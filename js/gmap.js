//var map;
var idtiposensor = 5;
var idsensornuevo = 3;
var ultimaLecturaSensor = null;
var ultimalectura;
///Radar
var kmlUrl = "http://imrad.sire.gov.co:8080/radar/reflectividad.kmz";
//var kmlUrl = "http://201.245.199.12:8080/radar/reflectividad.kmz";
var kmlloc = "https://www.sire.gov.co/documents/82884/85260/Localidades.kmz";
var kmlSalle = "https://mapasbogota.sire.gov.co:8447/mapas/sab/salle.kmz";
//var kmlTemp = "https://mapasbogota.sire.gov.co:8447/mapas/sab/Temp_7_06_v2.kmz";
var kmlTemp = "https://mapasbogota.sire.gov.co:8447/mapas/sab/Temp_7_06_v2.kmz";
var kmlSismo = "https://mapasbogota.sire.gov.co:8447/mapas/sab/RESPUESTA_SISMICA.kmz";
//var kmlFucha = "https://mapasbogota.sire.gov.co:8447/mapas/sab/fucha-amenaza.kmz";
//var kmlSismo = "http://201.245.199.9:280/mapas/sab/RESPUESTA_SISMICA.kmz";
var map, radar, localidades, temperatura, sismos, fucha, poligonos, fetchErrors = 0, errores = 0, usalle;
var zoomI;
var center;
var swVisualizarMenu = true;
var URLactual = window.location.href;
var band;
var latitudCorreo = datosURL('latitud');
var longitudCorreo = datosURL('longitud');
var band;
/**
 * Inicializar el mapa y sus componentes
 * @returns {undefined}
 */
function initialize() {
    var lati;
    var long;
    if (latitudCorreo != "" && longitudCorreo != "") {
        lati = parseFloat(latitudCorreo);
        long = parseFloat(longitudCorreo);
        zoomI = 13;
    } else {
        lati = 4.63973;
        long = -74.0834;
        zoomI = 11;
    }
    var myOptions = {
        zoom: zoomI,
//        center: new google.maps.LatLng(4.674654, -74.094194),
        //center: {lat: 4.674654, lng: -74.094194},
        center: {lat: lati, lng: long},
       // mapTypeId: 'IDIGER', //google.maps.MapTypeId.ROADMAP
		mapTypeId: "OSM",
        mapTypeControlOptions: {
            mapTypeIds: ['IDIGER']//,google.maps.MapTypeId.ROADMAP]
        },
        zoomControlOptions: {
            //  position: google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControlOptions: {
            //  position: google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true //my favorite feature in V3!
    }
    map = new google.maps.Map(document.getElementById("mapa"), myOptions);


/*
    var url = 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_3857/MapServer';
    var agsType = new gmaps.ags.MapType(url, {
        name: 'IDIGER'
    });
    map.mapTypes.set('IDIGER', agsType);
    map.setMapTypeId('IDIGER');*/

	   map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));

    band = URLactual.split('sab=')[1];
    if (band == 0 || band == 3 || band == undefined || band == 1 || band > 7) {
        getMostrarMenu();
        idtiposensor = 5;
        band == 0 ? document.title = "Lluvias en tiempo real" :
                band == 3 ? document.title = "Rios y Quebradas propensos a crecientes torrenciales" :
                band == 1 ? document.title = "Estaciones Hidrometereologicas" : document.title = "Sistema de Alerta de Bogota";
    }
    if (band == 2) {
        getMostrarNiveles();
        idtiposensor = 3;
        activarNivel();
        document.title = "Niveles de Cauce";
        $('#menu').css('width', '182px');
//        $('#menu').css('height', '70px');
    }
    if (band == 4) {
        getMostrarMenuReportes();
        idtiposensor = 5;
    }
    if (band == 5) {
        getMostrarTemperatura();
        activarDiasSin();
        idtiposensor = 1;
        document.title = "Temperatura";
    }
    if (band == 7) {
        idtiposensor = 9;
        getMostrarAcelerografo();
        document.title = "Sismos";
    }
    if (band == 6) {
        //puntosRemocion();
        getMostrarMenu();
    } else {
        sensoresxTiposensores(idtiposensor);
    }
    if (band != 7) {
        iniciarCapas();
    }



}
google.maps.event.addDomListener(window, 'load', initialize);
function datosURL(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
}
/**
 * Iniciar Capas
 * @returns {undefined}
 */
var infowindow1;
function iniciarCapas() {

    //zoomI = map.getZoom();
    //center = map.getCenter();

    radar = new google.maps.KmlLayer({url: kmlUrl, map: map, preserveViewport: true});
    //radar.setMap(map);
    localidades = new google.maps.KmlLayer({url: kmlloc, clickable: false, preserveViewport: true});
    localidades.setMap(map);

    google.maps.event.addListener(window.radar, "status_changed", function () {
        if (window.radar.getStatus() == 'FETCH_ERROR' && fetchErrors < 5) {
            fetchErrors++;
            window.radar.setUrl(kmlUrl + '?' + Math.floor((Math.random() * 10000) + 1));
//            console.log(radar.getStatus() + "\n");
        }
//        console.log(radar.getStatus() + "\n");
        /*setTimeout(function () {
         window.map.setZoom(zoomI); //Or whatever
         window.map.setCenter(center);
         //            console.log("actualizo capa Inicial");
         }, 1);*/
    });
    google.maps.event.addListener(window.localidades, "status_changed", function () {
//        console.log("localidades " + localidades.getStatus() + "\n");
        if (window.localidades.getStatus() == 'FETCH_ERROR' && errores < 5) {
            errores++;
            window.localidades.setUrl(kmlloc + '?' + Math.floor((Math.random() * 10000) + 1));
//            console.log(localidades.getStatus() + "\n");
        }
    });
    if (band == 5) {
        var urlIncendio = 'http://mapas.sire.gov.co:6080/arcgis/rest/services/SAB/SUSCEPT_INCENDIO_FOR_200618/MapServer';
//        var urlIncendio = 'http://mapas.sire.gov.co:6080/arcgis/rest/services/SAB/SUSCEPT_INCENDIO_FOR_200618/MapServer?f=jsapi';
        var agsIncendio = new gmaps.ags.MapType(urlIncendio, {name: 'ArcGIS', opacity: 1});
        map.overlayMapTypes.insertAt(0, agsIncendio);

        temperatura = new google.maps.KmlLayer({url: kmlTemp, clickable: false, preserveViewport: true});
        temperatura.setMap(map);
        google.maps.event.addListener(window.temperatura, "status_changed", function () {
            if (window.temperatura.getStatus() == 'FETCH_ERROR' && errores < 5) {
                errores++;
                window.temperatura.setUrl(kmlTemp + '?' + Math.floor((Math.random() * 10000) + 1));
            }
        });

    }

    if (band == 3) {
        var urlTorrencial = 'http://mapas.sire.gov.co:6080/arcgis/rest/services/SAB/AV_TORRENCIALES_200618/MapServer';
        var agsTorrencial = new gmaps.ags.MapType(urlTorrencial, {name: 'ArcGIS', opacity: 1});
        map.overlayMapTypes.insertAt(0, agsTorrencial);
       // fucha = new google.maps.KmlLayer({url: kmlFucha, clickable: false, preserveViewport: true});
       // fucha.setMap(map);

        for (var i = 0; i < cuencas.length; i++) {
            if (band != 6) {
                var color = '#0000F7';
                var fcolor = '#00AEEF';
              /*  if (nombrecuencas[i] == "Río Fucha") {
                    console.log(i);
                    color = '#FF0C00';
                    fcolor = '#FF0C00';
                }*/
                var quebradas = new google.maps.Polygon({
                     paths: cuencas[i],
                    strokeColor: '#0000F7',
                    strokeOpacity: 0.7,
                    strokeWeight: 1.5,
                    fillColor: '#00AEEF',
                    fillOpacity: 0
                });
                quebradas.setMap(map);
//            quebradas.addListener('click', showArrays);
                infowindow1 = new google.maps.InfoWindow({});

                quebradas.addListener('mouseover', changeColorOver);
                quebradas.addListener('click', changeClick);
                quebradas.addListener('mouseout', changeColorOut);
            }
            /*else {
             //            console.log(cuencas);
             var quebradas = new google.maps.Polygon({
             paths: cuencas[i],
             strokeColor: '#0000F7',
             strokeOpacity: 0.4,
             strokeWeight: 1.3,
             fillColor: '#00AEEF',
             fillOpacity: 0
             });
             quebradas.setMap(map);
             infowindow1 = new google.maps.InfoWindow({});
             quebradas.addListener('click', changeColorOver);
             quebradas.addListener('mouseout', changeColorOut);
             }*/
        }

    }

}
window.setInterval(UpdateKmlLayer, 5000);
window.setInterval(intervaloVentanas, 100000);
function intervaloVentanas() {
//    closeIframe();//Grafica.jss
    if (band != 6) {
        sensoresxTiposensores(idtiposensor);
    }
}
function changeColorOver(event) {
    var contentString = '';
    var vertices = this.getPath();//obtenemos los vertices del poligono
    var xy = vertices.getAt(0);//obtenemos el primer vertice para compararlos
    var latitud = xy.lat();//primer vertice para saber latitud del poligono
    var longitud = xy.lng();//primer vertice para saber longitud del poligono

    for (var i = 0; i < latitudCuenca.length; i++) {
        if (latitud == latitudCuenca[i]) {
            contentString = nombrecuencas[i];
        }
    }
    infowindow1.close();
    infowindow1.setContent(contentString);
    infowindow1.setPosition(event.latLng);
    infowindow1.open(map);
//    }#FF0C00
  //  if (contentString == "Río Fucha") {
  //      this.setOptions({strokeColor: '#FF0C00', strokeWeight: 5, strokeOpacity: 0.8, fillOpacity: 0});
   // } else {
    //    this.setOptions({strokeColor: '#0000F7', strokeWeight: 5, strokeOpacity: 0.8, fillOpacity: 0});
   // }

}

