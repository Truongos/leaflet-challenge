const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function getColor(d) {
  return d > 90  ? '#FF0000' :
         d > 70  ? '#FF6600' :
         d > 50  ? '#FFCC00' :
         d > 30  ? '#FFFF00' :
         d > 10  ? '#CCFF00' :
         d > 0  ? '#66FF00' :
                  '#00FF00';
}

function createMarkers(data) {
  let locations = data.features;
  let quakeMarkers = [];

  for (let i = 0; i < locations.length; i++) {
    let location = locations[i];
    let quakeMarker = L.circle(
      [location.geometry.coordinates[1], location.geometry.coordinates[0]],
      {
        color: "#000000",
        fillColor: getColor(location.geometry.coordinates[2]),
        fillOpacity: 0.5,
        radius: location.properties.mag * 10000,
        weight: 0.5,
      }
    ).bindPopup(`<b>Location</b>: ${location.properties.place}<br>
                 <b>Magnitude</b>: ${location.properties.mag}<br>
                 <b>Depth</b>: ${location.geometry.coordinates[2]}`);
    quakeMarkers.push(quakeMarker);
  }

  createMap(L.layerGroup(quakeMarkers));
}

function createMap(quakeLocations) {
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": streetmap
  };

  let overlayMaps = {
    "Earthquake Locations": quakeLocations
  };

  let map = L.map("map", {
    center: [39.0, 34.0], 
    zoom: 3, 
    layers: [streetmap, quakeLocations]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  let info = L.control({ position: "bottomright" });
  info.onAdd = function(map) {
    let div = L.DomUtil.create("div", "info legend");

    let depthLabels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
    let colors = ['#00FF00', '#66FF00', '#CCFF00', '#FFFF00', '#FFCC00', '#FF0000'];

    div.innerHTML += '<h4>Depth</h4>';
    for (let i = 0; i < depthLabels.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depthLabels[i] + (depthLabels[i + 1] ? '<br>' : '+');
    }

    return div;
  };
  info.addTo(map);

}

d3.json(url).then(function(data) {
  createMarkers(data);
});
