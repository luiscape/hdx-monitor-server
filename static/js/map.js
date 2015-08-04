//
// Generate map using MapBox and Leaflet.
//
// Author: Luis Capelo | luiscape@gmail.com
// (With guidance from MapBox' documentation.)
//


L.mapbox.accessToken = 'pk.eyJ1IjoidHJpc3RlbiIsImEiOiJuZ2E5MG5BIn0.39lpfFC5Nxyqck1qbTNquQ';
var map = L.mapbox.map('map', 'luiscapelo.mij8ld21')
    .setView([40.727997, -73.980775], 16);

var listings = document.getElementById('listings');
var locations = L.mapbox.featureLayer().addTo(map);

d3.json('data/station_metadata.geojson', function(err, geojson) {

    locations.setGeoJSON(geojson);

    function setActive(el) {
        var siblings = listings.getElementsByTagName('div');
        for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
                .replace(/active/, '').replace(/\s\s*$/, '');
        }

        el.className += ' active';
    }

    locations.eachLayer(function(locale) {

        // Shorten locale.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        var prop = locale.feature.properties;

        // Each marker on the map.
        var popup = '<h3>Docking Station</h3><div>' + prop.stAddress1;

        // var listing_container = listings.appendChild(document.createElement('div'));
        // listing_container.className = 'item row';

        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item col-xs-12';

        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'col-xs-8 store-title';

        var watch = listing.appendChild(document.createElement('div'))
        watch.className = 'col-xs-4 vertical-center'
        watch.innerHTML = '<a class="roundButton btn btn-primary btn-sm" href="#" role="button">Watch <span class="fa fa-eye"></span></a>'

        link.innerHTML = prop.stAddress1;
        if (prop.id) {
            // Id under name.
            link.innerHTML += '<br /><small class="quiet">' + prop.statusValue + '</small>';
            popup += '<br /><small class="quiet">' + prop.id + '</small>';
        }

        link.onclick = function() {
            setActive(listing);

            // When a menu item is clicked, animate the map to center
            // its associated locale and open its popup.
            map.setView(locale.getLatLng(), 16);
            locale.openPopup();
            CreateSparkLike(prop.id)
            return false;
        };

        // Marker interaction
        locale.on('click', function() {
            // 1. center the map on the selected marker.
            map.panTo(locale.getLatLng());

            CreateSparkLike(prop.id)

            // 2. Set active the markers associated listing.
            setActive(listing);
        });

        popup += '</div>';
        locale.bindPopup(popup);

        locale.setIcon(L.icon({
            iconUrl: 'img/citibike-24.png',
            iconSize: [56, 56],
            iconAnchor: [28, 28],
            popupAnchor: [0, -34]
        }));
    });

})
