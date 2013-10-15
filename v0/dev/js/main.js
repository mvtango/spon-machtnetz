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
        jit : 'jit',
        machtnetz : 'machtnetz',
        machtnetzloader :   'machtnetz.loader',
        machtnetzrenderer : 'machtnetz.renderer'
	}
});

require(["jquery", "underscore", "hashchange", "interface","machtnetz","jit","config","jquerymustache"],
        function ($, _, jqhash, mSponInterface, machtnetz,jit,config) {

   $(".preloader, #oldie").hide();
   var $tabs = $('.tabsBar .tab');


   function route(path) {
        /*$tabs.removeClass('tabActive');
          $tabs.filter('[data-name="' + path[0] + '"]').addClass('tabActive'); */
        if (path[0]!='') {
			var children=parseInt(path[1]);
			machtnetz.focus(path[0],children);
        } 
    }


	
	window.focus_graph=machtnetz.focus;

	$(document).ready(function(){
		mSponInterface.init();
		$(window).hashchange(function(e) {
                route(location.hash.substring(1).split('/'));
                e.preventDefault();
		});

		machtnetz.load(config.spreadsheet,function(data) {
			config.log("hash="+data.settings.start);
			if (!location.hash) {
				location.hash="#"+data.settings.start;
			} else {
				$(window).hashchange();
			}
			$('.preloader').hide();
 		});
		
        
        
        /*    
        $(window).resize(function(e) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    $(window).hashchange();
                }, 500);
            });
            
        }); */
	});
});
