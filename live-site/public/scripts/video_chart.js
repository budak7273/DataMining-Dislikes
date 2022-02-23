// set the dimensions and margins of the graph
var video_data_margins = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60
    },
    width = 1000 - video_data_margins.left - video_data_margins.right,
    height = 600 - video_data_margins.top - video_data_margins.bottom;

const video_div_selector = "#dataviz_video";

// append the svg object to the body of the page
var video_Svg = d3.select(video_div_selector)
    .append("svg")
    .attr("width", width + video_data_margins.left + video_data_margins.right)
    .attr("height", height + video_data_margins.top + video_data_margins.bottom)
    .append("g")
    .attr("transform",
        "translate(" + video_data_margins.left + "," + video_data_margins.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function (data) {

    // Add X axis
    const x_domain_start = 4;
    const x_domain_end = 8;
    var x = d3.scaleLinear()
        .domain([x_domain_start, x_domain_end])
        .range([0, width]);
    var xAxis = video_Svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const y_domain_start = 0;
    const y_domain_end = 9;
    var y = d3.scaleLinear()
        .domain([y_domain_start, y_domain_end])
        .range([height, 0]);
    var yAxis = video_Svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y));

    // Color scale: give me a species name, I return a color
    var color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica"])
        .range(["#440154ff", "#21908dff", "#fde725ff"])

    // START TOOLTIP STUFF ================================

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    var tooltip = d3.select(video_div_selector)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var mouseover = function (d) {
        tooltip
            .style("opacity", 1)
    }

    var mousemove = function (d) {
        // TODO `this` is not bound correctly, have to move the offsets manually every time the graph is moved on the page
        tooltip
            .html(`Video title: ${d.title}<br>Views: ${d.views}<br>Likes: ${d.likes}<br>Dislikes: ${d.dislikes}`)
            .style("left", (d3.mouse(this)[0] + 200) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1] + 100) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function (d) {
        tooltip
            .transition()
            .duration(0)
            .style("opacity", 0)
    }

    // END TOOLTIP STUFF ================================


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = video_Svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    // var brush = d3.brushX() // Add the brush feature using the d3.brush function
    var brush = d3.brush() // Add the brush feature using the d3.brush function
        .extent([
            [0, 0],
            [width, height]
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = video_Svg.append('g')
        .attr("clip-path", "url(#clip)")

    // Add the brushing
    var brusher = scatter
        .append("g")
        .attr("class", "brush")
        .call(brush);

    // Add circles
    var plotpoints = scatter
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        // Tooltip handlers
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        // End tooltip handlers
        .attr("cx", function (d) {
            return x(d.Sepal_Length);
        })
        .attr("cy", function (d) {
            return y(d.Petal_Length);
        })
        .attr("r", 8)
        .style("fill", function (d) {
            return color(d.Species)
        })
        .style("opacity", 0.5)

    // A function that set idleTimeOut to null
    var idleTimeout;

    function idled() {
        idleTimeout = null;
    }

    // A function that update the chart for given boundaries
    function updateChart() {

        extent = d3.event.selection

        console.log("Event is", d3.event);

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([x_domain_start, x_domain_end])
            y.domain([y_domain_start, y_domain_end])
        } else {
            const x_start = extent[0][0];
            const x_end = extent[1][0];
            const y_start = extent[1][1];
            const y_end = extent[0][1];
            x.domain([x.invert(x_start), x.invert(x_end)])
            y.domain([y.invert(y_start), y.invert(y_end)])
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // https://www.d3-graph-gallery.com/graph/interactivity_brush.html#realgraph
        // A function that return TRUE or FALSE according if a dot is in the selection or not
        // function isBrushed(brush_coords, cx, cy) {
        //     var x0 = brush_coords[0][0],
        //         x1 = brush_coords[1][0],
        //         y0 = brush_coords[0][1],
        //         y1 = brush_coords[1][1];
        //     return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
        // }

        // Update axis and circle position
        xAxis.transition().duration(1000).call(d3.axisBottom(x))
        yAxis.transition().duration(1000).call(d3.axisRight(y))
        scatter
            .selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function (d) {
                return x(d.Sepal_Length);
            })
            .attr("cy", function (d) {
                return y(d.Petal_Length);
            })

    }



})