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

    var nodesDfd = $.Deferred(),
        edgesDfd = $.Deferred();

    function loadTemplates(templates) {
        /* Templates aus Worksheet 'templates' */
        _(templates.all()).each(function(template) {
            var name = template.name + '-' + template.type;
            $.Mustache.add(name, template.code);
        });
    }

    function loadSettings(settings) {
        /* Variablen aus Worksheet 'settings' */
        var _settings = {};
        _(settings.all()).each(function(row, rowIndex) {
            try {
                _settings[row.name] = JSON.parse(row.value);
            } catch(e) {
                _settings[row.name] = row.value;
            }
        });
        config.settings.resolve(_settings);
        return _settings;
    }

    function loadNodes(sheet, settings) {
        /* Worksheets mit Netzknoten sind in settings.nodes gelistet */
        var nodes = {};

        _.each(settings.nodes.split(/ *, */), function(type) {
            if (!(type in sheet)) {
                config.log("FEHLER","Tabelle <i>", type ,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>settings</i> unter <i>edges</i> aufgelistet und sollte Netzknoten enthalten.");
                return;
            }
            var table = sheet[type];
            if (!hasColumns(table, ['name', 'id'])) return;

            _(table.all()).each(function(node, rowIndex) {
                if (_.contains(_.keys(nodes), node.id)) {
                    config.log("FEHLER","Tabelle <i>",type,"</i>, Zeile <i>",rowIndex+2,"</i>: die id <b>",node.id,"</b> ist doppelt vergeben.");
                    return;
                }
                node.type = type;
                node.line = rowIndex + 2;
                node.weight = 0;
                node = _.extend(node, settings[type] || {});
                node._inbound = [];
                node._outbound = [];
                nodes[node.id] = node;
            });
        });
        nodesDfd.resolve(_.values(nodes));
        return nodes;
    }

    function loadEdges(sheet, settings, nodes) {
        /* Worksheets mit Kanten sind in settings.edges gelistet */
        var edges = [],
            nodeIDs = _.keys(nodes);
        _(settings.edges.split(/ *, *-/)).each(function(type) {
            if (!(type in sheet)) {
                config.log("FEHLER","Tabelle <i>", type,"</i> nicht vorhanden. Die Tabelle ist in der Tabelle <i>settings</i> unter <i>edges</i> aufgelistet und sollte Netzverbindungen enthalten.");
                return;
            }

            var table = sheet[type];
            if (!hasColumns(table, ['source', 'target'])) return;

            _(table.all()).each(function(edge, rowIndex) {
                edge.line = rowIndex + 2;
                edge.type = type;
                edge = _.extend(edge, settings[type] || {});
                if (!_.contains(nodeIDs, edge.source)) {
                    config.log("FEHLER","Tabelle <i>", type,"</i>, Zeile <i>", edge.line ,"</i> Spalte <i>source</i>: Der Netzknoten <b>", edge.source ,"</b> fehlt.");
                    return;
                }
                if (!_.contains(nodeIDs, edge.target)) {
                    config.log("FEHLER","Tabelle <i>", type,"</i>, Zeile <i>", edge.line ,"</i> Spalte <i>target</i>: Der Netzknoten <b>", edge.target ,"</b> fehlt.");
                    return;
                }
                edge.source = nodes[edge.source];
                edge.source._outbound.push(edge);
                edge.target = nodes[edge.target];
                edge.target._inbound.push(edge);
                edge.id = edge.source + '>->' + edge.target;
                edges.push(edge);
            });
        });
        edgesDfd.resolve(edges);
    }

    function hasColumns(table, columns) {
        var passed = true;
        var rows = table.all()[0];
        _(columns).each(function(column) {
            if (!(column in rows)) {
                config.log("FEHLER","Tabelle <i>",table,"<i> fehlt die Spalte <i>",column,"</i>");
                passed=false;
            }
        });
        return passed;
    }

    function load(spreadsheet, callback) {
        config.log("Warte auf Spreadsheet ",spreadsheet);
        var spreadsheetTimeout = setTimeout(function() {
                config.log('Spreadheet nicht veröffentlicht? Nicht geladen nach', config.timeout, 'Sekunden.<br/>', '<a href="_">_</a>'.replace("_",spreadsheet));
                /* throw "machtnetz loader timeout"; */
                config.fatal("Die Daten konnten nicht geladen werden.");
        }, config.timeout*1000);
        tabletop.init({key : spreadsheet, debug: debug,
            callback : function (data) {
                config.log('<a href="'+spreadsheet+'">Spreadsheet</a> geladen.');
                clearTimeout(spreadsheetTimeout);

                var settings = loadSettings(data.settings);
                var nodes = loadNodes(data, settings);
                loadEdges(data, settings, nodes);
                loadTemplates(data.templates);
                config.settings = settings;
                callback(settings);
            }
        });
    }

    function graphSection(centralNode, depth, callback) {
        var selectedNodes = [],
            selectedNodeIDs = [centralNode],
            selectedEdges = [],
            selectedEdgeIDs = [];

        edgesDfd.then(function(allEdges) {
            while(depth-- > 0) {
                var newEdges = [],
                    newNodes = [],
                    newNodeIDs = [];
                _.each(allEdges, function(edge) {
                    if (_.contains(selectedEdges, edge)) {
                        return;
                    }

                    var source = _.contains(selectedNodeIDs, edge.source.id),
                        target = _.contains(selectedNodeIDs, edge.target.id);
                    if ((source || target) && !(source && target)) {
                        selectedEdges.push(edge);
                        if (!source) {
                            newNodeIDs.push(edge.source.id);
                        }
                        if (!target) {
                            newNodeIDs.push(edge.target.id);
                        }
                    }
                });

                selectedNodeIDs = selectedNodeIDs.concat(newNodeIDs);
            }

            nodesDfd.then(function(allNodes) {
                _.each(allNodes, function(node) {
                    if (_.contains(selectedNodeIDs, node.id)) {
                        selectedNodes.push(node);
                    }
                });
                callback(selectedNodes, selectedEdges);
            });
        });
    }

    return {
        'load' : load,
        'graphSection': graphSection
    };
});
