// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import electron = require('electron');
import * as Documenter from '../../cli/src/documenter';
const ipcRenderer = electron.ipcRenderer;
const _e_by_id = (id: string) => <HTMLInputElement>document.getElementById(id);

// Async message handler
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg);
});

// Async message sender

window.addEventListener('DOMContentLoaded', () => {
  console.log(document.querySelector('#submit-docform'));
  const sub_docform = <HTMLInputElement>document.querySelector('#submit-docform');
  const doc_output_displaybox = document.querySelector("#output-display-box");
  sub_docform.addEventListener('click', () => {
    let values = {
      doctype:            _e_by_id('doctype').value,
      name:               _e_by_id('name').value,
      description:        _e_by_id('description').value,
      method:             _e_by_id('method').value,
      route_uri:          _e_by_id('route-uri').value,
      query_parameters:   _e_by_id('query-parameters').value,
      arguments:          _e_by_id('arguments').value,
      return:             _e_by_id('return').value
    };
    let generated_docstring = '';
    if(values.doctype === 'section'){
      generated_docstring = Documenter.generate_section_doc(values.name);
    }
    else if(values.doctype === 'api-route'){
      generated_docstring = Documenter.generate_api_route_doc(
        values.name,
        values.method,
        values.route_uri,
        values.description,
        values.query_parameters,
        values.return
      );
    }
    else if(values.doctype === 'function'){
      generated_docstring = Documenter.generate_function_doc(
        values.description,
        values.arguments,
        values.return
      );
    }
    console.log(generated_docstring);
    doc_output_displaybox.textContent = generated_docstring;
    
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg);
    });
  });
});


