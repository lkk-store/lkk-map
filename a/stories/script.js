console.clear();

var sel = d3.select(".g-map").html("")
sel = sel.append("div.g-map-inner");

d3.select(".g-body").style("margin-top", (innerHeight/2 - d3.select(".g-body").node().getBoundingClientRect().height/2) + "px")

var dot, ids, wps, dotg, projection, trailpath, path, trailf, totalLength, wps, trackpts, totaldist, trailshape, hkg, all, enddp, meta, elevdot, elevx, elevy, elevwidth, lastpt, elevline, elevsvg, elevpath, elevg, elevtext;

var dsvg, dw, dh, dproj, dpath, dline, dmap, data;

var trailid = d3.select(".g-body").attr("data-trail");
var trailletter = trailid.substring(0,1);

var width = 300;
var height = width*0.8;

if (trailid == "hk") {
	width = 200;
	height = 110;
}

var dist = 0;
var counter = 0;
var prevcounter = 0;
var totaltime = 0;

var gdays = trailid == "wilson" ? 2 : 1;

function addemojis(x) {
	return x.replace(":lol:", "😂").replace(":tear:", "🥲").replace(":smile:", "🙂").replace(":sun:", "🌞")
}

d3.queue()
	.defer(d3.json, trailid + ".json")
	.defer(d3.json, "../../../data/" + trailid + ".json")
	.defer(d3.json, "parsed.json")
	.defer(d3.json, "../hkg.json")
	.defer(d3.json, "../four.json")
	.defer(d3.json, "meta.json")
	.awaitAll(function (err, res){
		
		data = res[1];
		trackpts = res[2];
		hkg = res[3];
		all = res[4];
		meta = res[5][0];
		totaldist = trackpts[trackpts.length - 1].dist;
		
		var filteredn = data.filter(d => !isNaN(+d.id.substring(0,3)));
		enddp = filteredn[filteredn.length - 1];

		var trail = res[0];
		trailshape = topojson.feature(trail, trail.objects.trail);

		var svg = sel.append("svg").attr("width", width).attr("height", height);
		projection = d3.geoMercator().fitSize([width, height], trailshape);

		path = d3.geoPath().projection(projection);

		var defs = svg.append("defs");
		var filter = defs.append("filter")
		    .attr("id", "drop-shadow")
		    .attr("height", "500%");
		filter.append("feGaussianBlur")
		    .attr("in", "SourceAlpha")
		    .attr("stdDeviation", 3)
		    .attr("result", "blur");
		filter.append("feOffset")
		    .attr("in", "blur")
		    .attr("dx", 0)
		    .attr("dy", 0)
		    .attr("result", "offsetBlur");
		var feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode")
		    .attr("in", "offsetBlur")
		feMerge.append("feMergeNode")
		    .attr("in", "SourceGraphic");

		trailf = trailshape.features;

		if (trailid == "hk") {
			trailf[0].geometry.coordinates = trailf[0].geometry.coordinates.reverse();
		}

		var line = d3.line()
          .x(function(d) { return projection(d)[0]; })
          .y(function(d) { return projection(d)[1]; })
          .curve(d3.curveBasis);
			
		var trailbg = svg.append("g.g-trailbg");
		trailbg.appendMany("path.g-trail-path", trailf)
			// .style("filter", "url(#drop-shadow)")
			.style("stroke", "rgba(255,255,255,0.6)")
			.attr("d", line(trailf[0].geometry.coordinates))

		var trailg = svg.append("g.g-trailg");
		trailpath = trailg.append("path.g-trail-path")
			// .style("filter", "url(#drop-shadow)")
			.attr("d", line(trailf[0].geometry.coordinates))

		totalLength = Math.ceil(trailpath.node().getTotalLength());

		drawElevChart();


		ids = data.map(d => d.id);
		var cont = d3.select(".g-content").html("")
		cont.style("width", data.length*375 + "px")

		var dp = cont.appendMany("div", data)	
			.attr("data-time", d => d.time)
			.attr("data-id", d => d.id)
			.attr("data-labeled", d => d.labeled)
			.attr("class", (d,i) => i == 0 ? "g-post g-post-active" : "g-post")
			.attr("id", (d,i) => "g-post-" + d.id)
			.style("transform", (d,i) => "translate(" + i*375 + "px,0)") 
			.attr("data-pic", d => d.nopic == "1" ? "false" : "true")
			.style("background-image", (d,i) => d.nopic == '1' ? "" : i == 0 ? "url(photos/" + trailletter + d.id + ".jpg)" : "url(photos-100/" + trailletter + d.id + ".jpg)")

		var textcont = dp.append("div.g-text-cont")
			.style("opacity", d => !d.text_cn && !d.text_en ? "0" : "1")
			.append("div.g-text-cont-inner");

		d3.select("#g-post-cover .g-text-cont-inner")
			.append("div.g-text.g-title.g-text-shadow")
			.text("香港四徑")

		d3.select("#g-post-cover .g-text-cont-inner")
			.append("div.g-text.g-title.g-title-en.g-text-shadow")
			.text("Hong Kong Four Trails")

		textcont.append("div.g-text.g-text-cn")
			.style("opacity", d => !d.text_cn ? "0" : "1")
			.append("div.g-text-inner")
			.html(d => "<div class='g-graf'>" + addemojis(d.text_cn.split("//").join("</div><div class='g-graf'>")) + "</div>")

		textcont.append("div.g-text.g-text-en")
			.style("opacity", d => !d.text_en ? "0" : "1")
			.append("div.g-text-inner")
			.html(d => "<div class='g-graf'>" + addemojis(d.text_en.split("//").join("</div><div class='g-graf'>next")) + "</div>")


		// end div

		var endcont = d3.select("#g-post-end").html("");
		endcont = endcont.append("div.g-text-cont")

		var endhed = endcont.append("div.g-end-hed").html("<a href='https://www.lkk-store.com/lkk-maps'>Read more on <br> LKK MAPS</a>")

		

	dotg = svg.append("g")
		.translate(projection(meta.start.pts))

	var dot = dotg.append("circle")
		.attr("r", 4)
		.attr("stroke-width", 1)
		.attr("fill", "none")
		.attr("stroke", "#ffcc00")
		.attr("id", "ring")

	dotg.append("circle")
			.attr("r", 4)
			.attr("fill", "#ffcc00")

	var labelg = svg.append("g");


	var list = ["start", "end"]
	list.forEach(function(d,i){
		labelg.append("text")
			.translate(function(){
				var pos = projection(meta[d].pts)
				return i == 0 ? [pos[0]+meta[d].offset[0], pos[1]+meta[d].offset[1]] : [pos[0]+meta[d].offset[0], pos[1]+meta[d].offset[1]]
			})
			.attr("text-anchor", meta[d].align ? meta[d].align : i == 0 ? "start" : "end")
			.tspans(i == 0 ? meta.start.text : meta.end.text, 10) 
	})

	if (document.location.hash) {
		var id = document.location.hash.replace("#", "");
		prevcounter = (ids.indexOf(id))-1;
		counter = ids.indexOf(id);
		move(id, true);
	} else {
		move("cover", true)
	}

})

