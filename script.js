// Linegraph

const lineWidth = 800;
const lineHeight = 400;

const lineMargin = { top: 30, right: 30, bottom: 30, left: 50 };

const lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
const lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

function getColor(color) {
    switch (color) {
        case "Black":
            return "#000000";
        case "Cinnamon":
            return "#892A15";
        case "Gray":
            return "#959595";
        case "Unknown":
            return "#7D6055";
        default:
            return "steelblue";
    }
}

d3.csv("reconfig.csv").then(function(data) {
    
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.Number = +d.Number;
        d.Running = d.Running === "TRUE";
        d.Climbing = d.Climbing === "TRUE";
        d.Eating = d.Eating === "TRUE";
        d.Foraging = d.Foraging === "TRUE";
    });

    
    const aggregatedData = d3.rollup(data, v => d3.sum(v, d => d.Number), d => d.Date, d => d["Primary.Fur.Color"]);

    
    const flattenedData = [];
    aggregatedData.forEach((dateMap, date) => {
        dateMap.forEach((value, color) => {
            flattenedData.push({ Date: date, Color: color, Number: value });
        });
    });

    
    const lineSvg = d3.select("#line-chart")
        .append("svg")
        .attr("width", lineWidth)
        .attr("height", lineHeight)
        .append("g")
        .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

 
    const xScaleLine = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, lineInnerWidth]);

    const yScaleLine = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Number)])
        .range([lineInnerHeight, 0]);


    const xAxisLine = d3.axisBottom(xScaleLine);
    const yAxisLine = d3.axisLeft(yScaleLine).ticks(5);

  
    lineSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + lineInnerHeight + ")")
        .call(xAxisLine);

  
    lineSvg.append("g")
        .attr("class", "y-axis")
        .call(yAxisLine);

    
    const dataGrouped = d3.group(flattenedData, d => d.Color);
    dataGrouped.forEach((groupData, color) => {
        const line = d3.line()
            .x(d => xScaleLine(d.Date))
            .y(d => yScaleLine(d.Number));

        lineSvg.append("path")
            .datum(groupData)
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", getColor(color))
            .attr("stroke-width", 2);
    });

    function updateChart() {
    const selectedCategories = [];
    d3.selectAll(".checkbox").each(function(d) {
        if (this.checked) {
            selectedCategories.push(this.value);
        }
    });


    const filteredData = data.filter(function(d) {
        return selectedCategories.some(category => d[category]);
    });


    lineSvg.selectAll(".line").remove();


    const dataGrouped = d3.group(filteredData, d => d["Primary.Fur.Color"]);
    dataGrouped.forEach((groupData, color) => {
        const line = d3.line()
            .x(d => xScaleLine(d.Date))
            .y(d => yScaleLine(d.Number));

        lineSvg.append("path")
            .datum(groupData)
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", getColor(color))
            .attr("stroke-width", 2);
    });
}


d3.selectAll(".checkbox").on("change", updateChart);


updateChart();
});



// Scatterplot


const scatterWidth = 800;
const scatterHeight = 600;
const scatterMargin = { top: 50, right: 30, bottom: 120, left: 50 };
const scatterInnerWidth = scatterWidth - scatterMargin.left - scatterMargin.right;
const scatterInnerHeight = scatterHeight - scatterMargin.top - scatterMargin.bottom;


const scatterSvg = d3.select("#scatter-plot")
    .attr("width", scatterWidth)
    .attr("height", scatterHeight)
    .append("g")
    .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");


