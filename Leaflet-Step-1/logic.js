// create the tile layers for the backgrounds of the map
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// grayscale layer 
var grayscale =  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// water color layer
 var watercolor =  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

// topography
let topography=  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});



// make a basemap object 
let basemap = {
    
    Grayscale: grayscale,
    "Water Color": watercolor,
    "Topography": topography,
    Default: defaultMap,

};

// make map object 
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 5,
    layers:[grayscale, watercolor,topography,defaultMap]
});

// add the default map to the map 
defaultMap.addTo(myMap);



// add the data for the tetonic plates and draw on map
//variable to hold the tetonic plates layer
let techtonicplates = new L.layerGroup();

//call the api 
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){ 

    // console log to make sure the data loaded

    //console.log (plateData);

    // load data using json and add to the tetonics plate layer
    L.geoJson(plateData, { 
        // style so you can see lines 
        color: "red", 
        weight: 1 
    }).addTo(techtonicplates);

});

// add to techtonics plates to the map
techtonicplates.addTo(myMap);


// variable to hold earthquake  data layer:
let earthquake = new L.layerGroup();

// get data for earthquake

//call the usgs Geojson API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        // console log to make sure the data loaded

       console.log(earthquakeData);
       //plot circles where the radius is dependent on the magnitude and the color is dependent on the depth

       // make a function that chooses a  color of the data point

       function dataColor(depth){ 
           if (depth > 90 )
                return "red";
            else if(depth > 70)
                return "#fc4903";
            else if(depth > 50)
                return "#fc8403";
            else if(depth > 30)
                return "#fcad03"; 
            else if (depth > 10)
                return "#cafc03";
            else
                return "green";
       
        }
       
       // make a function that determines the size of are radius 
        function radiussize(mag){
            if (mag == 0)
                return 1; // make sure that a 0 mag earthquake shows up 
            else
                return mag * 5; // make sure that the circle is pronounced in the map


        }

        // add on to the style for each data point 
        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]), // use index 2 for the depth 
                color:"000000",  // blackoutline 
                radius: radiussize(feature. properties.mag), // grabs magnitude
                weight: 0.5,
                stroke: true


            }
        }        

       //  add the geojson data to the earth
        L.geoJson(earthquakeData,{ 
            // make feature a marker that is on the map, each marker is a circle
           
            pointToLayer : function (feature, latLng) {
                return L.circleMarker (latLng);


            },
            // set the style for each marker
            style: dataStyle,  //calls the data style function and  pass in earthquake data 

            // add popups
            onEachFeature: function(feature,layer){ 
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b></br>
                                Location: <b>${feature.properties.place}</b>`);

            }

        
        }).addTo(earthquake);

    }

);
// add earthquake layer to the map

earthquake.addTo(myMap);

// add the overlay for the techtonic plates
let overlays = { 
   "Techtonic Plates": techtonicplates,
   "Earthquake Data" : earthquake
};

// add the layer control
L.control
    .layers(basemap, overlays)    
    .addTo(myMap);


// add legend to map 

let legend = L.control({ 
    position: "bottomright"
});

// properties for legend
legend.onAdd = function(){

    // div for the legend  to appear in the page
    let div =L.DomUtil.create( "div", "info legend")

    let intervals = [-10,10,30,50,70,90];

    let colors = [
                         "red",
                        "#fc4903",
                        "#fc8403",
                        "#fcad03",
                         "#cafc03",
                         "green"

    ];


    for(var i = 0; i <intervals.length; i++)
    {


        div.innerHTML += " < i style = 'background:"
        + colors[i]
        + "'></i> "
        + intervals[i]
        + (intervals[i + 1] ? "km &ndash km," + intervals[i + 1] +  "km<br>" : " + ");

        



    }

    return div; 

};

// add the legend to the map 

legend.addTo (myMap);


