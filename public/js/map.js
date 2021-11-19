let map_token = ''
$.ajax({
    url: "/mapToken",
    type: "GET",
    success: function(response, status, http) {
        if (response) {
            map_token = response
            drawMap(response)
        }
    }
});

function drawMap (response) {
    mapboxgl.accessToken = response
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/zak74/ckuzm2lot0yjg14s4e5k4202y',
        center: [0, 30],
        zoom: 1.5
    });
    let hoveredCountryId = null
    map.on('load', () => {
        map.dragRotate.disable()
    
        // disable map rotation using touch rotation gesture
        map.touchZoomRotate.disableRotation()

        map.addSource('country', {
            type: 'geojson',
            data: '../asset/world.geojson'
        })
                        
        map.addLayer({
            'id': 'country-fills',
            'type': 'fill',
            'source': 'country',
            'layout': {},
            'paint': {
                'fill-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    '#41CEDE',
                    'rgba(0,0,0,0)'
                ],
                // blue color fill
                'fill-opacity': 0.5,
                'fill-color-transition': {
                    'duration': 5000,
                    'delay': 0
                }
            }
        })
        map.addControl(new mapboxgl.NavigationControl());            
        map.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'country',
            'layout': {},
            'paint': {
                'line-color': '#FFFFFF',
                'line-width': 0.25
            }
        })

        map.on('mousemove', 'country-fills', (e) => {
            if (e.features.length > 0) {
                if (hoveredCountryId !== null) {
                    map.setFeatureState(
                        { source: 'country', id: hoveredCountryId },
                        { hover: false }
                    )
                }
                hoveredCountryId = e.features[0].id;
                map.setFeatureState(
                    { source: 'country', id: hoveredCountryId },
                    { hover: true }
                )
            }
        })

        map.on('mouseleave', 'country-fills', () => {
            if (hoveredCountryId !== null) {
                map.setFeatureState(
                    { source: 'country', id: hoveredCountryId },
                    { hover: false }
                )
            }
            hoveredCountryId = null;
            map.getCanvas().style.cursor = '';
        })
                
        map.on('click', 'country-fills', (e) => {
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(e.features[0].properties.NAME_LONG)
                .addTo(map);
        })

        map.on('mouseenter', 'country-fills', () => {
            map.getCanvas().style.cursor = 'pointer';
        })
    })
}
