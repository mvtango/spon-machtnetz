/*
 * Render Force-Directed Graph
 *
 */

define(['jquery', 'jqueryqtip', 'underscore', 'machtnetzloader', 'd3', 'config'],
    function($, qtip, _, loader, d3, config) {

    var initialized = false,
        $detail = $('#detail'),
        $graph = $('#graph'),
        force = null,
        svg = null;


    function initGraph() {
        if (initialized) return;
        initialized = true;
        console.log("Initialisiere graph....");

        var width = $graph.width(),
            height = $graph.height();

        force = d3.layout.force()
            .charge(-200)
            .gravity(0.1)
            .linkDistance(150)
            .size([width, height]);
        
        svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height);
    }

    function addTooltip(el, node) {
        var config = {
            "id": node.id,
            "position": {
                "target": 'event',
                "at": 'bottom center',
                "viewport": true
            },
            "style": {
                "classes": "rounded"
            },
            "show": {
                "delay": 0 //20
            },
            "events": {
            },
            "content": {
                "text": $.Mustache.render(node.type+"-tooltip", node, {method: 'html'})
            }
        };
        $(el).qtip(config);
    }

    function renderGraph(nodes, edges, centralNode) {
        _.each(nodes, function(node) {
            if (node.id == centralNode) {
                node.x = $graph.width() / 2;
                node.y = $graph.height() / 2;
                node.fixed = true;
            }
        });
        
        force
            .nodes(nodes)
            .links(edges)
            .start();

        svg.selectAll(".link").remove();

        var link = svg.selectAll(".link")
                .data(edges);

        link.enter().append("line")
                .attr("class", "link")
                .style("stroke-width", 1);

        svg.selectAll(".node").remove();

        var node = svg.selectAll(".node")
                .data(nodes);
        node.enter().append("circle")
                .attr("class", "node")
                .attr("r", function(d) { return d.id == centralNode ? d.size * 2 : d.size; })
                .style("fill", function(d) { return d.color; })
                .call(force.drag)
                .on('click', function(d) {
                    config.jumpRelative({'name': d.id});
                });

        _.each(_.zip(node[0], nodes), function(d) {
            addTooltip(d[0], d[1]);
        });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
    }


    function renderInfo(centralNode, nodes) {
        _.each(nodes, function(node) {
            if (node.id == centralNode) {
                $detail.mustache(node.type+"-info", node, {method: 'html'});
            }
        });
    }

    function focus(centralNode, depth) {
        initGraph();
        loader.graphSection(centralNode, depth, function(nodes, edges) {
            renderInfo(centralNode, nodes);

            // TODO: skip if mobile.
            config.loading(false);
            if ($graph.css("display") == "none") {
                return;
            }
            renderGraph(nodes, edges, centralNode);
        });
    }


    return {
        'focus': focus,
        'graph': graph
    };

});



