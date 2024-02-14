console.log("hi")

let kmlabels = [
    { id: "start", pct: 0},
    { id: "5km", pct: 0.12},
    { id: "10km", pct: 0.23},
    { id: "15km", pct: 0.35},
    { id: "20km", pct: 0.48},
    { id: "25km", pct: 0.599},
    { id: "30km", pct: 0.697},
    { id: "35km", pct: 0.83},
    { id: "40km", pct: 0.945},
    { id: "end", pct: 0.995}
]

let arrows = [
    { id: "1", pct: 0.015},
    { id: "2", pct: 0.065},
    { id: "3", pct: 0.09},
    { id: "4", pct: 0.14},
    { id: "5", pct: 0.2},
    { id: "6", pct: 0.305},
    { id: "7", pct: 0.405},
    { id: "8", pct: 0.46},
    { id: "9", pct: 0.545},
    { id: "10",pct: .62},
    { id: "11",pct: .71},
    { id: "12", pct: .795},
    { id: "13", pct: .855},
    { id: "14", pct: .875},
    { id: "15", pct: 0.905},
    { id: "16", pct: .93},
    { id: "17", pct: .985},
]

let labels = [
    { id: "highschool", pct: 0.1},
    { id: "lkkstore", pct: 0.1},
    { id: "lionrock", pct: 0.1},
    { id: "airport", pct: 0.35},
    { id: "harbor", pct: 0.8},
    { id: "walking", pct: 0.9},
]

let duration = 12000;

// d3.selectAll(".g-artboard").each(function(){

    let abpick = innerWidth > 1050 ? 1050 : innerWidth > 600 ? 600 : 375;
    let abid = "g-map-black-" + abpick;
    let sel = d3.select("#" + abid);
    let id = abid;

    // let sel = d3.select(this);
    // let id = abid;
    
    kmlabels.forEach(function(d){
        d.selname = "#" + id + "-kmlabels-img g[data-name='" + d.id + "']"
    })

    arrows.forEach(function(d){
        d.selname = "#" + id + "-arrows-img g[data-name='" + d.id + "']"
    })

    let path = sel.select("#" + id + "-route-img path")
    console.log("#" + id + "-route-img path")

    if (path && path.node()) {
        let length = path.node().getTotalLength();
        console.log(path.node().getTotalLength())
        
        repeat(length);
        function repeat(length) {
            kmlabels.forEach(function(d){
                sel.selectAll(d.selname).style("opacity", 0.1)
            })

            arrows.forEach(function(d){
                sel.selectAll(d.selname).style("opacity", 0.1)
            })

            labels.forEach(function(d){
                sel.selectAll(d.selname).style("opacity", 0.1)
            })
    
            path.attr("stroke-dasharray", length + " " + length)
                .attr("stroke-dashoffset", length)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(duration)
            
            sel.transition()
              .duration(duration)
              .ease(d3.easeLinear)
              .tween("text", function(t) {
                const i = d3.interpolateRound(0, length);
                return function(t) { 
                  let pct = i(t)/length;
                  console.log(length)
                  path.attr("stroke-dashoffset", length*(1-pct))
                  kmlabels.forEach(function(d){
                    if (pct >= d.pct) {
                        sel.selectAll(d.selname).style("opacity", 1)
                    }
                  })
                  arrows.forEach(function(d){
                    if (pct >= d.pct) {
                        sel.selectAll(d.selname).style("opacity", 1)
                    }
                  })
                };
              }).on("end", () => setTimeout(function(){
                repeat(length)
              }, 1000)); // this will repeat the animation after waiting 1 second;
        };
    }    



// })