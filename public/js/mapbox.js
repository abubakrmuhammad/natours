/* eslint-disable */

export function displayMap(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWJ1YmFrci1tdWhhbW1hZCIsImEiOiJjanl2OXl6cmowOGlpM2VwbThqZTY3dHh3In0.U9D27pUAS816bk5Mfgw-0g';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/abubakr-muhammad/cjyvai3a90va51dnxz8jo3uxl',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    const element = document.createElement('div');
    element.className = 'marker';

    new mapboxgl.Marker({
      element,
      anchor: 'bottom'
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p> Day: ${location.day}: ${location.description}`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
}
