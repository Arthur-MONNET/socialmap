import countries from '../asset/world.js'
const search = document.getElementById('search')
let timeLines = document.querySelectorAll('.timeLineWrapper')
let buttonsPage = document.querySelector('#buttonsPage')
let pagesWrapper = document.querySelector('#scrollWrapper')
let pages = pagesWrapper.querySelector('div')
const tweetsDiv = document.getElementById('tweets')
let tweetsInsered = document.getElementsByClassName('tweetI')
$.ajax({
    url: "/mapToken",
    type: "POST",
    dataType: 'text',
    success: function (response, status, http) {
        if (response) {
            drawMap(response)
        }
    }
})

async function addMarker(nbTweets, token) {
    const temp = await getUser()
    const geocodeUser = await getAdressGeocode(token, JSON.parse(temp).data.location)
    const temp2 = await getTweetsUser(JSON.parse(temp).data.id)
    if (temp2._realData.includes.places[nbTweets]) {
        return [temp2._realData.includes.places[nbTweets].geo.bbox[0], temp2._realData.includes.places[nbTweets].geo.bbox[1]]
    } else {
        return geocodeUser.geometry.coordinates
    }
}

async function addPopup(nbTweets) {
    const temp = await getUser()
    const temp2 = await getTweetsUser(JSON.parse(temp).data.id)
    return {
        'HTML': `<em>${temp2._realData.data[nbTweets].text}</em><br>
            Retweet: ${temp2._realData.data[nbTweets].public_metrics.retweet_count + temp2._realData.data[nbTweets].public_metrics.quote_count}<br>
            Like: ${temp2._realData.data[nbTweets].public_metrics.like_count}<br>
            Reponse: ${temp2._realData.data[nbTweets].public_metrics.reply_count}
        `, 'id': temp2._realData.data[nbTweets].id
    }
}

function getIdCountry(listCountries, allCountries) {
    let countries = allCountries.filter(country => listCountries.includes(country.properties.ISO_A2))
    console.log(countries)
    let idCountries = []
    for (let i in countries) idCountries.push(countries[i].id)
    return idCountries
}

async function getAdressGeocode(token, adress) {
    const geocode = await getGeocode(token, adress)
    if (geocode) {
        return geocode.features[0]
    }
}

