import countries from '../asset/world.js'

let zoomUp = document.getElementById('zoomUp')
let zoomDown = document.getElementById('zoomDown')
let zoomAll = document.getElementById('zoomAll')

//Recherche
let searchInput = document.getElementById('search')
let search = document.querySelector('#searchWrapper>button')
let timeLines = document.querySelectorAll('.timeLineWrapper')
let buttonsPage = document.querySelector('#buttonsPage')
let pagesWrapper = document.querySelector('#scrollWrapper')
let pages = pagesWrapper.querySelector('div')
const tweetsDivR = document.getElementsByClassName('content')
let tweetsInsered = document.getElementsByClassName('tweet')
let currentPage = 1
const buttonSearch = document.getElementsByClassName('b2')[0]

//Mytweets
const buttonMyTweets = document.getElementsByClassName('b1')[0]
const tweetDivMe = document.getElementById('titleMyTweets')

const listAutocomplete = document.getElementById('listAutocomplete')

const profilename = document.querySelector("#profile>p")
const profileimage = document.querySelector("#profile>img")

//Suivis
const buttonSuivis = document.getElementsByClassName('b3')[0]

const suiviInput = document.querySelector('#searchFollow>input')
const suiviAutocomplete = document.getElementById('autocompleteSuivi')

let followAddButton = document.querySelector('#searchFollow>svg')
let followsWrapper = document.getElementsByClassName('follows')[0]

let list_all_tweets = []
let divNum = 0
let nbTweetsIn = 5

let test =  [
    'step',
    ['feature-state', 'gradient'],
    0
]

for (let i = 0; i<91; i++) {
    test.push(i)
    test.push((i+10)/100)
}

let openSearchFollow = false
let allZoom = [1, 2, 3.5, 4.5, 6, 7, 9]
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
    return {
        "tweets": temp2._realData,
        "userLocation": geocodeUser,
        "photo": user.data.profile_image_url,
        "name": user.data.name,
        "username": user.data.username
    }
}

async function addMarkerHashtag(token, hashtag) {
    const allTweets = await getHashtag(hashtag)
    let allUser = {
        'location': [],
        'name':[],
        'photo': [],
        'username': []
    }
    if (!allTweets._realData.data) {
        return {}
    }
    for (let user in allTweets._realData.includes.users) {
        allUser.location.push(await getAdressGeocode(token, allTweets._realData.includes.users[user].location).then(function (response) { return response }).catch(function (error) {return ' not found' }))
        allUser.name.push(allTweets._realData.includes.users[user].name)
        allUser.photo.push(allTweets._realData.includes.users[user].profile_image_url)
        allUser.username.push(allTweets._realData.includes.users[user].username)
    }
    return {
        "tweets": allTweets._realData.data,
        "userLocation": allUser.location,
        "photo": allUser.photo,
        "name": allUser.name,
        "username": allUser.username
    }
}

