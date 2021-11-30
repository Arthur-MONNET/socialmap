import countries from '../asset/world.js'
let searchInput = document.getElementById('search')
let search = document.querySelector('#searchWrapper>button')
let timeLines = document.querySelectorAll('.timeLineWrapper')
let buttonsPage = document.querySelector('#buttonsPage')
let pagesWrapper = document.querySelector('#scrollWrapper')
let pages = pagesWrapper.querySelector('div')
const tweetsDivR = document.getElementsByClassName('content')
let tweetsInsered = document.getElementsByClassName('tweet')
const buttonSearch = document.getElementsByClassName('b2')[0]
//Mytweets
const buttonMyTweets = document.getElementsByClassName('b1')[0]
const tweetDivMe = document.getElementById('titleMyTweets')

let openSearchFollow = false
let timeLineText = ['1 ans', '9 mois', '6 mois', '4 mois', '3 mois', '2 mois', '1 mois', '3 semaines', '2 semaines', '1 semaine', '1 jour']
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

async function addMarker(token, user) {
    const geocodeUser = await getAdressGeocode(token, user.data.location)
    const temp2 = await getTweetsUser(user.data.id)
    console.log(temp2)
    return {
        "tweets": temp2._realData,
        "userLocation": geocodeUser,
        "photo": user.data.profile_image_url,
        "name": user.data.name,
        "username": user.data.username
    }
}

function dateFormat(date) {
    let year = date.substring(2, 4)
    let month = date.substring(5, 7)
    let day = date.substring(8, 10)
    let newDate = day + '/' + month + '/' + year
    return newDate
}
function locationFormat(loc){
    if(loc.indexOf(',') !== -1) return loc.substring(0,loc.indexOf(','))
    else return loc
}
function descFormat(desc) {
    if (desc.length > 30) return desc.substring(0, (desc.indexOf(' ') > 0) ? desc.substring(0, 30).lastIndexOf(' ') : 30) + "..."
    else return desc
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
            document.querySelectorAll('.tweetsMarker').forEach(function (tweetMarker) {
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
        // add marker for tweets 
        async function addMarkersMap(user, scope) {
            let tweetsDiv = ''
            let userData = await getUser(user)
            if (JSON.parse(userData).errors && scope === 'search') {
                search.disabled = false
                return tweetsDivR[1].insertAdjacentHTML('afterBegin', '<div>Utilisateur non trouvé</div>')
            } else if (JSON.parse(userData).errors && scope === 'myTweets') {
                search.disabled = false
                return tweetsDivR[0].insertAdjacentHTML('afterBegin', '<div>Utilisateur non trouvé</div>')
            }
            const allTweets = await addMarker(response, JSON.parse(userData))

            if (scope === 'search') {
                tweetsDiv = tweetsDivR[1]
            } else if (scope === 'myTweets') {
                tweetsDiv = tweetsDivR[0]
                tweetDivMe.innerHTML = `
                <img class="profileTweet" src="${allTweets.photo}"/>
                <div>
                    <p class="contentTweet nameTweet">${allTweets.name}</p>
                    <p class="contentTweet atTweet">@${allTweets.username}</p>
                </div>`
            }
            for (let tweetInfo = 0; tweetInfo < allTweets.tweets.data.length; tweetInfo++) {
                const popupTextId = allTweets.tweets.data[tweetInfo]
                let location = {}
                if (allTweets.tweets.includes && allTweets.tweets.includes.places[tweetInfo]) {
                    location.geo = [allTweets.tweets.includes.places[tweetInfo].geo.bbox[0], allTweets.tweets.includes.places[tweetInfo].geo.bbox[1]]
                    location.name = allTweets.tweets.includes.places[tweetInfo].full_name
                } else {
                    location.geo = allTweets.userLocation.geometry.coordinates
                    location.name = allTweets.userLocation.place_name
                }
                if (!popupTextId) {
                    break
                }
                let inTweet =`<div class="tweet" id="${popupTextId.id}">
                                <img class="profileTweet" src="${allTweets.photo}"/>
                                <div>
                                     <div>
                                        <div>
                                            <p class="contentTweet nameTweet">${allTweets.name}</p>
                                            <p class="contentTweet atTweet">@${allTweets.username}</p>
                                        </div>
                                        <p class="contentTweet date&Loc">${dateFormat(popupTextId.created_at)} - ${locationFormat(location.name)} </p>
                                    </div>
                                    <p class="contentTweet descTweet">${descFormat(popupTextId.text)}</p>
                                </div>
                            </div>`
                
                
                tweetsDiv.insertAdjacentHTML('beforeend', inTweet)
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    inTweet
                )
                const el = document.createElement('div')
                el.id = popupTextId.id
                el.classList.add('tweetsMarker')

                var marker = new mapboxgl.Marker(el)
                    .setLngLat(location.geo)
                    .setPopup(popup)
                    .addTo(map)
            }
            addClickTweets()
        }
        function addClickTweets() {
            tweetsInsered = document.getElementsByClassName('tweet')
            const arrayTweetsDiv = Array.prototype.slice.call(tweetsInsered)
            arrayTweetsDiv.forEach(tweetContainer => {
                tweetContainer.addEventListener('click', async () => {
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
                    for (let i = 0; i < arrayTweetsDiv.length; i++) {
                        if (arrayTweetsDiv[i].id !== tweetContainer.id) {
                            arrayTweetsDiv[i].style = 'border-color:transparent'
                        }
                    }
                    addLines(retweet_list)
                })
            })
            search.disabled = false
        }

        function removeOtherTweets(tweetId) {
            let allTweetsMarker = document.getElementsByClassName('tweetsMarker')
            let arrayTweetsMarker = Array.prototype.slice.call(allTweetsMarker)
            arrayTweetsMarker.forEach((tweetMarker) => {
                if (tweetMarker.id !== tweetId) {
                    tweetMarker.style.display = "none"
                } else {
                    tweetMarker.style.display = "block"
                }
            })

        }

        async function addRetweetsLine(id) {
            let list_retweets = []
            const retweets = await quotedOf(id)
            let locationRetweet = ''
            let geocode = []
            if (retweets.data) {
                for (let retweet of retweets.data) {
                    let all = {}
                    if (retweet.location) {
                        locationRetweet = retweet.location
                        locationRetweet = await getAdressGeocode(response, retweet.location).then(function (response) {return response}).catch(function (error) {return ' not found'})
                        if (locationRetweet && typeof locationRetweet !== 'string') {
                            geocode = locationRetweet.center
                            if (!locationRetweet.context) {
                                if (locationRetweet.properties.short_code.includes('-')) {
                                    locationRetweet = locationRetweet.properties.short_code.toUpperCase().split('-')[0]
                                } else {
                                    locationRetweet = locationRetweet.properties.short_code.toUpperCase()
                                }
                            } else {
                                if (locationRetweet.context[locationRetweet.context.length-1].short_code.includes('-')) {
                                    locationRetweet = locationRetweet.context[locationRetweet.context.length-1].short_code.toUpperCase().split('-')[0]
                                } else {
                                    locationRetweet = locationRetweet.context[locationRetweet.context.length-1].short_code.toUpperCase()
                                }
                            }
                            all.geocode = geocode
                            all.location = locationRetweet
                            all.user = retweet.name
                            list_retweets.push(all)
                        }
                    }
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

        search.addEventListener('click', (e) => {
            tweetsDivR[1].innerHTML = ''
            search.disabled = true
            addMarkersMap(searchInput.value, 'search')
        })

        buttonMyTweets.addEventListener('click', (e) => {
            document.querySelectorAll('.tweetsMarker').forEach(function(tweetMarker) {
                tweetMarker.remove()
            })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
                )
            })
            tweetsDivR[0].innerHTML = ''
            addMarkersMap(sessionStorage.usercompanyTwitter, 'myTweets')
        })

        buttonSearch.addEventListener('click', (e) => {
            searchInput.value = ''
            tweetsDivR[1].innerHTML = ''
            document.querySelectorAll('.tweetsMarker').forEach(function(tweetMarker) {
                tweetMarker.remove()
            })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
                )
            })
        })

        tweetsDivR[0].innerHTML = ''
        addMarkersMap(sessionStorage.usercompanyTwitter, 'myTweets')
    })
}


