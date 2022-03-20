const _e_by_id = (id: string) => <HTMLInputElement>document.getElementById(id);
const e_doctype =  _e_by_id('doctype');

// Disable refresh on form submission
_e_by_id("primary-form").addEventListener('submit', e => e.preventDefault());

function doctype_delta_hook() : void {
    console.log(e_doctype.value);
    const input_elements: Record<string, HTMLInputElement> = {
        name:               _e_by_id('name'),
        description:        _e_by_id('description'),
        method:             _e_by_id('method'),
        route_uri:          _e_by_id('route-uri'),
        query_parameters:   _e_by_id('query-parameters'),
        arguments:          _e_by_id('arguments'),
        return:             _e_by_id('return')
    };

    const _set_vis = (vis_keys: string[]) => Object.keys(input_elements).
        forEach (key => input_elements[key].readOnly = !vis_keys.includes(key));

    if(e_doctype.value === 'api-route')
        _set_vis(['name', 'description', 'method', 'route_uri',
                'query_parameters', 'return']);
    else if(e_doctype.value === 'function')
        _set_vis(['description', 'arguments', 'return']);
    else if(e_doctype.value === 'section')
        _set_vis(['name']);
}

function initialize() : void {
    // Run once to set initial editable parameters
    doctype_delta_hook();
    e_doctype.addEventListener('change', doctype_delta_hook);
}

initialize();
