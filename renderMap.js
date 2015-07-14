/**
 * Renders the choropleth map.
 */

var width = 960,height = 500;
	
var projection = d3.geo.albersUsa();

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
	.translate([0,0])
	.scale(1)
	.scaleExtent([1,8])
	.on("zoom", zoomed)

var svg = d3.select("#choropleth").append("svg")
	.attr("width", width)
	.attr("height", height)
	.call(zoom);

var vector = svg.append("g");

d3.csv("EC_data2014_v2.csv", function(data) {
  
	// Holds incidences in an associative array [County -> [Incidences]]
	var incidencesByCounty = [];
  
	data.forEach(function(incidence) {

		var i = incidencesByCounty.findIndex(function(county) {
			  return county.GEOID == incidence.GEOID;
		});
		 
		var occurrence = {
			   PFGEBlnIpattern : incidence["PFGE-BlnI-pattern"],
			   PFGEXbaIpattern : incidence["PFGE-XbaI-pattern"],
			   PatientAge : incidence.PatientAge,
			   PatientSex : incidence.PatientSex,
			   Serotype : incidence.Serotype,
			   SourceCity : incidence.SourceCity,
			   SourceSite : incidence.SourceSite,
			   Toxin : incidence.Toxin
		 };
		
		/* If county does not already have associated occurrence, create entry
		for county */
		if (i < 0) {
			i = incidencesByCounty.push( {
				GEOID : incidence.GEOID,
				SourceCounty : incidence.SourceCounty,
				SourceState : incidence.SourceState,
				Occurrences : []
			}) - 1;
		}
		
		incidencesByCounty[i].Occurrences.push(occurrence);

	  });

d3.json("us_counties_v2.json", function(error, us) {
	vector.selectAll(".counties")
		.data(topojson.feature(us, us.objects.counties).features)
		.enter().append("path")
		.attr("class", function(d) { 
			// TODO efficiency, this work is duplicated in the mouseover listener
			var i = incidencesByCounty.findIndex(function(county) {
				return Number(county.GEOID) == d.id;
			});
			var numOccurrences = i >= 0 ? incidencesByCounty[i].Occurrences.length : 0;
			// TODO change scale
			return "q" + Math.floor((numOccurrences / 35) * 9) + "-9";
		})
		.attr("d", path)
		.call(d3.helper.tooltip(
			function(d, i) {
				var i = incidencesByCounty.findIndex(function(county) {
					return Number(county.GEOID) == d.id;
				});
				// Found some incidences in the county
				if (i >= 0) 
					return "<b>"+ incidencesByCounty[i].SourceCounty 
						+ " County</b> Infected: " 
						+ incidencesByCounty[i].Occurrences.length;
				else return "<b> No reported incidences! </b>"; 
		}));

	vector.append("path")
		.datum(topojson.mesh(us, us.objects.counties))
		.attr("d", path)
		.style({'stroke-opacity':1,'stroke': "rgba(0, 0, 0, 0.3)"})
		.attr("class", "county-boundary");
	});
});

function zoomed() {
	vector.attr("transform", "translate(" + d3.event.translate 
		+ ")scale(" + d3.event.scale + ")");
	vector.select(".state-border").style("stroke-width", 1.5 / d3.event.scale 
		+ "px");
	vector.select(".county-border").style("stroke-width", .5 / d3.event.scale 
		+ "px");
}


