#!/usr/bin/env node

var fs = require("fs");

var trail = "lantau-trail";

function calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

// Converts numeric degrees to radians
function toRad(Value) {
  return Value * Math.PI / 180;
}

var data = fs.readFileSync(trail + "/data/trackpoints.tsv", "utf8");
data = data.split("\n");
data = data.filter(d => d != "" && d.indexOf("type") == -1)

var parsed = [];
data.forEach(function(d,i){
  d = d.split("\t")

  var row = {};
  row.id = i
  row.lat = +d[1]
  row.lon = +d[2]
  row.alt = +d[3]
  parsed.push(row);
})

var prev = parsed[0];
var totaldist = 0;
var str = ""
parsed.forEach(function(d){
  var dist = calcCrow(+prev.lat, +prev.lon, +d.lat, +d.lon);
  if (!isNaN(dist) && d.id != 984) {
    totaldist += +dist;
  }
  d.dist = totaldist;
  prev = d;
})

var waypoints = fs.readFileSync(trail + "/data/waypoints.tsv", "utf8");
waypoints = waypoints.split("\n")
waypoints = waypoints.filter(d => d != "")

waypoints.forEach(function(d,i){
  if (i != 0) {
    d = d.split("\t")
    var lat = d[1]
    var lon = d[2]
    var post = d[5]
    var closest;
    var closestpt;
    parsed.forEach(function(a){
      var dist = calcCrow(+lat, +lon, +a.lat, +a.lon);
      if (!closest) {
        closest = dist;
        closestpt = a;
      } else if (dist < closest) {
        closest = dist;
        closestpt = a;
      }
    })
    parsed[closestpt.id].dp = post.split(";")[0].replace('\"', "")
  }
})

fs.writeFileSync(trail + "/parsed.json", JSON.stringify(parsed, null, 2))