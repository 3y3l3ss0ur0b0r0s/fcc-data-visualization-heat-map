// API URL
const api_url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

// GET API DATA THROUGH ASYNC FUNCTION
async function getAPI(url) {
  // STORING RESPONSE
  const response = await fetch(url);
  
  // STORING DATA IN THE FORM OF JSON
  var data = await response.json();
  //console.log(data);
  renderData(data);
}

function renderData(data) {
  // CREATE OUR VARIABLES
  const dataset = data;
  //console.log(typeof dataset);
  
  const w = 1400;
  const h = 500;
  const padding = 60;
  
  // MAKE SCALES
    // YEARS ON X-AXIS, MONTHS ON Y-AXIS
 
  const xScale = d3.scaleLinear()
  .domain([d3.min(dataset["monthlyVariance"], (d) => d["year"]-1), d3.max(dataset["monthlyVariance"], (d) => d["year"])+1])
  .range([padding, w-padding]);
  
  const yScale = d3.scaleLinear()
  .domain([12.5,0.5])
  .range([h-padding, padding]);
 
  // CREATE SVG
  const svg = d3.select("#graphics-box")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
  // MAKE AXES
  //const years = dataset["monthlyVariance"].map((d) => d.year);
  
  const xAxis = d3.axisBottom(xScale)
    .ticks(40)
    .tickFormat((d) => parseInt(d.toString().replace(/,/g, '')));
  
    // MONTH INDEX TO MONTH NAME CONVERSION
  function getMonth(index) {
    const months = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December"
    };
    
    return months[index];
  }
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => getMonth(d));
  
  // APPEND AXES
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (h-padding) + ")")
    .call(xAxis);
 
    svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + (padding) + ",0)")
    .call(yAxis);
  
  // ADD TOP TEXT  
  const minYear = d3.min(dataset["monthlyVariance"].map((d) => d["year"]));
  const maxYear = d3.max(dataset["monthlyVariance"].map((d) => d["year"]));
  const baseTemp = dataset.baseTemperature;
  const baseTempString = "Base temperature from " + minYear + " to " + maxYear + ": " + baseTemp + " °C";
  console.log(baseTempString);
  
  d3.select("svg")
    .append("text")
    .text(baseTempString)
    .attr("x", padding + (w/3))
    .attr("y", padding-12);
  
  // TOOLTIP TIME
  d3.select("#overlay")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute");
  
  // ADD COLORS AND CELLS
    // https://css-irl.info/working-with-color-scales-for-data-visualisation-in-d3/
  /*const colorScale = d3.scaleThreshold()
  .domain([-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5])
  .range(["rgba(251,96,3,1.0)", "rgba(61,133,198,1.0)"])
  .clamp(true);*/
  
  function getColor(variance) {
    //console.log("Getting color...");
    let rVal = Math.floor(255/2)+100;
    let gVal = Math.floor(255/2)+90;
    let bVal = Math.floor(255/2)-40;
    
    if(variance < 0) {
      //console.log("Variance < -0.5");
      rVal = rVal + (40*Math.floor(variance));
      if(rVal < 0) {
        rVal = 0;
      }
      
      gVal = gVal - (5*Math.floor(variance));
      if(gVal > 255) {
        gVal = 255;
      }
      
      bVal = bVal - (60*Math.floor(variance));
      if(bVal > 255) {
        bVal = 255;
      }
      //return "rgba(61,133,198,1.0)";
    }
    else if(variance > 0) {
      //console.log("Variance > 0.5");
      bVal = bVal - (50*Math.floor(variance));
      if(bVal < 0) {
        bVal = 0;
      }
      
      gVal = gVal - (20*Math.floor(variance));
      if(gVal < 0) {
        gVal = 0;
      }
      
      rVal = rVal + (120*Math.floor(variance));
      if(rVal > 255) {
        rVal = 255;
      }
    }
    
    //console.log("-0.5 < Variance < 0.5");
    
    colorString = "rgba(" + rVal + "," + gVal + "," + bVal + ",1.0)";
    //console.log(colorString);
    return colorString;
  }
  
  svg.selectAll("rect")
    .data(dataset["monthlyVariance"])
    .enter()
    .append("svg")
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month - 0.5))
    .attr("width", (w-padding)/300)
    .attr("height", ((h-padding)/13)-2)
    .attr("data-month", (d) => d.month-1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => function(d){baseTemp + d.variance})
    .on("mouseover", function(e, d) {
      console.log("mouseover, " + d.month + "/" + d.year + ", " + (baseTemp+d.variance) + " °C");
      const[x,y] = d3.pointer(e);
  
      d3.select("#tooltip")
        .style("visibility", "visible")
        .style("left", ((e.pageX)+20) + "px")
        .style("top", ((e.pageY)-20) + "px")
        .attr("data-year", d.year)
        .text(d.month + "/" + d.year + ", " + (baseTemp+d.variance).toString().replace(/(?<=\.\d{3})\d*/g,'') + " °C");
    })
    .on("mouseout", function() {
      console.log("mouseout");
      
      d3.select("#tooltip")
        .style("visibility","hidden");
    })
    .style("fill", (d) => getColor(d.variance));
  
  // LEGEND TIME... : )
  const legendPadding = 10;
  const legendHeight = 60;
  const legendWidth = 220;
  
  const legend  = d3.select("#graphics-box")
    .append("div")
    .attr("id", "legend")
    .append("text")
    .text("Legend")
    .style("font-weight", "bold")
    .style("background-color", "#fff");
  
  legend.append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight);
  
  const legendVariances = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
  
  const legendScale = d3.scaleLinear()
    .domain([d3.min(legendVariances)-0.5, d3.max(legendVariances)+0.5])
    .range([0, 200]);
  
  legend.select("svg")
    .attr("x", legendWidth/2)
    .attr("y", legendHeight/2)
    .selectAll("rect")
    .data(legendVariances)
    .enter()
    .append("rect")
    .attr("class", "colorBlock")
    .attr("x", (d) => legendScale(d - 0.5) + legendPadding)
    .attr("y", legendPadding)
    .attr("width", 16)
    .attr("height", 20)
    .style("fill", (d) => getColor(d));
  
  const legendAxis = d3.axisBottom(legendScale);
  
  legend.select("svg")
    .append("g")
    .attr("id", "legend-axis")
    .attr("transform", "translate(" + legendPadding + "," + (20+legendPadding) + ")")
    .call(legendAxis);
}

// CALL GETAPI WITH API_URL
getAPI(api_url);