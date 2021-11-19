const search = document.getElementById('search')
const searchInput = document.getElementById('searchInput')
const tweetsDiv = document.getElementById('tweets')
let tweetsInsered = document.getElementsByClassName('tweetI')

$.ajax({
    url: "/mapToken",
    type: "POST",
    dataType: 'text',
    success: function(response, status, http) {
        if (response) {
            drawMap(response)
        }
    }
})

async function addMarker(nbTweets, token) {
    const temp = await getUser()
    const geocodeUser = await getAdressGeocode(token, JSON.parse(temp).data.location)
    const temp2 = await getTweetsUser(JSON.parse(temp).data.id)
    if (temp2._realData.includes.places[nbTweets].geo.bbox[0]) {
        return [temp2._realData.includes.places[nbTweets].geo.bbox[0], temp2._realData.includes.places[nbTweets].geo.bbox[1]]
    } else {
        return geocodeUser.geometry.coordinates
    }
}

async function addPopup(nbTweets) {
    const temp = await getUser()
    const temp2 = await getTweetsUser(JSON.parse(temp).data.id)
    /* const retweets = await quotedOf(temp2._realData.data[nbTweets].id)
    let placeRetweets = ''
    if (retweets._realData.includes.places) {
        for (const place in retweets._realData.includes.places) {
            console.log(place)
            placeRetweets += place
        }
    } else {
        for (let i = 0; i < retweets._realData.includes.users.length; i++) {
            placeRetweets += retweets._realData.includes.users[i].location
        }
    } */
    return {'HTML': `<em>${temp2._realData.data[nbTweets].text}</em><br>
            Retweet: ${temp2._realData.data[nbTweets].public_metrics.retweet_count+temp2._realData.data[nbTweets].public_metrics.quote_count}<br>
            Like: ${temp2._realData.data[nbTweets].public_metrics.like_count}<br>
            Reponse: ${temp2._realData.data[nbTweets].public_metrics.reply_count}
        `,'id': temp2._realData.data[nbTweets].id }
}

async function getAdressGeocode(token, adress){
    const geocode = await getGeocode(token, adress)
    if (geocode) {
        return geocode.features[0]
    }
}

function drawMap (response) {
    mapboxgl.accessToken = response
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/zak74/ckuzm2lot0yjg14s4e5k4202y',
        center: [5, 45],
        zoom: 4.5
    })
    let hoveredCountryId = null
    map.on('load', () => {
        map.dragRotate.disable()
    
        // disable map rotation using touch rotation gesture
        map.touchZoomRotate.disableRotation()

        /**
         * Initialize map and 
         */

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

        map.on('mouseenter', 'country-fills', () => {
            map.getCanvas().style.cursor = 'pointer';
        })

        // add marker for tweets 
        async function addMarkers() {
            const nbTweets = JSON.parse(await getUser()).data.public_metrics.tweet_count
            for (let i=0; i<nbTweets; i++) {
                const popupTextId = await addPopup(i)
                tweetsDiv.insertAdjacentHTML('afterBegin', `<div class="tweetI" id="${popupTextId.id}"><p>${popupTextId.HTML}</p></div>`)
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    popupTextId.HTML
                )
                const el = document.createElement('div')
                el.id = 'tweets'
                var marker = new mapboxgl.Marker(el)
                    .setLngLat(await addMarker(i, response))
                    .setPopup(popup)
                    .addTo(map)
            }
            addClickTweets()
        }
        addMarkers()
        search.addEventListener('click', (e) =>{
            console.log(searchInput.value)
        })
        let retweetsList = []
        function addClickTweets() {
            retweetsList = []
            tweetsInsered = document.getElementsByClassName('tweetI')
            const arrayTweetsDiv = Array.prototype.slice.call( tweetsInsered )
            arrayTweetsDiv.forEach(el => {
                el.addEventListener('click', async () =>{
                    await addRetweetsMarker(el.id)
                    console.log(retweetsList)
                    el.style.backgroundColor= '#1DA9B9'
                    for (let i = 0; i < arrayTweetsDiv.length; i++) {
                        if (arrayTweetsDiv[i].id !== el.id) {
                            arrayTweetsDiv[i].style.backgroundColor= 'tomato'
                        }
                    }
                })
            })
        }

        async function addRetweetsMarker(id) {
            const retweets = await quotedOf(id)
            let locationRetweet = ''
            let all = {}
            retweets._realData.data.forEach((l, i) => {
                if (retweets._realData.includes.places) {
                    locationRetweet = retweets._realData.includes.places[i]
                } else if(retweets._realData.includes.users[i].location) {
                    locationRetweet = retweets._realData.includes.users[i].location
                }
                all.location = locationRetweet
                all.user = retweets._realData.includes.users[i].name
                all.user = l.text
                console.log('retweets', all)
                return addMarkerRetweet(all)
            })
            async function addMarkerRetweet(object) {
                if (typeof object.location !== Array) {
                    object.location = await getAdressGeocode(response, object.location)
                    object.location = object.location.center
                }
                console.log(object)
                return retweetsList.push(object)
            }
            
        }
    })
}


/*
Link to API (Twitter/mapbox geocode)
*/
// get user 
function getUser() {    
    return $.ajax({
        url: "/searchUserName?username=GuellaRoxane",
        type: "POST",
        dataType: 'text',
        success: function(response, status, http) {
            if (response) {
                return response
            }
        }
    })
}

// Get tweest from user
function getTweetsUser(userId) {
    return $.ajax({
        url: `/userTweets?id=${userId}`,
        type: "POST",
        success: function(response, status, https) {
            if (response) {
               return response._realData.data, response._realData.includes
            }
        }
    })
}

//get geocode of a place
function getGeocode(accessToken,adress) {
    return $.ajax({
        url: ` https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/${adress}.json?access_token=${accessToken}&limit=1`,
        type: "GET",
        success: function(response, status, https) {
            if (response) {
               return response
            }
        }
    })
}

//get rewteets of a specific tweet
function quotedOf(tweetId) {
    return $.ajax({
        url: `/quotedOf?id=${tweetId}`,
        type: "POST",
        success: function(response, status, https) {
            if (response) {
               return response
            }
        }
    })
}