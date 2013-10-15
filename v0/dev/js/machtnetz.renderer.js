/*
 * Render Force-Directed Graph
 *
 */

define(['jquery','underscore','jit','config'], 
    function($,_,jit,config) {

    var graph;

    function get_graph(nodes) {
		config.log("settings: ",config.settings.mandat);
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
				//count connections  
				var count = 0;  
				node.eachAdjacency(function() { count++; });  
				//display node info in tooltip  
				$(tip).html("<div class=\"tip-title\">" + node.name + "</div>"  
				+ "<div class=\"tip-text\"><b>connections:</b> " + count + "</div>");  
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
				$('#details').mustache(node.data.type+"-info",node);  
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


    function load_nodes(nodes) { 	   // load JSON data.  
	  var graph=get_graph();
	  graph.loadJSON(nodes);  
	  // compute positions incrementally and animate.  
	  graph.computeIncremental({  
	    iter: 40,  
	    property: 'end',  
	    onStep: function(perc){  
		  config.log(perc + '% loaded...');  
	    },  
	    onComplete: function(){  
		  config.log('done');  
	      graph.animate({  
		   modes: ['linear'],  
		   transition: jit.Trans.Elastic.easeOut,  
		   duration: 2500  
		 });  
	    }  
	  });
	 }  





	return { 
	    'render' : load_nodes,
	    'graph'  : graph 
	};

});



