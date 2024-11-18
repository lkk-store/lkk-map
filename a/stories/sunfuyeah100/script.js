d3.queue()
	.defer(d3.json, "maclehose-with-sections-proj.json")
    .defer(d3.json, "../maclehose-trail/meta.json")
    .defer(d3.json, "hkg.json")
    .defer(d3.csv, "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU7WUEmGn6K4Fc6MOw_46trqCnhtIxaCYo9AQOOWT_yNQi43LF0e_m0G61H8FBTEAyAY65nFqgY4x7/pub?gid=71895201&single=true&output=csv")
    .awaitAll(function(err, res){
        
    let route = res[0];
    let hkg = res[2];
    let data = res[3];
    let hed = d3.select(".hed");
    let reversed = false;
    let proj, path, circle, duration, durationacc, durationtotal;
    let durationmultiplier = 3;
    function drawMap() {

        duration = [], durationacc = [], durationtotal = 0;

        let cont = d3.select(".g-map");
        let inner = d3.select(".g-map-inner");
        let svgcont = d3.select(".g-svg-cont").html("");
        let width = cont.node().getBoundingClientRect().width;
        let height = width * 0.712;

        let isM = width < 460;
        durationmultiplier = isM ? 8 : 3;

        let hkgf = topojson.feature(hkg, hkg.objects.hkg);
        let routef = topojson.feature(route, route.objects["maclehose-with-sections"]);

        inner.style("width", width + "px").style("height", height + 'px');
        let svg = svgcont.append("svg").attr("width", width).attr("height", height);
        proj = d3.geoIdentity().reflectY(true).fitSize([width, height], hkgf);
        path = d3.geoPath().projection(proj);

        let hkgg = svg.append("g.hkg");
        hkgg.appendMany("path.hkg", hkgf.features)
            .attr("vector-effect", "non-scaling-stroke")
            .attr("d", path)
        
        if (!reversed) {
            routef.features[1].geometry.coordinates = routef.features[1].geometry.coordinates.reverse();
            reversed = true;   
        }

        svg.append("g").appendMany("path.g-path", routef.features)
            .attr("vector-effect", "non-scaling-stroke")
            .attr("id", (d,i) => "path-" + i)
            .attr("d", path);

        circle = svg.append("circle")
            .attr("r", 0)

        let offset = [
            [-2,2,40],
            [2,2,-50],
            [0,-5,180],
            [0,-5,150],
            [2,2,-40],
            [4,2,40],
            [-2,2,90],
            [0,-3,180],
            [0,-3,180],
            [0,-3,isM ? 160 : 180],
            [-3,-3,150]
        ]

        let sectionText = [
            [[853581,826169],isM ? 3 : 0, isM ? 0 : -10, isM ? -8 : 40],
            [[857316,830203],0,0,isM ? 20 : 80],
            [[849880,832402],0,isM ? -5 : -8, isM ? -40 : 0],
            [[843164,827414],-5,0,isM ? -80 : -40],
            [[838142,824479],0,-3, isM  ? -30 : 0],
            [[833051,824875],isM ? 8 : 20, isM ? -2 : -5, isM ? 20 : 70],
            [[835580,828177],isM ? 5 : 7, isM ? -5 : -5, isM ? 40 : 80],
            [[831677,831110],0,-5, isM ? -40 : 0],
            [[826805,829436],0,-5,isM ? -60 : -20],
            [[820168,828564],0,-5, isM ? -60 : -20]
        ]

        let tripath = isM ? "M0,0 L-2,6 L0,4 L2,6 L0,0" : "M0,0 L-4,12 L0,9 L4,12 L0,0";
        let sectiontripath = isM ? "M-4.5,-4 L5,-4 L0.5,3 L-4.5,-4" : "M-10,-9 L10,-9 L1,7 L-10,-9";
        
        for (let i = 0; i < (routef.features.length+1); i++) {
            let p = i == 10 ? d3.select("#path-9") : d3.select("#path-" + i);
            let d = p.node().getTotalLength()*durationmultiplier
            duration.push(d);
            durationacc.push(durationtotal);
            durationtotal += d;

            let pt = i == 10 ? p.node().getPointAtLength(p.node().getTotalLength()) : p.node().getPointAtLength(0);
            let rotate = offset[i] ? offset[i][2] : 0;
            let offsetx = offset[i] ? offset[i][0] : 0;
            let offsety = offset[i] ? offset[i][1] : 0;
            svg.append("path.triangle")
                .attr("transform", `translate(${pt.x + offsetx},${pt.y + offsety}) rotate(${rotate})`)
                .attr("d", tripath)

            if ( i == 0) {
                circle.attr("transform", `translate(${pt.x},${pt.y})`)
                hed.style("transform", "translate(" + pt.x + 'px,' + pt.y + 'px')
            }

            if (sectionText[i]) {
                let pathpt = {"type": "Feature","geometry": {"coordinates": sectionText[i][0],"type": "Point"}};
                let pt = path.centroid((pathpt));
                let section = svg.append("g")
                    .attr("transform", `translate(${pt[0] + sectionText[i][1]},${pt[1] + sectionText[i][2]}) rotate(${sectionText[i][3] || 0})`)
                    // .attr("transform", `translate(${pt[0] + sectionText[i][1]},${pt[1] + sectionText[i][2]})`)
                
                section.append("path.section-tri")  
                    .attr("d", sectiontripath)

                section.append("text.section-text")
                    .text(i+1)
            }

        }

        let labelsg = svg.append("g")

        let labels = [
            [[837561,813607], ["香港島", "HONG KONG ISLAND"]],
            [[813072,814074], ["大嶼山", "LANTAU ISLAND"]],
            [[836158,819823], ["九龍", "KOWLOON"]],
            [[853581,829692], ["西貢", "SAI KUNG"]],
            [[814282,827172], ["屯門", "TUEN MUN"]],
            // [isM ? [829374,836937] : [830153,835525], ["新界", "NEW TERRITORIES"]]
        ]

        let dlabs = labelsg.appendMany("g.g-labels", labels)
            .translate(function(d){
                let pathpt = {"type": "Feature","geometry": {"coordinates": d[0],"type": "Point"}};
                return path.centroid(pathpt);
            })

        dlabs.append("text.map-label")
            .appendMany("tspan", d => d[1])
            .attr("x", (d,i) => i == 0 ? 2 : 0)
            .attr("y", (d,i) => isM ? i * 5 : i * 12)
            .text(a => a)
    }
    

    function updateTimer() {

        let hoursLabel = document.getElementById("hours");
        let minutesLabel = document.getElementById("minutes");
        // let secondsLabel = document.getElementById("seconds");

        let startTime = data[0].real_time_start;
        let totalSeconds = 0, endTimeF = new Date();

        let sectionsdone = data.filter(d => d.real_time_end != '');
        let last = sectionsdone[sectionsdone.length-1];

        if (last) {
            let lastSplit = last.real_time_end.split(":");
            let lastDateSplit = last.end_date.split("/");
            let lastTimeF = new Date(2024,+lastDateSplit[0]-1,lastDateSplit[1],lastSplit[0],lastSplit[1]);

            if (startTime) {
                let startTimeSplit = startTime.split(":");
                let startDateSplit = data[0].start_date.split("/");
                let startTimeF = new Date(2024,+startDateSplit[0]-1,startDateSplit[1],startTimeSplit[0],startTimeSplit[1]);
                totalSeconds = (lastTimeF.getTime() - startTimeF.getTime()) / 1000;
                console.log(lastTimeF, startTimeF, totalSeconds)
                setTime();
                // setInterval(setTime, 1000);
            }

            let totalDistArr = data.filter(d => d.real_time_end != '').map(d => d.dist)
            
            if (totalDistArr.length > 0) {
                let totalDist = totalDistArr.reduce((a,b) => +a + +b);
                distance.innerHTML = totalDist + " km";
                let diff = (endTimeF.getTime() - lastTimeF.getTime()) / 1000;
                let h = Math.floor(diff / 3600);
                let minCalc = diff % 3600;
                let m = Math.floor(minCalc / 60);
                d3.select("#last-updated").text(h + " h " + m + " m ago");
            }
        
        }
        
        function setTime() {
            // ++totalSeconds;

            let h = Math.floor(totalSeconds / 3600);
            let minCalc = totalSeconds % 3600;
            let m = Math.floor(minCalc / 60);
            // let s = Math.floor(minCalc % 60);

            hoursLabel.innerHTML = pad(parseInt(h));
            minutesLabel.innerHTML = pad(parseInt(m));
            // secondsLabel.innerHTML = pad(s);
        }

        function pad(val) {
             var valString = val + "";
            if (valString.length < 2) {
                return "0" + valString;
            } else {
                return valString;
            }
        }

    }

    function goTo() {

        let sectionsdone = data.filter(d => d.real_time_end != '');
        let last = sectionsdone[sectionsdone.length-1];
        
        if (last) {
            let range = d3.range(0,+last.section);

            range.forEach(function(id){

                setTimeout(function(){

                    let p = d3.select("#path-" + id);
                    
                    transition();
                    
                    function transition() {
                        circle.transition()
                            .duration(duration[id])
                            .ease(d3.easeLinear)
                            .attrTween("transform", translateAlong(p.node()))
                            .each("end", transition);
                    }

                    function translateAlong(p) {
                        var l = p.getTotalLength();
                        return function(d, i, a) {
                            return function(t) {
                                var pt = p.getPointAtLength(t * l);
                                hed.style("transform", "translate(" + pt.x + 'px,' + pt.y + 'px')
                                return "translate(" + pt.x + "," + pt.y + ")";
                            };
                        };
                    }
                }, durationacc[id])
            })

        }
        
    }

    function summaryText() {
        let sel = d3.select(".summary-text").html("");
        let tb = sel.append("table");

        let th = tb.append("thead").append("tr");
        th.append("td.section");
        th.append("td.dist").text("Dist. (km)");
        th.append("td.duration").text("Duration");
        
        let rows = tb.append("tbody").appendMany("tr", data.filter(d => d.section));
        rows.append("td.section").text(d => d.section);
        rows.append("td.dist").text(d => d.dist);
        rows.append("td.duration").text(d => d.real_duration);
        
    }

    
    drawMap();
    summaryText();
    updateTimer();
    goTo();

    d3.select(".g-map-outer").classed("ready", true);

    window.addEventListener('resize', function(event) {
        drawMap();
    }, true);

})