d3.selectAll(".g-nav-button").on("click", function(){
	var el = d3.select(this);
	var dir = el.attr("data-dir");
	prevcounter = counter;

	if (dir.indexOf("step") > -1) {

		if (dir == "step-next") {
			counter += 1;
		}

		if (dir == "step-back") {
			counter -= 1;
		}

	} else {

		if (dir == "next") {
			var next = data.filter((d,i) => i > counter && (d.text_en || d.text_cn || d.id == "end"))[0];
			counter = data.indexOf(next)
		}

		if (dir == "back") {
			var filtered = data.filter((d,i) => i < counter && (d.text_en || d.text_cn));
			var next = filtered[filtered.length - 1]
			counter = data.indexOf(next);
		}
	}

	if (counter < 0) {
		counter = 0;
	} else if (counter > (ids.length-1)) {
		counter = ids.length - 1
	} else {
		move(counter)
	}
})


function move(id, hash) {
	if (id == "cover") {
		d3.select(".g-hint").style("display", "block")
		d3.selectAll(".g-detailed-map").classed("g-hide", true)
	} else {
		d3.select(".g-hint").style("display", "none")
	}

	var id = hash ? id : ids[id];
	var n = ids.indexOf(id);
	var el = d3.select("#g-post-" + id)

	if (n > 0) {
		d3.select(".g-back-cont").classed("g-active", true)
	} else {
		d3.select(".g-back-cont").classed("g-active", false)
	}

	if (n > 5) {
		d3.select(".g-next").classed("g-active", true);
		d3.select(".g-back").classed("g-active", true);
	} else {
		d3.select(".g-next").classed("g-active", false);
		d3.select(".g-back").classed("g-active", false);
	}

	if (n == (ids.length - 1)) {
		d3.select(".g-next-cont").classed("g-active", false);
		d3.select(".g-next-cont").classed("g-active", false);
	} else {
		d3.select(".g-next-cont").classed("g-active", true);
		d3.select(".g-next-cont").classed("g-active", true);
	}


	var duration = id == "cover" ? 3000 : 1000

	var prev = true;
	var postduration = hash ? 0 : 600;

	d3.select(".g-content")
		.transition()
		.duration(1000)
		.style("transform", "translate(-" + n*375 + "px,0)")
	
	var photoid = el.attr("data-id")
	var time = el.attr("data-time")	
	var pic = el.attr("data-pic");

	if (pic == "true") {
		el.style("background-image", photoid == "end" ? "url(../end.jpg)" : "url(photos/" + trailletter + id + ".jpg)")
	}

	if (ids[n+1]) {
		var nextel = d3.select("#g-post-" + ids[n+1]);
		var nextelpic = nextel.attr("data-pic");

		if (nextelpic == "true") {
			nextel.style("background-image", "url(photos/" + trailletter + ids[n+1] + ".jpg)")
		}
	}
	
	var next = data.filter((d,i) => i > n && (d.text_en || d.text_cn) && d.text_en.indexOf("missed") == -1)[0];

	if (!next) {
		next = data[n+1];
	}

	if (!next) {
		next = data[data.length - 1]
	}

	var nextnextel = d3.select("#g-post-" + next.id);
	var nextnextelpic = nextnextel.attr("data-pic");
	if (nextnextelpic == "true") {
		nextnextel.style("background-image", "url(photos/" + trailletter + next.id + ".jpg)")
	}

	if (next.id == "end") {
		nextnextel.style("background-image", "url(../end.jpg)")	
	}

		var idstring = id.substr(0,3);
		idstring = idstring.indexOf("map") > -1 || idstring.indexOf("intro") > -1 ? "000" : idstring

		var previdstr = ids[prevcounter]
		previdstr = !previdstr ? "000" : previdstr
		previdstr = previdstr.substring(0,3)

		var dattime = el.attr("data-time");

		var hrs = trailid == "wilson" ? [[16,12], [13,54]] : [[10,51]]

		var firsttime = data.filter(d => d.time)[0].time.split(":");
		var starttime = new Date(2021,6,11,+firsttime[0],+firsttime[1]);

		if (trailid == "wilson" && +id.substr(0,3) > 69) {
			starttime = new Date(2021,6,11,5,25);
		}

		var newtime = new Date(2021,6,11,+dattime.split(":")[0],+dattime.split(":")[1]);

		var diffMs = (newtime - starttime); // milliseconds between now & Christmas
		var diffDays = Math.floor(diffMs / 86400000); // days
		var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
		var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

		if (id == "cover") {
			
			if (trailid == "wilson") {
				d3.select(".g-day-2").style("opacity", 0)
				d3.select(".g-day-2")
					.transition()
					.ease(d3.easeLinear)
					.delay(duration/2)
					.style("opacity", 1)
			}

			for (var day = 0; day < gdays; day++) {
				d3.select(".g-day-" + (day+1) + ".g-time .g-hour")
					.transition()
					.ease(d3.easeLinear)
					.duration(duration/2)
					.delay((duration/2)*(day))
					.tween("text", function(d) {
					        var element = d3.select(this);
					        var dataid = element.attr("data-id");
				        	var i = d3.interpolate(0, hrs[dataid-1][0]);
				        	return function(t) {
				        		var hr = Math.round(i(t));
				        	    element.text( String(hr).padStart(2, '0'));
				        	};
					})

				d3.select(".g-day-" + (day+1) + ".g-time .g-minute")
					.transition()
					.ease(d3.easeLinear)
					.duration(duration/2)
					.delay((duration/2)*(day))
					.tween("text", function(d) {
				        var element = d3.select(this);
				        var dataid = element.attr("data-id");
				        var i = d3.interpolate(0, hrs[dataid-1][1]);
			        	return function(t) {
			        	    element.text( String(Math.round(i(t))).padStart(2, '0'));
			        	};
				})	
			}

		} else if (id.indexOf("map") == -1 && id.indexOf("intro") == -1 && id.indexOf("end") == -1 && !isNaN(+id.substring(0,3))) {

			var dayselector = 1;
			if (trailid == "wilson" && id.substring(0,3) > 69) {
				d3.select(".g-day-2").style("opacity", 1)
				dayselector = 2;
				d3.select(".g-day-1 .g-hour").text(hrs[0][0])
				d3.select(".g-day-1 .g-minute").text(hrs[0][1])
			} else {
				d3.select(".g-day-2").style("opacity", 0)
			}

			d3.select(".g-detailed-map").classed("g-hide", true);
			d3.select(".g-day-" + dayselector + ".g-time .g-hour").transition().duration(0).text(String(diffHrs).padStart(2, '0'));

			var lastmin = d3.select(".g-time .g-minute").text();
			lastmin = lastmin == "NaN" ? 0 : lastmin

			d3.select(".g-day-" + dayselector + ".g-time .g-minute")
			.transition()
			.ease(d3.easeLinear)
			.duration(duration)
			.tween("text", function(d) {
			        var element = d3.select(this);
			        if (diffMins < lastmin) {
			        	var i = d3.interpolate(0, diffMins);
			        	return function(t) {
			        	    element.text( String(Math.round(i(t))).padStart(2, '0'));
			        	};
			        } else {
			        	var i = d3.interpolate(lastmin, diffMins);
			        	return function(t) {
			        	    element.text( String(Math.round(i(t))).padStart(2, '0'));
			        	};
			        }
			})
		}
		

	if (photoid.indexOf("map") > -1 || photoid.indexOf("intro") > -1 || photoid.indexOf("end") > -1) {

		d3.select(".g-map").classed("g-hide", true)
		d3.select(".g-meta").classed("g-hide", true)

		if (photoid.indexOf("map") > -1) {
			d3.select(".g-detailed-map").classed("g-hide", false);		
		} else {
			d3.select(".g-detailed-map").classed("g-hide", true);
		}
	
		trailpath
			.transition().duration(0)
			.ease(d3.easeLinear)
		  .attr("stroke-dasharray", totalLength + " " + totalLength)
		  .attr("stroke-dashoffset", totalLength)



		if (photoid == "map") {
			if (!dmap) {
				drawDetailedMap();
			}
			zoomMap();
			zoomMap2();
		} else {
			if (!dmap) {
				drawDetailedMap();
			}
			zoomMap();
		}

	} else {

		d3.select(".g-map").classed("g-hide", false)
		d3.select(".g-detailed-map").classed("g-hide", true)
		d3.select(".g-meta").classed("g-hide", false)

		var endnum = id == "cover" || id == trailletter + "000" ? 0: id.replace(trailletter, "").slice(0, 3)
		var endpt = trackpts.filter(d => d.dp == trailletter.toUpperCase() + endnum)[0];

		endpt = !endpt ? trackpts[trackpts.length - 1] : endpt

		var endpct = id == "cover" || id == enddp ? 1 : id == "000" ? 0 : endpt.dist/totaldist;

		var previd = ids[prevcounter];
		previd = !previd ? "cover" : previd;
		var prevnum = previd == "cover" ? 0 : previd.replace(trailletter.toUpperCase(), "").slice(0, 3)
		var startpt = trackpts.filter(d => d.dp == trailletter.toUpperCase() + prevnum)[0];
		var startpct = previd == "cover" || !startpt ? 0 : startpt.dist/totaldist;
		startpct = id == enddp && startpct == 0 ? (trackpts[trackpts.length - 1].dist/totaldist) : startpct

		dotg.transition()
			.duration(duration)
			.ease(d3.easeLinear)
			.tween("pathTween", function(){return pathTween(trailpath)})

		if (endpt) {

			var lastdist = d3.select(".g-distance .g-num").text();

			lastdist = id == "cover" ? 0 : lastdist;
			endpt = id == "000" ? trackpts[0] : id == enddp.id ? trackpts[trackpts.length - 1] : endpt;

			if (trailid == "wilson" && (id == enddp.id)) {
				endpt.dist = 78;
			}

			if (id == '000') {
				d3.select(".g-distance .g-num")
					.transition()
					.text("0.0")
			} else {
				d3.select(".g-distance .g-num")
				.transition()
				.ease(d3.easeLinear)
				.duration(duration)
				.tween("text", function(d) {
				        var element = d3.select(this);
				        var i = d3.interpolate(lastdist, Math.round(endpt.dist*10)/10);
				        return function(t) {
				            element.text( (Math.round(i(t)*10)/10).toFixed(1) );
				        };
				})
			}

			if (id == "cover") {
				d3.selectAll(".g-dp")
					.transition()
					.ease(d3.easeLinear)
					.duration(duration)
					.tween("text", function(d){
						var element = d3.select(this);
						var i = d3.interpolate(0, enddp.id);
						return function(t) {
						    element.text(trailletter.toUpperCase() + String(Math.round(i(t))).padStart(3,'0') );
						};
					})
			} else if (!isNaN(+id.substring(0,3))) {
				var previd = d3.select(".g-dp").text().replace(trailletter.toUpperCase(), "").substring(0,3);

				if (id == "000") {
					d3.selectAll(".g-dp").transition().duration(0).text(trailletter.toUpperCase() + "000");
				} else if (id == "end") {
					d3.selectAll(".g-dp").transition().duration(0).text(trailletter.toUpperCase() +  + ids[ids.length - 2]);
				} else {
					d3.selectAll(".g-dp")
						.transition()
						.ease(d3.easeLinear)
						.duration(duration)
						.tween("text", function(d){
							var element = d3.select(this);
							var i = d3.interpolate(previd, id.substring(0,3));
							return function(t) {
							    element.text(trailletter.toUpperCase() + String(Math.round(i(t))).padStart(3,'0') );
							};
						})

				}

				
			}
		}

		function pathTween(path){

			// console.log(trackpts.indexOf(startpt), trackpts.indexOf(endpt))

			var r = d3.interpolate(totalLength*startpct, totalLength*endpct);
			var r = d3.interpolate(trackpts.indexOf(startpt), trackpts.indexOf(endpt));

			return function(t){
				if (!isNaN(r(t))) {

					var closestpt = trackpts[Math.ceil(r(t))];

					if (closestpt) {

						trailpath
							.transition().duration(0)
						  .attr("stroke-dasharray", (closestpt.dist/totaldist)*totalLength + " " + totalLength)
						  .transition()
						  	.ease(d3.easeLinear)
						    .attr("stroke-dashoffset", 0)

						var point = trailpath.node().getPointAtLength(((closestpt.dist/totaldist)*totalLength)+3);
						dotg.attr("transform", "translate(" + point.x + "," + point.y + ")")
						
						if (id != "cover" && id != enddp) {	
							var newelevwidth = elevwidth*8
							elevx = d3.scaleLinear().range([0,newelevwidth]).domain([0,lastpt.dist]);
							elevpath.attr("d", elevline)


							var targetpt = (-elevx(closestpt.dist)) + (elevwidth/2);
							elevg.attr("transform", "translate(" + (targetpt) + ",0)")	

							elevtext.text((Math.ceil(closestpt.alt / 10) * 10) + "m")
						}
						
						elevdot.attr("transform", "translate(" + elevx(closestpt.dist) + "," + elevy(closestpt.alt) + ")")
					}
				}
			}
		}

	}

	// document.location.hash = id;	

}


