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
        d3 :  {
            exports: "d3"
        }
    },
    paths: {
        jquery:             "../../../../../../_common/js/jquery/jquery-1.8.0.min",
        jqueryqtip:         "../../../../../../_common/js/jquery/jquery.qtip-2.0.1",
        tabNavi:            "../../../../../../_common/js/spon/v0/ui/tabNavigation",
        underscore:         "../../../../../../_common/js/underscore/underscore-1.4.4.min",
        hashchange:         "../../../../../../_common/js/jquery/jquery.hashchange-1.3.amd",
        tabletop:           "tabletop",
        mustache:           "mustache",
        jquerymustache:     "jquery.mustache.amd",
        jqueryparseparams:  "jquery.parseParams",
        d3:                 "d3",
        machtnetzloader:    "machtnetz.loader",
        machtnetzrenderer:  "machtnetz.renderer"
    }
});

require(["jquery", "underscore", "hashchange", "interface", "machtnetzloader", "machtnetzrenderer", "config", "jquerymustache", "jqueryparseparams"],
        function ($, _, jqhash, mSponInterface, loader, renderer, config) {

    config.loading("Grafik wird vorbereitet");
   
    var $tabs = $('.tabsBar .tab');

    function route() {
        config.params(function(state, settings) {
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
                var depth = parseInt(state.depth, 10) || settings.showlevels || 2;
                renderer.focus(state.name, depth);
            }
        });
    }

    $(document).ready(function(){
        mSponInterface.init();
        $("#graphframe").width($(window).width());
        $(window).hashchange(function(e) {
                route();
                e.defaultPrevented = true;
        });

        if (document.location.search) {
            source = $.parseParams(document.location.search).source;
        } else {
            source = config.spreadsheet;
        }

        loader.load(source, function(settings) {
            if ($(window).width() > settings.graphwidth) {
                $("#graph").fadeIn({
                    complete: function() {
                        $("#graph").removeClass("invisible");
                    }
                });
                config.log("Grafik wird nicht angezeigt. Fensterbreite unter "+settings.graphwidth+"px - einstellbar in settings.graphwidth");
            }

            $("#detail").css({display: "inline-block"}).fadeIn();
            config.loading("Grafik wird vorbereitet ...");

            $("#topics .tab:first-child").html(settings.title);
            
            $(".spCredit").html(settings.source);
            
            if (!location.hash) {
                location.hash = "#" + settings.start;
            } else {
                $(window).hashchange();
            }
        });
    });
});
