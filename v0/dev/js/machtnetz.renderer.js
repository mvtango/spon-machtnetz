/*
 * Render Force-Directed Graph
 *
 */

define(['jquery', 'underscore', 'machtnetzloader', 'd3', 'config'],
    function($, _, loader, d3, config) {

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
            //.charge(-120)
            //.linkDistance(30)
            .size([width, height]);
        
        svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height);
    }


    function renderGraph(nodes, edges, centralNode) {
        initGraph();
        var links = edgesToIndices(nodes, edges);

        _.each(nodes, function(node) {
            if (node.id == centralNode) {
                node.x = $graph.width() / 2;
                node.y = $graph.height() / 2;
                node.fixed = true;
            }
        });
        
        force
            .nodes(nodes)
            .links(links)
            .gravity(0.05)
            .theta(0.6)
            .linkDistance(40)
            .start();

        svg.selectAll(".link").remove();
        var link = svg.selectAll(".link")
                .data(links);

        link.enter().append("line")
                .attr("class", "link")
                .style("stroke-width", 1);

        svg.selectAll(".node").remove();
        var node = svg.selectAll(".node")
                .data(nodes);
        node.enter().append("circle")
                .attr("class", "node")
                .attr("r", function(d) { return d.id == centralNode ? d.size * 1.5 : d.size; })
                .style("fill", function(d) { return d.color; })
                .call(force.drag)
                .on('click', function(d) {
                    config.jumpRelative({'name': d.id});
                });
        
        node.append("title")
            .style("stroke", function(d) { return d.color; })
            .text(function(d) { return d.name; });

        
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


    function edgesToIndices(nodes, edges) {
        // for great glory and d3.
        var map = {},
            links = [];
        _.each(nodes, function(node, index) {
            map[node.id] = node;
        });
        _.each(edges, function(edge) {
            var link = _.extend({}, edge);
            link.source = map[edge.source];
            link.target = map[edge.target];
            if (link.source===undefined) {
                console.log(link);
            }
            links.push(link);
        });
        return links;
    }
    

    function focus(centralNode, depth) {
        initGraph();
        loader.graphSection(centralNode, depth, function(nodes, edges) {
            //console.log(nodes.length);
            //console.log(edges.length);
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



