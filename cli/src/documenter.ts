/**
* Documentation generator
* Author: Adam Brewer
*/

import util = require('util');
import _prompt_sync = require('prompt-sync');
import _prompt_sync_history = require('prompt-sync-history');
import { format } from 'path';

/*
************************************************************************
* START 'CONSTANTS'
************************************************************************
*/
// Configurables
const DOC_SPACING = 23;
const DOC_SECTION_BORDER_LENGTH = 72;
const INPUT_AUTOWRAP = 50; // Character count to wrap at (not yet implemented)

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
// <NAME> <METHOD> <ROUTE URI> <DESCRIPTION> <QUERY PARAMETERS> <RETURN>
const _API_ROUTE_DOCSTRING = `/** API ROUTE DEFINITION
* NAME:                 %s
* METHOD:               %s
* ROUTE URI:            %s
*
* %s
*
* QUERY PARAMETERS:
*                       %s
*
* RETURN:               %s
*/`;

// String replacements:
// <DESCRIPTION> <ARGUMENTS> <RETURN>
const _FUNCTION_DOCSTRING = `/**
* %s
*
* ARGUMENTS:
*                       %s
*
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


/*
************************************************************************
* START 'MISC PARSING'
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

/*
************************************************************************
* END 'MISC PARSING'
************************************************************************
*/


/*
************************************************************************
* START 'DOCUMENTATION GENERATION FUNCTIONS'
************************************************************************
*/
function _autowrap_string(input: string): string {
    let splits: string[] = [];
    for(let i = 0; i < input.length; i += INPUT_AUTOWRAP){
        splits.push(input.slice(i, i + INPUT_AUTOWRAP));
    }
    return splits.join('\n');
}

function _format_multiline_input(entry: string | string[]) : string {
    let formatted_entry_string = '';
    const entry_arr = typeof entry === 'string' ? entry.split(/[\n,]/) : entry;
    formatted_entry_string = _autowrap_string(entry_arr[0]);
    if(entry_arr.length > 1){
        for(let i = 1; i < entry_arr.length; i++){
            formatted_entry_string += _autowrap_string(`\n*${' '.repeat(DOC_SPACING)}${entry_arr[i]}`);
        }
    }
    return formatted_entry_string;
}

function _safe_format_verify_multiline_input(entry?: string | string[], fallback_value?: string) : string{
    return typeof entry !== 'undefined' ? _format_multiline_input(entry) : 
        (typeof fallback_value !== 'undefined' ? fallback_value : 'None'); 
}

export function generate_section_doc(name: string) : string {
    return _safe_format_verify_multiline_input(util.format(_START_SECTION_DOCSTRING, name)) + '\n' +
        _safe_format_verify_multiline_input(util.format(_END_SECTION_DOCSTRING, name));
}

// <NAME> <METHOD> <ROUTE URI> <DESCRIPTION> <QUERY PARAMETERS> <RETURN>
export function generate_api_route_doc(name: string, method: string,
    route_uri: string, description: string, query_parameters?: string,
    returns?: string) : string {
    if(typeof query_parameters !== 'undefined')
        query_parameters = _safe_format_verify_multiline_input(query_parameters);
    else query_parameters = 'None';
    
    if(typeof returns !== 'undefined')
        returns = _safe_format_verify_multiline_input(returns);
    else returns = 'None';
    
    description = _safe_format_verify_multiline_input(description);
    
    returns = typeof returns !== 'undefined' ?
        _safe_format_verify_multiline_input(returns) : 'None';
    return util.format(
        _API_ROUTE_DOCSTRING,
        name,
        method, 
        route_uri,
        description,
        query_parameters, 
        returns
    );
}

export function generate_function_doc(description: string, argument_str?: string, returns?: string) : string {
    if (typeof argument_str !== 'undefined')
        argument_str = _autowrap_string(_safe_format_verify_multiline_input(argument_str));
    if (typeof returns !== 'undefined')
        returns = _autowrap_string(_safe_format_verify_multiline_input(returns));
    return util.format(
        _FUNCTION_DOCSTRING,
        description,
        argument_str,
        returns
    );
}
/*
************************************************************************
* END 'DOCUMENTATION GENERATION FUNCTIONS'
************************************************************************
*/


/*
************************************************************************
* START 'MISC CLI'
************************************************************************
*/
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
        return command.callback.apply(this, typeof args !== 'undefined' ? args : []);
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
        TIP #1: If you want to use spaces for a particular parameter, wrap your
        entry with quotation marks (see Ex. 2a)
        TIP #2: For parameters allowing multiple entries (i.e. <QUERY PARAMETERS>),
        separate each parameter with a comma.
            Ex. 2a: 
                "string - string to do things with,name - your name" etc... 
        
        Commands:
            <command accessors> | <arguments>                
            api, route | <METHOD> <ROUTE URI> <QUERY PARAMETERS> <RETURN>
                Generates documentation for the described API route
                RETURN: the generated documentation, as a string
            function, func | <DESCRIPTION> <ARGUMENTS> <RETURN>
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

// CLI Utility Functions
function _clear() : void { console.clear(); }
function _quit_cli(): void { process.exit(1); }
/*
************************************************************************
* END 'MISC CLI'
************************************************************************
*/

function main() : void {
    /**
    * Sets up and runs the interactable CLI
    */
    // Setup prompt, with history and autocomplete enabled
    const commands: string[] = CLICommand.get_primary_commands(_CLI_COMMAND_LIST).map(command => command.identifier);
    const _prompt = _prompt_sync({
        history: _prompt_sync_history(),
        autocomplete: (str: string) => {
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

if (require.main === module) main();

module.exports = {
    generate_section_doc: generate_section_doc,
    generate_api_route_doc: generate_api_route_doc,
    generate_function_doc: generate_function_doc
}