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

let running = false;
let duration = 12000;

function reset() {
    let abpick = innerWidth > 1050 ? 1050 : innerWidth > 600 ? 600 : 375;
    let grabid = d3.select(".g-version.g-show .ai2html");
    let iduse = grabid.attr("id").split("-")[2];
    let abid = "g-map-" + iduse + "-" + abpick;
    let sel = d3.select("#" + abid);
    sel.transition()
}
window.d3 = d3;
function run() {
    console.log("run called")
    let abpick = innerWidth > 1050 ? 1050 : innerWidth > 600 ? 600 : 375;
    let grabid = d3.select(".g-version.g-show .ai2html");
    let iduse = grabid.attr("id").split("-")[2];
    let abid = "g-map-" + iduse + "-" + abpick;
    let sel = d3.select("#" + abid);
    sel.style("display", "block")
    let id = abid;
    
    kmlabels.forEach(function(d){
        d.selname = "#" + id + "-kmlabels-img g[data-name='" + d.id + "']"
        sel.selectAll(d.selname).style("opacity", 0.1)
    })

    arrows.forEach(function(d){
        d.selname = "#" + id + "-arrows-img g[data-name='" + d.id + "']"
        sel.selectAll(d.selname).style("opacity", 0)
    })

    let path = sel.select("#" + id + "-route-img path")
    if (path && path.node()) {
        let scale = path.node().getBoundingClientRect().width/path.node().getBBox().width;
        let length = path.node().getTotalLength()*scale;
        repeat(length);

        function repeat(length) {
            kmlabels.forEach(function(d){
                sel.selectAll(d.selname).style("opacity", 0.1)
            })

            // arrows.forEach(function(d){
            //     sel.selectAll(d.selname).style("opacity", 0.1)
            // })
    
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
                  path.attr("stroke-dashoffset", length*(1-pct))
                  if (running) {
                    kmlabels.forEach(function(d){
                    if (pct >= d.pct) {
                        sel.selectAll(d.selname).style("opacity", 1)
                    }
                    })
                    // arrows.forEach(function(d){
                    // if (pct >= d.pct) {
                    //     sel.selectAll(d.selname).style("opacity", 1)
                    // }
                    // })
                  }
                };
              }).on("end", function(){
                timeout = setTimeout(function(){
                    repeat(length);
                }, 1000)
              }); // this will repeat the animation after waiting 1 second;
        };
    }
}

if (elementInViewport2() && !running) {
    console.log("hi")
    running = true;
    run();
}

let ow = window.innerWidth;
window.addEventListener('resize', function(event) {
    if (window.innerWidth !== ow ) {
        ow = window.innerWidth;
        run();
    }
}, true);

window.addEventListener('scroll', function(event) {
    if (elementInViewport2() && !running) {
        running = true;
        run();
    } else if (!elementInViewport2()) {
        running = false;
        reset();
    }
}, true);


function elementInViewport2(el) {
    var el = d3.select(".g-version.g-show .ai2html").node()
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
  
    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }
  
    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
  }