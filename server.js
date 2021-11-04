/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/

var express = require('express');
var app = express();
var path = require('path')
require('dotenv').config()

app.use(express.static(__dirname + '/public'))


app.get('/mapToken', (req, res) => {
    res.send(process.env.MAP_TOKEN);
});

//select link to start
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(3000)


// API Twitter request
app.post('/searchUserName', (req, res) =>{
    res.send(req.query['username'])
})