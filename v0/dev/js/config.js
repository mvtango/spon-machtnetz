define([], function() {

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

	
	return { 
		'debug' : true,
		'timeout' : 30, /* seconds before loader throws a timeout */
	    'spreadsheet' : 'https://docs.google.com/spreadsheet/ccc?key=0AnjSydpjIFuXdEM2NTMyMFhqRGVfWW43em1Ra2dXbVE#gid=1', 
	    'log' :	log,
	    'loading' : loading,
	    'fatal' : fatal
	};

});
