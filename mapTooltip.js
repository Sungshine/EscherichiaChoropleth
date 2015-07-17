/*
 * Tooltip callback function used as a mouseover listener for each geographic
 * region. Calling function provides text to display via accessor, namely the
 * number of reported E. coli cases
 */

// Efficiency
d3.helper = {};

d3.helper.tooltip = function(accessor){
    return function(selection) {
		console.log("reached callback");
        var tooltipDiv;
        var bodyNode = d3.select('body').node();
        selection.on("mouseover", function(d){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute') 
                .style('z-index', 999999);
            // Add text using the accessor function
            var tooltipText = accessor(d) || '';
        })
        .on('mousemove', function(d) {
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d){
            // Remove tooltip
            tooltipDiv.remove();
        });

    };
};