function dateFormat(date) {
    let year = date.substring(2, 4)
    let month = date.substring(5, 7)
    let day = date.substring(8, 10)
    let newDate = day + '/' + month + '/' + year
    return newDate
}
function locationFormat(loc) {
    if (loc.indexOf(',') !== -1) return loc.substring(0, loc.indexOf(','))
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
        center: [0, 0],
        zoom: 1
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
                    'transparent'
                ],
                // blue color fill
                'fill-opacity': 0.5
            }
        })

        let allCountries = map.getSource('country')._data.features

        allCountries.forEach(idCountry => {
            map.setFeatureState(
                { source: 'country', id: idCountry.id },
                { retweets: false }
            )
            map.setFeatureState(
                { source: 'country', id: idCountry.id },
                { gradient: 0 }
            )
        })

        search.onclick = () => {
            document.querySelectorAll('.tweetsMarker').forEach(function (tweetMarker) {
                tweetMarker.remove()
            })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
                )
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { gradient: 0 }
                )
            })
        }
        zoomUp.onclick = () => {
            let newZoom
            let oldZoom = map.getZoom()
            if (oldZoom < 9) {
                for (let i = 0; i < allZoom.length; i++) {
                    if (oldZoom < allZoom[i]) {
                        newZoom = allZoom[i];
                        break;
                    }
                }
                map.zoomTo(newZoom, { duration: 500 })
            }

        }
        zoomDown.onclick = () => {
            let oldZoom = map.getZoom()
            let newZoom
            if (oldZoom > 1) {
                for (let i = allZoom.length - 1; i >= 0; i--) {
                    if (oldZoom > allZoom[i]) {
                        newZoom = allZoom[i];
                        break;
                    }
                }
                map.zoomTo(newZoom, { duration: 500 })
            }
        }
        zoomAll.onclick = () => {
            map.zoomTo(1, { duration: 500 })
        }
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
            let userData = await getUser(user)
            if (user === sessionStorage.usercompanyTwitter && scope==='myTweets') {
                profilename.innerHTML = sessionStorage.userfirstname + '&nbsp;&nbsp;&nbsp;' + sessionStorage.userlastname
                profileimage.src = JSON.parse(userData).data.profile_image_url
            }
            if (JSON.parse(userData).errors && scope === 'search') {
                search.disabled = false
                return tweetsDivR[1].insertAdjacentHTML('afterBegin', '<div>Utilisateur non trouvé</div>')
            } else if (JSON.parse(userData).errors && scope === 'myTweets') {
                search.disabled = false
                return tweetsDivR[0].insertAdjacentHTML('afterBegin', '<div>Utilisateur non trouvé</div>')
            }
            const allTweets = await addMarker(response, JSON.parse(userData))

            if (scope === 'myTweets') {
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

                let inTweet = `<div class="tweet" id="${popupTextId.id}">
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

                list_all_tweets.push(inTweet)
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
            let div = 0
            let nbTweets = 5
            if (scope === 'search') {
                div = 1
                nbTweets = 4
            }
            renderingTweets(list_all_tweets, currentPage, div, nbTweets)
        }

        async function addMarkersMapHashtag(hashtag) {
            const allTweets = await addMarkerHashtag(response, hashtag)
            search.disabled = false
            if (!allTweets.tweets){
                return tweetsDivR[1].insertAdjacentHTML('afterBegin', '<div>Hashtag non trouvé</div>')
            }
            for (let tweetInfo = 0; tweetInfo < allTweets.tweets.length; tweetInfo++) {
                const popupTextId = allTweets.tweets[tweetInfo]
                let location = {
                    'name': 'Undefined on Ground',
                    'geo': [-1.876659, 54.215705]
                }
                if (allTweets.userLocation[tweetInfo] && allTweets.userLocation[tweetInfo] !== 'not found') {
                    location.geo = allTweets.userLocation[tweetInfo].geometry.coordinates
                    location.name = allTweets.userLocation[tweetInfo].place_name
                }
                
                if (!popupTextId) {
                    break
                }

                let inTweet = `<div class="tweet" id="${popupTextId.id}">
                                <img class="profileTweet" src="${allTweets.photo[tweetInfo]}"/>
                                <div>
                                     <div>
                                        <div>
                                            <p class="contentTweet nameTweet">${allTweets.name[tweetInfo]}</p>
                                            <p class="contentTweet atTweet">@${allTweets.username[tweetInfo]}</p>
                                        </div>
                                        <p class="contentTweet date&Loc">${dateFormat(popupTextId.created_at)} - ${locationFormat(location.name)} </p>
                                    </div>
                                    <p class="contentTweet descTweet">${descFormat(popupTextId.text)}</p>
                                </div>
                            </div>`

                list_all_tweets.push(inTweet)
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
            renderingTweets(list_all_tweets, currentPage, 1, 4)
        }

        function renderingTweets(listAllTweets, pageIn, div, nbTweet) {
            tweetsDivR[div].innerHTML = ''
            for (let i = (pageIn - 1) * nbTweet; i < ((pageIn - 1) * nbTweet) + nbTweet; i++) {
                if (listAllTweets[i]) {
                    tweetsDivR[div].insertAdjacentHTML('beforeend', listAllTweets[i])
                } else {
                    addClickTweets()
                    return
                }
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
                        map.setFeatureState(
                            { source: 'country', id: idCountry.id },
                            { gradient: 0 }
                        )
                    })
                    let retweet_list = await addRetweetsLine(tweetContainer.id)
                    removeOtherTweets(tweetContainer.id)
                    tweetContainer.style.borderColor = 'var(--blue)'
                    tweetContainer.style.background = 'rgb(255, 255, 255, 1)';
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
                        locationRetweet = await getAdressGeocode(response, retweet.location).then(function (response) { return response }).catch(function (error) { return ' not found' })
                        if (locationRetweet && typeof locationRetweet !== 'string') {
                            geocode = locationRetweet.center
                            if (!locationRetweet.context) {
                                if (locationRetweet.properties.short_code.includes('-')) {
                                    locationRetweet = locationRetweet.properties.short_code.toUpperCase().split('-')[0]
                                } else {
                                    locationRetweet = locationRetweet.properties.short_code.toUpperCase()
                                }
                            } else {
                                if (locationRetweet.context[locationRetweet.context.length - 1].short_code.includes('-')) {
                                    locationRetweet = locationRetweet.context[locationRetweet.context.length - 1].short_code.toUpperCase().split('-')[0]
                                } else {
                                    locationRetweet = locationRetweet.context[locationRetweet.context.length - 1].short_code.toUpperCase()
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
            let list_gradient = {}
            for (let retweet of list) {
                nameCountries.push(retweet.location)
                if (getIdCountry([retweet.location], allCountries) in list_gradient){
                    list_gradient[getIdCountry([retweet.location], allCountries)].gradient ++ 
                } else {
                    list_gradient[getIdCountry([retweet.location], allCountries)] = {gradient:1}
                }
            }
            idCountries = getIdCountry(nameCountries, allCountries)
            let arrayRetweet =[]
            idCountries.forEach(idCountry => {
                arrayRetweet.push((list_gradient[idCountry].gradient/list.length) * 100)
            })
            let maxRetweet = Math.max(...arrayRetweet)
            idCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry },
                    { retweets: true }
                    
                )
                console.log(((list_gradient[idCountry].gradient/list.length) * 100)/maxRetweet*80+20)
                map.setFeatureState(
                    { source: 'country', id: idCountry },
                    { gradient: (((list_gradient[idCountry].gradient/list.length) * 100)/maxRetweet*80+20) -10 }
                    
                )
            })
            map.setPaintProperty(
                'retweets',
                'fill-opacity',
                test
            )
        }

        search.addEventListener('click', (e) => {
            list_all_tweets = []
            tweetsDivR[1].innerHTML = ''
            search.disabled = true
            divNum = 1
            nbTweetsIn = 4

            if ( searchInput.value.includes('#')) {
                addMarkersMapHashtag(searchInput.value.replace('#','%23'))
            } else {
                addMarkersMap(searchInput.value, 'search')
            }
            
        })

        buttonMyTweets.addEventListener('click', (e) => {
            list_all_tweets = []
            divNum = 0
            currentPage = 1
            nbTweetsIn = 5
            document.querySelectorAll('.tweetsMarker').forEach(function (tweetMarker) {
                tweetMarker.remove()
            })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
                )
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { gradient: 0 }
                )
            })
            tweetsDivR[0].innerHTML = ''
            addMarkersMap(sessionStorage.usercompanyTwitter, 'myTweets')
        })

        buttonSearch.addEventListener('click', (e) => {
            list_all_tweets = []
            searchInput.value = ''
            tweetsDivR[1].innerHTML = ''
            currentPage = 1
            document.querySelectorAll('.tweetsMarker').forEach(function (tweetMarker) {
                tweetMarker.remove()
            })
            allCountries.forEach(idCountry => {
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { retweets: false }
                )
                map.setFeatureState(
                    { source: 'country', id: idCountry.id },
                    { gradient: 0 }
                )
            })
        })
        function changePage(e, move, numPage, numberPage) {
            numPage.querySelector('.select').classList.remove('select')
            let num1 = parseInt(numPage.querySelector('.page1').innerHTML)
            if (move === 0) {
                e.target.classList.add('select')
                currentPage = num1 + numberPage - 1
            } else {
                numPage.querySelector('.page2').classList.add('select')
                for (let i = 0; i < 3; i++) {
                    numPage.querySelector('.page' + (i + 1)).innerHTML = num1 + i + move
                }
                currentPage = num1 + 1 + move
            }
            renderingTweets(list_all_tweets, currentPage, divNum, nbTweetsIn)
        }
        document.querySelectorAll(".numPage").forEach(numPage => {
            numPage.addEventListener('click', e => {
                if (e.target.classList.contains('pageLeft')) {
                    let num1 = parseInt(numPage.querySelector('.page1').innerHTML)
                    if (currentPage > 1) {
                        if (numPage.querySelector('.select').classList.contains('page2')) {
                            if (currentPage === 2) {
                                numPage.querySelector('.select').classList.remove('select')
                                numPage.querySelector('.page1').classList.add('select')
                            } else {
                                for (let i = 1; i <= 3; i++) {
                                    numPage.querySelector('.page' + (i)).innerHTML = num1 - 2 + i
                                }
                            }
                            currentPage--;
                        } else if (numPage.querySelector('.select').classList.contains('page3')) {
                            numPage.querySelector('.select').classList.remove('select')
                            numPage.querySelector('.page2').classList.add('select')
                            currentPage = 8
                        }
                        renderingTweets(list_all_tweets, currentPage, divNum, nbTweetsIn)
                    } else {
                        currentPage = 1
                    }
                } else if (e.target.classList.contains('page1')) {
                    let numberPage = 1
                    if ((numPage.querySelector('.select').classList.contains('page2') && currentPage === 2) ||
                        (numPage.querySelector('.select').classList.contains('page3') && currentPage === 3)
                        || currentPage <= 1) {
                        changePage(e, 0, numPage, numberPage)
                    } else {
                        changePage(e, -1, numPage, numberPage)
                    }
                } else if (e.target.classList.contains('page2')) {
                    let numberPage = 2
                    changePage(e, 0, numPage, numberPage)
                } else if (e.target.classList.contains('page3')) {
                    let numberPage = 3
                    if ((numPage.querySelector('.select').classList.contains('page2') && currentPage === 8) ||
                        (numPage.querySelector('.select').classList.contains('page1') && currentPage === 7)
                        || currentPage >= 9) {
                        changePage(e, 0, numPage, numberPage)
                    } else {
                        changePage(e, 1, numPage, numberPage)
                    }
                } else if (e.target.classList.contains('pageRight')) {
                    let num1 = parseInt(numPage.querySelector('.page1').innerHTML)
                    if (currentPage < 9) {
                        if (numPage.querySelector('.select').classList.contains('page2')) {
                            if (currentPage === 8) {
                                numPage.querySelector('.select').classList.remove('select')
                                numPage.querySelector('.page3').classList.add('select')
                            } else {
                                for (let i = 1; i <= 3; i++) {
                                    numPage.querySelector('.page' + (i)).innerHTML = num1 + i
                                }
                            }
                            currentPage++;
                        } else if (numPage.querySelector('.select').classList.contains('page1')) {
                            numPage.querySelector('.select').classList.remove('select')
                            numPage.querySelector('.page2').classList.add('select')
                            currentPage = 2
                        }
                        renderingTweets(list_all_tweets, currentPage, divNum, nbTweetsIn)
                    } else {
                        currentPage = 9
                    }
                }
            })
        })

        searchInput.addEventListener('input', async e => {
            let listItem = []
            if (!searchInput.value.includes('#') && searchInput.value.length > 2) {
                let autocomplete = await getAutocomplete(searchInput.value)
                for (let user of autocomplete._realData) {
                    listItem.push(user)
                    listItem.sort((a, b) => (a.followers_count > b.followers_count) ? -1 : ((b.followers_count > a.followers_count) ? 1 : 0))
                }
            }
            listAutocomplete.innerHTML = ''
            let autocompleteItem = []
            if (listItem.length > 0 ) {
                let item = 3
                for (let i=0; i < item; i++) {
                    if (listItem[i]) {
                        let name = listItem[i].name.toLowerCase()
                        let username = listItem[i].screen_name.toLowerCase()
                        if (name.includes(searchInput.value.toLowerCase()) || username.includes(searchInput.value.toLowerCase())) {
                            autocompleteItem = `<option value=${listItem[i].screen_name}>${listItem[i].name}</option>`
                            listAutocomplete.insertAdjacentHTML('beforeend', autocompleteItem)
                        } else {
                            item ++
                        }
                    }
                    
                }
            }
        })

        suiviInput.addEventListener('input', async e => {
            let listItem = []
            if (!suiviInput.value.includes('#') && suiviInput.value.length > 2) {
                let autocomplete = await getAutocomplete(suiviInput.value)
                for (let user of autocomplete._realData) {
                    listItem.push(user)
                    listItem.sort((a, b) => (a.followers_count > b.followers_count) ? -1 : ((b.followers_count > a.followers_count) ? 1 : 0))
                }
            }
            suiviAutocomplete.innerHTML = ''
            let autocompleteItem = []
            if (listItem.length > 0 ) {
                let item = 3
                for (let i=0; i < item; i++) {
                    if (listItem[i]) {
                        let name = listItem[i].name.toLowerCase()
                        let username = listItem[i].screen_name.toLowerCase()
                        if (name.includes(suiviInput.value.toLowerCase()) || username.includes(suiviInput.value.toLowerCase())) {
                            autocompleteItem = `<option value=${listItem[i].screen_name}>${listItem[i].name}</option>`
                            suiviAutocomplete.insertAdjacentHTML('beforeend', autocompleteItem)
                        } else {
                            item ++
                        }
                    }
                    
                }
            }
        })

        followAddButton.addEventListener('click', async e => {
            let newFollow = await getUser(suiviInput.value)
            let newFollowDiv = 
                `<div class="input followWrapper" id=${JSON.parse(newFollow).data.username}>
                    <div>
                        <img class="profileTweet" src="${JSON.parse(newFollow).data.profile_image_url}" />
                        <div>
                            <p class="contentTweet nameTweet">${JSON.parse(newFollow).data.name}</p>
                            <p class="contentTweet atTweet">@${JSON.parse(newFollow).data.username}</p>
                        </div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="closeButton"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41L17.59 5Z"
                            fill="#000" />
                    </svg>
                </div>`
            followsWrapper.insertAdjacentHTML('beforeend', newFollowDiv)
            followdivNewClick()
        })

        function followdivNewClick() {
            let followDivs = document.getElementsByClassName('followWrapper')
            let arrayfollowDivs = Array.prototype.slice.call(followDivs)
            for (let followDiv of arrayfollowDivs) {
                followDiv.addEventListener('click', e => {
                    buttonSearch.click()
                    searchInput.value = followDiv.id
                    search.click()
                })
            }
        }

        buttonSuivis.addEventListener('click', e => {
            followdivNewClick()
        })

        tweetsDivR[0].innerHTML = ''
        addMarkersMap(sessionStorage.usercompanyTwitter, 'myTweets')
    })
}


/*
Link to API (Twitter/mapbox geocode)
*/

function getAutocomplete(user) {
    return $.ajax({
        url: `/autocompleteUser?user=${user}`,
        type: "POST",
        success: function (response, status, http) {
            if (response) {
                return response
            }
        }
    })
}

function getHashtag(hashtag) {
    return $.ajax({
        url:`/searchHashtag?hashtag=${hashtag}`,
        type: "POST",
        success: function (response, status, http) {
            if (response) {
                return response
            }
        }
    })
}

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
    if (!openSearchFollow) {
        document.querySelector('#searchFollow>input').focus()
        document.querySelector('#placeholderSearchFollow').style.opacity = "0"
        document.querySelector('#searchFollow').style.display = "flex"
        setTimeout(() => {
            document.querySelector('#placeholderSearchFollow').style.width = "0"
            document.querySelector('#searchFollow').style.width = "100%"
            document.querySelector('#searchFollow').style.opacity = "1"
        }, 150);
        openSearchFollow = true
    }

})
document.querySelector('.addFollowWrapper>#searchFollow>svg').addEventListener('click', () => {
    document.querySelector('#searchFollow').style.opacity = "0"
    document.querySelector('#searchFollow').style.width = "0"
    setTimeout(() => {
        document.querySelector('#placeholderSearchFollow').style.width = "100%"
        document.querySelector('#placeholderSearchFollow').style.opacity = "0.5"
    }, 300)
    setTimeout(() => {
        document.querySelector('#searchFollow').style.display = "none"
        openSearchFollow = false
    }, 500)
})

