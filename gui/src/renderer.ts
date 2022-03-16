// Retrieves element by  id, casts to HTMLInputElement
const _e_by_id = (id: string) => <HTMLInputElement>document.getElementById(id);

function setup_doctype_delta_hook(): void {
    const e_doctype =  _e_by_id('doctype');
    e_doctype.addEventListener('change', () => {
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
            forEach (key =>
                input_elements[key].style.visibility = 
                vis_keys.includes(key) ? 'visible': 'hidden'
            );

        if(e_doctype.value === 'api-route')
            _set_vis(['name', 'method', 'route_uri', 'description',
                    'query_parameters', 'return']);
        else if(e_doctype.value === 'function')
            _set_vis(['description', 'arguments', 'return']);
        else if(e_doctype.value === 'section')
            _set_vis(['name']);
    });
}

function initialize() : void {
    setup_doctype_delta_hook();
   
}

initialize();