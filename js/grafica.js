var idsensor = datosURL('idsensorv');
var tiposensor = datosURL('tiposensorv');
var unidadmedida = datosURL('medidav');
var estacion = datosURL('estacionv');
var acumuladoDia = datosURL('acumuladoDiav');
var localidad = datosURL('localidadv');
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
function drawChart() {
    try {
        var fecha;
        $.ajax({
            url: "/sab/ServletLecturas",
            type: 'POST',
            dataType: 'json',
            context: document.body,
            data: {
                "idsensor": idsensor
            },
            success: function (datos) {


//                getMostrarLecturas(datos);
//Lluvia
                if (tiposensor == 5) {
                    getGrafica(datos);
                    getUltimasLecturas(idsensor);
                }
                //Temperatura
                if (tiposensor == 1) {
                    getGraficaTemperatura(datos);
                }
                var lecturas = datos.Lecturas;
//                var color = '#FFFFFF';
//                var linea;
//                if (lecturas.length !== 0) {
//                    var dataArray = [];
//                    var Header = ['Tiempo', 'Precipitacion'];
//                    dataArray.push(Header);
//                    for (var i = 37; i > 0; i--) {
////                        if (i % 2 != 0) {
//                        fecha = lecturas[i].FECHALECTURA;
//                        var str = fecha;
//                        var res = str.split(" ", 1);
//                        var fechaLectura = str.slice(11, 16);
//                        var temp = [];
//                        temp.push(fechaLectura);
//                        temp.push(lecturas[i].VALORLECTURA);
//                        if (lecturas[i].VALORLECTURA != 0) {
//                            color = "#25AAE3";
//                        }
//                        if (lecturas[i].VALORLECTURA >= 5) {
//                            linea = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//                        } else {
//                            linea = [0, 1, 2, 3, 4, 5];
//
//                        }
////                        }
//                        dataArray.push(temp);
//
//                    }
//                    var data = new google.visualization.arrayToDataTable(dataArray);
//
//
//                    var options = {
//                        title: ' ',
//                        chartArea: {width: '70%'},
//                        hAxis: {title: 'Tiempo Minutos\n' + res + '\n'},
////                        hAxis: {title: 'Fecha ' + res, titleTextStyle: {color: '#25AAE3'}},
////                        vAxis: {ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
//                        vAxis: {title: 'Precipitacion(mm)', ticks: linea},
////                        vAxis: {title: 'Precipitaciones', ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
//                        colors: [color, color],
//                        is3D: true,
//                        title: '\n Lluvia de las ultimas 6 horas\n Estacion ' + decodeURI(estacion) + '\n',
//                                legend: 'none'
//                    };
//                    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
//                    chart.draw(data, options);
//                    $("#idestacion").html(decodeURI("Estaci&oacute;n "+estacion));
//vAxis: { ticks: [0,0.050,0.100,0.15,0.20,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1] } Empezar el valor en cero
                /*
                 * {textStyle: {color: '#94511A', fontName:
                 'Arial,Helvetica,sans-serif', fontSize: 11}, minValue: 0},
                 width: 900,
                 height: 270,
                 legend: 'right',
                 pointSize: 3,
                 backgroundColor: '#FFFDEC',
                 legendBackgroundColor: "#FFFBD0",
                 legendHeight: 375,
                 legendTextStyle: {color: '#94511A', fontName:
                 'Arial', fontSize: 10},
                 title: 'Estacion',
                 titleColor: "#25AAE3",
                 titleTextStyle: {color: '#94511A', fontName:
                 'Arial,Helvetica,sans-serif', fontSize: 11},
                 vAxis: {
                 format: '#,###',
                 minValue: 0,
                 maxValue: 1
                 },
                 */
//
//                }
            }
        });
    } catch (e) {
        console.log(e.message);
    }

}

