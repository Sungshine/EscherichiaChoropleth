/**
 * Renders the map
 */

var width = 960, height = 500;
	
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
	/* Associative array mapping counties to an array of disease incidences
	 * of form [city -> [incidences]] 
	 */
	
	var aggrByCounty = [{
		GEOID : 0,
		SourceCounty : "",
		SourceState : "",
		Occurrences : []
	}];
	
	var aggrByDate = [{
		UploadDate : "",
		Occurrences : []
	}];

	// Populate arrays
	data.forEach(function(incidence) {
		var i = aggrByCounty.findIndex(function(county) {
			return county.GEOID == incidence.GEOID;
		});
		
		var j = aggrByDate.findIndex(function(date){
			return date.UploadDate == incidence.UploadDate;
		});

		// Initialize occurrence object
		var occurrence = {
			PatientAge : incidence.PatientAge,
			PatientSex : incidence.PatientSex,
			Serotype : incidence.Serotype,
			SourceCity : incidence.SourceCity,
			SourceSite : incidence.SourceSite,
			Toxin : incidence.Toxin
		};
		
		// Find insertion location for array
		if (i < 0) {
			i = aggrByCounty.push( {
				GEOID : incidence.GEOID,
				SourceCounty : incidence.SourceCounty,
				SourceState : incidence.SourceState,
				Occurrences : []
			}) - 1;
		}
		
		if (j < 0) {
			j = aggrByDate.push( {
				UploadDate: incidence.UploadDate,
				Occurrences : []
			}) - 1;
		}

		aggrByCounty[i].Occurrences.push(occurrence);
		aggrByDate[j].Occurrences.push(occurrence);
	});

	// Draw histogram
	aggrByDate.sort(function(a,b) {
		adate = a.UploadDate.split("/");
		bdate = b.UploadDate.split("/");
		
		anum = adate[2] * 1000 + adate[1] * 10 + adate[0];
		bnum = adate[2] * 1000 + bdate[1] * 10 + bdate[0];
		
		return anum - bnum;
	});

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
	
	function stream_index(d, i) {
		return {x: i, y: Math.max(0, d.Occurrences.length)};
	}

	nv.addGraph(function() {
		var chart = nv.models.lineWithFocusChart();
		
		chart.xAxis
			.tickFormat(d3.format(',f'));
		
		chart.yAxis
			.tickFormat(d3.format(',.2f'));
		
		chart.y2Axis
			.tickFormat(d3.format(',.2f'));
		
		chart.showLegend(false);
		
		d3.select('#histogram svg')
			.datum(data())
			.transition().duration(500)
			.call(chart);
		
		return chart;
	});

	var counties_filename = "us_counties_v2.json";
	
	// Draw map
	d3.json(counties_filename, function(error, us) {
		// Modify individual counties
		vector.selectAll(".counties")
			.data(topojson.feature(us, us.objects.counties).features)
			.enter().append("path")
			/* Fill in colors
			 * TODO scaling - not much variation in colors
			 * TODO efficiency - work is duplicated in mouseover listener
			 */
			.attr("class", function(d) { 
				var i = aggrByCounty.findIndex(function(county) {
					return Number(county.GEOID) == d.id;
				});
				var numOccurrences = i >= 0 ? aggrByCounty[i].Occurrences.length : 0;
				return "q" + Math.floor((numOccurrences / 35) * 9) + "-9";
			})
			.attr("d", path)
			// Add tooltips
			.call(d3.helper.tooltip(function(d, i) {
					var i = aggrByCounty.findIndex(function(county) {
						return Number(county.GEOID) == d.id;
					});
					if (i >= 0) 
						return "<b>"+ aggrByCounty[i].SourceCounty 
							+ " County</b> Infected: " 
							+ aggrByCounty[i].Occurrences.length;
					else return "<b> No reported incidences! </b>"; 
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
});

function zoomed() {
	vector.attr("transform", "translate(" + d3.event.translate 
		+ ")scale(" + d3.event.scale + ")");
	vector.select(".states").style("stroke-width", 1 / d3.event.scale + "px");
	vector.select(".county-boundary")
		.style("stroke-width", 1 / d3.event.scale + "px");
}

d3.helper = {};

d3.helper.tooltip = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('body').node();
        selection.on("mouseover", function(d, i){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute') 
                .style('z-index', 1001);
            // Add text using the accessor function
            var tooltipText = accessor(d, i) || '';
        })
        .on('mousemove', function(d, i) {
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i){
            // Remove tooltip
            tooltipDiv.remove();
        });

    };
};
