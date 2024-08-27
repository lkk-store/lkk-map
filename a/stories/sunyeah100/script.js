d3.queue()
	.defer(d3.json, "../maclehose-trail/maclehose.json")
    .defer(d3.json, "../maclehose-trail/meta.json")
    .defer(d3.csv, "data.csv")
    .awaitAll(function(err, res){

    let route = res[0];
    let labels = res[1];
    let data = res[2];

    let cont = d3.select(".schedule").html("");

    let things = ["section","time_start","start","dist","duration","pace"];
    let label = ["","START","WHERE","DIST.","TIME","PACE"];

    let th = cont.append("tr.bold");
    things.forEach(function(thing,i){
        th.append("td").text(label[i]);
    })

    data.forEach(function(d){

        let tr = cont.append("tr");

        things.forEach(function(thing){
            tr.append("td")
                .text(d[thing])
        })

    })

    function drawMap() {

        let cont = d3.select(".g-map").html("");

        let width = cont.node().getBoundingClientRect().width - 20;
        let height = width*.25;

        let routef = topojson.feature(route, route.objects.trail);
        let svg = cont.append("svg").attr("width", width).attr("height", height);
        let proj = d3.geoMercator().fitSize([width, height], routef);
        let path = d3.geoPath().projection(proj);

        svg.appendMany("path.g-path", routef.features)
            .attr("d", path)

        var labelsg = svg.append("g")

        let labels = [
            [114.323814700,22.400008700, ["北潭涌"], "end", 0, 17],
            // [114.374653,22.4111482, ["鹹田"], "start",5, 3],
            [114.252388, 22.4090596, ["馬鞍山", "702"], "middle", 0, -22],
            [114.1870766, 22.3531043, ["獅子山", "495"], "middle", 0, 18],
            [114.12504469377492, 22.411564186617436, ["大帽山", "957"], "middle", 0, -25],
            [114.0637395, 22.3897581, ["田夫仔"], "middle", 0, 18],
            [113.977891400, 22.395125300, ["屯門"], "middle", 0, -8]
        ]

        var dlabs = labelsg.appendMany("g.g-labels", labels)
            .translate(function(d){
                return proj([d[0], d[1]])
            })
            
        dlabs.append("circle")
            .attr("r", 3)
    
        dlabs.append("text")
            .attr("text-anchor", d => d[3])
            .translate(d => [d[4], d[5]])
            .tspans(d => d[2], 15)


    }

    drawMap();
})