function changeClick(event) {
    var contentString = '';
    var vertices = this.getPath();//obtenemos los vertices del poligono
    var xy = vertices.getAt(0);//obtenemos el primer vertice para compararlos
    var latitud = xy.lat();//primer vertice para saber latitud del poligono
    var longitud = xy.lng();//primer vertice para saber longitud del poligono

    for (var i = 0; i < latitudCuenca.length; i++) {
        if (latitud == 4.508923650263918 && nombrecuencas[i] == "Río Fucha") {
            var content = "";
            content = "<style>tr{border: #25AAE3 1px solid;} td{padding: 6px;}</style><table style='font-family: sans-serif;border-collapse: collapse;' border='1'><tr><th bgcolor='#25AAE3' colspan ='2' style='color: white;font-weight: bold;height: 28px; padding: 5px;'> ";
            content += "</br> Estaciones Universidad de la Salle ";
            content += "</th> </tr></br>";
            content += "</table> </br>";
            content += "<center><tr><th><button type='button' style='padding: 5px;' onclick=abrirCapa(" + latitud + "," + longitud + ");>Ver Capa</button>&nbsp;";
            content += "</th><th><button type='button' style='padding: 5px;' onclick=cerrarCapa();>Ocultar Capa</button></th></tr></center>"
            content += "</table> </br>";

            infowindow1.close();
            infowindow1.setContent(content);
            infowindow1.setPosition(event.latLng);
            infowindow1.open(map);
//    }
            if (contentString == "Río Fucha") {
                this.setOptions({strokeColor: '#FF0C00', strokeWeight: 5, strokeOpacity: 0.8, fillOpacity: 0});
            } else {
                this.setOptions({strokeColor: '#0000F7', strokeWeight: 5, strokeOpacity: 0.8, fillOpacity: 0});
            }
        }
    }
}
function abrirCapa(latitud, longitud) {
//    var coordenadas = new google.maps.LatLng(latitud, longitud);
//    map.setCenter(coordenadas);
    map.setCenter(new google.maps.LatLng(latitud, longitud));
    map.setZoom(12.5);
    usalle = new google.maps.KmlLayer({url: kmlSalle, clickable: false, preserveViewport: true});
    usalle.setMap(map);
}
function cerrarCapa() {
    usalle.setMap(null);
}
function changeColorOut(event) {
    var contentString = '';
    var vertices = this.getPath();//obtenemos los vertices del poligono
    var xy = vertices.getAt(0);//obtenemos el primer vertice para compararlos
    var latitud = xy.lat();//primer vertice para saber latitud del poligono
    var longitud = xy.lng();//primer vertice para saber longitud del poligono
    var color = '#0000F7';
    var fcolor = '#00AEEF';

    for (var i = 0; i < latitudCuenca.length; i++) {
        if (latitud == latitudCuenca[i]) {
            contentString = nombrecuencas[i];
        }
      /*  if (contentString == "Río Fucha") {
            color = '#FF0C00';
            fcolor = '#FF0C00';
        }*/
    }

    this.setOptions({
//        strokeColor: '#00AEEF', strokeWeight: 1, strokeOpacity: 0.6, fillOpacity: 0.1
        strokeColor: color,
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
        fillColor: fcolor,
        fillOpacity: 0
    });
}
function showArrays(event) {

    var contentString = '';
    // Replace the info window's content and position.
    for (var i = 0; i < nombrecuencas.length; i++) {
        contentString = nombrecuencas[i];
        infowindow1.setContent(contentString);
        infowindow1.setPosition(event.latLng);
        infowindow1.open(map);
    }
}
/**
 * Activar por defecto Radar en el mapa
 * @returns {undefined}
 */
function UpdateKmlLayer() {
    if (band != 7) {
        if (document.getElementById('btnradar').checked) {
            zoomI = map.getZoom();
            center = map.getCenter();
//        console.log("zoom " + zoomI);
            //setting loaded to false unloads the layer//
            window.radar.setMap(null);
            //change its url so that we would force the google to refetch data
            window.radar.url = kmlUrl + "?rand=" + (new Date()).valueOf();
            //and re-add layer
            window.radar.setMap(window.map);
            google.maps.event.addListener(window.radar, "status_changed", function () {
//            console.log("Refresh: " + window.radar.getStatus() + "\n");
                /* setTimeout(function () {
                 window.map.setZoom(zoomI); //Or whatever
                 window.map.setCenter(center);
                 //                console.log("actualizo capa");
                 }, 1);*/
            });
        }
    }
}
/**
 * Activar o desactivar Capa de Radar o Localidades
 * @returns {undefined}
 */

function check(layer)
{
    if (layer.getMap() == null) {
        zoomI = map.getZoom();
        center = map.getCenter();
        layer.setMap(window.map);
        google.maps.event.addListener(layer, "status_changed", function () {
//            console.log("localidades " + localidades.getStatus() + "\n");
            /* setTimeout(function () {
             window.map.setZoom(zoomI); //Or whatever
             window.map.setCenter(center);
             });*/
//            console.log("capa prendida");
        }, 1);
    } else
    {
        layer.setMap(null);
        layer = null;
    }

}
var boolean = false;
function iniciarSismos(layer) {
    if (document.getElementById('btnSismo').checked) {
        if (boolean == false) {
            sismos = new google.maps.KmlLayer({url: kmlSismo, clickable: false, preserveViewport: true});
            sismos.setMap(map);
            google.maps.event.addListener(window.sismos, "status_changed", function () {
                if (window.sismos.getStatus() == 'FETCH_ERROR' && errores < 5) {
                    errores++;
                    window.sismos.setUrl(kmlSismo + '?' + Math.floor((Math.random() * 10000) + 1));
                }
            });
        }
        boolean = true;
    }

    if (layer.getMap() == null) {
        zoomI = map.getZoom();
        center = map.getCenter();
        layer.setMap(window.map);
        google.maps.event.addListener(layer, "status_changed", function () {
        }, 1);
    } else
    {
        layer.setMap(null);
        layer = null;
    }
}

function visualizarMenu()
{
    if (swVisualizarMenu)
    {
        $('#usuario').show('slow');
        document.getElementById("controlUsuario").style.height = "175px";
        $('#tituloMenu').css('border-bottom-left-radius', '0px');
        $('#tituloMenu').css('border-bottom-right-radius', '0px');
        $('#tituloMenu').find('img').attr('src', 'img/pin.png');

    } else
    {
        $('#usuario').slideUp(1000, function (e) {
            document.getElementById("controlUsuario").style.height = "22px";
            $('#tituloMenu').css('border-bottom-left-radius', '8px');
            $('#tituloMenu').css('border-bottom-right-radius', '8px');
            $('#tituloMenu').find('img').attr('src', 'img/pin_up.png');

        });
    }
    swVisualizarMenu = !swVisualizarMenu;
}
window.onload = detectarCarga;