function drawDetailedMap() {

	dmap = d3.select(".g-detailed-map").html("");

	dw = dmap.node().getBoundingClientRect().width;
	dh = dmap.node().getBoundingClientRect().height;
	dsvg = dmap.append("svg").attr("width", dw).attr("height", dh);

	dsvg = dsvg.append("g").translate([0,0])

	var hkg_shape = topojson.feature(all, all.objects.hkg)

	dproj = d3.geoMercator().fitSize([dw*0.7, dh*0.65], trailshape);
	dpath = d3.geoPath().projection(dproj);

	dsvg.appendMany("path.g-hkg-shape", hkg_shape.features)
		.style("stroke-width", 0.3)
		.style("fill", "none")
		.style("stroke", "rgba(255,255,255,0.3)")
		.attr("d", dpath)

	dline = d3.line()
      .x(function(d) { return dproj(d)[0]; })
      .y(function(d) { return dproj(d)[1]; })
      .curve(d3.curveBasis);
}

function zoomMap() {

	var duration = 2000;
	dsvg.transition().duration(0)
		.attr("transform", trailid == "hk" ? "scale(0.28) translate(" + dw*1.9 + "," + dh/0.445 + ")" : "scale(0.47) translate(" + dw + "," + dh/1.06 + ")")
	d3.select(".g-hkg-shape")
		.style("stroke-width", 0.4).style("stroke", "rgba(255,255,255,1)")
		.style("fill", "rgba(255,255,255,0.02")

	dsvg.selectAll(".g-labels").remove();
	dmap.selectAll(".g-big-text").remove();


	var trails = ["t_hk", "t_lantau", "t_maclehose", "t_wilson"]
	var trailnames = ["港島徑//Hong Kong Trail//45 km", "鳳凰徑//Lantau Trail//78 km", "麥理浩徑//MacLehose Trail//100 km", "衞奕信徑//Wilson Trail//78 km"]


	dsvg.selectAll(".g-trail-path").remove();

	trails.forEach(function(trail, ti){

		var trailf = topojson.feature(all, all.objects[trail]).features

		dsvg.appendMany("path.g-trail-path.g-four-trail-path", trailf)
			.attr("id", (d,i) => trail + "_" + i)
			.style("stroke", trail == "t_" + trailid ? "#ffcc00" : "rgba(2555,255,255,0.7)")
			.style("stroke-width", 4)
			.attr("d", dpath)

		if (trail == "t_wilson") {
			dsvg.append("path.g-trail-path.g-four-trail-path")
				.attr("id", "hi")
				.style("stroke", "rgba(2555,255,255,0.5)")
				.style("stroke-width", 2)
				.attr("d", dline([[114.214945,22.284631], [114.23487,22.30812]]))
		}

		var dd = dmap.append("div.g-trail-label.g-tl-" + trail)
		
		dd.style("opacity", 0)
			.transition()
			.delay(duration)
			.duration(1000)
			.style("opacity", 1)

		dd.append("div.g-text-cn").text(trailnames[ti].split("//")[0])
		dd.append("div.g-text-en").text(trailnames[ti].split("//")[1])
		dd.append("div.g-text-en").text(trailnames[ti].split("//")[2])
	})

	dsvg.selectAll(".g-four-trail-path").each(function(){

		var el = d3.select(this)
		var id = el.attr("id");
		var dtotalLength = el.node().getTotalLength();

		el.transition()
		.attr("stroke-dasharray", dtotalLength + " " + dtotalLength)
		.attr("stroke-dashoffset", dtotalLength)
		.transition()
			.delay(id == "hi" ? 300 : 0)
		  .duration(id == "hi" ? 500 : duration)
		  .ease(d3.easeLinear)
		  .attr("stroke-dashoffset", 0);

	})

}