function drawMap(response) {
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
            data: countries
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
        map.addLayer({
            'id': 'retweets',
            'type': 'fill',
            'source': 'country',
            'layout': {},
            'paint': {
                'fill-color': [
                    'case',
                    ['boolean', ['feature-state', 'retweets'], false],
                    '#DEFD6D',
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

        let allCountries = map.getSource('country')._data.features

        search.onclick = () => {
            let listCountries = ['FR', 'US', 'BR', 'GB']
            let idCountries = getIdCountry([search.value], allCountries)
            idCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry },
                    { retweets: true }
                )
            })

        }
        map.addControl(new mapboxgl.NavigationControl());
        map.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'country',
            'layout': {},
            'paint': {
                'line-color': 'rgba(255,255,255,0.5)',
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

        map.on('mouseenter', 'country', () => {
            map.getCanvas().style.cursor = 'pointer';
        })

        // add marker for tweets 
        async function addMarkers() {
            const nbTweets = JSON.parse(await getUser()).data.public_metrics.tweet_count
            for (let i = 0; i < nbTweets; i++) {
                const popupTextId = await addPopup(i)
                if (!popupTextId) {
                    break
                }
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
        search.addEventListener('click', (e) =>{
            console.log(searchInput.value)
            tweetsDiv.innerHTML = ''
            addMarkers()
        })
        let retweetsList = []
        function addClickTweets() {
            retweetsList = []
            tweetsInsered = document.getElementsByClassName('tweetI')
            const arrayTweetsDiv = Array.prototype.slice.call(tweetsInsered)
            arrayTweetsDiv.forEach(el => {
                el.addEventListener('click', async () =>{
                    retweetsList = []
                    await addRetweetsMarker(el.id)
                    console.log(retweetsList)
                    el.style.backgroundColor = '#1DA9B9'
                    for (let i = 0; i < arrayTweetsDiv.length; i++) {
                        if (arrayTweetsDiv[i].id !== el.id) {
                            arrayTweetsDiv[i].style.backgroundColor = 'tomato'
                        }
                    }
                })
            })
        }

        async function addRetweetsMarker(id) {
            const retweets = await quotedOf(id)
            let locationRetweet = ''
            let all = {}
            retweets._realData.data.forEach( async (l, i) => {
                if (retweets._realData.includes.places) {
                    locationRetweet = retweets._realData.includes.places[i]
                } else if (retweets._realData.includes.users[i].location) {
                    locationRetweet = retweets._realData.includes.users[i].location
                }
                all.location = locationRetweet
                if (typeof object.location !== Array) {
                    object.location = await getAdressGeocode(response, object.location)
                    object.location = object.location.center
                }
                all.user = retweets._realData.includes.users[i].name
                all.text = l.text
                all.index = i
                addLineRetweet(all, i)
            })
            
        }
        async function addLineRetweet(object, i) {
            console.log('add line', i)
            console.log('add line i', object, i)
            if (typeof object.location !== Array) {
                object.location = await getAdressGeocode(response, object.location)
                object.location = object.location.center
                console.log ('in if', object)
            }
            console.log(object, i)
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
        success: function (response, status, http) {
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
        success: function (response, status, https) {
            if (response) {
                return response._realData.data, response._realData.includes
            }
        }
    })
}

//get geocode of a place
function getGeocode(accessToken, adress) {
    return $.ajax({
        url: ` https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/${adress}.json?access_token=${accessToken}&limit=1`,
        type: "GET",
        success: function (response, status, https) {
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
        success: function (response, status, https) {
            if (response) {
                return response
            }
        }
    })
}

buttonsPage.addEventListener('click', e => {
    timeLines.forEach(timeLine => {
        let textPoint = timeLine.querySelector('.textPoint')
        changeTextTimeLine(10,textPoint)
        timeLine.querySelector('.pointWrapper').style.left = 'calc(-2.5vw + ((100% - 4.3vh) / 10) * ' + 10 + ')'
    })
    if (e.target.classList.contains("b1")) {
        pages.style.left = 0
        scrollPage.style.marginLeft = '0'
    }
    else if (e.target.classList.contains("b2")) {
        scrollPage.style.marginLeft = 'calc(100% / 3)'
        pages.style.left = '-' + pages.scrollWidth * 1 / 3;
    }
    else if (e.target.classList.contains("b3")) {
        scrollPage.style.marginLeft = 'calc(100% / 3 * 2)'
        pages.style.left = '-' + pages.scrollWidth * 2 / 3
    }
})


function changeTextTimeLine(x,text){
    if(x===10){text.innerHTML='1 jour'}
    else if(x===9){text.innerHTML='1 semaine'}
    else if(x===8){text.innerHTML='2 semaines'}
    else if(x===7){text.innerHTML='3 semaines'}
    else if(x===6){text.innerHTML='1 mois'}
    else if(x===5){text.innerHTML='2 mois'}
    else if(x===4){text.innerHTML='3 mois'}
    else if(x===3){text.innerHTML='4 mois'}
    else if(x===2){text.innerHTML='6 mois'}
    else if(x===1){text.innerHTML='9 mois'}
    else if(x===0){text.innerHTML='1 ans'}
}

let x = 0
let click = false
timeLines.forEach(timeLine => {
    let textPoint = timeLine.querySelector('.textPoint')
    timeLine.addEventListener('mousedown', e => {
        click = true
        x = Math.round(((e.clientX - (pages.offsetWidth / 100) * (100 / 3 - 25) / 2) / (timeLine.offsetWidth - window.innerHeight / 100 * 4.3) * 100) / 10)
        if (x > 10) x = 10
        if (x < 0) x = 0
        changeTextTimeLine(x,textPoint)
        timeLine.querySelector('.pointWrapper').style.left = 'calc(-2.5vw + ((100% - 4.3vh) / 10) * ' + x + ')'
    })
    timeLine.addEventListener('mousemove', e => {
        if (click) {
            x = Math.round(((e.clientX - (pages.offsetWidth / 100) * (100 / 3 - 25) / 2) / (timeLine.offsetWidth - window.innerHeight / 100 * 4.3) * 100) / 10)
            if (x > 10) x = 10
            if (x < 0) x = 0
            changeTextTimeLine(x,textPoint)
            timeLine.querySelector('.pointWrapper').style.left = 'calc(-2.5vw + ((100% - 4.3vh) / 10) * ' + x + ')'
        }
    })
    timeLine.addEventListener('mouseleave', e => {
        click = false
    })
})
document.addEventListener('mouseup', e => {
    click = false
});