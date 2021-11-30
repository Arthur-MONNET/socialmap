/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/

const { response } = require('express');
var express = require('express');
var app = express();
var path = require('path')
let port = process.env.PORT || 3001
require('dotenv').config()
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi(process.env.BEARER_TOKEN)

const roClient = client.readOnly;

app.use(express.static(__dirname + '/public'))


app.post('/mapToken', (req, res) => {
    res.send(process.env.MAP_TOKEN);
});

//select link to start
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})


// API Twitter request
app.post('/searchUserName', (req, res) =>{
    client.v2.userByUsername(req.query['username'], {"user.fields": ['location', 'public_metrics', 'profile_image_url']})
    .then(response => 
        res.send(response)
    )
    .catch(error => console.error(error))
})

app.post('/userTweets', (req, res) => {
    client.v2.userTimeline(req.query['id'], {"expansions": 'geo.place_id',"tweet.fields": ['geo', 'public_metrics', 'created_at'],'place.fields': ['contained_within', 'country', 'geo'], "exclude": ['replies', 'retweets'], "max_results": 40})
    .then(response =>
        res.send(response))
    .catch(error => console.error(error))
})

app.post('/quotedOf', (req, res) => {
    client.v2.tweetRetweetedBy(req.query['id'], {"user.fields": ['location', 'public_metrics']})
    .then(response =>
        res.send(response)
    )
})

app.listen(port)

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server')
    server.close(() => {
      debug('HTTP server closed')
    })
})