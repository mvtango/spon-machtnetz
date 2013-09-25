require.config({
	shim: {
		underscore: {
			exports: "_"
		},
		tabletop :  {
			exports: "Tabletop"
		},
		mustache :  {
			exports: "Mustache"
		},
		jit :  {
			exports: "$jit"
		}
	},
	paths: {
		jquery:             "../../../../../../_common/js/jquery/jquery-1.8.0.min",
        jqueryqtip:     '../../../../../../_common/js/jquery/jquery.qtip-2.0.1',
        //xml2json:     '../../../../../../_common/js/jquery/jquery.xml2json-1.3',
		tabNavi:            "../../../../../../_common/js/spon/v0/ui/tabNavigation",
		underscore:         "../../../../../../_common/js/underscore/underscore-1.4.4.min",
		// tweenmax:           "../../../../../../_common/js/gsap/TweenMax.min",
        // moment: '../../../../../../_common/js/moment/moment-2.0.0.min',
        //raphael: '../../../../../../_common/js/raphael/master/raphael-2.1.0.amd',
        //raphaelcore: '../../../../../../_common/js/raphael/master/raphael-2.1.0.core',
        //raphaelvml: '../../../../../../_common/js/raphael/master/raphael-2.1.0.vml',
        //raphaelsvg: '../../../../../../_common/js/raphael/master/raphael-2.1.0.svg',
        //chroma: '../../../../../../_common/js/chroma/chroma.pack-0.3.1',
        //eve: '../../../../../../_common/js/eve/eve-0.3.4.amd',
        // globalize: "../../../../../../_common/js/jquery/jquery.globalize-0.1.1",
        hashchange:     '../../../../../../_common/js/jquery/jquery.hashchange-1.3.amd',
        // d3light: '../../../../../../_common/js/d3/d3.light-3.1.7.min',
        tabletop : 'tabletop',
        mustache : 'mustache',
        jquerymustache : 'jquery.mustache.amd',
        jit : 'jit'
	}
});