d3.csv("hoverLink.csv").then(function(scatterData) {
    scatterData.forEach(function(d) {
        d["Hectare.Squirrel.Number"] = +d["Hectare.Squirrel.Number"];
        d["Above.Ground.Sighter.Measurement"] = +d["Above.Ground.Sighter.Measurement"];
    });

 
    const xScaleScatter = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d["Hectare.Squirrel.Number"])])
        .range([scatterMargin.left, scatterInnerWidth]);

    const yScaleScatter = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d["Above.Ground.Sighter.Measurement"])])
        .range([scatterInnerHeight, 0]); 


    const xAxisScatter = d3.axisBottom(xScaleScatter).tickSize(0);
    scatterSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (scatterHeight - scatterMargin.bottom) + ")")
        .call(xAxisScatter);

  
    const yAxisScatter = d3.axisLeft(yScaleScatter).ticks(5).tickSize(0);
    scatterSvg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + scatterMargin.left + ",0)")
        .call(yAxisScatter);

   
    scatterSvg.selectAll(".dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScaleScatter(d["Hectare.Squirrel.Number"]))
        .attr("cy", d => yScaleScatter(d["Above.Ground.Sighter.Measurement"]))
        .attr("r", 5) 
        .attr("fill", d => getColor(d["Primary.Fur.Color"]))
        .attr("opacity", 0.5)
        .on("click", function(event, d) {
            const note = d["Notes"];
            const notesContainer = document.getElementById("notesContainer");
            notesContainer.innerHTML = `<p>${note}</p>`;
        });

    

    
    scatterSvg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", scatterInnerWidth / 2)
        .attr("y", scatterHeight - scatterMargin.bottom / 2)
        .style("text-anchor", "middle")
        .text("Squirrel Number Recorded in Sequence in Singular Squirrel Sighting Session");

  
    scatterSvg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -scatterInnerHeight / 2)
        .attr("y", -scatterMargin.left / 2)
        .style("text-anchor", "middle")
        .text("Height in Ft.");

   
    scatterSvg.append("text")
        .attr("class", "title")
        .attr("x", scatterInnerWidth / 2)
        .attr("y", -scatterMargin.top / 2)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Squirrels Recorded Above Ground");

      
function updateScatterplot(data) {

    scatterSvg.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("class", "dot")

        .attr("cx", d => xScaleScatter(d["Hectare.Squirrel.Number"]))
        .attr("cy", d => yScaleScatter(d["Above.Ground.Sighter.Measurement"]))
        .attr("r", 5)
        .attr("fill", d => getColor(d["Primary.Fur.Color"]))
        .attr("opacity", 0.5)
       
        .on("click", function(event, d) {

            const note = d["Notes"];
            const notesContainer = document.getElementById("notesContainer");
            notesContainer.innerHTML = `<p>${note}</p>`;
        });
}

// Barchart



const barWidth = 800;
const barHeight = 400;
const barMargin = { top: 70, right: 50, bottom: 50, left: 50 };
const barInnerWidth = barWidth - barMargin.left - barMargin.right;
const barInnerHeight = barHeight - barMargin.top - barMargin.bottom;


d3.csv("bargraph.csv").then(function(barData) {
    barData.forEach(function(d) {
        d.Number = +d.Number;
    });


    const xScaleBar = d3.scaleBand()
        .domain(barData.map(d => d["Fur Color"]))
        .range([0, barInnerWidth])
        .padding(0.1);

    const yScaleBar = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.Number)])
        .range([barInnerHeight, 0]);

  
    const barSvg = d3.select("#bar-chart")
        .attr("width", barWidth)
        .attr("height", barHeight)
        .append("g")
        .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");


    barSvg.selectAll(".bar")
        .data(barData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScaleBar(d["Fur Color"]))
        .attr("y", d => yScaleBar(d.Number))
        .attr("width", xScaleBar.bandwidth())
        .attr("height", d => barInnerHeight - yScaleBar(d.Number))
        .attr("fill", d => getColor(d["Fur Color"]));


    barSvg.selectAll(".bar-label")
        .data(barData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScaleBar(d["Fur Color"]) + xScaleBar.bandwidth() / 2)
        .attr("y", d => yScaleBar(d.Number) - 5) 
        .attr("dy", "-0.7em")
        .style("text-anchor", "middle")
        .text(d => d.Number);


    barSvg.selectAll(".bar")
        .on("click", function(event, d) {
            const clickedColor = d["Fur Color"];
            
            const filteredScatterData = scatterData.filter(function(scatterD) {
                return scatterD["Primary.Fur.Color"] === clickedColor;
            });
            
            updateScatterplot(filteredScatterData);
        });
});   
});


function getColor(color) {
    switch (color) {
        case "Black":
            return "#000000";
        case "Cinnamon":
            return "#892A15";
        case "Gray":
            return "#959595";
        case "Unknown":
            return "#7D6055";
        default:
            return "steelblue";
    }
}


d3.csv("bargraph.csv").then(function(data) {
const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d["Fur Color"]))
    .range(["#000000", "#892A15", "#959595", "#7D6055"]);

    const legendContainer = d3.select("#legend-container")
    .style("position", "fixed")
    .style("right", "100px") 
    .style("top", "350px"); 
    

const legend = legendContainer.selectAll(".legend")
    .data(colorScale.domain())
    .enter()
    .append("div")
    .attr("class", "legend");

legend.append("div")
    .attr("class", "legend-box")
    .style("background-color", d => colorScale(d));

legend.append("span")
    .text(d => d);

});