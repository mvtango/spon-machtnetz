/* machtnetz Kern-Modul */

define(['jquery','underscore','config','machtnetzloader','machtnetzrenderer'], 
 function($,_,config,loader,renderer) {

	var nodes;
	
    function filter_nodes(s,max) {
		var r=[];
		var already={};
		var rr=[];
		i=max /* || config.settings.showlevels */;
		config.log("i="+i);
 		r=_(nodes).values().filter(function(n) { return n.name.indexOf(s)>-1 });
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


	
	function focus(s,i) {
		n=filter_nodes(s,i);
		renderer.render(n);
	}
	
	function load(spreadsheet,callback) {
		loader.load(spreadsheet,function(data) {
			nodes=data.nodes;
			callback(data);
		});
	}


	return { 
		'load'  : load,
		'focus' : focus,
		'graph' : renderer.graph
	};

});
