console.log("Loaded");

// Based on:
// https://www.d3-graph-gallery.com/graph/line_color_gradient_svg.html

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

console.log(svg);

d3.csv("sample_ratio_data.csv",

  // Process incoming data first
  function(d){
    return {
        x: d.views,
        y : d.ratio,
    }
  }).then(

  // Now I can use this dataset:
  function(data) {

    // Add X axis
    const x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return +d.x; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Max/min y values observed:
    const maxY = d3.max(data, function(d) { return +d.y; })
    const minY = d3.min(data, function(d) { return +d.y; })

    // Add Y axis with some extra space on top and bottom
    const y = d3.scaleLinear()
      .domain([minY * 1.1, maxY * 1.1])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Set the gradient
    svg.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(maxY))
      .selectAll("stop")
        .data([
            // TODO this might need to be changed to look better depending on the real data
          {offset: "0%", color: "red"},
          {offset: "50%", color: "gray"},
          {offset: "100%", color: "green"}
        ])
      .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)" )
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) })
        )

})