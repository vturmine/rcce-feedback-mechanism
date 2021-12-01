// window.$ = window.jQuery = require('jquery');
// colors 
let ifrcPink_1 = '#D90368', ifrcPink_2 = '#E27093', ifrcPink_3 = '#E996AD', ifrcPink_4 = '#F0BDC9', ifrcPink_5 = '#FAE7EA';
let ifrcGreen_1 = '#2F9C67', ifrcGreen_2 = '#78B794', ifrcGreen_3 = '#9EC8AE', ifrcGreen_4 = '#C2DACA', ifrcGreen_5 = '#E9F1EA';
let ifrcBlue_1 = '#204669', ifrcBlue_2 = '#546B89', ifrcBlue_3 = '#798BA5', ifrcBlue_4 = '#A6B0C3', ifrcBlue_5 = '#DBDEE6';
let ifrcYellow = '#FCCF9E';
let mapActiveColor = '#2F9C67',
    mapInactiveColor = '#C2DACA',//'#d1021a',
    mapPipelineColor = '#78B794';

var mapColorRangeDefault = [ifrcBlue_3, ifrcBlue_2, ifrcBlue_1];
// let mapInactive = '#a6d8e8';

let numberCountriesCFM = 0;
let regionsArr = ['All regions'];
let countriesISO3Arr = [];

let statusChart ;

let datatable;

let focusCovid = ['COVID-19', 'COVID-19, Volcano', 'COVID-19, Accountability'],
    focusMigrant = ['Migrant'],
    focusOther = ['Protection'];

var sort_value = function (d1, d2) {
    if (d1.value > d2.value) return -1;
    if (d1.value < d2.value) return 1;
    return 0;
}

// get and set # countries with CFM
function setCountriesAndOrgCFM(){
    var arrCountries = [],
        arrOrgs = [];
    countriesISO3Arr = [];
    filteredCfmData.forEach(element => {
        arrCountries.includes(element['Country']) ? '' : arrCountries.push(element['Country']);
        arrOrgs.includes(element['Organisation Name']) ? '' : arrOrgs.push(element['Organisation Name']);
        regionsArr.includes(element['Region']) ? '' : regionsArr.push(element['Region']);
        countriesISO3Arr.includes(element['ISO3']) ? '' : countriesISO3Arr.push(element['ISO3']);
    });
    $('#totalCfms').text(filteredCfmData.length);
    $('#countriesCFM').text(arrCountries.length);
    $('#orgsCFM').text(arrOrgs.length);
} //setCountriesAndOrgCFM

// populate regions selections via the data
function regionSelectionDropdown(){
    var options = "";
    filteredCfmData.forEach(element => {
        regionsArr.includes(element['Region']) ? '' : regionsArr.push(element['Region']);
    });
    for (let index = 0; index < regionsArr.length; index++) {
        const element = regionsArr[index];
        index == 0 ? options += '<option value="' + element + '" selected>' + element + '</option>'  : 
            options += '<option value="' + element + '">' + element + '</option>';
    }
    $('#regionSelect').append(options);
}//regionSelectionDropdown

