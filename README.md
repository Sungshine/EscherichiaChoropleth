# EscherichiaChoropleth
Georgia Tech: CS4460 Intro to Data Visualization: Inseok Hwang, Raghav Kaul, Sung Im

**Demo Instructions**

The usual, clone the repository into a folder and open the html. Do note that the webpage performs few HTTP request, so one must set up a HTTP server before running. For local usages, do

    python -m SimpleHTTPServer
    
 to set up a local HTTP server.

## Choropleth Projection
Choropleth map using U.S. county data from U.S. Census Bureau. Currently assigns random color value for each county within the range of color sequence defined in the css selection.

## File Description
**us_counties.json** 

This file is a TopoJSON file created using GDAL to filter and convert the original shape-file to GeoJSON format and TopoJSON to then convert the GeoJSON to TopoJSON format setting the object identifiers as the FIPS county codes.

The shape-files (.shp) were downloaded from the U.S. Census Bureau website:

[U.S. Census Bureau](http://www.census.gov/geo/maps-data/data/tiger-line.html)

**index.html**

The main display of the visualization. Uses the example color sequence from Bostock's choropleth example at:

[D3JS website](d3js.org)

**countyFIPS.csv**

File contains the FIPS codes and their related U.S. counties:

[FIPS county codes wiki](https://en.wikipedia.org/wiki/FIPS_county_code)
