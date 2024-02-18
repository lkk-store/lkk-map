let pagestate = "cn";

const addQueryParam = (key, value) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url.toString());
  };
  

function switchTo(lang) {
    d3.selectAll(".g-version").classed("g-show", false)
    d3.selectAll(".g-" + lang + "-version").classed("g-show", true)
    pagestate = lang;
    addQueryParam("v", lang)
}

function addUrlParameter(name, value) {
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set(name, value)
    window.location.search = searchParams.toString()
}

const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('v');

if (lang && lang != pagestate) {
    switchTo(lang);
}

d3.select(".g-read.g-cn").on("click", function(){
    switchTo("cn")
})

d3.select(".g-read.g-en").on("click", function(){
    switchTo("en")
})

function updatechartlang() {
    let se
}

d3.loadData("js/list.csv", function(err, res){
    let data = res[0];

    data.forEach(function(d){
        d.datef = new Date(d["Activity Date"]);
        d.weekday = d.datef.getDay();
    })

    let weektext = ["Mon","Tue","Wed","Thur","Fri", "Sat", "Sun"];
    let weekuse = [6,0,1,2,3,4,5];

    let weeks = d3.range(1,16);

    
    function drawChart(v) {
        let sel = d3.select(".g-" + v + "-version .g-training-chart .g-chart").html("");
        console.log(".g-" + v + "-version .g-training-chart .g-chart")
        let keycont = sel.append("div.g-key");
        let colors = {
            "tempo": "rgba(77, 238, 234, .6)",
            "interval": "rgba(116, 238, 21, .6)",
            "long": "rgba(240, 0, 255, .6)",
            "bike ride": "none"//"rgba(216, 226, 231, .6)"
            // "rgba(255,0,255,.2)"
        }
        
        let chinesekey = ["節奏跑", "間距跑", "長課"]
        Object.keys(colors).forEach(function(d,i){
            if (d != "bike ride") {
                let k = keycont.append("div.g-key-each");
                k.append("div.g-rect").style("background", colors[d])
                k.append("div.g-key-text").text(v == "cn" ? chinesekey[i] : d);
            }
        })

        let width = d3.select(".g-" + pagestate + "-version .g-chart").node().getBoundingClientRect().width;
        let rowh = 35;
        let height = rowh*(weeks.length);
        let svg = sel.append("svg").attr("width", width).attr("height", height);
        let barheight = rowh - 5;
       
        let leftmargin = 120;
        let rightmargin = 55;
        // let x = d3.scaleLinear().range([0,width-leftmargin]).domain([0,70])
        // let xaxis = d3.axisBottom(x).tickSize(height-25).tickValues([10,20,30,40,50,60]).tickFormat(d => d + " km");
        let x = d3.scaleLinear().range([0,width-leftmargin-rightmargin]).domain([0,6])
        let xaxis = d3.axisTop(x).tickSize(height-16).tickValues([0,1,2,3,4,5,6]).tickFormat(d => weektext[d]);
        let texty = 20;
        let textkmy = 48;
        let colwidth = width/7;
        let rscale = d3.scaleSqrt().range([5,30]).domain([1,35]);

        svg.append("text.g-small-text").text("Week").translate([0,-12])
        svg.append("text.g-small-text").text("of").translate([0,0])

        svg.append("text.g-small-text").text("Total").translate([textkmy,-12])
        svg.append("text.g-small-text").text("km").translate([textkmy,0])

        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        svg.append("g.x.axis")
            .translate([leftmargin,height-25])
            .call(xaxis)

        let firstdate = new Date("2023-10-02")
        let formatdate = d3.timeFormat("%b %e")
        weeks.forEach(function(week,i){
            let filtered = data.filter(d => +d.Week == +week);
            let total = Math.round(d3.sum(filtered.filter(d => d.type != "bike ride").map(d => d.Distance)));
            
            let weekg = svg.append("g.g-week-"+ week).translate([0,(i)*rowh]);
            weekg.append("text.g-bold").text(formatdate(firstdate)).attr("y", texty);

            firstdate = firstdate.addDays(7)

            weekg.append("text").text(total + " km").translate([textkmy,0]).attr("y", texty);

            let barg = weekg.append("g")
            barg.translate([leftmargin,0])

            // let left = 0;
            filtered.forEach(function(d,di){
                let km = d["Distance"];
                
                barg.append("circle")
                    .attr("r", rscale(+d.Distance))
                    .translate([x(weekuse[d.weekday]),rowh/2])
                    .style("fill", colors[d.type])
                    .style("stroke", d.type == "bike ride" ? "rgba(255,255,255,0.5)" : "")
                    .style("stroke-dasharray", d.type == "bike ride" ? "3 2" : "")
                
                barg.append("text.g-text-" + i + "-" + di)
                    .style("text-anchor", "middle")
                    .style("text-shadow", "0 0 3px #000")
                    .text(Math.round(+d.Distance))
                    .translate([x(weekuse[d.weekday]),rowh/2+5])
                    .style("fill", "#fff")


            //     barg.append("rect")
            //         .style("fill", colors[d.type])
            //         .translate([left,0])
            //         .attr("width", x(km))
            //         .attr("height", barheight)
                
            //     // if (i != 0) {
            //     //     barg.append("rect")
            //     //         .style("stroke", "#fff")
            //     //         .translate([left,1])
            //     //         .attr("width", 0.1)
            //     //         .attr("height", barheight-2)
            //     // }
                
            //     // if (d.type != "interval") {
            //         barg.append("text.g-bar-text")
            //             .translate([left + 3, texty])
            //             .style("opacity", 0.6)
            //             .style("fill", "#000")
            //             .style("font-size", "10px")
            //             .text(d.type == "interval" ? d.text.split("x")[0] + "x" : Math.round(km * 10) / 10 + "k")
            //     // }
                
            //     left += x(km);
            })

            if (i == weeks.length - 1) {
                barg.append("circle")
                    .translate([x(6),rowh/2])
                    .style("stroke", "#ffcc00")
                    .style("fill", "rgba(255,231,0,0.2)")
                    .attr("r", rscale(42.195))
                
                barg.append("text")
                .style("text-anchor", "middle")
                    .translate([x(6),rowh/2 + 5])
                    .text(v == "cn" ? "馬拉松" : "MARATHON")
            }
        })


        
        let annog = svg.append("g.g-svg-anno").translate([width-115,-50])
        let y1 = -10;
        let lineheight = pagestate == "cn" ? 13 : 11.5;
        annog.append("text").translate([75,y1]).text(v == "cn" ? "沿紐約馬拉松路徑" : "Biked the NYC")
        annog.append("text").translate([75,y1+lineheight]).text(v == "cn" ? "踩了趟長途單車" : "marathon route")
        annog.append("text").translate([75,y1+lineheight*2]).text(v == "cn" ? "所以沒有跑長課" : "instead of running")

        annog.append("path")
            .translate([80,0])
            .style("stroke", "#fff")
            .style("fill", "none")
            .attr("d", "M0,0 C0,0 25,45 0,140")
        
        annog.append("path")
            .style("fill", "#fff")
            .attr("transform", "translate(79,142) rotate(-70)")
            .attr("d", "M0,0 L10,-3 L10,3")

        
    }

    function drawAllCharts() {
        // d3.selectAll(".g-training-chart .g-chart").each(function(){

        let versions = ["en", "cn"]
        versions.forEach(function(v){
            drawChart(v);
        })
            
        // })
    }

    drawAllCharts();

    let ow = window.innerWidth;
    window.addEventListener('resize', function(event) {
        if (window.innerWidth !== ow ) {
            ow = window.innerWidth;
            drawAllCharts();
        }
    }, true);

   


})