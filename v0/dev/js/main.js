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
        jquerymustache : 'jquery.mustache.amd'
	}
});

require(["jquery", "underscore", "hashchange", "interface","tabletop","config","jquerymustache"],
        function ($, _, jqhash, mSponInterface, tabletop,config) {

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

	nodes={};
	edges=[];	

	$(document).ready(function(){
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
								config[v.name]=v.value; 
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
											nodes[node.id]=node; 
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
												edges.push(edge);
											}
										});
									log("Tabelle <i>",n,"</i>: ",data[n].all().length," Einträge für Netzverbindungen.");
									}
								} else {
									log("FEHLER","Tabelle <i>",n,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>config</i> unter <i>edges</i> aufgelistet und sollte Netzverbindungen enthalten.");
								}
							});
							 							
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