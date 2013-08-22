define(["jquery", "underscore", 'xml2json'], function ($, _, xml2json) {
    var configDfd = $.get('/xml/xml-61163.xml'),
        config = null;
        staticgens = {},
        profiles = {},
        parties = {};

    function getStaticGen(name) {
        if (staticgens[name]===undefined) {
            //staticgens[name] = $.getJSON('/staticgen/data_imports/twitter/' + name + '.json');
            //staticgens[name] = $.getJSON('data/twindle/' + name + '.json');
            //staticgens[name] = $.getJSON('http://ec2-54-216-143-88.eu-west-1.compute.amazonaws.com/' + name + '.json');
            staticgens[name] = $.ajax({
                cache: true,
                dataType: 'jsonp',
                jsonpCallback: 'ranking_layer',
                url: 'http://dc2kg1gbjlv64.cloudfront.net/' + name + '.jsonp'
            });
            
        }
        return staticgens[name];
    }

    function init(callback) {
        configDfd.done(function(data) {
            config = $.xml2json(data);
            $.each(config.parties.party, function(i, party) {
                parties[party.name] = party;
            });
            $.each(config.searches.search, function(i, search) {
                search.party = parties[search.party] || parties['parteilos'];
                search.fullname = search.fullname || null;
                search.title = search.title || search.titel || null;
                search.has_account = String(search.name).substring(0, 2) != '__';
                profiles[search.name.toLowerCase()] = search;
            });
            callback(config);
        });
    }

    return {
        config: config,
        init: init,
        profiles: profiles,
        parties: parties,
        getStaticGen: getStaticGen
    };
});