function detectarCarga() {
    document.getElementById("carga").style.display = "none";
}

var infoWindows = true;
function ocultarWindows()
{
    if (infoWindows)
    {
        document.getElementById("textopri").style.display = "none";
        document.getElementById("textosec").style.display = "block";
    } else
    {
        document.getElementById("textosec").style.display = "none";
        document.getElementById("textopri").style.display = "block";
    }

    infoWindows = !infoWindows;
}

$(document).ready(function () {
    $('.close1').click(function () {
        $('.overlay-container').fadeOut().end().find('.window-container').removeClass('window-container-visible');
    });


    $("#btntemperatura").click(function () {
        idtiposensor = 1;
        sensoresxTiposensores(idtiposensor);
    });
    $("#btnhumedad").click(function () {
        idtiposensor = 2;
        sensoresxTiposensores(idtiposensor);
    });
    $("#btnnivel").click(function () {
        idtiposensor = 3;
        sensoresxTiposensores(idtiposensor);
    });
    $("#btnpluviometria").click(function () {
        idtiposensor = 5;
        sensoresxTiposensores(idtiposensor);
    });
    $("#btnacelerografos").click(function () {
        idtiposensor = 9;
        sensoresxTiposensores(idtiposensor);
    });
    $("#btnrayos").click(function () {
        getRayos();
    });
});

function cargar() {
    setInterval(sensoresxTiposensores(idtiposensor), 10000);
}

function sensoresxTiposensores(idtiposensor) {

    try {
        $.ajax({
            // url: "/sab/ServletTipoSensores",
            url: "https://sab.sire.gov.co/sab/ServletTipoSensores",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idtiposensor": idtiposensor
            },
            success: function (datos) {
                getMostrarmarcadores(datos);
            }
        });
    } catch (e) {
        alert(e.message);
    }
}

var imagen;
function getUltimaLecturaxSensor(idsensor) {
    try {
        $.ajax({
            url: "/sab/ServletUltimaLecturaSensor",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idsensor": idsensor
            },
            success: function (datos) {
                ultimalectura = datos.UltimaLectura;
                ultimaLecturaSensor = ultimalectura[0].VALORLECTURA;
                return ultimaLecturaSensor;
            }
        });
    } catch (e) {
        alert(e.message);
    }
}
var rayos;
function getRayos() {
    try {
        $.ajax({
            url: "http://190.66.34.22/idiger_web_service/servicio.php",
            type: 'POST',
            dataType: 'json',
            contentType: "text/xml",
            data: {
                "datos": rayos
            },
            success: function (data) {
            }
        });
    } catch (e) {
        alert(e.message);
    }
}

var markers = [];
var tecnologia;
var estadoimg;
var unidadmedida;
var fechalectura;
var valorLectura;
var estacion;
var idsensorEstacion;
var nombreEstacion = "Estación";
//var estacionT;
/**
 * Mostrar los sensores de todas las estaciones según el sensor
 * @param {type} datos Toda la información de los sensores
 * @returns {undefined}
 */
