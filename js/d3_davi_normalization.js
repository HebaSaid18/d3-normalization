// LOAD DATA
d3.csv("data/covid19ch.csv",function(d) {
  var parseTime = d3.timeParse("%d.%m.%Y");
  return {
    date: parseTime(d.Date),
    CH : +d["CH"]
  };
}).then(function(data){  

    
    
    // Change this number to 
    // 0 -> linear normalization, 
    // 1 -> squareroot normalization, 
    // 2 -> logarithmic normalization
    
    var chosenNormalisation = 0;
    
  
    console.log(data);

//SVG margins -> left labels
var margin = {
    top: 25,
    right: 25,
    bottom: 15,
    left: 200
};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#graphic").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Scale time for x Axis
var xScale = d3.scaleTime()
            .domain(d3.extent(data,d=>d.date))
            .range([0, width]);


// AXIS
var xAxis = d3.axisTop(xScale)
    .ticks(d3.timeMonth, 1)
    .tickFormat(d3.timeFormat('%b'));

svg.append("g")
    .attr("class","x axis")
    .call(xAxis);
    
var binWidth = xScale(new Date("2019-03-31 00:00:00"))-xScale(new Date("2019-03-30 00:00:00"));
    
//compute range
var min = d3.min(data, d=>d.CH);
var max = d3.max(data, d=>d.CH);
    
var yScale = function (d) {
    if (chosenNormalisation == 0) {
        return (d - min) / (max - min);
    } else if (chosenNormalisation == 1) {
        return (Math.sqrt(d) - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min));
    } else if (chosenNormalisation == 2) {
        return (Math.log(d + 1) - Math.log(min + 1)) / (Math.log(max + 1) - Math.log(min + 1));
    }
}

d3.range(min, max, 100).forEach(val=>
    svg.append("g")
    .append("text")
        .attr("class", "label")
        .attr("x",-10)
        .attr("y", height - yScale(val) * height)
        .attr("text-anchor","end")
        .text(val)
);

// SHOW DATA    
svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", function (d) {
        return height - yScale(d.CH) * height;
    })
    .attr("height", function (d) {
        return yScale(d.CH) * height;
    })
    .attr("x", function (d) {
        return xScale(d.date);
    })
    .attr("width", binWidth);
    
    
    function normalizationChange() {
        console.log(chosenNormalisation);
        chosenNormalisation = d3.select("#normOption").node().value;
        svg.selectAll(".bar")
            .data(data)
            .transition()
            .attr("y", function (d) {
                return height - yScale(d.CH) * height;
            })
            .attr("height", function (d) {
                return yScale(d.CH) * height;
            })
        d3.selectAll(".label").remove();
        d3.range(min, max, 100).forEach(val=>
            svg.append("g")
            .append("text")
                .attr("class", "label")
                .attr("x",-10)
                .attr("y", height - yScale(val) * height)
                .attr("text-anchor","end")
                .text(val)
);
    }
    
    var selectOption = d3.select("#options")
        .append("select")
            .on("change", normalizationChange)
            .attr("id", "normOption");
    
    selectOption.append("option")
        .text("linear")
        .attr("value",0);
    selectOption.append("option")
        .text("squareroot")
        .attr("value",1);
    selectOption.append("option")
        .text("logarithmic")
        .attr("value",2);
}) // Ende