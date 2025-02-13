// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.config.EVENTS_URL = null;
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "cluster-map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/light-v10",
  center: [8.2275, 46.8182],
  zoom: 7,
});

const mq = window.matchMedia("(min-width: 990px)");
if (mq.matches) {
  map.setZoom(7); //set map zoom level for desktop size
} else {
  map.setZoom(6); //set map zoom level for mobile size
}

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

document.getElementById("fit").addEventListener("click", () => {
  map.fitBounds([
    [5.8358140744676303, 45.659168946713827],
    [10.979311848153316, 47.869910020393519],
  ]);
});

map.on("load", () => {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource("hikes", {
    type: "geojson",
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: hikes,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "hikes",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#188655",
        5, // point count (was 100 before I changed it)
        "#188655",
        10, // point count (was 750 before I changed it)
        "#188655",
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20, // pixels
        5, // point count
        30, // pixels
        10, // point count
        30,
      ],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "hikes",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 16,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "hikes",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#188655",
      "circle-radius": 14,
      "circle-stroke-width": 0,
      "circle-stroke-color": "#000",
    },
  });

  // inspect a cluster on click
  map.on("mouseover", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("hikes").getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
      });
    });
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on("click", "unclustered-point", (e) => {
    const { popUpMarkup } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
  });

  map.on("mouseenter", ["clusters", "unclustered-point"], () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", ["clusters", "unclustered-point"], () => {
    map.getCanvas().style.cursor = "";
  });
});