function getDataTableData(data = filteredCfmData){
    var dtData = [];
    data.forEach(element => {
        var cfmstatusColor = ifrcGreen_1;
        element['Status'] == "Inactive" ? cfmstatusColor =  ifrcGreen_5 : 
        element['Status'] == "Pipeline" ? cfmstatusColor =  ifrcGreen_3 : null;
        dtData.push([
                    '<i class="fa fa-circle fa-md" style="color:'+cfmstatusColor+';"></i>',
                    element['Country'], element['Organisation Name'], 
                    element['Perception'] != "" ? element['Perception'] : "-", 
                    element['Suggestion'] != "" ? element['Suggestion'] : "-", 
                    element['Rumour tracking'] != "" ? element['Rumour tracking'] : "-", 
                    element['Questions'] !="" ? element['Questions'] : "-", 
                    element['Complaint'] != "" ? element['Complaint'] : "-", 
                    element['Accountability'] != "" ? element['Accountability'] : "-", 
                    //link with icone
                    element['Link'] != "" ? '<a href="'+element['Link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a>' : "-"
        ]);
    });
    return dtData;
}

// generate data table
function generateDataTable(){
    var dtData = getDataTableData();
    datatable = $('#datatable').DataTable({
        data : dtData,
        // "columns": [
        //     {"width": "1%"},
        //     {"width": "1%"},
        //     {"width": "1%"},
        //     {"width": "1%"},
        //     {"width": "80%"},
        //     {"width": "1%"},
        //     {"width": "1%"}
        // ],
        "pageLength": 5,
        "bLengthChange": false,
        "pagingType": "simple_numbers",
        "order":[[1, 'asc']],
        "dom": "lrtp"
    });
} //generateDataTable

function generateBarChart(){
    var data = d3.nest() 
        .key(function(d) { return d['Status']; })
        .rollup(function(d) { return d.length ;})
        .entries(filteredCfmData).sort(sort_value);
    var arrX = ['x'],
        arrY = ['Status'];
    data.forEach(element => {
        arrX.includes(element.key) ? '' : arrX.push(element.key);
        arrY.includes(element.key) ? '' : arrY.push(element.value);
    });
	var chart = c3.generate({
		bindto: '#statusChart',
		size: { height: 100 },
		// padding: {right: 10, left: 180},
	    data: {
	        x: 'x',
	        columns: [arrX, arrY],
	        type: 'bar'
	    },
	    bar: {
	    	width: 10
	    },
	    color: {
	    	pattern: [ifrcGreen_2]
	    },
	    axis: {
	        rotated : true,
	      x: {
	          type : 'category',
	          tick: {	          	
                outer: false,
                multiline: false,
                fit: true,}
	      },
	      y: {
	      	tick: {
	      		outer: false,
	      		format: d3.format('d'),
	      		count: 3
	      	}
	      } 
	    },
	    // grid: {
	    //   	y: {
	    //   		show: true
	    //   	}
	    // },
	    legend: {
	    	show: false
	    },
	    tooltip: {
	    	format: {
	    		value: function(value){
	    			return d3.format('d')(value)
	    		}
	    	}
	    }
	}); 
	return chart;
} //generateBarChart 

// return mapActiveColor, mapInactiveColor or mapPipelineColor based on the corresponding status
function getColorFromStatus(status, cercle = false) {
    if (cercle){
        mapActiveColor = ifrcGreen_1,
        mapPipelineColor = ifrcYellow,
        mapInactiveColor = 'grey';
    }
    var st = status.trim().toLowerCase();
    var clr = mapInactive;
    st == 'active' ? clr = mapActiveColor : 
    st == 'inactive' ? clr = mapInactiveColor :
    st == 'pipeline' ? clr = mapPipelineColor : null;
    return clr;
} //getColorFromStatus 

// get country CFM color
function getRightCountryCFMColor(data, cercle = false){
    if (cercle){
        mapActiveColor = ifrcGreen_1,
        mapPipelineColor = ifrcYellow,
        mapInactiveColor = 'grey';
    }
    var color ;
    if (data.length == 0) {
        color = mapInactive;//getColorFromStatus(data['Status']);
    } else if(data.length > 0) {
        var colors = [];
        for (let index = 0; index < data.length; index++) {
            var c = getColorFromStatus(data[index]['Status'], cercle  = cercle);
            colors.includes(c) ? '' : colors.push(c);            
        }
        colors.includes(mapActiveColor) ? color = mapActiveColor :
        colors.includes(mapPipelineColor) ? color = mapPipelineColor :
        colors.includes(mapInactiveColor) ? color = mapInactiveColor : null;
        
    }
    return color;
}
// choropleth map
function choroplethMap(focusArea = "all"){
    mapsvg.selectAll('path').each( function(element, index) {
        // console.log(element)
        d3.select(this).transition().duration(500).attr('fill', function(d){
            var filtered = filteredCfmData.filter(pt => pt['ISO3']== d.properties.ISO_A3);
            return getRightCountryCFMColor(filtered);
        });
    });
    // cercle
    // mapsvg.selectAll('circle').each( function(element, index) {
    //     // console.log(element)
    //     d3.select(this).transition().duration(500).attr("r", 3).attr('fill', function(d){
    //         var filtered = filteredCfmData.filter(pt => pt['ISO3']== d['ISO_A3']);
    //         // console.log(filtered)
    //         return getRightCountryCFMColor(filtered, true);
    //     });
    // });
}

// update viz based on filtered and selections
function updateViz() {
    setCountriesAndOrgCFM();
    choroplethMap();
    var data = d3.nest() 
        .key(function(d) { return d['Status']; })
        .rollup(function(d) { return d.length ;})
        .entries(filteredCfmData).sort(sort_value);
    var arrX = ['x'],
        arrY = ['Status'];
    data.forEach(element => {
        arrX.includes(element.key) ? '' : arrX.push(element.key);
        arrY.includes(element.key) ? '' : arrY.push(element.value);
    });
    // statusChart.load({columns: [arrX, arrY], unload: true });

    // update datatable
    var dt = getDataTableData();
    $('#datatable').dataTable().fnClearTable();
    $('#datatable').dataTable().fnAddData(dt);

    // reset CFM purpose text
    $('.purpose > h6 > span').text("(Select Country)");
} //updateViz
let g, mapsvg, projection, width, height, zoom, path;
let currentZoom = 1;

let countrySelectedFromMap = false;
let mapFillColor = '#9EC8AE', 
    mapInactive = '#fff',//'#f1f1ee',//'#C2C4C6',
    mapActive = '#2F9C67',
    hoverColor = '#78B794';

function initiateMap() {
    width = $('#map').width();
    height = 500;
    var mapScale = width/7.8;
    var mapCenter = [25, 25];

    projection = d3.geoMercator()
        .center(mapCenter)
        .scale(mapScale)
        .translate([width / 2, height / 1.9]);

    path = d3.geoPath().projection(projection);

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);


    mapsvg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("wheel.zoom", null)
        .on("dblclick.zoom", null);
    
    mapsvg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%");
    //map tooltips
    var maptip = d3.select('#map').append('div').attr('class', 'd3-tip map-tip hidden');

    g = mapsvg.append("g").attr('id', 'countries')
            .selectAll("path")
            .data(geomData.features)
            .enter()
            .append("path")
            .attr('d',path)
            .attr('id', function(d){ 
                return d.properties.ISO_A3; 
            })
            .attr('class', function(d){
              var className = (countriesISO3Arr.includes(d.properties.ISO_A3)) ? 'hasCFM' : 'inactive';
              return className;
          });
    // cercles 
    // var centroids = mapsvg.append("g")
    //       .attr("class", "centroids")
    //       .selectAll("centroid")
    //       .data(locations)
    //       .enter()
    //         .append("g")
    //         // .append("centroid")
    //         .append("circle")
    //         .attr('id', function(d){ 
    //           return d["ISO_A3"]; 
    //         })
    //         .attr('class', function(d){
    //           var className = (countriesISO3Arr.includes(d["ISO_A3"])) ? 'hasCFM' : 'inactive';
    //           return className;
    //       })
    //       .attr("transform", function(d){ return "translate(" + projection([d.X, d.Y]) + ")"; });
    mapsvg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);

    choroplethMap();

    //zoom controls
    d3.select("#zoom_in").on("click", function() {
        zoom.scaleBy(mapsvg.transition().duration(500), 1.5);
    }); 
    d3.select("#zoom_out").on("click", function() {
        zoom.scaleBy(mapsvg.transition().duration(500), 0.5);
    });
            
    
    // var tipPays = d3.select('#countries').selectAll('path') 
    g.filter('.hasCFM')
    .on("mousemove", function(d){ 
      var countryCfmData = filteredCfmData.filter(c => c['ISO3'] == d.properties.ISO_A3);
      if (countryCfmData.length != 0) {
        var content = '<h5>' + d.properties.NAME_LONG + '</h5>';
        var numActive = 0, 
            numInactive = 0, 
            numPipeline = 0;
        countryCfmData.forEach(element => {
          element['Status'] == 'Active' ? numActive++ :
          element['Status'] == 'Inactive' ? numInactive++ :
          element['Status'] == 'Pipeline' ? numPipeline++ : null;
        });
        content += '<div>' +
              '<div><label><i class="fa fa-circle fa-sm" style="color:#2F9C67;"></i> Active: '+numActive+'</label></div>' +
              '<div><label><i class="fa fa-circle fa-sm" style="color:#9EC8AE;"></i> Pipeline: '+numPipeline+'</label></div>' +
              '<div><label><i class="fa fa-circle fa-sm" style="color:#E9F1EA;"></i> Inactive: '+numInactive+'</label></div>' +
              '</div>';

        showMapTooltip(d, maptip, content);
      }
    //   showMapTooltip(d, maptip, "Qu'est ce qui se passe?");
    })
    .on("mouseout", function(d) { 
      hideMapTooltip(maptip); 
    })
    .on("click", function(d){
      $('.purpose > h6 > span').text("( " +d.properties.NAME+" )");
      var data = filteredCfmData.filter(function(p) { return p['ISO3'] == d.properties.ISO_A3 ; });
      var dt = getDataTableData(data);
      $('#datatable').dataTable().fnClearTable();
      $('#datatable').dataTable().fnAddData(dt);
      countrySelectedFromMap = true;
    })

} //initiateMap

