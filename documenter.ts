/**
* Documentation generator
* Author: Adam Brewer
*/

// Imports
import util = require('util');
import _prompt_sync = require('prompt-sync');
import _prompt_sync_history = require('prompt-sync-history');

/*
************************************************************************
* START 'CONSTANTS'
************************************************************************
*/

// Configurables
const DOC_SPACING = 23;
const DOC_SECTION_BORDER_LENGTH = 72;

// Untouchables (well, you should not-touch-ables)
const _DNE = -69;
const _INVALID_ARGUMENT_COUNT = -68;
const _ERR_MAP: Record<string, string> = {};
_ERR_MAP[_DNE] = 'DOES NOT EXIST'; 
_ERR_MAP[_INVALID_ARGUMENT_COUNT] = 'NOT ENOUGH ARGUMENTS'; 

/*
************************************************************************
* END 'CONSTANTS'
************************************************************************
*/


/*
************************************************************************
* START 'DOCSTRING TEMPLATES'
************************************************************************
*/

// String replacements:
// <METHOD> <NAME> <QUERY PARAMETERS> <RETURN>
const _API_ROUTE_DOCSTRING = `/** API ROUTE DEFINITION
* METHOD:               %s
* NAME:                 %s
* QUERY PARAMETERS:
*                       %s
* RETURN:               %s
*/`;

// String replacements:
// <DESCRIPTION> <ACCESS SCOPE> <ARGUMENTS> <RETURN>
const _FUNCTION_DOCSTRING = `/**
* %s
* 
* ACCESS SCOPE:         %s
* ARGUMENTS:
*                       %s
* RETURN:               %s
*/`;

// String replacements:
// <SECTION NAME>
const _START_SECTION_DOCSTRING = `/*
${'*'.repeat(DOC_SECTION_BORDER_LENGTH)}
* START '%s'
${'*'.repeat(DOC_SECTION_BORDER_LENGTH)}
*/`;

// String replacements:
// <SECTION NAME>
const _END_SECTION_DOCSTRING = `/*
${'*'.repeat(DOC_SECTION_BORDER_LENGTH)}
* END '%s'
${'*'.repeat(DOC_SECTION_BORDER_LENGTH)}
*/`;

/*
************************************************************************
* END 'DOCSTRING TEMPLATES'
************************************************************************
*/

type ParseFunction = (...args: string[]) => string | void;
function _parse_input_string(input_string: string) : string[] {
    const parsed: string[] = [];
    let parsed_long_str = '';
    let i = 0;
    while(i < input_string.length){
        if(input_string[i] == '"'){
            while(input_string[++i] != '"'){
                parsed_long_str += input_string[i];
            }
            parsed.push(parsed_long_str);
            parsed_long_str = '';
            i++;
        } else {
            while(i < input_string.length && input_string[i] != ' '){
                parsed_long_str += input_string[i++];
            }
            parsed.push(parsed_long_str);
            parsed_long_str = '';
        }
        i++;
    }
    return parsed;
}

function generate_section_doc(name: string) : string {
    return util.format(_START_SECTION_DOCSTRING, name) + '\n' +
    util.format(_END_SECTION_DOCSTRING, name);
}

function generate_api_route_doc(method: string, route_uri: string, param_string?: string, returns?: string) : string {
    let formatted_param_string = '';
    if (typeof param_string !== 'undefined' && param_string.length > 0){
        const param_string_arr = param_string.split(',');
        formatted_param_string = param_string_arr[0];
        if(param_string_arr.length > 1){
            for(let i = 1; i < param_string_arr.length; i++){
                formatted_param_string += `\n*${' '.repeat(DOC_SPACING)}${param_string_arr[i]}`;
            }
        }
    } else throw _INVALID_ARGUMENT_COUNT;
    const return_str = typeof returns !== 'undefined' ? returns : 'None';
    return util.format(
        _API_ROUTE_DOCSTRING, 
        method, 
        route_uri, 
        formatted_param_string, 
        return_str
    );
}

