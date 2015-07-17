var countiesFilename = "us_counties_v2.json";

var width = $(window).width, height = $(window).height;
  
var projection = d3.geo.albersUsa();

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .translate([0,0])
    .scale(1)
    .scaleExtent([1,8])
    .on("zoom", zoomed)

// Initialize map div
var mapSvg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

var vector = mapSvg.append("g");

// Create legend
var legendSvg = d3.select('#choropleth').append("svg")
    .attr("width", width)
    .attr("height", 50)
    .attr("class", "legend");

for (var i = 0; i < 9; i++) {
	legendSvg.append("rect")
		.attr("width", 100)
		.attr("height", 15)
		.attr("x", 300 + i * 100)
		.attr("y", 10)
		.attr("class", "q" + i + "-9");
}

// Returns the [0, 364]-based ordinal day in the year given a date
function handleDate(date) {
  var str = date.split("/");
  var monthDays = 0, 
      dayDays = parseInt(str[1]),
      x = parseInt(str[0]);

  if (x >= 1)
    monthDays += 0;
  if (x >= 2)
    monthDays += 31;
  if (x >= 3)
    monthDays += 28;
  if (x >= 4)
    monthDays += 31;
  if (x >= 5)
    monthDays += 30;
  if (x >= 6)
    monthDays += 31;
  if (x >= 7)
    monthDays += 30;
  if (x >= 8)
    monthDays += 31;
  if (x >= 9)
    monthDays += 31;
  if (x >= 10)
    monthDays += 30;
  if (x >= 11)
    monthDays += 31;
  if (x >= 12)
    monthDays += 30;

  return monthDays + dayDays - 1;
}

var aggrByDate = [];

function county(GEOID, SourceCounty, SourceState ) {
	this.GEOID = GEOID;
	this.SourceCounty = SourceCounty;
	this.SourceState = SourceState;
	this.Occurrences = [];
}

function date (UploadDate) {
	this.UploadDate = UploadDate;
	this.Occurrences = [];
}

for (i = 0; i < 365; i++) {
	aggrByDate.push(new date(i));
}

// Populate arrays
data.forEach(function(incidence) {
	totalCount += 1;
	
	// Initialize occurrence object
	var occurrence = {
		UploadDate : incidence.UploadDate,  
		PFGEBlnIpattern : incidence["PFGE-BlnI-pattern"],
		PFGEXbaIpattern : incidence["PFGE-XbaI-pattern"]
	};
	
	var i = parseInt(incidence.GEOID);
	var j = handleDate(incidence.UploadDate);
	
	if (aggrByCounty[i] == null) {
	  aggrByCounty[i] = new county(i, incidence.SourceCounty, incidence.SourceState);
	}
	
	aggrByCounty[i].Occurrences.push(occurrence);
	aggrByDate[j].Occurrences.push(occurrence);
});
	
// Draw histogram	
var data = function() {
	return d3.range(1).map(function() {
		return aggrByDate.map(stream_index);
	}).map(function(data, i) {
		return {
			key: 'Stream' + i,
			values: data
	  };
	});
}

// Draw map
d3.json(countiesFilename, function(error, us) {
// Modify individual counties
vector.selectAll(".counties")
	.data(topojson.feature(us, us.objects.counties).features)
	.enter().append("path")
	/* 
	* Fill in colors
	* TODO scaling - not much variation in colors
	* TODO efficiency - work is duplicated in mouseover listener
	*/
	.attr("class", function(d) { 
		var i = d.id;
		var numOccurrences;
		if (aggrByCounty[i] == null) 
			numOccurrences = 0;
		else
			numOccurrences = aggrByCounty[i].Occurrences.length;

		return "q" + Math.floor((numOccurrences / 35) * 9) + "-9";
	})
	.attr("d", path)
	// Add tooltips
	.call(d3.helper.tooltip(function(d, i) {
		return "<b>"+"Hello world" + "</b>";
	}));

// Modify geographic borders
vector.append("path")
	.datum(topojson.mesh(us, us.objects.counties))
	.attr("d", path)
	.style({'stroke-opacity':1,'stroke': "rgba(0, 0, 0, 0.3)"})
	.attr("class", "county-boundary");

// Modify state borders
vector.append("path")
	.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	.attr("class", "states")
	.attr("d", path);
});

// Label legend
for (var i = 0; i < 10; i++) {
	legendSvg.append("text")
		.attr("id", "ll" + i)
		.attr("x", 295 + i * 100)
		.attr("y", 35);
	document.getElementById("ll" + i).innerHTML = Math.floor(35/9 * i);
}

// Label details panel
d3.select('#totalCount')
	.append("text")
	.attr("id", "tc");

document.getElementById("tc").innerHTML = totalCount;

d3.select('#dateRange')
.append("text")
.attr("id", "dr");

document.getElementById("dr").innerHTML = "Jan 1 ~ Dec 31";

d3.select('#outbreaks')
.append("text")
.attr("id", "ob");

//  TODO document.getElementById("tc").innerHTML = FILLHERE;
});

function zoomed() {
vector.attr("transform", "translate(" + d3.event.translate 
+ ")scale(" + d3.event.scale + ")");
vector.select(".states").style("stroke-width", 1 / d3.event.scale + "px");
vector.select(".county-boundary")
.style("stroke-width", 1 / d3.event.scale + "px");
}
