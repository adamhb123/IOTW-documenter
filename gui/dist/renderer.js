// Retrieves element by  id, casts to HTMLInputElement
var _e_by_id = function (id) { return document.getElementById(id); };
function setup_doctype_delta_hook() {
    var e_doctype = _e_by_id('doctype');
    e_doctype.addEventListener('change', function () {
        console.log(e_doctype.value);
        var input_elements = {
            name: _e_by_id('name'),
            description: _e_by_id('description'),
            method: _e_by_id('method'),
            route_uri: _e_by_id('route-uri'),
            query_parameters: _e_by_id('query-parameters'),
            arguments: _e_by_id('arguments'),
            "return": _e_by_id('return')
        };
        var _set_vis = function (vis_keys) { return Object.keys(input_elements).
            forEach(function (key) {
            return input_elements[key].style.visibility =
                vis_keys.includes(key) ? 'visible' : 'hidden';
        }); };
        if (e_doctype.value === 'api-route')
            _set_vis(['name', 'method', 'route_uri', 'description',
                'query_parameters', 'return']);
        else if (e_doctype.value === 'function')
            _set_vis(['description', 'arguments', 'return']);
        else if (e_doctype.value === 'section')
            _set_vis(['name']);
    });
}
function initialize() {
    setup_doctype_delta_hook();
}
initialize();
//# sourceMappingURL=renderer.js.map