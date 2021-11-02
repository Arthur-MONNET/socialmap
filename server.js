/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/


var express = require('express');
var app = express();
var path = require('path')

app.use(express.static(path.join(__dirname, './public')));

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
    res.send()
});
app.listen(3000)