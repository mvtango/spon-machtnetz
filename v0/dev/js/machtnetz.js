/* machtnetz Kern-Modul, braucht loader und renderer */

define(['jquery', 'underscore', 'config', 'machtnetzloader', 'machtnetzrenderer'],
 function($,_,config,loader,renderer) {

    var nodes;
    
    function load(spreadsheet, callback) {
        loader.load(spreadsheet, function(data) {
            nodes = data.nodes;
            callback(data);
        });
    }

    function focus(s, i) {
        return renderer.focus(s, i, nodes);
    }

    return {
        'load'  : load,
        'focus' : focus,
        'graph' : renderer.graph
    };

});