function showMapTooltip(d, maptip, text){
var mouse = d3.mouse(mapsvg.node()).map( function(d) { return parseInt(d); } );
maptip
    .classed('hidden', false)
    .attr('style', 'left:'+(mouse[0]+20)+'px;top:'+(mouse[1]+20)+'px')
    .html(text)
}

function hideMapTooltip(maptip) {
    maptip.classed('hidden', true) 
}

// zoom on buttons click
function zoomed(){
    const {transform} = d3.event;
    currentZoom = transform.k;

    if (!isNaN(transform.k)) {
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);

    }
}

function clicked(event, d){
    var offsetX = 50;//(isMobile) ? 0 : 50;
    var offsetY = 25;//(isMobile) ? 0 : 25;
    const [[x0, y0], [x1, y1]] = [[-20.75,-13.71],[31.5,27.87]];//path.bounds(d);
    // d3.event.stopPropagation(event);
    mapsvg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(5, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2 + offsetX, -(y0 + y1) / 2 - offsetY),
    //   d3.mouse(mapsvg.node())
    );
  }

// zoom on region select
function zoomToRegion(region){
    var isInRegion = true;
    if (region=="All regions"){ //reset map zoom
      mapsvg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    }
    else{
      geomData.features.forEach(function(c){
        if (countriesISO3Arr.includes(c.properties.ISO_A3) && isInRegion){
          clicked(c);
          isInRegion = false;
        }
      });
    }
  }