function zoomMap2() {

	var duration = 2000;
	dsvg.transition().duration(duration)
		.attr("transform", "scale(1) translate(" + dw*0.16 + "," + dh*0.25 + ")")

	dmap.selectAll(".g-trail-label").remove();

	dsvg.select(".g-hkg-shape")
		.transition()
		.duration(duration)
		.delay(duration/8)
		.style("stroke-width", 0.3)
		.style("stroke", "rgba(255,255,255,0.5)")

	dlabels = meta.dlabels;

	dsvg.selectAll(".g-trail-path").remove();
	dsvg.selectAll(".g-trail-label").remove();

	dtrailpath = dsvg.append("path.g-trail-path")
				.style("filter", "url(#drop-shadow)")
				.attr("d", dline(trailf[0].geometry.coordinates))

	var dtotalLength = dtrailpath.node().getTotalLength();
	dtrailpath.transition()
	.attr("stroke-dasharray", dtotalLength + " " + dtotalLength)
	.attr("stroke-dashoffset", dtotalLength)
	.transition()
	  .duration(3000)
	  .ease(d3.easeLinear)
	  .attr("stroke-dashoffset", 0);	
		
	var dlabelsg = dsvg.append("g")
	var dlabs = dlabelsg.appendMany("g.g-labels", dlabels)
		.translate(d => dproj([d[0], d[1]]))
	
	dlabs.style("opacity", 0)
		.transition()
		.duration(1000)
		.delay(d => d[6])
		.style("opacity", 1)

	dlabs.append("circle")
		.attr("r", d => d[2][0] == "八仙嶺" ? 0 : 3)
		.style("fill", "#ffcc00")
		.style("stroke", "#000")

	dlabs.append("text")
		.attr("text-anchor", d => d[3])
		.translate(d => [d[4], d[5]])
		.style("fill", "#c6c6c6")
		.tspans(d => d[2], 10.5)

	dmap.selectAll(".g-big-text")
		.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity", 1)

}

