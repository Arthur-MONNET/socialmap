/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/

/* const express = require('express'),
axios = require('axios'),
app = express(),
http = require('http').Server(app),
port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
//port http
http.listen(port, () => {
    console.log(`http://localhost:${port}/`);
});
 */

var express = require('express');
var app = express();
var path = require('path')
require('dotenv').config()

app.use(express.static(__dirname + '/public'));

app.get('/mapToken', function (req, res) {
    res.send(process.env.MAP_TOKEN);
});


//select link to start
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function (req, res) {
    res.render('./pages/map.html', { mapToken: process.env.MAP_TOKEN });
});
app.listen(3000)
