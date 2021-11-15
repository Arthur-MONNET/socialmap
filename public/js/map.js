$.ajax({
    url: "/mapToken",
    type: "POST",
    dataType: 'text',
    success: function(response, status, http) {
        if (response) {
            drawMap(response)
        }
    }
});


function test(response, includes) {
    response.forEach((el, i) => {
        console.log(includes.places[i].geo.bbox)
        return [includes.places[i].geo.bbox[0], includes.places[i].geo.bbox[1]]
        /* var customMarker = document.createElement('div')
        customMarker.className = 'mapboxgl-marker'
        var marker = new mapboxgl.Marker(customMarker)
            .setLngLat([includes.places[i].geo.bbox[0], includes.places[i].geo.bbox[1]]).addTo(map) */
    })
    console.log('Test', response, includes)
}

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
                    '#00086C'
                ],
                // blue color fill
                'fill-opacity': 0.5,
                'fill-color-transition': {
                    'duration': 5000,
                    'delay': 0
                }
            }
        })
                    
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
        async function addMarker () {
        var marker = new mapboxgl.Marker()
            .setLngLat(await getUser())
            .addTo(map);
        }
        addMarker()
    })
}

// get user 

function getUser() {    
    return $.ajax({
        url: "/searchUserName?username=GuellaRoxane",
        type: "POST",
        dataType: 'text',
        success: function(response, status, http) {
            if (response) {
                console.log(response)
                console.log(JSON.parse(response).data.id)
                $.ajax({
                    url: `/userTweets?id=${JSON.parse(response).data.id}`,
                    type: "POST",
                    success: function(response, status, https) {
                        if (response) {
                            test(response._realData.data, response._realData.includes)
                        }
                    }
                })
            }
        }
    })
}