function generate_function_doc(description: string, access_scope: string, arg_string?: string, returns?: string) : string {
    let formatted_arg_string = '';
    if (typeof arg_string !== 'undefined' && arg_string.length > 0){
        const arg_string_arr = arg_string.split(',');
        formatted_arg_string = arg_string_arr[0];
        if(arg_string_arr.length > 1){
            for(let i = 1; i < arg_string_arr.length; i++){
                formatted_arg_string += `\n*${' '.repeat(DOC_SPACING)}${arg_string_arr[i]}`;
            }
        }
    } else throw _INVALID_ARGUMENT_COUNT;
    const return_str = typeof returns !== 'undefined' ? returns : 'None';
    return util.format(
        _FUNCTION_DOCSTRING,
        description,
        access_scope,
        formatted_arg_string,
        return_str
    );
}

// Interactable CLI
class CLICommand {
    readonly identifier: string;
    readonly callback: ParseFunction
    readonly is_primary: boolean = false;
    constructor(identifier: string, callback: ParseFunction, is_primary?: boolean){
        this.identifier = identifier;
        this.callback = callback;
        this.is_primary = Boolean(is_primary);
    }
    evoke(args?: string[]): string | void {
        this.callback.apply(args);
    }
    static evoke(command_list: CLICommand[], key: string, args?: string[]) : string | void {
        const command = this.get_by_identifier(command_list, key);
        if(!command) throw _DNE;
        return command.callback.apply(this, args);
    }
    static get_by_identifier(command_list: CLICommand[], identifier: string): CLICommand | void {
        const command = command_list.filter(command => command.identifier === identifier);
        if(command.length > 1) throw `DUPLICATE COMMANDS IN GIVEN command_list:\n${command_list}`;
        if(command.length == 1) return command[0];
    }
    static get_primary_commands(command_list: CLICommand[]): CLICommand[] {
        return command_list.filter(command => command.is_primary);
    }
}

function _get_help() : string {
    return (
        `Help Menu:    
        Commands:
            <command accessors> | <arguments>                
            api, route | <METHOD> <ROUTE> <QUERY PARAMETERS> <RETURN>
                Generates documentation for the described API route
                RETURN: the generated documentation, as a string
            function, func | <DESCRIPTION> <ACCESS SCOPE> <ARGUMENTS> <RETURN>
                Generates documentation for the described function
                RETURN: the generated documentation, as a string
            section, sect | <NAME>
                Generates start and end documentation for the given
                section
                RETURN: the generated documentation, as a string
            help, h:
                Displays this help message
                RETURN: this help message, as a string
            clear, cls:
                Clears console
                RETURN: undefined
            quit, q:
                Exit console`
    );
}

const _CLI_COMMAND_LIST: CLICommand[] = [
    new CLICommand('help', _get_help, true), new CLICommand('h', _get_help),
    new CLICommand('api', generate_api_route_doc, true),
    new CLICommand('function', generate_function_doc, true), new CLICommand('func', generate_function_doc),
    new CLICommand('section', generate_section_doc, true), new CLICommand('sect', generate_section_doc),
    new CLICommand('clear', _clear, true), new CLICommand('cls', _clear),
    new CLICommand('quit', _quit_cli, true), new CLICommand('q', _quit_cli)
];

function _clear() : void { console.clear(); }
function _quit_cli(): void { process.exit(1); }

function main() : void {
    /**
    * Sets up and runs the interactable CLI
    */
    // Setup prompt, with history and autocomplete enabled
    const commands: string[] = CLICommand.get_primary_commands(_CLI_COMMAND_LIST).map(command => command.identifier);
    const _prompt = _prompt_sync({
        history: _prompt_sync_history(),
        autocomplete: (str) => {
            const ret: string[] = [];
            for (let i = 0; i < commands.length; i++) {
                if (commands[i].indexOf(str) == 0)
                    ret.push(commands[i]);
            }
            return ret;
        },
        sigint: false
    });

    // Start REPL
    for(;;) {
        const user_input = _prompt('$');
        if(user_input){
            try {
                const parsed = _parse_input_string(user_input);
                const result = CLICommand.evoke(_CLI_COMMAND_LIST, parsed[0], parsed.slice(1));
                console.log(typeof result !== 'undefined' ? result : 'Command successful');
            } catch (error) {
                if(Object.keys(_ERR_MAP).includes(error.toString())) console.error(`[ERROR](${error}) ${_ERR_MAP[error]}`);
                else console.error(`[ERROR] Errored with unknown code: ${error}`);
            }
        }
    }
}

module.exports = {
    generate_api_route_doc: generate_api_route_doc,
    generate_function_doc: generate_function_doc,
    generate_section_doc: generate_section_doc
};

if (require.main === module) main();