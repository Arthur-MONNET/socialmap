/*coordonnées gps transform : 
Grinwitch + longitude /90*500   |    Equator + latitude /90*500
*/

let map = document.querySelector('#map');
let paths = map.querySelectorAll('path');
paths.forEach(path => {
    console.log(path.className)
    if(path.class==="france"){
        console.log("fr")
    }
});
