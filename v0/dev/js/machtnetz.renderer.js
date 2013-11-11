/*
 * Render Force-Directed Graph
 *
 */

define(['jquery', 'underscore', 'jit', 'config'],
    function($, _, jit, config) {

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
                focus(node.id,2);   
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


    
    function filter_nodes(s, max, nodes) {
        var r=[];
        var already={};
        var rr=[];
        if (isNaN(parseInt(max, 10))) {
            i=config.settings.showlevels || 2;
        } else {
            i=parseInt(max)
        };
        config.log("s="+s+" max="+i);
        r=_(nodes).values().filter(function(n) { return ((n.name.indexOf(s)>-1) || (n.id==s)) });
        _(r).each(function(k) { already[k.id]=true ; });
        while(i--) {
            _(r).each(function(node) {
                _(node.adjacencies).each(function(edge) {
                    if (!(edge.nodeTo in already)) {
                        rr.push(nodes[edge.nodeTo]);
                        already[edge.nodeTo]=true;
                    }
                    if (!(edge.nodeFrom in already)) {
                        rr.push(nodes[edge.nodeFrom]);
                        already[edge.nodeFrom]=true;
                    }
                });
            });
            _(rr).each(function(n) { r.push(n); });
            rr=[]; 
        }
        /* 
        _(r).each(function(node) {
            _(node.adjacencies).each(function(edge) {
                if (!(edge.nodeTo in already)) {
                    var nn=nodes[edge.nodeTo];
                    rr.push({ name : nn.name, id: nn.id, data: nn.data});
                }
                if (!(edge.nodeFrom in already)) {
                    var nn=nodes[edge.nodeFrom];
                    rr.push({ name : nn.name, id: nn.id, data: nn.data});
                }
            });
        });
        _(rr).each(function(n) { r.push(n); });
        */
        return r;   
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

    function display_node(n) {
        var o = $.extend({}, n);
        _(o.adjacencies).each(function(a) {
            var ln = o.id == a.nodeTo ? a.nodeFrom : a.nodeTo
            a.node=node_lookup[ln];
        })
        $detail.mustache(n.data.type+"-info", n, {method: 'html'});  
    }

    
    function focus(s, i, _nodes) {
        if (_nodes) {
            nodes = _nodes;
        }
        nodes = filter_nodes(s, i, nodes);
        load_nodes(nodes);
        display_node(nodes[0]);
    }


    return { 
        'focus': focus,
        'graph': graph 
    };

});



