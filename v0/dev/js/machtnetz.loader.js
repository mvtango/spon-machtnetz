/* Machtnetz Daten laden 
 * Besondere Worksheet-Namen:
 *   - "settings" - enthält die Spalten name und value, und wird zu einem Javascript-Objekt. 
 *      -- Alles in value, was nach JS aussieht,
 *         wird kompiliert
 *      -- Worksheets, die in "nodes" aufgelistet sind, müssen existieren und Knoten 
 *         enthalten. Knoten haben mindestens die Attribut id und name. Empfohlen werden 
 *         ebenfalls "source" (Quelle) und "update" (Datum der letzten Änderung). 
 *      -- Worksheets, die in "edges" aufgelistet sind, müssen existieren und Verbindungen 
 *         enthalten. Verbindungen haben mindestens die Attribute nodeFrom und NodeTo.
 *         Empfohlen werden ebenfalls "source" (Quelle) und "update" 
 *         (Datum der letzten Änderung).
 * 
 *   - "templates" - enthält die Spalten "name","type","code"
 *      Die Templates in code sind Mustache-Template, sie werden beim Laden kompiliert und
 *      jquery.Mustache unter dem Namen "{{ name }}-{{ type }}" hinzugefügt.
 *      
 * */
define(['jquery', 'underscore', 'tabletop', 'config', 'jquerymustache'],
    function($, _, tabletop, config) {

    var log = config.log;
    var debug = config.debug;

    function load(spreadsheet, callback) {
        var nodes={};

        function check_columns(t, nn) {
            var passed = true;
            var r = t.all()[0];
            _(nn).each(function(n) {
                if (!(n in r)) {
                    config.log("FEHLER","Tabelle <i>",t,"<i> fehlt die Spalte <i>",n,"</i>");
                    passed=false;
                }
            });
            return passed;
        }
        
        function check_nodes(edge, nn, z, t) {
            var passed=true;
            _(nn).each(function(n) {
                if (!(edge[n] in nodes)) {
                    config.log("FEHLER","Tabelle <i>",t,"</i>, Zeile <i>",z+2,"</i> Spalte <i>",n,"</i>: Der Netzknoten <b>",edge[n],"</b> fehlt.");
                    passed=false;
                }
            });
            return passed;
        }

        log("Warte auf Spreadsheet ",spreadsheet);
        var spreadsheetTimeout = setTimeout(function() {
                config.log('Spreadheet nicht veröffentlicht? Nicht geladen nach', config.timeout, 'Sekunden.<br/>', '<a href="_">_</a>'.replace("_",spreadsheet));
                /* throw "machtnetz loader timeout"; */
                config.fatal("Die Daten konnten nicht geladen werden.");
        }, config.timeout*1000);
        nodes={} ;
        settings={};
        tabletop.init({key : spreadsheet, debug: debug,
            callback : function (data) {
                       clearTimeout(spreadsheetTimeout);
                       /* Templates aus Worksheet 'templates' */
                       log('<a href="'+spreadsheet+'">Spreadsheet</a> geladen.');
                       _(data.templates.all()).each(function(t) {
                        $.Mustache.add(t.name+"-"+t.type,t.code);
                       });
                       /* Variablen aus Worksheet 'settings' */
                       _(data.settings.all()).each(function(v,z) {
                         /* was nach Javascript aussieht, wird kompiliert */
                         if (v.value.match(/^ *(\{|\[|function|\"|\'|[0-9]|-)/)) {
                            try {
                                settings[v.name]=(new Function("return "+v.value))();
                            } catch(e) {
                                config.log('FEHLER in Tabelle <i>settings</i>, Zeile ',z+2,'(',v.name,') "'+v.value+'" ',e);
                            }
                         } else {
                            settings[v.name]=v.value;
                         }
                       });
                       /* Worksheets mit Netzknoten sind in settings.nodes gelistet */
                      _(settings.nodes.split(/ *, */)).each(function(n) {
                         if (n in data) {
                             if (check_columns(data[n],['name','id'])) {
                                 _(data[n].all()).each(function(node,z) {
                                    if (node.id in nodes) {
                                        config.log("FEHLER","Tabelle <i>",n,"</i>, Zeile <i>",z+2,"</i>: die id <b>",node.id,"</b> ist doppelt vergeben. Sie kommt auch in Tabelle <i>",nodes[node.id].type,"</i>, Zeile <i>",nodes[node.id].line,"</i> vor");
                                        return;
                                    }
                                    node.type=n;
                                    node.line=z+2;
                                    gnode={ 'name' : node.name, 'id' : node.id, 'adjacencies' : [], data : _(node).extend(settings[n] || {})};
                                    nodes[node.id]=gnode;
                                 });
                            config.log("Tabelle <i>",n,"</i>: ",data[n].all().length," Einträge für Netzknoten.");
                          }
                       } else {
                            config.log("FEHLER","Tabelle <i>",n,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>settings</i> unter <i>edges</i> aufgelistet und sollte Netzknoten enthalten.");
                      }
                     });

                     /* Worksheets mit Kanten sind in settings.edges gelistet */
                     _(settings.edges.split(/ *, */)).each(function(n) {
                         if (n in data) {
                             if (check_columns(data[n],['from','to'])) {
                                _(data[n].all()).each(function(edge,z) {
                                    if (check_nodes(edge,['from','to'],z,n)) {
                                        edge.line=z+2;
                                        edge.type=n;
                                        nodes[edge.from].adjacencies.push({ 'nodeFrom' : edge.from, 'nodeTo' : edge.to, 'data' : _(edge).extend(settings[n] || {}) });
                                        nodes[edge.to].adjacencies.push({ 'nodeFrom' : edge.from, 'nodeTo' : edge.to, 'data' : _(edge).extend(settings[n] || {}) });
                                    }
                                });
                            config.log("Tabelle <i>",n,"</i>: ",data[n].all().length," Einträge für Netzverbindungen.");
                            }
                        } else {
                            config.log("FEHLER","Tabelle <i>",n,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>settings</i> unter <i>edges</i> aufgelistet und sollte Netzverbindungen enthalten.");
                        }
                    });

                config.settings = settings;
                callback({nodes: nodes, settings: settings});
                }
            });
        }

    return {
        'load' : load
    };
});
