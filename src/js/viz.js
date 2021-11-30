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