// on focus layer change
// $('input[type="radio"]').click(function(){
//   var selected = $('input[name="focus"]:checked');
//   choroplethMap(selected.val());
//   // reset datatable : test if there is country selection from the map first
//   if (countrySelectedFromMap) {
//     var dt = getDataTableData();
//     $('.purpose > h6 > span').text("(Select Country)");
//     $('#datatable').dataTable().fnClearTable();
//     $('#datatable').dataTable().fnAddData(dt);
//   }
//   countrySelectedFromMap = false;
// });
let geodataUrl = 'data/worldmap.json';
let locationsUrl = 'data/world_locations.csv';
let cfmDataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbPRrmlDfV3WzI-5QizI2ig2AoJo84KS7pSQtXkUiV5BD3s4uxpXqW8rK2sHmNjP2yCavO1XasLyCe/pub?gid=651254408&single=true&output=csv';

let geomData,
    locations,
    cfmData,
    filteredCfmData;


$( document ).ready(function(){
    function getData(){
        Promise.all([
            d3.json(geodataUrl),
            d3.csv(locationsUrl),
            d3.csv(cfmDataUrl)
        ]).then(function(data){
            geomData = topojson.feature(data[0], data[0].objects.geom);
            cfmData = data[2];
            locations = data[1];
            filteredCfmData = data[2];
            setCountriesAndOrgCFM();
            regionSelectionDropdown();
            // statusChart = generateBarChart();

            initiateMap();
            generateDataTable();
            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();
});

$('#regionSelect').on('change', function(e){
    var select = $('#regionSelect').val();
    select != "All regions" ? filteredCfmData = cfmData.filter(function(d){ return d['Region'] == select ; }) : 
    filteredCfmData = cfmData;
    filteredCfmData.forEach(element => {
        countriesISO3Arr.includes(element['ISO3']) ? '' : countriesISO3Arr.push(element['ISO3']);
    });
    updateViz();
    // zoom to region 
    if (select == 'All regions') {
        mapsvg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    }
    // zoomToRegion(select);
    // reset layers selection to all
    $('#all').prop('checked', true);

  });