function getGrafica(datos) {
    var lecturas = datos.Lecturas;
//    console.log("Valor de la lectura " + lecturas.length);
    if (lecturas.length !== 0) {
        var dataArray = [];
        var data = [];
        var dataArray1 = [];
        var dataLabel = [];
        var maximo;
        var fecha;
        var valorLectura;
        var band10 = false;
        var band15 = false;
        var total = 71;
        if (lecturas.length < total) {
            total = lecturas.length - 1;
        }
        var acum = 0;
        var j;
//        for (var i = lecturas.length - 1; i >= 0; i--) {
//            acum = acum + parseFloat(lecturas[i].VALORLECTURA);
//        }
        for (var i = lecturas.length - 1; i >= 0; i--) {
            fecha = lecturas[i].FECHALECTURA;
            var str = fecha;
            var res = str.split(" ", 1);
            var fechaLectura = str.slice(11, 16);
            console.log(lecturas.length - 1);
            if (lecturas.length - 1 >= 350) {
                for (j = i; j >= 0; j--) {
                    if (acum <= 5) {
                        dataArray[i] = acum + parseFloat(lecturas[i].VALORLECTURA);
                        //  console.log(acum + parseFloat(lecturas[i].VALORLECTURA));
                        console.log(j);
                    }
                }

            } else {
                dataArray[i] = parseFloat(lecturas[i].VALORLECTURA);
            }
            data.push(dataArray[i]);

            dataArray1[i] = (fechaLectura);
            dataLabel.push(dataArray1[i]);

            valorLectura = lecturas[i].VALORLECTURA;
            if (valorLectura >= 5 && valorLectura < 10) {
                band10 = true;
            } else {
                if (valorLectura >= 10 && valorLectura < 15) {
                    band15 = true;
                }
            }
            if (band10) {
                maximo = 10;
            } else {
                if (band15) {
                    maximo = 15;
                } else {
                    maximo = 5;
                }
            }
        }
        var ctx = document.getElementById("myChart").getContext("2d");
        var config = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataLabel,
                datasets: [{
                        label: 'Precipitacion',
                        borderColor: '#003C78',
                        lineTension: 0,
                        pointRadius: 0,
                        borderWidth: 5,
//                        cubicInterpolationMode: "linear",
                        lineTension: 0.5,
                                data: data,
                        fill: true,
                    }]
            },
            options: {
                responsive: true,
//                title: {
//                    display: true,
//                    text: 'Estacion ' + decodeURI(estacion) + '-Localidad ' + decodeURI(localidad) + '\n',
//                    fontSize: 14,
//                    fontColor: '#003e60',
//                    fontStyle: 'bold',
//                },
                tooltips: {
                    //mode: 'point',
                    intersect: false,
                    backgroundColor: '#ffffff',
                    titleFontSize: 12,
                    titleFontColor: 'black',
                    bodySpacing: 4,
                    borderColor: '#003C78',
                    borderWidth: 1,
                    bodyFontColor: 'black',
                    bodyFontStyle: 'bold',
                    bodyFontSize: 12
                },
                hover: {
                    mode: 'nearest',
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                //labelString: 'Hora (Datos cada 6 minutos)',
                                fontColor: '#003e60',
                                fontSize: 12,
                                fontStyle: "bold",
                            },
                        }],
                    yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Precipitaciona (mm)',
                                fontColor: '#003e60',
                                fontSize: 12,
                                fontStyle: "bold",
                            },
                            ticks: {
                                min: 0,
                                max: maximo
                            }
                        }]
                },
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        fontColor: 'red',
                        fontSize: 16
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 50
                    }
                }
            }
        });
        config.render();
        window.onload = function () {
            var ctx = document.getElementById("canvas").getContext("2d");
            window.myLine = new Chart(ctx, config);
        };
        var titulo;
        moment.locale('es');
        var date = moment(fecha);
        titulo = 'LLuvia de las &uacute;ltimas 6 horas </br>';
        titulo += 'Estaci&oacute;n ' + decodeURI(estacion) + '- Localidad ' + decodeURI(getMayuscula(localidad.toLowerCase())) + '</br>';
        titulo += date.format('LL');
        $("#tituloL").html(titulo);

        $("#hora").html('Hora (Datos cada 5 minutos)');
    }
}
//Gráfica de temperatura 
function getGraficaTemperatura(datos) {
    var lecturas = datos.Lecturas;
    if (lecturas.length !== 0) {
        var dataArray = [];
        var data = [];
        var dataArray1 = [];
        var dataLabel = [];
        var maximo;
        var minimo;
        var fecha;
        var valorLectura;
        var band = false;
        var total = 71;
        if (lecturas.length < total) {
            total = lecturas.length - 1;
        }
        for (var i = total; i >= 0; i--) {
            fecha = lecturas[i].FECHALECTURA;
            var str = fecha;
            var res = str.split(" ", 1);
            var fechaLectura = str.slice(11, 16);
            dataArray[i] = parseFloat(lecturas[i].VALORLECTURA);
            data.push(dataArray[i]);

            dataArray1[i] = (fechaLectura);
            dataLabel.push(dataArray1[i]);

            valorLectura = lecturas[i].VALORLECTURA;
            if (valorLectura >= 10) {
                band = true;
            }
        }
        if (band) {
            maximo = 10;
            minimo = 30;
        }
        var ctx = document.getElementById("myChart").getContext("2d");
        var config = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataLabel,
                datasets: [{
                        label: 'Grados centigrados ',
                        borderColor: "#ff0000",
//                        borderColor: "#ff0000",
                        backgroundColor: 'transparent',
                        lineTension: 0,
                        pointRadius: 0,
                        borderWidth: 1,
                        cubicInterpolationMode: "linear",
                        lineTension: 0.9,
                                data: data,
                        fill: true,
//                        label: "Car Speed",
//                        data: data,
//                        lineTension: 0,
//                        fill: false,
//                        borderColor: 'ff0000',
//                        backgroundColor: 'transparent',
//                        borderDash: [5, 5],
//                        pointBorderColor: 'orange',
//                        pointBackgroundColor: 'rgba(255,150,0,0.5)',
//                        pointRadius: 5,
//                        pointHoverRadius: 10,
//                        pointHitRadius: 30,
//                        pointBorderWidth: 2,
//                        pointStyle: 'rectRounded'

                    }]
            },
            options: {
                responsive: true,
                tooltips: {
//                    mode: 'point',
                    intersect: false,
                    backgroundColor: '#ffffff',
                    titleFontSize: 12,
                    titleFontColor: 'black',
                    bodySpacing: 4,
                    borderColor: '#003C78',
                    borderWidth: 1,
                    bodyFontColor: 'black',
                    bodyFontStyle: 'bold',
                    bodyFontSize: 12
                },
                hover: {
                    mode: 'nearest',
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Hora (Datos cada 5 minutos)',
                                fontColor: '#003e60',
                                fontSize: 12,
                                fontStyle: "bold",
                            },
                        }],
                    yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Grados Centigrados ',
                                fontColor: '#003e60',
                                fontSize: 12,
                                fontStyle: "bold",
                                borderDash: [2, 5],
                            },
                            ticks: {
                                // min: minimo,
                                //max: maximo
                            }
                        }]
                },
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        fontColor: '#003C78',
                        fontSize: 16
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 50
                    }
                }
            }
        });
        config.render();
        window.onload = function () {
            var ctx = document.getElementById("canvas").getContext("2d");
            window.myLine = new Chart(ctx, config);
        };
        var titulo;
        moment.locale('es');
        var date = moment(fecha);
        titulo = 'Temperatura de las &uacute;ltimas 6 horas </br>';
        titulo += 'Estaci&oacute;n ' + decodeURI(estacion) + '- Localidad ' + decodeURI(getMayuscula(localidad.toLowerCase())) + '</br>';
        titulo += date.format('LL');

        if (screen.width < 800) {
            $("#tituloL").css("font", "11px sans-serif");
            $("#image").css("right", "-213px");
            $("#image").css("position", "relative");
        }
        $("#tituloL").html(titulo);
    }
}
function getMayuscula(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getMostrarLecturas(datos) {
    var tablamostrar;
    var lecturas = datos.Lecturas;
    if (lecturas == "") {
        tablamostrar = "<div style='color:#2F6194;font-weight: bold'></style>No hay registro de lecturas para este sensor</div>";
    } else {
        tablamostrar = "<style>th{font-weight: normal;}tr{border: #25AAE3 1px solid;}</style><table style='font-family: sans-serif;border-collapse: collapse;' width='450' border='1' align='center'>"
        tablamostrar += "<tr><th bgcolor='#25AAE3' style='font-weight: bold;color:white;' >Fecha</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Lectura Sensor (" + unidadmedida + ") </th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Estado</th>"
        for (var i = 0; i < lecturas.length; i++) {
            valorlectura = lecturas[i].IDSENSOR;
            tablamostrar += "<tr>"
            tablamostrar += "<th>" + lecturas[i].FECHALECTURA + "</th>"
            tablamostrar += "<th>" + lecturas[i].VALORLECTURA + "</th>"
            if (lecturas[i].VALORLECTURA > 0) {
                if (tiposensor == 5) {
                    tablamostrar += "<th><img src='img/lluvias1.gif'/>" + "</th>"
                } else {
                    tablamostrar += "<th><img src='img/" + tiposensor + "2.png'/>" + "</th>"
                }
            } else {
                if (tiposensor == 5) {
                    tablamostrar += "<th><img src='img/" + tiposensor + "2.png'/></th>"
                } else {
                    tablamostrar += "<th><img src='img/" + tiposensor + "1.png'/></th>"
                }
            }
            tablamostrar += " </tr>"
        }
        tablamostrar += "</tr></table>"
//        tablamostrar += "<button type='button' onclick='getConsolidados(" + valorlectura + ");'>Consolidados</button>"
    }
    $("#tablachart").html(tablamostrar);
    getConsolidados();
    getUltimasLecturas();
}

function getConsolidados()
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
                getMostrarConsolidados(datos);
            }
        });
    } catch (e) {
        alert(e.message);
    }
}
function getMostrarConsolidados(datos) {
    var tablamostrar;
    consolidados = datos.Consolidados;
    if (consolidados == "") {
        tablamostrar = "<div style='color:#2F6194;font-weight: bold'></style>No hay registro de lecturas para este sensor</div>";
    } else {
        tablamostrar = "<style>th{font-weight: normal;}tr{border: #25AAE3 1px solid;}</style><table style='font-family: sans-serif;border-collapse: collapse;width: 91.6%;' border='1' align='center'>"
        tablamostrar += "<tr><th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Fecha Lectura</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>M&iacutenimo</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>M&aacuteximo</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Promedio</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Acumulado</th>"
        tablamostrar += "<th bgcolor='#25AAE3' style='font-weight: bold;color:white;'>Conteo total</th>"
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
    $("#tablaconsolidado").html(tablamostrar);

}
function getUltimasLecturas(idsensor) {
    var tablamostrar;
    $.ajax({
        url: "/sab/ServletAcumuladosTiempos",
        type: 'POST',
        dataType: 'json',
        context: document.body,
        data: {
            "idsensor": idsensor
        },
        success: function (datos) {
            var acumulado = datos.Acumulado;
            var minutos10;
            var minutos30;
            var minutos60;
            var dia;
            if (acumulado.length == 4) {
                minutos10 = acumulado[0].VALORACUMULADO;
                minutos30 = acumulado[1].VALORACUMULADO;
                minutos60 = acumulado[2].VALORACUMULADO;
                dia = acumulado[3].VALORACUMULADO;
            } else {
                minutos10 = "0";
                minutos30 = "0";
                minutos60 = "0";
                dia = "0";
            }
            if (screen.width < 800) {
                $("#tablaultimas").css("top", "-135px");
                $("#tablaultimas").css("right", "-30px");
                $("#tituloL").css("font", "11px sans-serif");
                $("#image").css("right", "-199px");
                tablamostrar = "<style>tr{border: #25AAE3 1px solid;}td{padding: 3px;}</style><table  style='font-size: 11px;font-family: sans-serif;border-collapse: collapse;width: 75%' border='1'>";
            } else {
                tablamostrar = "<style>tr{border: #25AAE3 1px solid;}td{padding: 3px;}</style><table  style='font-family: sans-serif;border-collapse: collapse;width: 52%' border='1'>";
            }

            tablamostrar += "<tr><td bgcolor='#25AAE3'  style='color: white;font-weight: bold;padding: 6px;' colspan='2' align='center'>&Uacuteltimas lecturas</td></tr></br>";
            tablamostrar += "<tr><td style='width: 321px;'>&Uacuteltimos 10 minutos (mm): </td><td style='width:35px;text-align:center;'><b>" + minutos10 + "</b> </br></td><tr> ";
            tablamostrar += "<tr><td>&Uacutetimos 30 minutos (mm): </td><td style='width:35px;text-align:center;'><b>" + minutos30 + "</b></td><tr></br>";
            tablamostrar += "<tr><td>&Uacutetimos 60 minutos (mm): </td><td style='width:35px;text-align:center;'><b>" + minutos60 + "</b></td><tr> </br>";
            tablamostrar += "<tr><td>Acumulado del d&iacute;a (mm): </td><td style='width:35px;text-align:center;'><b>" + acumuladoDia + "</b></td><tr></table> </br>";
            $("#tablaultimas").html(tablamostrar);
        }

    });
}

//function getgraficasFechas() {
//    fechaInicio = document.getElementById("fechaInicio").value;
//    fechaFin = document.getElementById("fechaFin").value;
//    if (fechaInicio != "" && fechaFin != "") {
//        try {
//            PF('graficaFecha').show();
//            var fecha;
//            $.ajax({
//                url: "/sab/ServletConsultarLecturas",
//                type: 'POST',
//                dataType: 'json',
//                context: document.body,
//                data: {
//                    "idsensor": idsensor,
//                    "fechaInicio": fechaInicio,
//                    "fechaFin": fechaFin
//
//                },
//                success: function (datos) {
//                    var lecturas = datos.ConsultarLecturas;
//                    console.log(lecturas);
//                    var color = '#FFFFFF';
//                    if (lecturas.length !== 0) {
//                        var dataArray = [];
//                        var Header = ['Tiempo', 'Precipitacion'];
//                        dataArray.push(Header);
//                        for (var i = 37; i > 0; i--) {
////                        if (i % 2 != 0) {
//                            fecha = lecturas[i].FECHALECTURA;
////                            var str = fecha;
////                            var res = str.split(" ", 1);
////                            var fechaLectura = str.slice(11, 16);
//                            var temp = [];
//                            temp.push(fecha);
//                            temp.push(lecturas[i].VALORLECTURA);
//                            if (lecturas[i].VALORLECTURA != 0) {
//                                color = "#25AAE3";
//                            }
////                        }
//                            dataArray.push(temp);
//
//                        }
//                        var data = new google.visualization.arrayToDataTable(dataArray);
//
//
//                        var options = {
//                            title: ' ',
//                            chartArea: {width: '65%'},
//                            hAxis: {title: 'Tiempo (min)\n' + fecha + '\n'},
////                        hAxis: {title: 'Fecha ' + res, titleTextStyle: {color: '#25AAE3'}},
//                            vAxis: {ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
////                        vAxis: {title: 'Precipitaciones', ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
//                            colors: [color, color],
//                            is3D: true,
//                            title: 'Estacion ' + decodeURI(estacion)
//                        };
//                        var chart = new google.visualization.ColumnChart(document.getElementById('graficaFechas'));
//                        chart.draw(data, options);
//                    }
//                }
//            });
//        } catch (e) {
//            console.log(e.message);
//        }
//
//    } else {
//        PF('growlWV').renderMessage({"summary": "Fechas",
//            "detail": "Debe seleccionar la fecha inicial y la fecha final",
//            "severity": "error"}); //warn,error  
//    }
//}
function closeIframe() {
    $(".grafica").hide(1000);
}