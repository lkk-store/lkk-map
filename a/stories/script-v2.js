console.clear();

var sel = d3.select(".g-map").html("")
sel = sel.append("div.g-map-inner");

d3.select(".g-body").style("margin-top", (innerHeight/2 - d3.select(".g-body").node().getBoundingClientRect().height/2) + "px")

var ids, dotg, path, projection, trailpath, totalLength, trackpts, meta, elevdot, elevx, elevy, elevwidth, elevline, elevsvg, elevpath, elevg, elevtext, line, segmentshapes, zoomedw, segmentpos;
var svg, locatorg;

var trailid = d3.select(".g-body").attr("data-trail");
var width, height;
var counter = 0;
var prevcounter = 0;
var mapzoomed = false;
var start = [9.5666,47.1156];
var duration = 1000;
var laststop = ""
var contwidth = innerWidth > 460 ? 375 : innerWidth;

var segid;

var colors = {
	"purple": "#964c85",
	"red": "#cb4827",
	"yellow": "#ffcc00",
	"green": "#0c793d",
	"blue": "#4064af"		
}

d3.queue()
	.defer(d3.json, "../../../data/" + trailid + ".json")
	.defer(d3.json, "route.json")
	.defer(d3.json, "countries.json")
	.defer(d3.json, "meta.json")
	.defer(d3.json, "route-all.json")
	.defer(d3.json, "countries-all.json")
	.defer(d3.json, "segments.json")
	.awaitAll(function (err, res){
		
		data = res[0];
		route = res[1];
		countries = res[2];
		meta = res[3][0];
		route_all = res[4];
		countries_all = res[5];
		segments = res[6];

		segid = Object.keys(segments);
		var coords_all = [];
		segmentshapes = {};
		segid.forEach(function(segment){
			var coords = segments[segment]

			var cooords_out = []
			coords.forEach(function(d){
				cooords_out.push([d[2], d[1]])
				coords_all.push([d[2], d[1]])
			})

			shape = {
				type: 'FeatureCollection',
				features: [
					{
						"geometry": {
							"coordinates": cooords_out,
							"type": "LineString"
						}

					}
				]
			}
			segmentshapes[segment] = shape
		})

		var selbb = sel.node().getBoundingClientRect();
		width = selbb.width;
		height = selbb.height;	

		routeshape = topojson.feature(route, route.objects.route);
		countryshape = topojson.feature(countries, countries.objects.countries)

		countriesf = topojson.feature(countries_all, countries_all.objects.countries);
		routesf = topojson.feature(route_all, route_all.objects.routes);

		svg = sel.append("svg").attr("width", width).attr("height", height);

		locatorg = svg.append("g");
		projection = d3.geoMercator().fitSize([width, width*0.5], countryshape);
		path = d3.geoPath().projection(projection);

		routef = routeshape.features;
		trackpts = routef[0].geometry.coordinates;

		drawLocatorMap();
		drawElevChart();

		// add text
		ids = data.map(d => d.id);
		
		var cont = d3.select(".g-content").html("")
		cont.style("width", data.length*contwidth + "px")


		var dp = cont.appendMany("div", data)	
			.attr("data-id", d => d.id)
			.attr("class", (d,i) => i == 0 ? "g-post g-post-active" : "g-post")
			.attr("id", (d,i) => "g-post-" + d.id)
			.style("transform", (d,i) => "translate(" + i*contwidth + "px,0)") 
			.attr("data-pic", d => d.nopic == "1" ? "false" : "true")
			.attr("data-video", d => d.video == "1" ? "true" : "false")
			.attr("data-sound", d => d.sound == "1" ? "true" : "false")
			// .style("background-image", (d,i) => d.nopic == '1' ? "" : i == 0 ? "url(photos/" + d.id + ".jpg)" : "url(photos-100/" + d.id + ".jpg)")
			.style("background-image", (d,i) => d.nopic == '1' ? "" : i == 0 || d.id == "0924_start" ? "url(photos/" + d.id + ".jpg)" : "url(photos-100/" + d.id + ".jpg)")
			// .style("background-image", (d,i) => d.nopic == '1' ? "" : i == 0 ? "url(photos/" + d.id + ".jpg)" : "")

		data.filter(d => d.video == "1").forEach(function(d){
			var el = d3.select("#g-post-" + d.id);
			el.append("div.g-video-cont").html("<video class='lazy' id='g-vid-" + d.id + "' autoplay muted loop playsinline preload='none' data-src='photos/" + d.id + ".mp4' poster='photos-100/" + d.id + ".jpg' />")
		})

		var textcont = dp.append("div.g-text-cont")
			.style("opacity", d => !d.text_cn && !d.text_en ? "0" : "1")
			.append("div.g-text-cont-inner");

		textcont.append("div.g-text.g-text-en")
			.style("opacity", d => !d.text_en ? "0" : "1")
			.append("div.g-text-inner")
			.html(d => "<div class='g-graf'>" + d.text_en.split("//").join("</div><div class='g-graf'>next") + "</div>")

		var endcont = d3.select("#g-post-end").html("");
		endcont = endcont.append("div.g-text-cont")
		var endhed = endcont.append("div.g-end-hed").html("<a href='https://www.lkk-store.com/lkk-map'>Read more on <br> LKK MAP</a>")

		data.filter(d => d.text_abs != "").forEach(function(d){
			var labels = d.text_abs.split("//");
			var el = d3.select("#g-post-" + d.id);
			labels.forEach(function(a,i){
				el.append("div.g-text.g-abs-label.g-abs-label-" + i)
					.append("div.g-text-inner")
					.text(a)
			})
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

	d3.selectAll("video").each(function(){
		var el = d3.select(this);
		this.muted = true;
	})

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
	var id = hash ? id : ids[id];
	var n = ids.indexOf(id);
	var el = d3.select("#g-post-" + id);
	var d = data[n];

	// button stuff

	if (n > 0) {
		d3.select(".g-back-cont").classed("g-active", true)
	} else {
		d3.select(".g-back-cont").classed("g-active", false)
	}

	if (n == (ids.length - 1)) {
		d3.select(".g-next-cont").classed("g-active", false);
	} else {
		d3.select(".g-next-cont").classed("g-active", true);
	}


	var lightbg = ["1006_snowball", "1006_jungfrau", "1006_snow3", "1006_snow2", "1006_grindelwald"]
	if (lightbg.indexOf(id) > -1) {
		sel.classed("g-background-light", true);
	} else {
		sel.classed("g-background-light", false);
	}

	// div stuff

	d3.select(".g-content")
		.transition()
		.duration(1000)
		.style("transform", "translate(-" + n*contwidth + "px,0)")
		.on("end", function(){
		});

	

	// pic stuff
	var duration = id == "cover" ? 3000 : 1000;	
	var id = el.attr("data-id")
	var pic = el.attr("data-pic");
	var video = el.attr("data-video");

	if (pic == "true") {
		el.style("background-image", id == "end" ? "url(../end.jpg)" : "url(photos/" + id + ".jpg)")
	}

	d3.select(".g-video-sound").classed("g-active", false);
	if (video == "true") {
		// console.log(el.select("video").attr("data-src"))
		var videl = el.select("video");
		if (!videl.attr("src")) {
			videl.attr("src", videl.attr("data-src"));
			videl.node().play();
		}

		if (el.attr("data-sound") == "true") {
			d3.select(".g-video-sound").classed("g-active", true);
			d3.select(".g-video-sound").on("click", function(){
				var el = d3.select(this);
				d3.select("#g-vid-" + id).node().muted = false;
			})
		}
	}

	if (ids[n+1]) {
		var nextel = d3.select("#g-post-" + ids[n+1]);
		var nextelpic = nextel.attr("data-pic");
		var nextelvideo = nextel.attr("data-video");

		if (nextelpic == "true") {
			nextel.style("background-image", "url(photos/" + ids[n+1] + ".jpg)")
		}

		if (nextelvideo == "true") {
			var videl = nextel.select("video")
			videl.attr("src", nextel.select("video").attr("data-src"));
			videl.node().play();
		}
	}


	// map stuff

	// var delaythis = 0;
	// if (mapzoomed) {
	// 	d3.select(".g-map").classed("g-map-behind", false);
	// 	// dotg.transition();
	// 	// trailpath
	// 	// 	.transition().duration(0)
	// 	// 	.ease(d3.easeLinear)
	// 	//   .attr("stroke-dasharray", totalLength + " " + totalLength)
	// 	//   .attr("stroke-dashoffset", totalLength)
		  
	// 	resetMap();
	// 	// delaythis = duration;
	// }

	if (id == "cover") {
		d3.select(".g-map").classed("g-map-behind", false);
		// startpct = 0;
		// endpct = 1;
		// dotg.transition()
		// 	.delay(delaythis)
		// 	.duration(4000)
		// 	.ease(d3.easeLinear)
		// 	.tween("pathTween", function(){return pathTween(trailpath)})

		laststop = "";
	} else if (id == "end") {

		d3.select(".g-map").classed("g-map-behind", true);
		d3.select(".g-meta").classed("g-hide", true);

	} else if (id.indexOf("map") > -1 || id.indexOf("intro") > -1) {
		d3.select(".g-meta").classed("g-hide", true)
		d3.select(".g-map").classed("g-map-behind", true);
		if (id == "mapall") {
			drawDetailedMap();
		} else if (id == "map") {
			zoomMap();
		}
		laststop = "";
	} else {
		d3.select(".g-map").classed("g-map-behind", false);
		locatorg.select(".g-country-all").classed("g-active", false);
		locatorg.selectAll(".g-trail").classed("g-active", false);
		locatorg.selectAll(".g-trail").classed("g-half", false);
		locatorg.selectAll(".g-trail-path").classed("g-trail-green", false);
		locatorg.selectAll(".g-trail-path-animate").classed("g-active", false);

		if (id != "cover") {
			d3.select(".g-meta").classed("g-hide", false);
			d3.selectAll(".g-secondary").classed("g-active", false);
			d3.selectAll("#g-switzerland").classed("g-active", false);
		}

		if (laststop != d.stop) {			
			zoomToSegment(d.stop)
			updateElevChart(d.stop)
			laststop = d.stop;

			//meta stuff

			var allstops = Array.from(new Set(data.map(d => d.stop))).filter(d => d != '')
			console.log(allstops)
			d3.select(".g-dp").html(d.stop.replace("ChateaudOex", "Château-d'Œx") + "<span><span style='font-size: 8px; margin-left: 7px;'>LEG</span> " + (allstops.indexOf(d.stop)+1) + " / 16</span>")
			var stops = d.stop.split("-");
			d3.selectAll(".g-startend").classed("g-active", false);
			d3.selectAll(".g-stop").classed("g-active", false);
			stops.forEach(function(stop){
				d3.select("#g-" + stop.toLowerCase()).classed("g-active", true);
			})

			d3.select(".g-distance .g-num").text(meta.dist[d.stop])

		}
	
	}


	// document.location.hash = id;	
}

function pathTween(path){
	var r = d3.interpolate(totalLength*startpct, totalLength*endpct);
	return function(t){
		if (!isNaN(r(t))) {
			trailpath
				.transition().duration(0)
			  .attr("stroke-dasharray", (r(t)/totalLength)*totalLength + " " + totalLength)
			  .transition()
			  	.ease(d3.easeLinear)
			    .attr("stroke-dashoffset", 0)

			var point = trailpath.node().getPointAtLength(((r(t)))+3);
			dotg.attr("transform", "translate(" + point.x + "," + point.y + ")")
		}
	}
}

function drawLocatorMap() {

	console.log("drawLocatorMap");
			// draw base map
	line = d3.line()
	  .x(function(d) { return projection(d)[0]; })
	  .y(function(d) { return projection(d)[1]; })
	  .curve(d3.curveBasis);

	locatorg.append("g.g-country-g").appendMany("path.g-country", countryshape.features)
		.attr("d", path)

	locatorg.append("g.g-country-all-g").appendMany("path.g-country.g-country-all", topojson.feature(countries_all, countries_all.objects.countries).features)
		.attr("d", path)

	locatorg.append("g.g-country-names").appendMany("text.g-country-name.g-places", meta.detailed_labels)
		.attr("id", d => "g-" + d.name.toLowerCase())
		.translate(d => projection(d.pos.reverse()))
		.text(d => d.name)
	locatorg.select("#g-switzerland").classed("g-active", true);

	locatorg.append("g.g-all-trails-g").appendMany("path.g-trail", routesf.features.filter(d => d.properties.name != "green"))
		.style("stroke", d => colors[d.properties.name])
		.attr("d", path)

	locatorg.selectAll(".g-trail").each(function(el,i){
		var elpath = d3.select(this);
		var eltotalLength = Math.ceil(elpath.node().getTotalLength());
		elpath
		  .attr("stroke-dasharray", eltotalLength + " " + eltotalLength)
		  .attr("stroke-dashoffset", eltotalLength)
	})

	drawMainPath();

	var segg = locatorg.append("g.g-segments");

	zoomedw = width*1.8
	segmentproj = d3.geoMercator().fitSize([zoomedw, zoomedw*0.5], countryshape);
	segmentpos = {}

	segmentline = d3.line()
	  .x(function(d) { return segmentproj(d)[0]; })
	  .y(function(d) { return segmentproj(d)[1]; })
	  .curve(d3.curveBasis);

	segid.forEach(function(segment){
		var dat = segments[segment].map(d => [d[2],d[1]])
		var spath = segg.append("path")
			.datum(dat)
			.attr("class", segment.indexOf("xx") > -1 ? "g-segment g-segment-dotted" : "g-segment")
			.attr("id", "g-segment-" + segment)
			.attr("d", segmentline)

		segmentpos[segment] = spath.node().getBBox();

	})

	var places2 = locatorg.append("g.g-placesg").appendMany("g", meta.places2)
		.attr("class", d => "g-places g-locator-places g-secondary g-active")
		.attr("text-anchor", d => d.anchor ? d.anchor : "start")
		.translate(d => projection(d.pos.reverse()))

	places2.append("circle")
		.attr("r", d => 1.5 )

	places2.append("text")
		.translate(d => d.offset ? d.offset : [4,3])
		.text(d => d.name)

	var places = locatorg.append("g.g-placesg").appendMany("g", meta.places)
		.attr("class", d => d.class ? "g-places g-locator-places g-" + d.class : "g-places g-locator-places")
		.attr("id", d => d.id ? "g-" + d.id : "g-" + d.name.toLowerCase())
		.translate(d => projection(d.pos.reverse()))

	places.append("circle")
		.attr("r", d => d.class == "secondary" ? 1.5 : 2)

	var textoffset = {
		"Vaduz": [-4,1],
		"Sargans": [-4,1],
		"Weisstannen": [-4,1],
		"Elm": [-4,1],
		"Linthal": [-4,1],
		"Altdorf": [-4,1],
		"Engelberg": [-4,1],
		"Meiringen": [-4,1],
		"Grindelwald": [-4,1],
		"Lauterbrunnen": [-4,1],
		"Griesalp": [-4,0],
		"Kandersteg": [-4,0],
		"Adelboden": [-4,2],
		"Lenk": [-4,1],
		"Gstaad": [-4,1],
		"Château-d'Œx": [-4,1],
		"Montreux": [-4,1]
	}

	places.append("text")
		.attr("transform", function(d){
			var pos = textoffset[d.name] ? textoffset[d.name] : [-3,2]
			return "rotate(50) translate(" + pos[0] + "," + pos[1] + ")"
		})
		// .attr("text-anchor", d => d.anchor ? d.anchor : "start")
		.attr("text-anchor", "end")
		.text(d => d.name)

}

function drawMainPath() {

	locatorg.selectAll(".g-trailbg").remove();
	locatorg.selectAll(".g-trailg").remove();
	locatorg.selectAll(".g-dot").remove();

	locatorg.append("g.g-trailbg").append("path.g-trail-path.g-trail-path-bg.g-active")
		.datum(trackpts)
		.style("stroke", "rgba(255,255,255,0.3)")
		.attr("d", line)

	trailpath = locatorg.append("g.g-trailg").append("path.g-trail-path.g-active.g-trail-path-animate")
		.datum(trackpts)
		.attr("d", line)

	totalLength = Math.ceil(trailpath.node().getTotalLength());
	trailpath
		// .transition().duration(0)
		// .ease(d3.easeLinear)
	  .attr("stroke-dasharray", totalLength + " " + totalLength)
	  .attr("stroke-dashoffset", totalLength)

	trailpath
		.transition()
		.duration(4000)
		.ease(d3.easeLinear)
	    .attr("stroke-dashoffset", 0)

	// dotg = locatorg.selectAppend("g.g-dot.g-active")
	// 	.translate(projection(start))

	// dotg.append("circle")
	// 	.attr("r", 4)
	// 	.attr("stroke-width", 1)
	// 	.attr("fill", "none")
	// 	.attr("stroke", "#ffcc00")
	// 	.attr("id", "ring")

	// dotg.append("circle")
	// 		.attr("r", 4)
	// 		.attr("fill", "#ffcc00")

}

function resetPaths(opts) {

	locatorg.selectAll(".g-country").classed("g-active", true);
	locatorg.selectAll(".g-country").each(function(){
		var el = d3.select(this);
		el.transition().duration(duration).attr("d", path)
	})

	locatorg.selectAll(".g-places").each(function(){
		var el = d3.select(this);
		el.transition().duration(duration).translate(d => projection(d.pos))
	})

	locatorg.selectAll(".g-trail-path-bg").each(function(el,i){
		var el = d3.select(this);
		el.transition().duration(duration).attr("d", line)
	})

	locatorg.selectAll(".g-segment").each(function(el,i){
		var el = d3.select(this);
		el.transition().duration(duration).attr("d", line)
	})

	locatorg.selectAll(".g-dot").each(function(){
		var el = d3.select(this);
		el.transition().duration(duration).attr("transform", "translate(" + projection(start)[0] + "," + projection(start)[1] + ")")
	})

	if (opts && opts.segment) {

		opts.segment = opts.segment == "Meiringen-Grindelwald" || opts.segment == "Griesalp-Kandersteg" ? opts.segment + "xx" : opts.segment
		var segmenetline = d3.select("#g-segment-" + opts.segment);
		var bb = segmentpos[opts.segment];
		var clippedh = 140;
		var xpos = -bb.x + (width/5*4) + (bb.width/2)
		var ypos = -(bb.y) + clippedh/3 - (bb.height/2);

		locatorg
			.transition()
			.duration(duration)
			.translate([xpos, ypos])

		locatorg.selectAll(".g-country").classed("g-active", false);

		// console.log()

	} else {
		locatorg.transition().translate([0,0])
		locatorg.selectAll(".g-segment").classed("g-active", false);
	}

	if (opts && opts.drawalltrails && opts.drawalltrails == true) {

		locatorg.selectAll(".g-trail").each(function(){
			var el = d3.select(this);
			// el
			// .transition()
			// .duration(duration)
			// .attr("d", path);
			
			el.classed("g-active", true)
			el.transition()
			el.attr("stroke-dasharray", "").attr("stroke-dashoffset", "")
			el.transition().duration(duration).attr("d", path);

			// var totalLength = Math.ceil(el.node().getTotalLength());
			// el
			// .transition()
			// .duration(0)
			// .attr("stroke-dasharray", totalLength + " " + totalLength)
			// .attr("stroke-dashoffset", totalLength)

			// console.log(duration)
			// el.transition()
			// .delay(duration)
			// .duration(duration)
			// 	.ease(d3.easeLinear)
			//     .attr("stroke-dashoffset", 0)
		})

	} else if (opts && opts.showalltrails && opts.showalltrails == true) {

		locatorg.selectAll(".g-trail").each(function(){
			var el = d3.select(this);
			// var totalLength = Math.ceil(el.node().getTotalLength());
			el.classed("g-active", true)
			el.transition()
			el.attr("stroke-dasharray", "").attr("stroke-dashoffset", "")
			el.transition().duration(duration).attr("d", path);
		})

	} else {
		locatorg.selectAll(".g-trail").each(function(){
			var el = d3.select(this);
			el.classed("g-active", false)
			el.transition().duration(duration).attr("d", path)
		})
	}

}

function drawDetailedMap() {

	console.log("detailed map")

	duration = 2500;

	projection = d3.geoMercator().fitSize([width, height], routesf);
	path = d3.geoPath().projection(projection);

	locatorg.selectAll(".g-country-name").classed("g-active", true);
	locatorg.selectAll(".g-country-all").classed("g-active", true);
	locatorg.selectAll(".g-trail").classed("g-active", true);

	locatorg.selectAll(".g-locator-places").classed("g-active", false);
	locatorg.selectAll(".g-dot").classed("g-active", false);
	locatorg.selectAll(".g-trail-path-animate").classed("g-active", false);

	locatorg.selectAll(".g-trail-path-bg").classed("g-trail-green", true);
	locatorg.selectAll(".g-trail").classed("g-half", false);
	locatorg.selectAll(".g-secondary").classed("g-active", false);

	sel.classed("g-clipped", false);

	resetPaths({drawalltrails: true});
	mapzoomed = true;
}

function zoomMap() {

	console.log("zoom map")

	projection = d3.geoMercator().fitSize([width, width], countryshape);
	path = d3.geoPath().projection(projection);

	locatorg.selectAll(".g-trail-path-bg").classed("g-trail-green", true);

	resetPaths({showalltrails: true});

	locatorg.selectAll(".g-trail").classed("g-half", true);
	locatorg.selectAll(".g-locator-places").classed("g-active", true);

	locatorg.selectAll(".g-country-name").classed("g-active", false);
	locatorg.selectAll(".g-dot").classed("g-active", false);
	locatorg.selectAll(".g-trail-path-animate").classed("g-active", false);
	locatorg.selectAll(".g-secondary").classed("g-active", false);

	// locatorg.select("#g-switzerland").classed("g-active", true);

	sel.classed("g-clipped", false);

	mapzoomed = true;
}

function resetMap() {

	console.log("reset map")

	projection = d3.geoMercator().fitSize([width, width*0.5], countryshape);
	path = d3.geoPath().projection(projection);

	resetPaths();

	locatorg.selectAll(".g-country-name").classed("g-active", false);

	locatorg.selectAll(".g-country-all").classed("g-active", false);
	locatorg.selectAll(".g-trail").classed("g-active", false);
	locatorg.selectAll(".g-trail").classed("g-half", false);

	locatorg.selectAll(".g-locator-places").classed("g-active", true);
	locatorg.selectAll(".g-dot").classed("g-active", true);
	locatorg.selectAll(".g-trail-path-animate").classed("g-active", true);
	locatorg.selectAll(".g-places").classed("g-active", false);

	locatorg.selectAll(".g-trail-path").classed("g-trail-green", false);

	locatorg.selectAll(".g-secondary").classed("g-active", true);
	locatorg.select("#g-switzerland").classed("g-active", true);

	sel.classed("g-clipped", false);

	mapzoomed = false;
}


function zoomToSegment(segment) {
		
	locatorg.selectAll(".g-dot").classed("g-active", false);
	sel.classed("g-clipped", true);
	
	zoomedw = width*1.8
	projection = d3.geoMercator().fitSize([zoomedw, zoomedw*0.5], countryshape);
	path = d3.geoPath().projection(projection);

	resetPaths({segment: segment});

	locatorg.selectAll(".g-country-all").classed("g-active", false);

	var show = true;
	segid.forEach(function(seg){
		if (seg.indexOf(segment) > -1) {
			locatorg.select("#g-segment-" + seg).classed("g-active", true);
		} else if (show) {
			locatorg.select("#g-segment-" + seg).classed("g-active", true);
		} else {
			locatorg.select("#g-segment-" + seg).classed("g-active", false);
		}

		if (seg.indexOf(segment) > -1) {
			show = false;
		}
	})


}

function drawElevChart() {

	var sel = d3.select(".g-elev-chart").html("");
	sel.classed("g-active", true)

	var pts = segments["Vaduz-Sargans"]

	var textcont = sel.append("div.g-text-elev-cont");
	elevwidth = 125;
	var height = 45;
	elevsvg = sel.append("svg").attr("width", elevwidth).attr("height", height);

	var margin = {
		left: 5,
		right: 30,
		top: 10,
		bottom: 0
	}

	elevwidth -= (margin.left + margin.right)

	var defs = elevsvg.append("defs")
	defs.append("clipPath").attr("id", "elevmask")
		.append("rect")
		.attr("width", elevwidth+3)
		.attr("height", height*2)
		.attr("y", -height/2)

	height -= (margin.top + margin.bottom)

	elevsvg = elevsvg.append("g").translate([margin.left,margin.top])

	elevsvg.append("text")
		.translate([0, height+3])
		// .attr("text-anchor", "end")
		.text("Elevation (m)")
		
	elevline = d3.line()
		.x(d => elevx(d[3]))
		.y(d => elevy(d[0]))	

	elevx = d3.scaleLinear().range([0,elevwidth]).domain([0,pts[pts.length - 1][3]]);
	elevy = d3.scaleLinear().range([height,0]).domain([0, 2800]);

	var axis = [1000,2000];
	axis.forEach(function(a){
		var ypt = elevy(a);
		elevsvg.append("path.g-axis")
			.attr("d", "M0," + ypt + " L" + elevwidth + "," + ypt);
		elevsvg.append("text")
			.translate([(elevwidth+5),(ypt+2)])
			.text(a)
	})

	elevg = elevsvg.append("g").attr("clip-path", "url(#elevmask)").append("g")

	segid.filter(a => a.indexOf("xx") == -1).forEach(function(seg,i){

		var pts = segments[seg]
		elevx = d3.scaleLinear().range([0,elevwidth]).domain([0,pts[pts.length - 1][3]]);

		var elevgg = elevg.append("g").translate([(elevwidth*i) + (5*i),0])

		elevgg.append("path.g-elev-path")
			.style("stroke", "rgba(255,255,255,0.6)")
			.attr("d", elevline(pts))


		var segtolabel = {
			"Weisstannen-Elm": [["Foopass", "2,223"]],
			"Elm-Linthal": [["Richetlipass", "2,260"]],
			"Linthal-Altdorf": [["Klausenpass", "1,952"], "end"],
			"Altdorf-Engelberg": [["Surenenpass", "2,291"]],
			"Engelberg-Meiringen": [["Jochpass", "2,207"]],
			"Grindelwald-Lauterbrunnen": [["Kleine Scheidegg", "2,061"],"middle",[0,-12]],
			"Lauterbrunnen-Griesalp": [["Sefinenfurgge", "2,612"],,[-5,-12]],
			"Kandersteg-Adelboden":	[["Bunderchrinde", "2,385"],"middle",[0,-12]],
			"Adelboden-Lenk": [["Hahnenmoospass", "1,950"], "middle"],
			"Lenk-Gstaad": [["Trutlisbergpass", "2,037"], "middle"],
			"Gstaad-ChateaudOex": [["Col de Jable", "1,884"],,[0,-12]],
			"ChateaudOex-Montreux":	[["Rochers De Naye", "1,980"], "end", [-1,-12]]
		}

		if (Object.keys(segtolabel).indexOf(seg) > -1) {
			var maxpt = pts.sort((a,b) => b[0] - a[0])[0];
			
			if (seg == "Engelberg-Meiringen") {
				maxpt = pts[133];
			}

			var elevlabel = elevgg.append("g.g-elev-label")
				.translate([elevx(maxpt[3]), elevy(maxpt[0])])

			elevlabel.append("circle")
				.attr("r", 1.2)

			elevlabel.append("text")
				.translate(segtolabel[seg][2] ? segtolabel[seg][2] : segtolabel[seg][1] == "middle" ? [0,-12] : segtolabel[seg][1] == "end" ? [-3,-8] : [3,-8])
				.attr("text-anchor", segtolabel[seg][1] ? segtolabel[seg][1] : "start")
				.tspans(segtolabel[seg][0],7)


		}

	})

	


}

function updateElevChart(segment) {
	var index = segid.filter(a => a.indexOf("xx") == -1).indexOf(segment);

	if (index != -1) {
		d3.select(".g-elev-chart").classed("g-active", true)
		d3.select(".g-distance").classed("g-active", true)
		elevg
			.transition()
			.duration(duration)
			.translate([-(elevwidth*index+5*index),0])
	} else {
		d3.select(".g-elev-chart").classed("g-active", false)
		d3.select(".g-distance").classed("g-active", false)
	}
	
	// elevpath.transition().attr("d", elevline(pts));

}



