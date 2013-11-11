/*
 * Render Force-Directed Graph
 *
 */

define(['jquery', 'underscore', 'machtnetzloader', 'jit', 'config'],
    function($, _, loader, jit, config) {

    var graph,
        nodes,
        node_lookup = {},
        $detail = $('#detail');

    function get_graph(nodes) {
        if (typeof graph == "undefined") {
         graph = new jit.ForceDirected({  
            injectInto: 'graph',  
            //Enable zooming and panning  
            //by scrolling and DnD  
            Navigation: {  
                enable: true,  
                //Enable panning events only if we're dragging the empty  
                //canvas (and not a node).  
                panning: 'avoid nodes',  
                zooming: 10 //zoom speed. higher is more sensible  
            },  
            // Change node and edge styles such as  
            // color and width.  
            // These properties are also set per node  
            // with dollar prefixed data-properties in the  
            // JSON structure.  
            Node: {  
                overridable: true  
            },  
            Edge: {  
                overridable: true,  
                color: '#23A4FF',  
                lineWidth: 0.4  
            },  
            //Native canvas text styling  
            Label: _({  
                type: 'Native', //Native or HTML  
                size: 10,  
                style: 'bold',
                color: "#000000",  
            }).extend(config.label),  
            //Add Tips  
            Tips: {  
                enable: true,  
                onShow: function(tip, node) {  
                //display node info in tooltip 
                n=node_lookup[node.id];
                console.log(n); 
                $(tip).mustache(n.data.type+"-tooltip", n,{ method: 'html' });  
                }  
            },  
        // Add node events  
        Events: {  
            enable: true,  
            type: 'Native',  
            //Change cursor style when hovering a node  
            onMouseEnter: function() {  
                graph.canvas.getElement().style.cursor = 'move';  
            },  
            onMouseLeave: function() {  
                graph.canvas.getElement().style.cursor = '';  
            },  
            //Update node positions when dragged  
            onDragMove: function(node, eventInfo, e) {  
                var pos = eventInfo.getPos();  
                node.pos.setc(pos.x, pos.y);  
                graph.plot();  
            },  
            //Implement the same handler for touchscreens  
            onTouchMove: function(node, eventInfo, e) {  
                jit.util.event.stop(e); //stop default touchmove event  
                this.onDragMove(node, eventInfo, e);
            },  
            //Add also a click handler to nodes  
            onClick: function(node) {
                if(!node) return;
                focus(node.id, 2);
            }
        },  
        //Number of iterations for the FD algorithm  
        iterations: 200,
        //Edge length  
        levelDistance: 130,
        // Add text to the labels. This method is only triggered  
        // on label creation and only for DOM labels (not native canvas ones).  
        onCreateLabel: function(domElement, node){  
            domElement.innerHTML = node.name;
            $(domElement).css( _({fontSize:"0.8em", color: "#888"}).extend(config.label));  
        },  
        // Change node styles when DOM labels are placed  
        // or moved.  
        onPlaceLabel: function(domElement, node){  
            var style = domElement.style;  
            var left = parseInt(style.left);  
            var top = parseInt(style.top);  
            var w = domElement.offsetWidth;  
            style.left = (left - w / 2) + 'px';  
            style.top = (top + 10) + 'px';  
            style.display = '';  
         }  
        });  
        }
      return graph;
    }


    function load_nodes(nodes) {       // load JSON data.  
      _(nodes).each(function(n) {
          node_lookup[n.id]=n;
      });
      if ($("#graph").css("display") == "none") {
          config.loading(false);
          return;
      }
      var graph=get_graph();
      console.log(nodes);
      graph.loadJSON(nodes);  
      // compute positions incrementally and animate.  
      graph.computeIncremental({  
        iter: 40,  
        property: 'end',  
        onStep: function(perc){  
          config.loading('Berechnen '+".....".substr(0,Math.floor(perc/20)));  
        },  
        onComplete: function(){  
          config.loading(false);
          graph.animate({
           modes: ['linear'],  
           transition: jit.Trans.Elastic.easeOut,  
           duration: 2500  
         });  
        }  
      });
    }  

    function renderInfo(centralNode, nodes) {
        _.each(nodes, function(node) {
            if (node.id == centralNode) {
                $detail.mustache(node.type+"-info", node, {method: 'html'});  
            }
        });
    }

    function edgesToIndices(nodes, edges) {
        // for great glory and d3.
        var map = {},
            _edges = [];
        _.each(nodes, function(node, index) {
            map[node.id] = index;
        });
        _.each(edges, function(edge) {
            _edges.push(_.extend({}, edge, {
                'source': map[edge.source],
                'target': map[edge.target]
            }));
        });
        return _edges;
    }

    
    function focus(centralNode, depth) {
        loader.graphSection(centralNode, depth, function(nodes, edges) {
            //console.log(nodes.length);
            //console.log(edges.length);
            renderInfo(centralNode, nodes);
        });
    }


    return { 
        'focus': focus,
        'graph': graph 
    };

});



