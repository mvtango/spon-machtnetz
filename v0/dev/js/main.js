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
        jqueryparseparams : 'jquery.parseParams',
        jit : 'jit',
        machtnetz : 'machtnetz',
        machtnetzloader :   'machtnetz.loader',
        machtnetzrenderer : 'machtnetz.renderer'
	}
});

require(["jquery", "underscore", "hashchange", "interface","machtnetz","jit","config","jquerymustache","jqueryparseparams"],
        function ($, _, jqhash, mSponInterface, machtnetz,jit,config) {

   $("#oldie").hide();
   config.loading("Grafik wird vorbereitet");
   
   var $tabs = $('.tabsBar .tab');


   function route(params) {
	    state=_($.parseParams(config.settings.start)).extend($.parseParams(params));
		config.log("HASHCHANGE "+JSON.stringify(state));
        if (state.debug) {
			$(".debugwrapper").css({ visibility: "visible" });
			if (state.debug+"">"1") {
				$(".debugwrapper #debug").addClass("always");
			}
		} else {
			$(".debugwrapper").css({ visibility: "hidden" });
			$(".debugwrapper #debug").removeClass("always");
		}
        if (state.name) {
			var children=parseInt(state.children);
			machtnetz.focus(state.name,children);
        } 
    }


	
	window.focus_graph=machtnetz.focus;

	$(document).ready(function(){
		mSponInterface.init();
		$("#graphframe").width($(window).width());
		$(window).hashchange(function(e) {
                route(location.hash);
                e.preventDefault();
		});
		if (document.location.search) {
			source=$.parseParams(document.location.search).source;
		} else {
			source=config.spreadsheet;
		}
		machtnetz.load(source,function(data) {
			if ($(window).width()>data.settings.graphwidth) {
				$("#graph").fadeIn({ complete: function() { $("#graph").removeClass("invisible"); } });
				config.log("Grafik wird nicht angezeigt. Fensterbreite unter "+data.settings.graphwidth+"px - einstellbar in settings.graphwidth");
			}; 
			$("#detail").css({ display: "inline-block"}).fadeIn();
			config.loading("Grafik wird vorbereitet ...");
			$("#topics .tab:first-child").html(data.settings.title);
			$(".spCredit").html(data.settings.source);
			if (!location.hash) {
				location.hash="#"+data.settings.start;
			} else {
				$(window).hashchange();
			}
 		});
		
        window.goto=function(a) {
				var now=$.parseParams(document.location.hash)
				$.extend(now,$.parseParams(a));
				document.location.hash="#"+$.param(now);
		};
        
        
	});
});
