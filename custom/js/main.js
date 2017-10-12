function initMap(data) {
    map = L.map("map")
    // map.setView([45.4642, 9.1900], 13, { paddingTopLeft: [500, 0] });

map.on("zoomend", function() {
    var z = map.getZoom();
    $("BODY").attr("class", "zoom" + z)
})

    markersLayer = new L.FeatureGroup().addTo(map);
    var osmAttr =
        '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    var tiles = L.tileLayer(data.tilesUrl, {
        attribution: osmAttr
    });
    tiles.addTo(map);
}

function initSidebar(data) {
    $("title").text(data.titolo);
    $(".header h1").text(data.titolo);
    $(".intro").html(data.introduzione);
}

function createLocations(data) {
    $(".locations .list").empty(); // ripulisci la sidebar
    markersLayer.clearLayers(); // ripulisci la mappa

    var filteredData = data.luoghi.filter(locationsFilter); // filtra dati usando locationsFilter()

    for (var i in filteredData) {
        // per ogni luogo filtrato:

        var luogo = filteredData[i];
        var num = ++i; // numero sequenza del luogo 1, 2, 3...
        var listItem = createListItem(luogo, num); // crea elemento sidebar
        $(".locations .list").append(listItem); // e aggiungilo alla sidebar

        if (luogo.lat && luogo.lng) {
            // se ha latitudine e longitudine
            var marker = createMarker(luogo, num); // crea marker
            marker.addTo(markersLayer); // e aggiungilo alla mappa
            marker.on(
                "click",
                selectLocation(listItem, marker, luogo) // al click sul marker esegui selectLocation()
            );
            listItem.on(
                "click",
                selectLocation(listItem, marker, luogo) // al click sull'elemento esegui selectLocation()
            );
        }
    }
}

function createListItem(luogoData, numero) {
    var item = $($("#listitemtmpl").html()); // carica html da template
    item.addClass(luogoData.tipo || ""); // aggiungi il tipo del luogo come classe CSS
    item.addClass(luogoData.contentsPath ? "hasPath" : ""); // aggiungi classe CSS "hasPath" se il luogo ha contenuti
    item.find(".titolo").text(luogoData.titolo); // aggiungi titolo all'elemento con classe "titolo"
    item.find(".indirizzo").text(luogoData.indirizzo); // aggiungi indirizzo all'elemento con classe "indirizzo"
    item.find(".numero").text(luogoData.numero || numero); // aggiungi numero o n. successivo all'elemento con classe "numero"
    luogoData.descrizione = luogoData.descrizione; // aggiungi descrizione all'elemento con classe "descrizione"
    return item;
}

function createMarker(luogoData, numero) {
    var iconClass = luogoData.tipo || ""; // aggiungi il tipo del luogo come classe CSS
    iconClass += luogoData.contentsPath ? " hasPath" : ""; // aggiungi classe CSS "hasPath" se il luogo ha contenuti
    var icon = L.divIcon({
        className: "icon " + iconClass, // crea icona marker con le classi CSS estratte dai dati
        iconSize: luogoData.dimensione || 20, // e con le dimensioni estratte dai dati
        html: luogoData.numero || numero // senza testo
    });
    var marker = L.marker(
        // crea marker
        [luogoData.lat, luogoData.lng],
        { icon: icon }
    );
    return marker;
}

function selectLocation(listItem, marker, luogo) {
    return function() {
        selectMarker(marker);
        selectListItem(listItem, luogo);
    };
}

function selectListItem(listItem, luogo) {
    $(".location").removeClass("selected");
    listItem.addClass("selected");

    $("#sidebar").animate({ left: "-100%" });

    var path = luogo["contentsPath"];
    $(".details .header h1").html(luogo.titolo);
    $(".details").toggleClass("hasPath", !!path);
    if (path) {
        var html = $("<iframe/>", { src: "custom/contents/" + path, frameBorder: 0 })
        loadLocationHtml(html);
    } else {
        var details = $($("#detailstmpl").html()); // carica html da template
        details.find(".indirizzo").text(luogo.indirizzo);
        details.find(".descrizione").text(luogo.descrizione);
        loadLocationHtml(details.html());
    }
}

function loadLocationHtml(html) {
    $(".details .contents").html(html);
}

function back() {
    $("#sidebar").animate({ left: "0" });
}

function selectMarker(marker) {
    $(".icon").removeClass("selected");
    $(marker._icon).addClass("selected");
}

function locationsFilter(luogo) {
    var tipo = luogo.tipo;
    var showBancarelle = $(".bancarelle").is(":checked");
    var showFumetti = $(".fumetti").is(":checked");
    var showLibrerie = $(".librerie").is(":checked");

    if (!showBancarelle && tipo === "B") return false;
    if (!showFumetti && tipo === "F") return false;
    if (!showLibrerie && tipo === "L") return false;
    return true;
}

var map;
var markersLayer;
var data;
var selected;

initMap(data);
initSidebar(data);
createLocations(data);
map.fitBounds(markersLayer.getBounds(), { paddingTopLeft: [500, 0] });

$("input[type=checkbox]").on("change", function() {
    if (!data) return;
    createLocations(data);
});
