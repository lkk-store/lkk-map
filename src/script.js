function calcheight() {
	d3.selectAll(".g-project-cont").each(function(){
		var el = d3.select(this);
		var height = el.node().getBoundingClientRect().height;
		el.attr("data-height", height);
		el.style("height", 0)
	})
}

calcheight();
d3.selectAll(".g-hed").on("click", function(){
	var el = d3.select(this);
	var id = el.attr("data-id");
	var target = d3.select(".g-project-" + id);
	var state = target.attr("data-state");
	var targetheight = target.attr("data-height");
	var duration = 1000 //targetheight < 100 ? 100 : targetheight;

	d3.selectAll(".g-project-opened").each(function(){
		var el = d3.select(this);
		var elid = el.attr("data-id");
		var openedel = d3.select(".g-project-" + elid);
		openedel.transition().style("height", 0)
		openedel.attr("data-state", "closed");
		openedel.classed("g-project-opened", false);
	})

	if (state == "closed") {
		target
			.transition()
			.duration(duration)
			.style("height", targetheight + "px")
		target.attr("data-state", "opened");
		target.classed("g-project-opened", true);
	} else {
		target.transition().style("height", 0)
		target.attr("data-state", "closed");
		target.classed("g-project-opened", false);
	}
})

d3.selectAll(".g-img-thumb-cont").on("click", function(){

	var el = d3.select(this);
	var id = el.attr("data-id");
	var src = el.select(".g-img-thumb-inner").style("background-image");

	d3.selectAll(".g-img-cont-" + id + " .g-img-thumb-cont").classed("g-selected", false);
	el.classed("g-selected", true);

	d3.select(".g-featured-" + id + "	 .g-featured-img-inner").style("background-image", src)


	updateButtons(el.attr("data-count"));
})

d3.selectAll(".g-nav-button").on("click", function(){

	var el = d3.select(this);
	var id = el.attr("data-id");
	var dir = el.attr("data-dir");
	var counter = +d3.select(".g-img-thumbs-" + id).attr("data-counter");
	
	if (dir == "next") {
		counter += 1;
	} else {
		counter -= 1;
	}

	var targetel = d3.select(".g-img-thumb-cont-" + counter);
	d3.selectAll(".g-img-thumb-cont").classed("g-selected", false);
	targetel.classed("g-selected", true);

	var src = targetel.select(".g-img-thumb-inner").style("background-image")
	d3.select(".g-featured-" + id + " .g-featured-img-inner").style("background-image", src);

	updateButtons(counter);
})

function updateButtons(counter) {
	var max = d3.select(".g-img-thumbs").attr("data-max");
	d3.select(".g-img-thumbs").attr("data-counter", counter);

	if (counter > 0) {
		d3.select(".g-nav-button-back").classed("g-active", true);
	} else {
		d3.select(".g-nav-button-back").classed("g-active", false);
	}

	if (counter == (max-1)) {
		d3.select(".g-nav-button-next").classed("g-active", false);
	} else {
		d3.select(".g-nav-button-next").classed("g-active", true);
	}
}