function drawElevChart() {
	var sel = d3.select(".g-elev-chart").html("");

	var textcont = sel.append("div.g-text-elev-cont");
	// textcont.append("div.g-text.g-text-en").text("Elevation")
	// textcont.append("div.g-text.g-text-cn").text("高度")

	elevwidth = trailid == "wilson" ? 125 : 100;
	var height = 35;
	elevsvg = sel.append("svg").attr("width", elevwidth).attr("height", height);

	var margin = {
		left: 5,
		right: 30,
		top: 10,
		bottom: 0
	}

	elevwidth -= (margin.left + margin.right)
	height -= (margin.top + margin.bottom)
	elevsvg = elevsvg.append("g").translate([margin.left,margin.top])

	var defs = elevsvg.append("defs")
	defs.append("clipPath").attr("id", "elevmask")
		.append("rect")
		.attr("width", elevwidth+3)
		.attr("height", height*2)
		.attr("y", -height/2)
		
	elevline = d3.line()
		.x(d => elevx(d.dist))
		.y(d => elevy(d.alt))	

	var firstpt = trackpts[0];
	lastpt = trackpts[trackpts.length - 1];
	var maxelev = d3.max(trackpts.map(d => d.alt));	

	elevx = d3.scaleLinear().range([0,elevwidth]).domain([0,lastpt.dist]);
	elevy = d3.scaleLinear().range([height,0]).domain([0, maxelev]);

	var axis = trailid == "wilson" ? [200,400,600] : [200,400];
	axis.forEach(function(a){
		var ypt = elevy(a);
		elevsvg.append("path.g-axis")
			.attr("d", "M0," + ypt + " L" + elevwidth + "," + ypt);
		elevsvg.append("text")
			.translate([(elevwidth+5),(ypt+2)])
			.text(a + " m")
	})

	elevg = elevsvg.append("g").attr("clip-path", "url(#elevmask)").append("g")

	elevpath = elevg.append("path")
		.datum(trackpts)
		.style("stroke", "rgba(255,255,255,0.6)")
		.attr("d", elevline)

	elevdot = elevg.append("g").translate([elevx(firstpt.dist), elevy(firstpt.alt)])

	elevdot.append("circle")
		.attr("r", 2)
		.style("fill", "#fff")

	elevtext = elevdot.append("text.g-elev-text")
		.translate([3,-5])
		.text("")
		

	// console.log(trackpts)


}