require(["jquery", "underscore", "hashchange", "interface","tabletop","jit","config","jquerymustache"],
        function ($, _, jqhash, mSponInterface, tabletop,jit,config) {

   $(".preloader, #oldie").hide();
   var $tabs = $('.tabsBar .tab');


   function log() {
	    var s="";
	    _(arguments).each(function(e) {
			s+=e+" ";
		});
		s+="<br/>"
		$("#debug").append(s);
	}


   function route(path) {
        $tabs.removeClass('tabActive');
        $tabs.filter('[data-name="' + path[0] + '"]').addClass('tabActive');
        if (path[0]=='ranking') {
            return ranking.render(path.slice(1));
        } else if (path[0]=='topics') {
            //
        } else {
            location.hash = '#ranking';
        }
    }

	function check_columns(t,nn) {
		passed=true;
		var r=t.all()[0];
		_(nn).each(function(n) {
			if (! n in r) {
				log("FEHLER","Tabelle <i>",t,"<i> fehlt die Spalte <i>",n,"</i>");
				passed=false;
			}
		});
		return passed;
	}	
	
	function check_nodes(edge,nn,z,t) {
		passed=true;
		_(nn).each(function(n) {
			if (!(edge[n] in nodes)) {
				log("FEHLER","Tabelle <i>",t,"</i>, Zeile <i>",z+2,"</i> Spalte <i>",n,"</i>: Der Netzknoten <b>",edge[n],"</b> fehlt.");
				passed=false;
			}
		});
		return passed;
	}	

	var nodes={};
	var graph;

    function make_graph(nodes) {
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
 	   // load JSON data.  
	  graph.loadJSON(nodes);  
	  // compute positions incrementally and animate.  
	  graph.computeIncremental({  
	    iter: 40,  
	    property: 'end',  
	    onStep: function(perc){  
		  log(perc + '% loaded...');  
	    },  
	    onComplete: function(){  
		  log('done');  
	      graph.animate({  
		   modes: ['linear'],  
		   transition: jit.Trans.Elastic.easeOut,  
		   duration: 2500  
		 });  
	    }  
	  });  
	  return graph;
	}

    function filter_nodes(s,max) {
		var r=[];
		var already={};
		var rr=[];
		i=max || config.showlevels;
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
		return r;	
	}
	
	function focus_graph(s,i) {
		n=filter_nodes(s,i);
		return(make_graph(n));
	}
	
	window.focus_graph=focus_graph;

	$(document).ready(function(){
		log("Warte auf Spreadsheet ",config.spreadsheet);
		spreadsheetTimeout=setTimeout(function() {
			log('Spreadheet nicht veröffentlicht? Nicht geladen nach 30 Sekunden.<br/>', '<a href="_">_</a>'.replace("_",config.spreadsheet));			
		},30*1000);
		tabletop.init({ key : config.spreadsheet, debug: true,
						callback : function (data) {
							 clearTimeout(spreadsheetTimeout);
							 log('<a href="'+config.spreadsheet+'">Spreadsheet</a> geladen.');
							 _(data.templates.all()).each(function(t) {
								$.Mustache.add(t.name+"-"+t.type,t.code); 
				 			 });
							 _(data.config.all()).each(function(v) {
								if (v.value.match(/ *\{/)) {
									try {
										config[v.name]=(new Function("return "+v.value))();
									} catch(e) {
										log('FEHLER','"'+v.value+'" ',e);
									}  
							    } else {
									config[v.name]=v.value;
								} 
							 });
							 _(config.nodes.split(/ *, */)).each(function(n) {
								 if (n in data) {
									 if (check_columns(data[n],['name','id'])) {
										 _(data[n].all()).each(function(node,z) {
											if (node.id in nodes) {
												log("FEHLER","Tabelle <i>",n,"</i>, Zeile <i>",z+2,"</i>: die id <b>",node.id,"</b> ist doppelt vergeben. Sie kommt auch in Tabelle <i>",nodes[node.id].type,"</i>, Zeile <i>",nodes[node.id].line,"</i> vor");
												return;
											}	
											node.type=n;
											node.line=z+2;
											gnode={ 'name' : node.name, 'id' : node.id, 'adjacencies' : [], data : _(node).extend(config[n] || {})};
											nodes[node.id]=gnode;
										 });
									 log("Tabelle <i>",n,"</i>: ",data[n].all().length," Einträge für Netzknoten.");
								  }
								} else {
									log("FEHLER","Tabelle <i>",n,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>config</i> unter <i>edges</i> aufgelistet und sollte Netzknoten enthalten.");
								}
							});
							_(config.edges.split(/ *, */)).each(function(n) {
								 if (n in data) {
									 if (check_columns(data[n],['from','to'])) {
										_(data[n].all()).each(function(edge,z) {
											if (check_nodes(edge,['from','to'],z,n)) {
												edge.line=z+2;
												edge.type=n;
												nodes[edge.from].adjacencies.push({ 'nodeFrom' : edge.from, 'nodeTo' : edge.to, 'data' : _(edge).extend(config[n] || {}) });
												nodes[edge.to].adjacencies.push({ 'nodeFrom' : edge.from, 'nodeTo' : edge.to, 'data' : _(edge).extend(config[n] || {}) });
											}
										});
									log("Tabelle <i>",n,"</i>: ",data[n].all().length," Einträge für Netzverbindungen.");
									}
								} else {
									log("FEHLER","Tabelle <i>",n,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>config</i> unter <i>edges</i> aufgelistet und sollte Netzverbindungen enthalten.");
								}
							});
							focus_graph("Volkswagen",2);
						}
		});
		mSponInterface.init();
        /*loader.init(function(config) {
            $(window).hashchange(function(e) {
                route(location.hash.substring(1).split('/'));
                e.preventDefault();
            });
            $(window).hashchange();
            $('.preloader').hide();
            $('#frame').show();
           
            $(window).resize(function(e) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    $(window).hashchange();
                }, 500);
            });
            
        }); */
	});
});