function getMostrarmarcadores(datos) {
    tiposensores = datos.TipoSensores;
    deleteMarkers();
    var marker;
    for (var i = 0; i < tiposensores.length; i++) {
        var position = new google.maps.LatLng(tiposensores[i].LATITUD, tiposensores[i].LONGITUD);
        estadoimg = tiposensores[i].IDTIPOSENSOR;
        valorLectura = tiposensores[i].VALORLECTURA;
        fechalectura = tiposensores[i].FECHALECTURA;
        var fechaLectura1 = fechalectura;
        var fechaLectura2 = fechalectura;
        var d = new Date();
        var fechafuera = new Date(fechaLectura1);
        var fecLec = fechafuera.getTime();
        var fecAc = d.getTime();
        var total = fecAc - fecLec;
        var estado = tiposensores[i].ESTADO;
        var unidad = tiposensores[i].UNIDADMEDIDA;
        var acumuladodia = tiposensores[i].ACUMULADODIA;

        if (fechalectura != null) {
            var str = fechalectura;
            var res = str.split(" ", 1);
            fechaLectura1 = str.slice(11, 16);
            var res1 = str.split(" ", 1);
            fechaLectura2 = str.slice(0, 11);
        }
//        if (estadoimg === 5) {
//            imagen = "img/" + estadoimg + "1T.png";
//        } else {
//            imagen = "img/" + estadoimg + "1.png";
//        }

//        if (screen.width < 1024)
//            document.write("Pequeña");
//        else
//        if (screen.width < 1280)
//            document.write("Mediana");
//        else
//            document.write("Grande");
        if (valorLectura > 0 && acumuladodia > 0 && acumuladodia <= 10 && estadoimg === 5) {
            if (screen.width < 1024) {
                imagen = "img/movil/" + estadoimg + "1.gif";
            } else {
                imagen = "img/" + estadoimg + "1.gif";
            }
        } else {
            if (valorLectura > 0 && acumuladodia > 10 && acumuladodia <= 30 && estadoimg === 5) {
                if (screen.width < 1024) {
                    imagen = "img/movil/" + estadoimg + "2T.gif";
                } else {
                    imagen = "img/" + estadoimg + "2T.gif";
                }
            } else {
                if (valorLectura > 0 && acumuladodia > 30 && acumuladodia <= 50 && estadoimg === 5) {
                    if (screen.width < 1024) {
                        imagen = "img/movil/" + estadoimg + "3T.gif";
                    } else {
                        imagen = "img/" + estadoimg + "3T.gif";
                    }
                } else {
                    if (valorLectura > 0 && acumuladodia > 30 && estadoimg === 5) {
                        if (screen.width < 1024) {
                            imagen = "img/movil/" + estadoimg + "4T.gif";
                        } else
                        {
                            imagen = "img/" + estadoimg + "4T.gif";
                        }
                    } else {
//                        if (lluvias == true && acumuladodia > 0) {
                        if (acumuladodia > 0 && acumuladodia <= 10 && estadoimg === 5) {
                            if (screen.width < 1024) {
                                imagen = "img/movil/" + estadoimg + "11.png";
                            } else {
                                imagen = "img/" + estadoimg + "11.png";
//                            }
                            }
                        } else {
                            if (acumuladodia > 10 && acumuladodia <= 30 && estadoimg === 5) {
                                if (screen.width < 1024) {
                                    imagen = "img/movil/" + estadoimg + "22.png";
                                } else {
                                    imagen = "img/" + estadoimg + "22.png";
                                }
                            } else {
                                if (acumuladodia > 30 && acumuladodia <= 50 && estadoimg === 5) {
                                    if (screen.width < 1024) {
                                        imagen = "img/movil/" + estadoimg + "33.png";
                                    } else {
                                        imagen = "img/" + estadoimg + "33.png";
                                    }
                                } else {
                                    if (acumuladodia > 50 && estadoimg === 5) {
                                        if (screen.width < 1024) {
                                            imagen = "img/movil/" + estadoimg + "44.png";
                                        } else {
                                            imagen = "img/" + estadoimg + "44.png";
                                        }
                                    } else {
                                        if (estadoimg === 5) {
                                            if (screen.width < 1024) {
                                                imagen = "img/movil/" + estadoimg + "1T.png";
                                            } else {
                                                imagen = "img/" + estadoimg + "1T.png";
                                            }
//                                            imagen = "img/" + estadoimg + "1.gif";
                                        } else {
                                            if (screen.width < 1024) {
                                                //íconos diferentes a lluvia
                                                imagen = "img/movil/" + estadoimg + "1.png";
                                            } else {
                                                imagen = "img/" + estadoimg + "1.png";
                                            }
                                            //íconos diferentes a lluvia
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        //Temperatura
        if (band == 5) {
            if (valorLectura >= 0 && valorLectura <= 15) {
                imagen = "img/" + estadoimg + "1.png";
            } else {
                if (valorLectura > 15 && valorLectura <= 18) {
                    imagen = "img/" + estadoimg + "2.png";
                } else {
                    if (valorLectura > 18 && valorLectura <= 21) {
                        imagen = "img/" + estadoimg + "3.png";
                    } else {
                        if (valorLectura > 21 && valorLectura <= 24) {
                            imagen = "img/" + estadoimg + "4.png";
                        } else {
                            if (valorLectura > 24 && valorLectura <= 30) {
                                imagen = "img/" + estadoimg + "5.png";
                            }
                        }
                    }
                }
            }
//            if (valorLectura >= 21 && valorLectura <= 24) {
//                imagen = "img/amarillo.gif";
//            } else {
//                if (valorLectura > 24) {
//                    imagen = "img/naranja.gif";
//                } else {
//                    imagen = "img/" + estadoimg + "1T.png";
////                    imagen = "img/azulcLARO.png";
//                }
//            }

        }
        //Acelerografos
        if (band == 7) {
            if (estadoimg == 9) {
                if (tiposensores[i].IDESTADOSSISMOS == 8) {
                    imagen = "";
                } else {
                    imagen = "img/9" + tiposensores[i].IDESTADOSSISMOS + ".png";
                }
            }
        }
//        }

        tecnologia = tiposensores[i].TIPOTECNOLOGIA;
        unidadmedida = tiposensores[i].UNIDADMEDIDA;
        estacion = tiposensores[i].ESTACION;
        idsensorEstacion = tiposensores[i].IDSENSOR + estacion;
        if (unidad == "Milimetros") {
            unidad = "mm";
        }
        if (unidad == "Grados") {
            unidad = "°C";
        }
        if (unidad == "Segundos") {
            unidad = "'";
        }
        if (fechaLectura2 == null && fechaLectura1 == null && acumuladodia == null) {
            fechaLectura2 = "No hay datos";
            fechaLectura1 = "No hay datos";
            acumuladodia = "No hay datos";
        }
        var content = "";
        var minimo;
        var alerta;
        if (tiposensores[i].IDSENSOR != 24000 && tiposensores[i].IDSENSOR != 25000 && tiposensores[i].IDSENSOR != 26000 && tiposensores[i].IDSENSOR != 27000)
            content = "<style>tr{border: #25AAE3 1px solid;} td{padding: 6px;}</style><table style='font-family: sans-serif;border-collapse: collapse;' border='1'><tr><th bgcolor='#25AAE3' colspan ='2' style='color: white;font-weight: bold;height: 28px; padding: 5px;text-transform: capitalize;'> ";
        else
            content = "<style>tr{border: #BFBFBF 1px solid;} td{padding: 6px;}</style><table style='font-family: sans-serif;border-collapse: collapse;' border='1'><tr><th bgcolor='#BFBFBF' colspan ='2' style='color: black;font-weight: bold;height: 28px; padding: 5px;text-transform: capitalize;'> ";
        var localidadM = tiposensores[i].LOCALIDAD.toLowerCase();
        var borde;
//Niveles de Cauce
        //Gravilleras
        if (tiposensores[i].IDSENSOR == 1001) {
            content += "Rio Tunjuelo ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Tunjuelo,Estación " + tiposensores[i].ESTACION;
            minimo = 2575.42;
            alerta = valorLectura + parseFloat(minimo);

            // valorLectura = tiposensores[i].VALORLECTURA;;
            var profundidad = 4.914;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2575.426 && alerta < 2576.84) {
//                    imagen = "img/" + estadoimg + "2.png";//azul
//                } else {
//                    if (alerta >= 2576.84 && alerta < 2577.84) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2577.84 && alerta < 2578.84) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2578.84 && alerta < 2580.34) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
            estacion = " ";
        }
//San Benito
        if (tiposensores[i].IDSENSOR == 17007) {
            content += "Rio Tunjuelo ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Tunjuelo,Estación " + tiposensores[i].ESTACION;
            minimo = 2554.04;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 8.21;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2554.04 && alerta < 2557.55) {
//                    imagen = "img/" + estadoimg + "2.png";//verde
//                } else {
//                    if (alerta >= 2557.55 && alerta < 2558.55) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2558.55 && alerta < 2559.55) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2559.55 && alerta < 2562.25) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
            estacion = " ";
        }
//La Independencia
        if (tiposensores[i].IDSENSOR == 19007) {
            content += "Rio Tunjuelo ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Tunjuelo,Estación " + tiposensores[i].ESTACION;
            minimo = 2540.34;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 6.96;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2540.34 && alerta < 2543.80) {
//                    imagen = "img/" + estadoimg + "2.png";//verde
//                } else {
//                    if (alerta >= 2543.80 && alerta < 2544.80) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2544.80 && alerta < 2545.80) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2545.80 && alerta < 2547.30) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
            estacion = " ";
        }
//Kennedy
        if (tiposensores[i].IDSENSOR == 22007) {
            content += "Rio Tunjuelo ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Tunjuelo,Estación " + tiposensores[i].ESTACION;
            minimo = 2543.58;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 4.965;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2543.59 && alerta < 2544.55) {
//                    imagen = "img/" + estadoimg + "2.png";//verde
//                } else {
//                    if (alerta >= 2544.55 && alerta < 2545.55) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2545.55 && alerta < 2546.55) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2546.55 && alerta < 2548.55) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
            estacion = " ";
        }
        //Molinos
        if (tiposensores[i].IDSENSOR == 8002) {
            content += "Quebrada Chiguaza ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Quebrada Chiguaza,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2579.88;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 5.143;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2579.89 && alerta < 2582.00) {
//                    imagen = "img/" + estadoimg + "2.png";//verde
//                } else {
//                    if (alerta >= 2582.00 && alerta < 2583.00) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2583.00 && alerta < 2584.00) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2584.00 && alerta < 2585.03) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
        }
        //Casas Fiscales
        if (tiposensores[i].IDSENSOR == 113) {
            content += "Quebrada Chiguaza ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Quebrada Chiguaza,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2558.00;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 4.425;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2558.00 && alerta < 2559.20) {
//                    imagen = "img/" + estadoimg + "2.png";//verde
//                } else {
//                    if (alerta >= 2559.20 && alerta < 2560.00) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2560.00 && alerta < 2560.80) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2560.80 && alerta < 2562.42) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
        }
        //Chicú
        if (tiposensores[i].IDSENSOR == 200164) {
            content += "Rio Bogotá ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Bogotá,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2558.50;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 6.677;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2558.50 && alerta <= 2561.24) {
//                    imagen = "img/" + estadoimg + "2.png";//azul
//                } else {
//                    if (alerta >= 2561.25 && alerta <= 2562.54) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2562.55 && alerta <= 2563.54) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2563.54 && alerta <= 2564.54) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
        }
        //La Ramada
        if (tiposensores[i].IDSENSOR == 200172) {
            content += "Rio Bogotá ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Bogotá,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2555.10;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 5.916;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);

            imagen = "img/" + estadoimg + "2.png";//azul
            /*  if (alerta < minimo) {
             imagen = "img/" + estadoimg + "1.png";
             } else {
             if (alerta >= 2555.10 && alerta <= 2557.29) {
             imagen = "img/" + estadoimg + "2.png";//azul
             } else {
             if (alerta >= 2557.30 && alerta <= 2558.49) {
             imagen = "img/" + estadoimg + "3.png";//amarilla
             } else
             {
             if (alerta >= 2558.50 && alerta <= 2559.49) {
             imagen = "img/" + estadoimg + "4.png";//naranja
             } else {
             if (alerta >= 2559.50 && alerta <= 2560.49) {
             imagen = "img/" + estadoimg + "4.png";//roja
             }
             }
             }
             }
             }*/
        }
        //El Tabaco
        if (tiposensores[i].IDSENSOR == 200180) {
            content += "Rio Bogotá ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Bogotá,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2545.20;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 5.851;
            var borde1 = profundidad - valorLectura;
            borde = borde1.toString();
            borde = borde.substring(0, 4);

            imagen = "img/" + estadoimg + "2.png";//azul
            /*  if (alerta < minimo) {
             imagen = "img/" + estadoimg + "1.png";
             } else {
             if (alerta >= 2545.20 && alerta <= 2547.74) {
             imagen = "img/" + estadoimg + "2.png";//azul
             } else {
             if (alerta >= 2547.75 && alerta <= 2548.74) {
             imagen = "img/" + estadoimg + "3.png";//amarilla
             } else
             {
             if (alerta >= 2548.75 && alerta <= 2549.74) {
             imagen = "img/" + estadoimg + "4.png";//naranja
             } else {
             if (alerta >= 2549.75 && alerta < 2550.64) {
             imagen = "img/" + estadoimg + "4.png";//roja
             }
             }
             }
             }
             }*/
        }
        //Guaymaral
        if (tiposensores[i].IDSENSOR == 200204) {
            content += "Rio Bogotá ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Rio Bogotá,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2564.30;
            alerta = valorLectura + parseFloat(minimo);
            var profundidad = 5.158;
            var borde1 = profundidad - valorLectura;
            var borde = borde1.toString();
            borde = borde.substring(0, 4);
            imagen = "img/" + estadoimg + "2.png";//azul
//            if (alerta < minimo) {
//                imagen = "img/" + estadoimg + "1.png";
//            } else {
//                if (alerta >= 2564.30 && alerta <= 2565.93) {
//                    imagen = "img/" + estadoimg + "2.png";//azul
//                } else {
//                    if (alerta >= 2565.94 && alerta <= 2567.23) {
//                        imagen = "img/" + estadoimg + "3.png";//amarilla
//                    } else
//                    {
//                        if (alerta >= 2567.24 && alerta <= 2568.230) {
//                            imagen = "img/" + estadoimg + "4.png";//naranja
//                        } else {
//                            if (alerta >= 2568.24 && alerta <= 2569.23) {
//                                imagen = "img/" + estadoimg + "4.png";//roja
//                            }
//                        }
//                    }
//                }
//            }
        }
        if (tiposensores[i].IDSENSOR == 63) {
            content += "Quebrada Limas ";
            content += "</br>Estación " + tiposensores[i].ESTACION;
            nombreEstacion = "Quebrada Limas,Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            minimo = 2568.84;
        }
        //Estaciones Acueducto
        if (tiposensores[i].IDSENSOR == 24000 || tiposensores[i].IDSENSOR == 25000 || tiposensores[i].IDSENSOR == 26000 || tiposensores[i].IDSENSOR == 27000) {
            imagen = "img/" + estadoimg + "0.png";

//            content += "Acueducto de Bogotá ";
//            tiposensores[i].IDSENSOR == 25000 ? content += "</br>Río Bogotá " : " ";
            if (tiposensores[i].IDSENSOR == 24000 || tiposensores[i].IDSENSOR == 26000 || tiposensores[i].IDSENSOR == 25000) {
                content += "</br>Río Bogotá ";
                nombreEstacion = "Rio Bogotá,Estación " + tiposensores[i].ESTACION;
            }
            if (tiposensores[i].IDSENSOR == 27000) {
                content += "</br>Río  San Cristobal ";
                nombreEstacion = "Rio San Cristobal,Estación " + tiposensores[i].ESTACION;
            }
            content += "</br>Estación " + tiposensores[i].ESTACION;
            estacion = " ";
            borde = "";
        }
        if (estadoimg == 5 || estadoimg == 1 || estadoimg == 9) {
            content += nombreEstacion + " " + tiposensores[i].ESTACION;

            content += "</br>" + localidadM;
        }
        content += "</th> </tr></br>";
        if (band != 7 && tiposensores[i].IDSENSOR != 24000 && tiposensores[i].IDSENSOR != 25000 && tiposensores[i].IDSENSOR != 26000 && tiposensores[i].IDSENSOR != 27000) {
            content += "<tr><td>Fecha Última lectura: </td><td style='text-align: center;'><b>" + fechaLectura2 + "</b> </br></td><tr>";
            content += "<tr><td>Hora Última lectura: </td><td style='text-align: center;'><b>" + fechaLectura1 + "</b> </br></td><tr>";
        } else {

            if (tiposensores[i].IDSENSOR != 24000 && tiposensores[i].IDSENSOR != 25000 && tiposensores[i].IDSENSOR != 26000 && tiposensores[i].IDSENSOR != 27000) {
                //Tipo sensor Acelerografos,Niveles Acueducto
                /* if (tiposensores[i].CODIGO != null) {
                 content += "<tr><td>Código: </td><td style='text-align: center;'><b>" + tiposensores[i].CODIGO + "</b></br></td><tr>";
                 }
                 content += "<tr><td>Latitud (°N): </td><td style='text-align: center;'><b>" + tiposensores[i].LATITUD.toFixed(2) + "</b></br></td><tr>";
                 content += "<tr><td>Longitud (°E): </td><td style='text-align: center;'><b>" + tiposensores[i].LONGITUD.toFixed(2) + "</b></br></td><tr>";
                 content += "<tr><td>Elevación (msnm): </td><td style='text-align: center;'><b>" + tiposensores[i].ALTITUD + "</b></br></td><tr>";
                 content += "<tr><td>Geología: </td><td style='text-align: center;'><b>" + tiposensores[i].GEOLOGIA + "</b></br></td><tr>";
                 content += "<tr><td>Tipo de tecnología: </td><td style='text-align: center;'><b>" + tiposensores[i].TIPOTECNOLOGIA + "</b> </br></td><tr>";
                 if (tiposensores[i].ESTADOESTACION == 1) {
                 content += "<tr></table> </br><center><button type='button' style='padding: 5px;' onclick=abriracelerogramas('" + tiposensores[i].IDESTACION + "');>Ver registros</button></center>";
                 }*/
            } else {
                content += "<tr></table> </br><center><button type='button' style='padding: 5px;' onclick=abrirNivelesAcueducto('" + tiposensores[i].IDSENSOR + "');>Ver Niveles</button></center>";
            }
        }

        //Tipo Sensor Temperatura
        if (estadoimg == 1) {
            var temp;
            if (tiposensores[i].VALORLECTURA != null) {
                temp = tiposensores[i].VALORLECTURA.toFixed(1);
            }
//            console.log(n);
//            var conDecimal = tiposensores[i].VALORLECTURA.toFixed(2);
            content += "<tr><td>Temperatura actual (" + unidad + "):  </td><td style='text-align: center;'><b> " + temp + "</b></td><tr></table> </br>";
            content += "<center><button type='button' style='padding: 5px;' onclick=abrirgraficas('" + tiposensores[i].IDSENSOR + "','" + "');>Ver registros</button></center>";
        }

//Boton Tipo Sensor LLuvia
        if (estadoimg == 5) {
            content += "<tr><td>Acumulado de hoy (" + unidad + "):  </td><td style='text-align: center;'><b> " + acumuladodia + "</b></td><tr></table> </br>";
            content += "<center><button type='button' style='padding: 5px;' onclick=abrirgraficas('" + tiposensores[i].IDSENSOR + "','" + acumuladodia + "');>Ver registros</button></center>";
//            estacionT = tiposensores[i].ESTACION;
        }
        //Botón Tipo sensor Niveles
        if (tiposensores[i].IDSENSOR == 1001 ||
                tiposensores[i].IDSENSOR == 17007 || tiposensores[i].IDSENSOR == 19007 ||
                tiposensores[i].IDSENSOR == 22007 || tiposensores[i].IDSENSOR == 8002
                || tiposensores[i].IDSENSOR == 113
                || tiposensores[i].IDSENSOR == 63 || tiposensores[i].IDSENSOR == 200164
                || tiposensores[i].IDSENSOR == 200172 || tiposensores[i].IDSENSOR == 200180
                || tiposensores[i].IDSENSOR == 200204
                ) {
            content += "<tr><td>Borde Libre(m): </td><td style='text-align: center;'><b>" + borde + "</b> </br></td><tr>";
            content += "</table> </br>";
           // if (tiposensores[i].IDSENSOR !== 113)
                content += "<center><button type='button' style='padding: 5px;' onclick=abrirNiveles('" + tiposensores[i].IDSENSOR + "');>Ver niveles</button></center>";
        }
        content += "</table> </br>";

        var imgtiposensor = {
            url: imagen,
//            size: new google.maps.Size(30, 41),
//            origin: new google.maps.Point(0, 0),
//            anchor: new google.maps.Point(15, 41)
        };
        if (tiposensores[i].IDSENSOR != 355 &&
                //tiposensores[i].IDSENSOR != 45 &&
                tiposensores[i].IDSENSOR != 315
                && tiposensores[i].IDSENSOR != 325 && tiposensores[i].IDSENSOR != 335 && tiposensores[i].IDSENSOR != 345 && tiposensores[i].IDSENSOR != 365
                && tiposensores[i].IDSENSOR != 375 && tiposensores[i].IDSENSOR != 385 && tiposensores[i].IDSENSOR != 4005 && tiposensores[i].IDSENSOR != 5005
                //&& tiposensores[i].IDSENSOR != 4001
                //&& tiposensores[i].IDSENSOR != 7001
                && tiposensores[i].IDSENSOR != 22008 && tiposensores[i].IDSENSOR != 501 && tiposensores[i].IDSENSOR != 395 && tiposensores[i].IDSENSOR != 63 &&
                //Sensores de temperatura
                tiposensores[i].IDSENSOR != 503 && tiposensores[i].IDSENSOR != 1003 && tiposensores[i].IDSENSOR != 6003 && tiposensores[i].IDSENSOR != 123
                && tiposensores[i].IDSENSOR != 769) {
            addMarker(position, imgtiposensor, tiposensores[i].IDSENSOR, tiposensores[i].TIPOSENSOR, content, borde);

        }
//        else {
//            var contenido = "Estación " + estacion;
//            addMarker(position, imgtiposensor, tiposensores[i].IDSENSOR, tiposensores[i].TIPOSENSOR, contenido);
//        }

    }

}
/**
 * Agregar los marcadores en el mapa de cada uno de los sensores
 * @param {type} location latitud y longitud de los sensores
 * @param {type} imgtsensor Imagen de cada sensor
 * @param {type} idsensorl Id del sensor
 * @param {type} tipoSensor Id tipo sensor
 * @param {type} content Información del marcador
 * @returns {undefined}
 */
function addMarker(location, imgtsensor, idsensorl, tipoSensor, content, borde) {
    if (tipoSensor == "Nivel") {
        var marker = new MarkerWithLabel({
            position: location,
            icon: imgtsensor,
            title: nombreEstacion + " " + estacion,
            // estacion + "," + tecnologia + ", Fecha: " + fechalectura + ", Lectura: " + valorLectura + ", Sensor: " + tipoSensor,
            labelContent: borde,
            labelAnchor: new google.maps.Point(-4, 25),
            labelClass: "labels",
            labelInBackground: false,
            labelStyle: {opacity: 0.9},
            map: map
        });
    } else {
        var marker = new google.maps.Marker({
            position: location,
            icon: imgtsensor,
            map: map,
            title: nombreEstacion + " " + estacion
        });
    }

    var infowindow = new google.maps.InfoWindow({});
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.close();
        infowindow.setContent(content);
        infowindow.open(map, marker);
        marker.setIcon(imgtsensor);
    });

    markers.push(marker);
}
function deleteMarkers() {
    clearMarkers();
    markers = [];
    markers.length = 0;
}
function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setAllMap(null);
}
function getLecturas(idsensor)
{
    try {
        $.ajax({
            url: "/sab/ServletLecturas",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idsensor": idsensor
            },
            success: function (datos) {
                getMostrarLecturas(datos);
            }
        });
    } catch (e) {
        alert(e.message);
    }
}

var idsensorchart;
var valorlectura;
function getMostrarLecturas(datos) {
    var tablamostrar;
    $('.overlay-container').fadeIn(function () {
        window.setTimeout(function () {
            $('.window-container').addClass('window-container-visible');
        }, 100);
    });
    lecturas = datos.Lecturas;
    if (lecturas == "") {
        tablamostrar = "<table id='grafica' width='378' border='0' cellpadding=0 cellspacing=0><tr><th width='368' scope='col'>No hay registro de lecturas para este sensor</th></tr></table>";
    } else {
        tablamostrar = "<table width='450' border='1' align='center' cellpadding=0 cellspacing=0><tr><th>Fecha</th>"
        tablamostrar += "<th>Lectura Sensor (" + unidadmedida + ") </th>"
        tablamostrar += "<th>Estado</th>"
        for (var i = 0; i < lecturas.length; i++) {
            valorlectura = lecturas[i].IDSENSOR;
            tablamostrar += "<tr>"
            tablamostrar += "<th>" + lecturas[i].FECHALECTURA + "</th>"
            tablamostrar += "<th>" + lecturas[i].VALORLECTURA + "</th>"
            if (lecturas[i].VALORLECTURA > 0) {
                if (estadoimg == 5) {
                    tablamostrar += "<th><img src='img/lluvias.gif'/>" + "</th>"
                } else {
                    tablamostrar += "<th><img src='img/" + estadoimg + "2.png'/>" + "</th>"
                }
            } else {
                if (estadoimg == 5) {
                    tablamostrar += "<th><img src='img/" + estadoimg + "2.png'/></th>"
                } else {
                    tablamostrar += "<th><img src='img/" + estadoimg + "1.png'/></th>"
                }
            }
            tablamostrar += " </tr>"
        }
        tablamostrar += "</tr></table>"
        tablamostrar += "<button type='button' onclick='getConsolidados(" + valorlectura + ");'>Consolidados</button>"
    }
    $("#tablachart").html(tablamostrar);
}
function getConsolidados(idsensor)
{
    try {
        $.ajax({
            url: "/sab/ServletConsolidados",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idsensor": idsensor
            },
            success: function (datos) {
                getMostrarConsolidados(datos)
            }
        });
    } catch (e) {
        alert(e.message);
    }
}

function getMostrarConsolidados(datos) {
    var tablamostrar;
    $('.overlay-container').fadeIn(function () {
        window.setTimeout(function () {
            $('.window-container').addClass('window-container-visible');
        }, 100);
    });

    consolidados = datos.Consolidados;
    if (consolidados == "") {
        tablamostrar = "<table width='120' border='0' cellpadding=0 cellspacing=0><tr><th width='368' scope='col'>No hay registro de lecturas para este sensor</th></tr></table>";
    } else {
        tablamostrar = "<table width='566' border='1' align='center' cellpadding=0 cellspacing=0><tr><th>Fecha Lectura</th>"
        tablamostrar += "<th>Minimo</th>"
        tablamostrar += "<th>Maximo</th>"
        tablamostrar += "<th>Promedio</th>"
        tablamostrar += "<th>Acumulado</th>"
        tablamostrar += "<th>Conteo Total</th>"
        for (var i = 0; i < consolidados.length; i++) {
            fecha = consolidados[i].FECHALECTURA;
            fechafinal = fecha.substring(0, 11);
            tablamostrar += "<tr>"
            tablamostrar += "<th>" + fechafinal + "</th>"
            tablamostrar += "<th>" + consolidados[i].MINIMO + "</th>"
            tablamostrar += "<th>" + consolidados[i].MAXIMO + "</th>"
            tablamostrar += "<th>" + consolidados[i].PROMEDIO + "</th>"
            tablamostrar += "<th>" + consolidados[i].ACUMULADO + "</th>"
            tablamostrar += "<th>" + consolidados[i].LECTURAS + "</th>"
            tablamostrar += " </tr>"
        }
        tablamostrar += "</tr></table>"
    }
    $("#tablachart").html(tablamostrar);
}
/**
 * Abris página de gráficas
 * @param {type} url
 * @returns {undefined}
 */
document.write("<" + "script type='text/javascript' src='js/grafica.js'><" + "/script>");
function abrirgraficas(idesensor, acumuladoDia) {
    $.ajax({
        // url: "/sab/ServletTipoSensores",
        url: "https://sab.sire.gov.co/sab/ServletTipoSensores",
        type: 'POST',
        dataType: 'json',
        context: document.body,
        data: {
            "idtiposensor": estadoimg
        },
        success: function (datos) {
            var estacionT;
            var localidad;
//            var acumuladoDia;
            tiposensores = datos.TipoSensores;
            for (var i = 0; i < tiposensores.length; i++) {
                if (tiposensores[i].IDSENSOR == idesensor) {
                    estacionT = tiposensores[i].ESTACION;
                    localidad = tiposensores[i].LOCALIDAD;
//                    acumuladoDia = tiposensores[i].ACUMULADODIA;
                }
            }
            var graficas = "<iframe id='frame' scrolling='no' allowtransparency='true'  style='border:0px; margin:0 auto; position:absolute; right:0; left:0;' height='636px' width='95%' src='https://sab.sire.gov.co/sab/faces/graficas.xhtml?idsensorv=" + idesensor + "&tiposensorv=" + estadoimg + "&medidav=" + unidadmedida + "&estacionv=" + estacionT + "&acumuladoDiav=" + acumuladoDia + "&localidadv=" + localidad + "'></iframe>";
            //window.open(graficas, '_blank');
            if (estadoimg == 5) {
                $(".grafica").css("height", "639px");
            }
            if (estadoimg == 1) {
                $(".grafica").css("height", "485px");
            }
            $(".grafica").html(graficas);
            $(".grafica").show(1000);

//
//            if (graficas == null || typeof (graficas) == 'undefined') {
//                alert('Por favor deshabilita el bloqueador de ventanas emergentes .');
//            }
//            else {
//                graficas.focus();
//            }
        }
    });
}
function abrirNiveles(idesensor) {
    var graficas = "https://sab.sire.gov.co/Nivel/?sensor=" + idesensor;
    window.open(graficas, '_blank');

}
function abrirNivelesAcueducto(idsensor) {
    var niveles;
    if (idsensor == 24000) {
        niveles = "https://www.acueducto.com.co/wasapp2/sih/servlet/sihController?opcion=verCorteTransversal&estacion=20965&tipoGrafico=linea";
    }
    if (idsensor == 25000) {
        niveles = "https://www.acueducto.com.co/wasapp2/sih/servlet/sihController?opcion=verCorteTransversal&estacion=20970&tipoGrafico=linea";
    }
    if (idsensor == 26000) {
        niveles = "https://www.acueducto.com.co/wasapp2/sih/servlet/sihController?opcion=verCorteTransversal&estacion=20967&tipoGrafico=linea";
    }
    if (idsensor == 27000) {
        niveles = "https://www.acueducto.com.co/wasapp2/sih/servlet/sihController?opcion=verCorteTransversal&estacion=20990&tipoGrafico=linea";
    }
    window.open(niveles, '_blank');

}
/**
 * Activar o desactivar SAB
 */
function getMostrarMenu() {
    $("#btnradar1").css({'display': 'block'});
    $(".barRadar").css({'display': 'block'});
    $(".barLluvias").css({'display': 'block'});
    $("#btntemperatural").remove();
    $("#btnDiassin1").remove();
    $(".barTemp").remove();
    if (band != 3)
        $(".barTempe").remove();
    $("#btnhumedadl").remove();
    $("#btnnivell").remove();
    $("#btnpluviometrial").remove();
    $("#btnSismo1").remove();
    $("#btnlocalidadesl").remove();
    $(".barSismos").remove();
    $(".barNiveles").remove();
    $("#titulolluvia").remove();
    $('h1').css({'fontSize': '100px', 'color': 'red'});
    $('#menu').css({'height': '37px', 'top': '134px'});
    $("#btnalta").remove();
    $("#btnmedia").remove();
    $("#btnbaja").remove();
    $("#btnseguimiento").remove();


    if (band != 1) {
        $("#controlUsuario").remove();
    }
    if (band == 3) {
        $(".barTempe").css({'display': 'block'});
        $(".barLluvias").remove();
    }
    if (band == 6) {
        /*  $("#titulolluvia").html("Priorización por LLuvia");
         $('#menu').css({'height': '152px', 'top': '67px', 'width': '178px'});
         $('h1').css({'fontSize': '100px', 'color': 'red'});*/

    } else {
        $("#titulolluvia").remove();
        $('h1').css({'fontSize': '100px', 'color': 'red'});
        $('#menu').css({'height': '37px', 'top': '134px'});
        $("#btnalta").remove();
        $("#btnmedia").remove();
        $("#btnbaja").remove();
        $("#btnseguimiento").remove();
        $(".barSismos").remove();
    }

}

/**
 * Activar solo Niveles de Cauce
 */
function getMostrarNiveles() {
    $("#btnnivell").css({'display': 'block'});
    $("#btnradar1").css({'display': 'block'});
    $(".barRadar").css({'display': 'block'});
    $("#btntemperatural").remove();
    $("#btnDiassin1").remove();
    $(".barTemp").remove();
    $(".barTempe").remove();
    $("#btnhumedadl").remove();
    $(".barSismos").remove();
    $(".barLluvias").remove();
    $("#btnpluviometrial").remove();
    $("#btnSismo1").remove();
    $("#btnlocalidadesl").remove();
    $("#controlUsuario").remove();
    $("#btnalta").remove();
    $("#btnmedia").remove();
    $("#btnbaja").remove();
    $("#btnseguimiento").remove();
    $('h1').css({'fontSize': '100px', 'color': 'red'});
    $("#btnradar1").css({'position': 'relative', 'top': '-36px', 'left': '3px'});
//    $('#menu').css({'height': '51px', 'top': '115px'});
    $('#menu').css({'height': '121px', 'top': '55px'});
    $('#menuSensores').css({'top': '-4px'});
}
/**
 * Activar solo Temperatura
 */
function getMostrarTemperatura() {
    $("#btntemperatural").css({'display': 'block'});
    $("#btnDiassin1").css({'display': 'block'});
    $(".barTemp").css({'display': 'block'});
    $("#btnradar1").css({'display': 'block'});
    $("#btnnivell").remove();
    $("#btnpluviometrial").remove();
    $("#btnSismo1").remove();
    $("#btnlocalidadesl").remove();
    $("#controlUsuario").remove();
    $("#btnalta").remove();
    $("#btnmedia").remove();
    $("#btnbaja").remove();
    $("#btnseguimiento").remove();
    $('h1').css({'fontSize': '100px', 'color': 'red'});
    $('#menu').css({'height': '92px', 'top': '86px', width: '265px'});
    $(".barRadar").remove();
    $(".barLluvias").remove();
    $(".barNiveles").remove();
    $(".barSismos").remove();
    $(".barTempe").remove();
    var dt = new Date();
    dt.setHours(dt.getHours() + 12);
    var month = dt.getMonth() + 1;
    var day = dt.getDate() - 1;
    var year = dt.getFullYear();
    var diaantes = '(' + day + '-' + month + '-' + year + ')';
    $("#hora").html(diaantes);
    $("#btnradar1").css({'position': 'relative', 'top': '-35px'});
    $("#btnDiassin1").css({'position': 'relative', 'top': '-36px'});


}
/**
 * Activar solo Acelerografo
 */
function getMostrarAcelerografo() {
    document.getElementById('btnradar').checked == false;
    $(".barSismos").css({'display': 'block'});
    $("#btntemperatural").remove();
    $("#btnDiassin1").remove();
    $(".barTemp").remove();
    $(".barTempe").remove();
    $("#btnhumedadl").remove();
    $("#btnnivell").remove();
    $("#btnpluviometrial").remove();
//    $("#btnacelerografosl").remove();
    $("#btnlocalidadesl").remove();
    $("#controlUsuario").remove();
    $("#btnalta").remove();
    $("#btnmedia").remove();
    $("#btnbaja").remove();
    $("#btnseguimiento").remove();
    $("#btnradar1").remove();
    $(".barRadar").remove();
    $(".barLluvias").remove();
    $(".barNiveles").remove();
    $("#menu").remove();

//    $('h1').css({'fontSize': '100px', 'color': 'red'});
//    $('#menu').css({'height': '55px', 'top': '134px', 'width': '215px'});

    activarSismo();
}


/**
 * Activar o desactivar SAB
 */
function getMostrarMenuReportes() {
    $("#btntemperatural").remove();
    $("#btnDiassin1").remove();
    $(".barTemp").remove();
    $(".barTempe").remove();
    $("#btnradar").remove();
    $(".rmLeftImage").remove();
    $("#btnhumedadl").remove();
    $("#btnnivell").remove();
    $("#btnpluviometrial").remove();
    $("#btnSismo1").remove();
    $("#btnlocalidadesl").remove();
    $("#controlUsuario").remove();
    $("#btnalta").remove();
    $("#btnmedia").remove();
    $("#btnbaja").remove();
    $("#btnseguimiento").remove();
    $("#menu").remove();
    $('h1').css({'fontSize': '100px', 'color': 'red'});
    $('#menu').css({'height': '51px', 'top': '134px'});
    $(".barSismos").remove();
    $(".barNiveles").remove();
}
/*function puntosRemocion() {

 try {
 $.ajax({
 url: "/sab/ServletRemocion",
 type: 'POST',
 dataType: 'json',
 context: document.body,
 //            data: {
 //                "idtiposensor": idtiposensor
 //            },
 success: function (datos) {
 getMostrarRemocion(datos);
 }
 });
 } catch (e) {
 alert(e.message);
 }
 }
 var remocion;
 function getMostrarRemocion(datos) {
 remocion = datos.Remocion;
 var imagen;
 deleteMarkers();
 var marker1;

 for (var i = 0; i < remocion.length; i++) {
 var position = new google.maps.LatLng(remocion[i].LATITUD, remocion[i].LONGITUD);

 if (remocion[i].ESTADOREMOCION == "ALTA") {
 imagen = "img/alta.png";
 }
 if (remocion[i].ESTADOREMOCION == "MEDIA") {
 imagen = "img/media.png";
 }
 if (remocion[i].ESTADOREMOCION == "BAJA") {
 imagen = "img/baja.png";
 }
 if (remocion[i].ESTADOREMOCION == "SEGUIMIENTO") {
 imagen = "img/seguimiento.png";
 }

 var content = "";

 content = "<style>tr{border: #25AAE3 1px solid;} td{padding: 6px;}</style><table style='font-family: sans-serif;border-collapse: collapse;' border='1'><tr><th bgcolor='#25AAE3' colspan ='2' style='color: white;font-weight: bold;height: 28px; padding: 5px;'> ";
 content += +"</br> Estación " + remocion[i].ESTACION;
 content += "</th> </tr></br>";
 content += "<tr><td>Nombre: </td><td style='text-align: center;'><b>" + remocion[i].NOMBRE + "</b> </br></td><tr>";
 content += "<tr><td>Localidad: </td><td style='text-align: center;'><b>" + remocion[i].LOCALIDAD + "</b> </br></td><tr>";
 content += "<tr><td>Priorización por Lluvia: </td><td style='text-align: center;'><b>" + remocion[i].ESTADOREMOCION + "</b> </br></td><tr>";
 content += "</table> </br>";
 //        content += "<center><button type='button' style='padding: 5px;' onclick=abrirNiveles('" + remocion[i].IDREMOCION + "');>Ver Datos</button></center>";
 content += "</table> </br>";

 var imgRemocion = {
 url: imagen,
 size: new google.maps.Size(30, 41),
 origin: new google.maps.Point(0, 0),
 anchor: new google.maps.Point(15, 41)
 };
 marcador(position, imgRemocion, remocion[i].NOMBRE, content);

 }

 }
 function marcador(location, imgremocion, estacion, content) {
 var marker1 = new MarkerWithLabel({
 position: location,
 icon: imgremocion,
 title: estacion,
 // estacion + "," + tecnologia + ", Fecha: " + fechalectura + ", Lectura: " + valorLectura + ", Sensor: " + tipoSensor,
 //        labelContent: " Lectura: " + valorLectura,
 labelAnchor: new google.maps.Point(-4, 25),
 labelClass: "labels",
 labelStyle: {opacity: 0.9},
 map: map
 });

 var infowindow = new google.maps.InfoWindow({});
 google.maps.event.addListener(marker1, 'click', function () {
 infowindow.close();
 infowindow.setContent(content);
 infowindow.open(map, marker1);
 marker1.setIcon(imgremocion);
 });
 markers.push(marker1);
 }
 function deleteMarkers() {
 clearMarkers();
 markers = [];
 markers.length = 0;
 }
 function setAllMap(map) {
 for (var i = 0; i < markers.length; i++) {
 markers[i].setMap(map);
 }
 }

 function clearMarkers() {
 setAllMap(null);
 }*/
function activarNivel() {
//    if (band == 2) {
    if (document.getElementById('btnnivel').checked) {
        var niveles = "<iframe id='frame' scrolling='no' allowtransparency='true'  style='border:0px; margin:0 auto; position:absolute; right:0; left:0;' height='658px' width='600px' src='faces/niveles.xhtml'></iframe>";
        $(".grafica").css("width", "600px");
        $(".grafica").css("height", "658px");
        $(".grafica").html(niveles);
        $(".grafica").show(1000);
    } else {
        $(".grafica").hide(1000);
    }
//    }
}
function activarDiasSin() {
    if (band == 5) {
        if (document.getElementById('btnDiassin').checked == true) {
            var diaSin = "<iframe id='frame' scrolling='no' allowtransparency='true'  style='border:0px; margin:0 auto; position:absolute; right:0; left:0; 'height='636px' width='95%' src='faces/sinLluvias.xhtml'></iframe>";
            $(".grafica").css("height", "638px");
            $(".grafica").html(diaSin);
            $(".grafica").show(1000);
        } else {
            $(".grafica").hide(1000);
        }
    }
}
function activarTemperatura() {
    if (band == 5) {
        if (document.getElementById('btntemperatura').checked == true) {
            sensoresxTiposensores(1);
        } else {
            sensoresxTiposensores(-1);
        }

    }
}
function activarSismo() {
    try {
        $.ajax({
            url: "/sab/ServletUltimoSismos",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idsensor": idsensor
            },
            success: function (datos) {
                var lecturas = datos.Sismos;
                var tablasismos;
                tablasismos = "<center><table id='tablaSismos' style='top: -122px;font-size: 16px;align:center;left:392px;font-family: sans-serif;border-collapse: collapse;width: 501px;position: relative;' border='1'>";
                tablasismos += " <td bgcolor='#25AAE3'  style='border: #25AAE3 1px solid;text-align: center;color: white;font-weight: bold;padding: 12px;' colspan='2' align='center'>Aceleraciones registradas por la Red de Monitoreo del IDIGER </td></table></center>";


                tablasismos += "<table style='font-size: 13px;font-family: sans-serif;border-collapse: collapse;width: 100%;position: relative;top: -44px;' border='1'>";
                tablasismos += " <td bgcolor='#25AAE3'  style='border: #25AAE3 1px solid;text-align: center;color: white;font-weight: bold;padding: 6px;' colspan='2' align='center'>EVENTO SÍSMICO* </td>";
                for (var i = 0; i < lecturas.length; i++) {
                    var fechalectura = lecturas[i].FECHA;
                    var hora = fechalectura;
                    var fecha = fechalectura;
                    var fechafuera = new Date(hora);

                    if (fechalectura != null) {
                        var str = fechalectura;
                        var res = str.split(" ", 1);
                        hora = str.slice(11, 16);
                        var res1 = str.split(" ", 1);
                        fecha = str.slice(0, 11);
                    }
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Epicentro:</th><td style='padding: 3px;width:55px;text-align:left;'>" + lecturas[i].EPICENTRO + "</td></tr>";
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Fecha(AAAA-MM-DD) :</th><td style='padding: 3px;width:55px;text-align:left;'>" + fecha + "</td></tr>";
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Hora Local** :</th><td style='padding: 3px;width:55px;text-align:left;'>" + hora + "</td></tr>";
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Magnitud :</th><td style='padding: 3px;width:55px;text-align:left;'>" + lecturas[i].MAGNITUD + "</td ></tr>";
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Profundidad:</th><td style='padding: 3px;width:55px;text-align:left;'>" + lecturas[i].PROFUNDIDAD + "</td></tr>";
                    tablasismos += "<tr style='border: #25AAE3 1px solid;'><th style='width:55px;text-align:left;'>Distancia a Bogotá D.C.:</th><td style='padding: 3px;width:55px;text-align:left;'>" + lecturas[i].DISTANCIABOGOTA + "</td></tr>";
                }
                tablasismos += " <td bgcolor='#d9d9d9' style='border: #25AAE3 1px solid;font-size: 10px;text-align: left;color: black;padding: 6px;' colspan='2' >* La magnitud y localización del evento sísmico es tomada de los reportes emitidos por el Servicio Geológico Colombiano</td>";
                tablasismos += "<tr  bgcolor='#d9d9d9'style='border: #25AAE3 1px solid;'><td style='border: #25AAE3 1px solid;font-size: 10px;' colspan='2'>** Hora UTC = Hora Local + 5 horas</td></tr>"
                tablasismos += "</table>";
                var sismos = "<iframe id='frame1' scrolling='no' allowtransparency='true' style='border:0px; margin:0 auto; position:absolute; right:0; left:16px' height='244px' width='458px'  src='faces/sismos.xhtml'></iframe>";
                $(".sismo").css("width", "317px");
                $(".sismo").css("height", "238px");
                $(".sismo").css("top", "107px");
                $(".sismo").html(sismos);
                $(".sismo").html(tablasismos);
                $(".sismo").show(1000);
            }
        });
    } catch (e) {
        alert(e.message);
    }
}
function abriracelerogramas(idestacion) {
    var acelerogramas = "<iframe id='frame1' scrolling='no' allowtransparency='true' style='border:0px; margin:0 auto; position:absolute; right:0; left:-16px' height='636px' width='95%'  src='faces/acelerogramas.xhtml?idestacionv=" + idestacion + "'></iframe>";
    $(".grafica").css("height", "384px");
    $(".grafica").css("width", "458px");
    $(".grafica").html(acelerogramas);
    $(".grafica").show(1000);
}