/*
Link to API (Twitter/mapbox geocode)
*/
// get user 
function getUser(user) {
    return $.ajax({
        url: `/searchUserName?username=${user}`,
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
    text.innerHTML = timeLineText[x]
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
document.querySelector('.addFollowWrapper').addEventListener('click', () => {
    console.log(openSearchFollow)
    if (!openSearchFollow) {
        console.log(openSearchFollow)
        document.querySelector('#searchFollow>input').focus()
        document.querySelector('#placeholderSearchFollow').style.opacity = "0"
        document.querySelector('#searchFollow').style.display = "flex"
        setTimeout(() => {
            document.querySelector('#placeholderSearchFollow').style.width = "0"
            document.querySelector('#searchFollow').style.width = "100%"
            document.querySelector('#searchFollow').style.opacity = "1"
        }, 150);
        openSearchFollow=true
    }

})
document.querySelector('.addFollowWrapper>#searchFollow>svg').addEventListener('click', () => {
    console.log(openSearchFollow)
    document.querySelector('#searchFollow').style.opacity = "0"
    document.querySelector('#searchFollow').style.width = "0"
    setTimeout(() => {
        document.querySelector('#placeholderSearchFollow').style.width = "100%"
        document.querySelector('#placeholderSearchFollow').style.opacity = "0.5"
    }, 300);
    setTimeout(() => {
        document.querySelector('#searchFollow').style.display = "none"
        openSearchFollow=false
    }, 500);
    
})