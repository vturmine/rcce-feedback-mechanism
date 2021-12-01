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
        "pageLength": 10,
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