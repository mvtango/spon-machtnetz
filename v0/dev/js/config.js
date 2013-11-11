define(['jquery', 'underscore'], function($, _) {

	var settingsDfd = $.Deferred();

   function log() {
	    var s="";
	    _(arguments).each(function(e) {
			s+=e+" ";
		});
		s+="<br/>"
		$("#debug").append(s);
	}
	
   function loading(msg) {
		var $p=$(".preloader");
		if (! (msg == false)) {
			if ($p.css("visibiliy") != "visible") {
				$p.fadeIn({ duration: .1 });
			};
			$(".preloader h2").html(msg);
		} else {
			$p.fadeOut({ duration: .1 });
		}
	}

	function fatal(msg) {
		var $p=$(".preloader");
		if ($p.css("visibiliy") != "visible") {
				$p.fadeIn({ duration: .1 });
		};
		$(".preloader h2").html(msg);
		$(".preloader img").fadeOut();
	}

	function serialize(obj) {
  		var str = [];
  		for(var p in obj)
     		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  		return str.join("&");
	}

	function params(callback) {
		settingsDfd.then(function(settings) {
			var state = _($.parseParams(settings.start)).extend($.parseParams(window.location.hash));
			callback(state, settings);
		});
	}

	function jumpRelative(opts) {
		params(function(old) {
			opts = _.extend({}, old, opts);
			window.location.hash = serialize(opts);
		});
	}

	window.goto = jumpRelative;

	return { 
		'debug' : true,
		'timeout' : 30, /* seconds before loader throws a timeout */
	    'spreadsheet' : 'https://docs.google.com/spreadsheet/ccc?key=0AnjSydpjIFuXdEM2NTMyMFhqRGVfWW43em1Ra2dXbVE#gid=1', 
	    'log' :	log,
	    'loading' : loading,
	    'fatal' : fatal,
	    'params': params,
	    'settings': settingsDfd,
	    'jumpRelative': jumpRelative
	};

});
