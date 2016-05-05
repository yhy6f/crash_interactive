//Set our margins, width and height.
//Pin the width and height to the .chart div for actual width and height.
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = $(".chart").width() - margin.left - margin.right,
    height = $(".chart").height() - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

//Color exists as a Scale.
var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//The line function draws points for a path
//Based on the `date` and `value` for each row in each series.
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.no_of_incidents); });

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("no_of_crashes.tsv", function(error, data) {
  if (error) throw error;

  //Define domain of our column names
  //i.e. the values we'll be charting. (One color for each chart);
  var colorDomain = d3.keys(
    data[0]).filter(
      function(key) {
        return key !== "year";
    }
  )

  //Pass that to our color scale.
  color.domain(colorDomain);

  //Create new property called "date" for each row
  //Assign it the value of d.observation_date after it's been formatted.
  data.forEach(function(d) {
    d.year = parseDate(d.year);
  });

  //color.domain is an array of our column headers (but not "date")
  //In other words, it's the values we'll be charting.
  //Remember, colorDomain is an array of 3 values, which are our column headers.
  var incidents = colorDomain.map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {year: d.year, no_of_incidents: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.year; }));

  y.domain([
    //d3.min(places, function(c) { return d3.min(c.values, function(v) { return v.rate; }); }),
    0,
    d3.max(incidents, function(c) { return d3.max(c.values, function(v) { return v.no_of_incidents; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of incidents");

  var incident = svg.selectAll(".incident")
      .data(incidents)
    .enter().append("g")
      .attr("class", "incident");

  incident.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  incident.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.year) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
});