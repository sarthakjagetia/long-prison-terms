
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {


  var pageSize = "large"
  var mapSizes = {
    "huge": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8},
    "large": { "width": 900, "height": 1270, "scale": 3100, "translate": [380,220], "chartWidth": 62, "chartMargin": 5},
    "medium": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8},
    "small": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8}
  }

  var mapMargin = {top: 30, right: 20, bottom: 30, left: 50},
    mapWidth = mapSizes[pageSize]["width"] - mapMargin.left - mapMargin.right,
    mapHeight = mapSizes[pageSize]["height"] - mapMargin.top - mapMargin.bottom;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // sizing constants for intro track

  var mapSvg = null;
  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];
  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height

      mapSvg = d3.select("#map")
        .append("svg")
            .attr("width", mapWidth + mapMargin.left + mapMargin.right)
            .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + mapMargin.left + "," + mapMargin.top + ")");




      // perform some preprocessing on raw data
      var trendsData = rawData[0]
      mapSvg.data([trendsData])
      setupVis(trendsData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param allData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(trendsData) {
    //temp line

    //map
    trendsData = trendsData.filter(function(o){
    return +o.Year >= 2000
    })
    trendsData.forEach(function(d) {
      d.LOS_Mean = +d.LOS_Mean
      d.LOS_MeanViolent = +d.LOS_MeanViolent
      d.Year = +d.Year;
      d.LOS_10plus_Num =  +d.LOS_10plus_Num
      d.LOS_MeanAllExceptViol = +d.LOS_MeanAllExceptViol
      d.LOS_MeanTop10 = +d.LOS_MeanTop10
      d.LOS_10plus_Pct = +d.LOS_10plus_Pct
      d.LOS_10plus_Num = +d.LOS_10plus_Num
    });


  var trendsDataNest = d3.nest()
    .key(function(d) {return d.State;})
    .entries(trendsData);

  var tmpKeys = []
  for(var i = 0; i < trendsDataNest.length; i++){
    var obj = trendsDataNest[i]
    if(obj.hasOwnProperty("key")){
      tmpKeys.push(obj.key)
    }
  }





  var blankStateData = stateData.features.filter(function(o) { return tmpKeys.indexOf(o.properties.abbr) == -1})



        var projection = d3.geo.equirectangular()
        .scale(mapSizes[pageSize]["scale"])
        .center([-96.03542,41.69553])
        .translate(mapSizes[pageSize]["translate"]);

      var geoPath = d3.geo.path()
        .projection(projection);
  var chartWidth = mapSizes[pageSize]["chartWidth"]
  var chartMargin = mapSizes[pageSize]["chartMargin"]
  var map = mapSvg
    .selectAll(".state")
    .data(trendsDataNest)
    .enter()
    .append("g")
    .attr("class","state")
        .attr("transform", function(d,i){
            var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
            return "translate(" + geoPath.centroid(tmp[0]) + ")"

        })

    var blank = mapSvg
    .selectAll(".blank")
    .data(blankStateData)
    .enter()
    .append("g")
    .attr("class","blank")
        .attr("transform", function(d,i){
            // var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
            return "translate(" + geoPath.centroid(d) + ")"

        })

    blank.append("rect")
      .attr("width",chartWidth-2*chartMargin)
      .attr("height",chartWidth-2*chartMargin)
      .attr("x",chartMargin)
      .attr("y",chartMargin)
      .style("fill","#e3e3e3") 

 


    var mapX = d3.scale.linear().range([chartMargin, chartWidth-chartMargin]);
    var mapY = d3.scale.linear().range([chartWidth-chartMargin, chartMargin]);


    mapX.domain([2000,2014]);
    mapY.domain([0, d3.max(trendsData, function(d) { return d.LOS_Mean; })]); 

    var mapXAxis = d3.svg.axis().scale(mapX)
        .orient("bottom").outerTickSize(0);

    var mapYAxis = d3.svg.axis().scale(mapY)
        .orient("left").outerTickSize(0);

    var mapline = d3.svg.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d.LOS_Mean); });

    map.append("path")
      .attr("class", function(d){ return "standard line " + d.key })
          .attr("d", function(d){  return mapline(d.values)})
    map.append("path")
      .attr("class", "alt line")
          .attr("d", function(d){  return mapline(d.values)})
          .style("opacity",0)


      map.append("rect")
       .attr("class","mapCurtain")
       .attr("width",chartWidth-2*chartMargin)
       .attr("height",chartWidth-2*chartMargin)
       .attr("x",chartMargin)
       .attr("y",chartMargin)
       .style("fill","#ffffff")

    map.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (chartWidth-chartMargin) + ")")
        .call(mapXAxis);

    // Add the Y Axis
    map.append("g")
        .attr("class", function(d){ return "y axis " + d.key})
      .attr("transform", "translate(" + chartMargin + ",0)")
        .call(mapYAxis);





  };

  function drawMapLine(variable, alt, hide){
    alt = (typeof(alt) == "undefined") ? "standard" : alt
    hide = (typeof(hide) == "undefined") ? "show" : hide
    var opacity = (hide == "hide") ? 0 : 1
    var trendsData = d3.select("#vis").data()[0][0]

    var trendsDataNest = d3.nest()
      .key(function(d) {return d.State;})
      .entries(trendsData);

    var chartWidth = mapSizes[pageSize]["chartWidth"]
    var chartMargin = mapSizes[pageSize]["chartMargin"]

    d3.select("#map svg")
      .selectAll(".state")
      .data(trendsDataNest)

    var mapX = d3.scale.linear().range([chartMargin, chartWidth-chartMargin]);

    var mapY = d3.scale.linear().range([chartWidth-chartMargin, chartMargin]);

    mapX.domain([2000,2014]);
    // var mapYs = {}
    var mlines = {}
    var yaxes = {}
    var mapY;
    var mapline;
    var mapYAxis
    var altvar = (alt == "alt" && hide == "show") ? "LOS_MeanViolent" : variable
    if(variable == "LOS_10plus_Num"){
      for(var i = 0; i < trendsDataNest.length; i++){
        var max = d3.max(trendsDataNest[i].values, function(d) { return d[variable]; })

        var my = d3.scale.linear().range([chartWidth-chartMargin, chartMargin])
          .domain([0, max]);

        var state = trendsDataNest[i].key

        mlines[state] = d3.svg.line()
          .x(function(d) { return mapX(d.Year); })
          .y(function(d) { return my(d[variable]); });

        yaxes[state] = d3.svg.axis().scale(my)
          .orient("left")
          .tickValues([max])
          .outerTickSize(0);

      d3.selectAll("#map .y.axis." + state)
        .transition()
        .call(yaxes[state])

        d3.selectAll("#map svg ." + alt + ".line." + state)
          .transition()
          .style("opacity", opacity)
          .transition()
          .duration(1200)
          .attr("d", function(d){ return mlines[state](d.values)})

      }

    }else{
      mapY = d3.scale.linear().range([chartWidth-chartMargin, chartMargin]);
      var max = d3.max(trendsData, function(d) { return d[altvar]; })
      mapY.domain([0, max]); 
      mapline = d3.svg.line()
          .x(function(d) { return mapX(d.Year); })
          .y(function(d) { return mapY(d[variable]); });
      mapYAxis = d3.svg.axis().scale(mapY)
        .orient("left")
        .tickValues([0, max])
        .outerTickSize(0);

      d3.selectAll("#map .y.axis")
        .transition()
        .call(mapYAxis)
      d3.selectAll("#map svg ." + alt + ".line")
          .transition()
          .style("opacity", opacity)
          .transition()
          .duration(1200)
          .attr("d", function(d){ return mapline(d.values)})

    }
    var mapXAxis = d3.svg.axis().scale(mapX)
        .orient("bottom").outerTickSize(0);

  }





  function drawBackMapCurtain(delay){
    var chartWidth = mapSizes[pageSize]["chartWidth"]
    var chartMargin = mapSizes[pageSize]["chartMargin"]

    d3.selectAll(".mapCurtain")
      .transition()
      .duration(0)
      .attr("width",chartWidth-2*chartMargin)
      .attr("x",chartMargin)
      .transition()
      .delay(delay + 200)
      .duration(1200)
      .attr("width",0)
      .attr("x", chartWidth - chartMargin)
       //    map.append("rect")
       // .attr("class","mapCurtain")
       // .attr("width",chartWidth-2*chartMargin)
       // .attr("height",chartWidth-2*chartMargin)
       // .attr("x",chartMargin)
       // .attr("y",chartMargin)
       // .style("fill","#ffffff")
  }

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes

    activateFunctions[0] = mapTimeServed;
    activateFunctions[1] = mapTimeServedByOffense
    activateFunctions[2] = mapTimeServedTop10Percent;
    activateFunctions[3] = map10YearsPercent;
    activateFunctions[4] = map10YearsNumber;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 5; i++) {
      updateFunctions[i] = function() {};
    }
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * introLineChart - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */

  function mapTimeServed(){
    d3.select("#map")
      .transition()
      .style("opacity",1)
    drawMapLine("LOS_Mean")
    drawMapLine("LOS_Mean", "alt", "hide")
    drawBackMapCurtain(0);
  }
  function mapTimeServedByOffense(){
    drawMapLine("LOS_MeanAllExceptViol", "alt", "show")
    drawMapLine("LOS_MeanViolent")

  }
  function mapTimeServedTop10Percent(){
    // drawBackMapCurtain(0);
    drawMapLine("LOS_MeanTop10", "alt", "hide")
    drawMapLine("LOS_MeanTop10")

  }
  function map10YearsPercent(){
    drawBackMapCurtain(0);
    drawMapLine("LOS_10plus_Pct")

  }
  function map10YearsNumber(){
    drawMapLine("LOS_10plus_Num")

  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * updateCough - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */

   function updateAdmissionsText(progress){
   }




  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * cleanData - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(trendsData) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum([trendsData])
    .call(plot);

  // d3.select("#lineChart")
  //   .datum(lineData)


  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display

    d3.csv("data/trendsData.csv", function(trendsData){
      display(trendsData)
    })
