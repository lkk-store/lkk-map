d3.loadData("js/shoreline.json", "js/all.json", "js/pointsproj.json", function(err, res){

    let shoreline = res[0];
    let shorelineshp = topojson.feature(shoreline, shoreline.objects["shoreline-2002"]);

    let all = res[1];
    // let names = Object.keys(all.objects).filter(d => d.indexOf("long") > -1);
    let names = [
        'a2023-10-15_long',
        'a2023-10-22_long',
        'a2023-10-29_long',
        'a2023-11-12_long',
        'a2023-11-19_long',
        'a2023-11-26_long',
        'a2023-12-03_long',
        'a2023-12-10_long',
        'a2023-12-17_long',
        'a2023-12-24_long',
        'a2023-12-31_long',
        'a2024-01-07_long',
        'a2024-01-14_long',
    ]

    let points = res[2];
    let pointshp = topojson.feature(points, points.objects.points);

    let shapes = [];

    names.forEach(function(d){
        shapes.push(topojson.feature(all, all.objects[d]));
    })

    let longest = topojson.feature(all, all.objects["a2023-12-17_long"]);

    let distlookup = {
        "2023-10-15": [19, 7335],
        "2023-10-22": [14.37, 5211],
        "2023-10-29": [24, 8709],
        "2023-11-12": [21.1, 7532],
        "2023-11-19": [24.02, 8332],
        "2023-11-26": [26.01, 9247],
        "2023-12-03": [22.01, 7057],
        "2023-12-10": [30, 10789],
        "2023-12-17": [21.13, 6539],
        "2023-12-24": [30.01, 10012],
        "2023-12-31": [21.22, 6997],
        "2024-01-07": [21.13, 7227],
        "2024-01-14": [12.87, 4200]
    }


    let g, path;
    let delayTime = 3000;
    let intervalId;
    let timeouts = [];
    if (intervalId) {
        clearInterval(intervalId);
    }
    drawMap();
    intervalId = setInterval(drawMap, names.length*delayTime);

    let ow = window.innerWidth;
    window.addEventListener('resize', function(event) {
        if (window.innerWidth !== ow ) {
            ow = window.innerWidth;
            clearInterval(intervalId);
            for (var i=0; i<timeouts.length; i++) {
                clearTimeout(timeouts[i]);
            }
            timeouts = [];
            drawMap();
            intervalId = setInterval(drawMap, names.length*delayTime);
        }
    }, true);

    function drawMap(initial) {
        // console.log("draw map called");
        d3.selectAll(".g-map-cont-inner").each(function(){
            let outercont = d3.select(this);
            let sel = outercont.select(".g-map-cont-inner-2").html("");

            let width = d3.select(".g-version.g-show .g-map-cont").node().getBoundingClientRect().width;
            let height = width;

            let projection = d3.geoIdentity().reflectY(true).fitSize([width*.8, height*.8], longest);
            let path = d3.geoPath().projection(projection);

            let counter = outercont.select(".g-counter-cont").html("");
            let svg = sel.append("svg").attr("width", width).attr("height", height);

            let gleft = width*.2;
            g = svg.append("g").translate([gleft,0])

            g.appendMany("path.g-shoreline", shorelineshp.features)
                .attr("d", path);
            
            g.append("image")
                .attr("href", "img/gradient.png")
                .attr("width", width)
                .attr("height", height)
                .style("opacity", 0.5)
                .translate([-gleft,0]);


            let text  = g.appendMany("text.g-label", pointshp.features)
                .translate(d => path.centroid(d))
        
            text.append("tspan")
                .attr("x", 0)
                .attr("y", 0)
                .text(d => d.properties.name.split(" ")[0])
            
            text.append("tspan")
                .attr("x", 0)
                .attr("y", 12)
                .text(d => d.properties.name.split(" ")[1])
            
            let delay = 0;
            let date = outercont.selectAll('.g-map-cont .g-date');
            let dist = outercont.selectAll('.g-map-cont .g-dist');
            let time = outercont.selectAll('.g-map-cont .g-time');
            let pace = outercont.selectAll('.g-map-cont .g-pace');
            let formatdate = d3.timeFormat("%b %e");

            shapes.forEach(function(d,i){
                counter.append("div.g-dot.g-dot-" + i);
            })

            shapes.forEach(function(shape,i){
                let type = names[i].split("_")[1];
                let datetext = names[i].split("a")[1].split("_")[0];

                if (type == "long") {
                    let p = g.appendMany("path", shape.features)
                        .attr("class", "g-runs g-" + type)
                        .attr("d", path)

                    let totalLength = p.node().getTotalLength();
                    p.attr("stroke-dasharray", totalLength + " " + totalLength);
                    p.attr("stroke-dashoffset", totalLength)
                        .transition()
                        .delay(delay)
                        .duration(1500)
                        // .ease("linear")
                        .style("stroke-width", 3)
                        .attr("stroke-dashoffset", 0)
                        .on("end", function(){
                            d3.select(this).transition()
                                .delay(800)
                                .duration(1000)
                                .style("opacity", 0.2)
                                .style("stroke-width", 1)
                        })
                    
                    function secondsToHms(d) {
                        d = Number(d);
                        var h = Math.floor(d / 3600);
                        var m = Math.floor(d % 3600 / 60);
                    
                        var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
                        var mDisplay = m > 0 ? m + " min." : "";
                        return hDisplay + mDisplay; 
                    }

                    Date.prototype.addDays = function(days) {
                        var date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    }

                    function n(n){
                        return n > 9 ? "" + n: "0" + n;
                    }

                    timeouts.push(setTimeout(function(){
                        let distn = distlookup[datetext][0];
                        let timen = distlookup[datetext][1];
                        let pacen = Math.round((timen/60)/distn * 100) / 100;
                        let pacemin = Math.floor(+pacen);
                        let pacesec = Math.round(pacen%1*60);
                        let pacetext = pacemin + ":" + n(pacesec) + "/km";

                        let datef = new Date(datetext);
                        datef = datef.addDays(1)

                        counter.selectAll(".g-dot").classed("g-active", false);
                        counter.selectAll(".g-dot-" + i).classed("g-active", true);

                        date.html(formatdate(datef));
                        dist.html(Math.round(distn * 10) / 10 + " km");
                        time.html(secondsToHms(timen));
                        pace.html(pacetext);

                    }, delay));

                    delay += delayTime;

                }
            })

        });
    }
    

})
