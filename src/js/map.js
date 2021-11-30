let g, mapsvg, projection, width, height, zoom, path;
let currentZoom = 1;

let countrySelectedFromMap = false;
let mapFillColor = '#9EC8AE', 
    mapInactive = '#f1f1ee',//'#C2C4C6',
    mapActive = '#2F9C67',
    hoverColor = '#78B794';

function initiateMap() {
    width = $('#map').width();
    height = 500;
    var mapScale = width/5.2;
    var mapCenter = [25, 25];

    projection = d3.geoMercator()
        .center(mapCenter)
        .scale(mapScale)
        .translate([width / 2, height / 3]);

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
              '<label><i class="fa fa-circle fa-sm" style="color:#2F9C67;"></i> '+numActive+'</label>&nbsp; ' +
              '<label><i class="fa fa-circle fa-sm" style="color:#d1021a;"></i> '+numPipeline+'</label>&nbsp; ' +
              '<label><i class="fa fa-circle fa-sm" style="color:#FCCF9E;"></i> '+numInactive+'</label>' +
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