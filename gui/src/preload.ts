// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const _e_by_id = (id: string) => <HTMLInputElement>document.getElementById(id);

// Synchronous message emmiter and handler
//console.log(ipcRenderer.sendSync('synchronous-message', 'sync ping'));

// Async message handler
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg);
});

// Async message sender
ipcRenderer.send('asynchronous-message', 'async ping');

window.addEventListener('DOMContentLoaded', () => {
  console.log(document.querySelector('#submit-docform'));
  document.querySelector('#submit-docform').addEventListener('click', () => {
    ipcRenderer.send('asynchronous-message', {
        doctype:            _e_by_id('doctype').value,
        name:               _e_by_id('name').value,
        description:        _e_by_id('description').value,
        method:             _e_by_id('method').value,
        route_uri:          _e_by_id('route-uri').value,
        query_parameters:   _e_by_id('query-parameters').value,
        arguments:          _e_by_id('arguments').value,
        return:             _e_by_id('return').value
    });
    
    // receive message from main.js
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg);
    });
  });
});
// Add form submission event listener
/*

*/