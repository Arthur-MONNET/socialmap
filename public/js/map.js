import countries from '../asset/world.js'
let searchInput = document.getElementById('search')
let search = document.querySelector('#searchWrapper>button')
let timeLines = document.querySelectorAll('.timeLineWrapper')
let buttonsPage = document.querySelector('#buttonsPage')
let pagesWrapper = document.querySelector('#scrollWrapper')
let pages = pagesWrapper.querySelector('div')
const tweetsDiv = document.getElementsByClassName('content')[1]
let tweetsInsered = document.getElementsByClassName('tweet')
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

function dateFormat(date){
    let year = date.substring(2, 4)
    let month = date.substring(5, 7)
    let day = date.substring(8, 10)
    let newDate = day+'/'+month+'/'+year
    return newDate
}
function locationFormat(loc){
    if(loc.indexOf(',')) return loc.substring(0,loc.indexOf(','))
    else return loc
}
function descFormat(desc){
    if(desc.length>30) return desc.substring(0,(desc.indexOf(' ')>0)?desc.substring(0,30).lastIndexOf(' '):30)+"..."
    else return desc
}

async function addPopup(nbTweets) {
    const temp = await getUser()
    const temp2 = await getTweetsUser(JSON.parse(temp).data.id)
    console.log(JSON.parse(temp).data)
    console.log(temp2._realData)
    if (temp2._realData.data[nbTweets]) {
        return {
            'HTML': `<em>${temp2._realData.data[nbTweets].text}</em><br>
                Retweet: ${temp2._realData.data[nbTweets].public_metrics.retweet_count}<br>
                Like: ${temp2._realData.data[nbTweets].public_metrics.like_count}<br>
                Reponse: ${temp2._realData.data[nbTweets].public_metrics.reply_count}
            `, 
            'id': temp2._realData.data[nbTweets].id,
            'element': {
                'photo': JSON.parse(temp).data.profile_image_url,
                'name': JSON.parse(temp).data.name,
                'username': JSON.parse(temp).data.username,
                'date': dateFormat(temp2._realData.data[nbTweets].created_at),
                'text': descFormat(temp2._realData.data[nbTweets].text),
                'location': locationFormat(JSON.parse(temp).data.location)
            }
        }
    }
    
}

