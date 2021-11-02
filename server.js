/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/


var express = require('express');
var app = express();
var path = require('path')
require('dotenv').config()

app.use(express.static(path.join(__dirname, './public')));

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
    res.send()
});

app.get('/', function(req, res){
    res.render('./pages/map.html',{mapToken:process.env.MAP_TOKEN});
});
app.listen(3000)