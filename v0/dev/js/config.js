define([], function() {

   function log() {
	    var s="";
	    _(arguments).each(function(e) {
			s+=e+" ";
		});
		s+="<br/>"
		$("#debug").append(s);
	}





	return { 
		'debug' : true,
		'timeout' : 30, /* seconds before loader throws a timeout */
	    'spreadsheet' : 'https://docs.google.com/spreadsheet/ccc?key=0AnjSydpjIFuXdEM2NTMyMFhqRGVfWW43em1Ra2dXbVE#gid=1', 
	    'log' :	log
	};

});