function getIdCountry(listCountries, allCountries) {
    let countries = allCountries.filter(country => listCountries.includes(country.properties.ISO_A2))
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

let retweetsList = []

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
            document.querySelectorAll('.tweetsMarker').forEach(function(tweetMarker) {
                tweetMarker.remove()
              })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
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
            for (let tweetInfo = 0; tweetInfo < nbTweets; tweetInfo++) {
                console.log(tweetInfo)
                const popupTextId = await addPopup(tweetInfo)
                console.log(popupTextId)
                if (!popupTextId) {
                    break
                }
                let inTweet = 
                                `<div class="tweet" id="${popupTextId.id}">
                                    <img class="profileTweet" src="${popupTextId.element.photo}"/>
                                    <div>
                                        <div>
                                            <div>
                                                <p class="contentTweet nameTweet">${popupTextId.element.name}</p>
                                                <p class="contentTweet atTweet">@${popupTextId.element.username}</p>
                                            </div>
                                            <p class="contentTweet date&Loc">${popupTextId.element.date} - ${popupTextId.element.location} </p>
                                        </div>
                                        <p class="contentTweet descTweet">${popupTextId.element.text}</p>
                                    </div>
                                </div>`
                tweetsDiv.insertAdjacentHTML('afterBegin', inTweet)
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    popupTextId.HTML
                )
                const el = document.createElement('div')
                el.id = popupTextId.id
                el.classList.add('tweetsMarker')
                var marker = new mapboxgl.Marker(el)
                    .setLngLat(await addMarker(tweetInfo, response))
                    .setPopup(popup)
                    .addTo(map)
            }
            addClickTweets()
        }
        search.addEventListener('click', (e) =>{
            tweetsDiv.innerHTML = ''
            addMarkers()
        })
        function addClickTweets() {
            tweetsInsered = document.getElementsByClassName('tweet')
            const arrayTweetsDiv = Array.prototype.slice.call(tweetsInsered)
            arrayTweetsDiv.forEach(tweetContainer => {
                tweetContainer.addEventListener('click', async () =>{
                    /* map.flyTo({center: [0, 0], zoom: 2.5}) */
                    allCountries.forEach(idCountry => {
                        map.setFeatureState(
                            { source: 'country', id: idCountry.id },
                            { retweets: false }
                        )
                    })
                    let retweet_list = await addRetweetsLine(tweetContainer.id)
                    removeOtherTweets(tweetContainer.id)
                    tweetContainer.style.borderColor='var(--blue)'
                    console.log(arrayTweetsDiv)
                    for (let i = 0; i < arrayTweetsDiv.length; i++) {
                        if (arrayTweetsDiv[i].id !== tweetContainer.id) {
                            arrayTweetsDiv[i].style='border-color:transparent'
                        }
                    }
                    addLines(retweet_list)
                })
            })
        }

        function removeOtherTweets(tweetId) {
            let allTweetsMarker = document.getElementsByClassName('tweetsMarker')
            let arrayTweetsMarker = Array.prototype.slice.call( allTweetsMarker )
            arrayTweetsMarker.forEach((tweetMarker) => {
                if (tweetMarker.id !== tweetId) {
                    tweetMarker.style.display="none"
                } else {
                    tweetMarker.style.display="block"
                }
            })

        }

        async function addRetweetsLine(id) {
            let list_retweets = []
            const retweets = await quotedOf(id)
            let locationRetweet = ''
            let geocode = []
            if (retweets.data){
                for (let retweet of retweets.data) {
                    let all = {}
                    if (retweet.location) {
                        locationRetweet = retweet.location
                        locationRetweet = await getAdressGeocode(response, retweet.location)
                        geocode = locationRetweet.center
                        if (locationRetweet.context[1].short_code.includes('-')) {
                            locationRetweet = locationRetweet.context[1].short_code.toUpperCase().split('-')[0]
                        } else {
                            locationRetweet = locationRetweet.context[1].short_code.toUpperCase()
                        }
                    } else {
                        return null
                    }
                    all.geocode = geocode
                    all.location = locationRetweet
                    all.user = retweet.name
                    list_retweets.push(all)
                }
            }
            return list_retweets
            
        }
        function addLines(list) {
            let idCountries = []
            let nameCountries = []
            for (let retweet of list) {
                nameCountries.push(retweet.location)
            }
            idCountries = getIdCountry(nameCountries, allCountries)
            idCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry },
                    { retweets: true }
                )
            })
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

/* 
timeline [Arthur]
 */

buttonsPage.addEventListener('click', e => {
    timeLines.forEach(timeLine => {
        let textPoint = timeLine.querySelector('.textPoint')
        changeTextTimeLine(10, textPoint)
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


function changeTextTimeLine(x, text) {
    if (x === 10) { text.innerHTML = '1 jour' }
    else if (x === 9) { text.innerHTML = '1 semaine' }
    else if (x === 8) { text.innerHTML = '2 semaines' }
    else if (x === 7) { text.innerHTML = '3 semaines' }
    else if (x === 6) { text.innerHTML = '1 mois' }
    else if (x === 5) { text.innerHTML = '2 mois' }
    else if (x === 4) { text.innerHTML = '3 mois' }
    else if (x === 3) { text.innerHTML = '4 mois' }
    else if (x === 2) { text.innerHTML = '6 mois' }
    else if (x === 1) { text.innerHTML = '9 mois' }
    else if (x === 0) { text.innerHTML = '1 ans' }
    else { text.innerHTML = '' }
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
        changeTextTimeLine(x, textPoint)
        timeLine.querySelector('.pointWrapper').style.left = 'calc(-2.5vw + ((100% - 4.3vh) / 10) * ' + x + ')'
    })
    timeLine.addEventListener('mousemove', e => {
        if (click) {
            x = Math.round(((e.clientX - (pages.offsetWidth / 100) * (100 / 3 - 25) / 2) / (timeLine.offsetWidth - window.innerHeight / 100 * 4.3) * 100) / 10)
            if (x > 10) x = 10
            if (x < 0) x = 0
            changeTextTimeLine(x, textPoint)
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