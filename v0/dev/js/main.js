require.config({
	shim: {
		underscore: {
			exports: "_"
		}
	},
	paths: {
		jquery:             "../../../../../../_common/js/jquery/jquery-1.8.0.min",
        jqueryqtip:     '../../../../../../_common/js/jquery/jquery.qtip-2.0.1',
        'xml2json':     '../../../../../../_common/js/jquery/jquery.xml2json-1.3',
		tabNavi:            "../../../../../../_common/js/spon/v0/ui/tabNavigation",
		underscore:         "../../../../../../_common/js/underscore/underscore-1.4.4.min",
		tweenmax:           "../../../../../../_common/js/gsap/TweenMax.min",
        moment: '../../../../../../_common/js/moment/moment-2.0.0.min',
        raphael: '../../../../../../_common/js/raphael/master/raphael-2.1.0.amd',
        raphaelcore: '../../../../../../_common/js/raphael/master/raphael-2.1.0.core',
        raphaelvml: '../../../../../../_common/js/raphael/master/raphael-2.1.0.vml',
        raphaelsvg: '../../../../../../_common/js/raphael/master/raphael-2.1.0.svg',
        chroma: '../../../../../../_common/js/chroma/chroma.pack-0.3.1',
        eve: '../../../../../../_common/js/eve/eve-0.3.4.amd',
        globalize: "../../../../../../_common/js/jquery/jquery.globalize-0.1.1",
        'hashchange':     '../../../../../../_common/js/jquery/jquery.hashchange-1.3.amd',
        d3light: '../../../../../../_common/js/d3/d3.light-3.1.7.min'
	}
});

require(["jquery", "hashchange", "interface", "loader", "ranking"],
        function ($, jqhash, mSponInterface, loader, ranking) {

	var $tabs = $('.tabsBar .tab'),
        resizeTimeout = null,
		i,               //noBuild
		cMethods,       //noBuild
        nix;

    window.console = window.console || {'log': function() {}, 'info': function() {}};
    // IE console kennt die gruppen nicht... -> ersetzen durch console.log
	cMethods = ["groupCollapsed", "group", "groupEnd", "clear"]; i = cMethods.length;    //noBuild
	while (i--) {                                                                       //noBuild
		console[cMethods[i]] = console[cMethods[i]] || console.info;                    //noBuild
	}                                                                                   //noBuild


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


	$(document).ready(function(){
		console.log("Projekt startet");
		mSponInterface.init();
        loader.init(function(config) {
            $(window).hashchange(function(e) {
                route(location.hash.substring(1).split('/'));
                e.preventDefault();
            });
            $(window).hashchange();
            $('.preloader').hide();
            $('#frame').show();
            /*
            $(window).resize(function(e) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    $(window).hashchange();
                }, 500);
            });
            */
        });
	});
});