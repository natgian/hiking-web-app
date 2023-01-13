// Adding a Map with Mapbox
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v10", // style URL
  center: [8.2275, 46.8182], // starting position [lng, lat]
  zoom: 6, // starting zoom
});

var mq = window.matchMedia( "(min-width: 990px)" );

if (mq.matches){
    map.setZoom(6); //set map zoom level for desktop size
} else {
    map.setZoom(5); //set map zoom level for mobile size
};

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());



// Create a default Marker and add it to the map.
new mapboxgl.Marker()
  .setLngLat(hike.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 30})
    .setHTML(
      `<h5>${hike.title}</h5><p>${hike.location}</p>`
    )
  )
  .addTo(map);

// Create a default Marker, colored black, rotated 45 degrees.
// const marker2 = new mapboxgl.Marker({ color: 'black', rotation: 45 })
// .setLngLat([12.65147, 55.608166])
// .addTo(map);
