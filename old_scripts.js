
function download_resources_images_profiles(idusu) {
    let folder = zip.folder(idusu);
    var sizefile = 0;
    if (urls != "" && urls != undefined && urls != []) {
        for (let i = 0; i < urls.length; i++) {
            if (!folder.file(urls[i]["id"])) {
                setTimeout(function () {
                    fetch(urls[i]["url"])
                        .then(response => response.blob())
                        .then(blob => {
                            folder.file(urls[i]["id"], blob, {binary: true});
                        }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 2994 drip " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 2994 drip " + error + "\n";
                    });
                }, 1000);
            }
        }
    }
}

function savehtml(cadena, numero){
    zip.file(cadena,"hmtl"+numero+".html");
}

function download_resources_posts(idusu) {
    let folderposts = zip.folder("publicaciones_files");
    var sizefile = 0;
    if (urlsposts != "" && urlsposts != undefined && urlsposts != []) {
        for (let i = 0; i < urlsposts.length; i++) {
            if (!folderposts.file(urlsposts[i]["id"])) {
                setTimeout(function () {
                    fetch(urlsposts[i]["url"])
                        .then(response => response.blob())
                        .then(blob => {
                            folderposts.file(urlsposts[i]["id"], blob, {binary: true});
                        }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 3020 drp " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 3020 drp " + error + "\n";
                    });
                }, 1000);
            }
        }
    }
}

async function userreport(tab, typeuser, downloadedId, downloadPath, filename) {
    var report = {}
    var element = "#root"
    var element2 = "";
    try {
        var href = await chrome.scripting.executeScript({
            target: {tabId: tab.id}, function: () => { //alert("Scraping user");
				var div = document.querySelector('#root')
                var href = ""
                if (div.outerHTML.includes("?subject_id=")) {
					href =div.outerHTML.match(/subject_id=(\d+)/i)[1];
				} else if (div.outerHTML.includes("/messages/thread/")) {
					href = div.outerHTML.match(/\/messages\/thread\/(\d+)/i)[1];
				} else if (div.outerHTML.includes("?owner_id=")) {
					href = div.outerHTML.match(/owner_id=(\d+)/i)[1];
				} else if (div.outerHTML.includes("/more/?")) {
					href = div.outerHTML.match(/more\/?(\d+)/i)[1];
				} else if (div.outerHTML.includes("subscribe.php?id=")) {
					href = div.outerHTML.match(/subscribe.php?id=(\d+)/i)[1];
				}
				return href;
            }
        }).then(function (resultados) {
            return resultados[0]["result"];
        }).catch(function (error) {
            // Manejar errores
            stringflujotxt += "[" + getFormattedDateTime() + "] 345 urr:  " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 345 urr:  " + error + "\n";
        });
        if (href === "" || href === undefined || href === null) {
            href = await chrome.scripting.executeScript({
                target: {tabId: tab.id}, function: () => {
                    return window.location.href;
                }
            }).then(function (resultados) {
                return resultados[0]["result"];
            }).catch(function (error) {
                // Manejar errores
                stringflujotxt += "[" + getFormattedDateTime() + "] 357 urr:  " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 357 urr:  " + error + "\n";
            });
            if (href.includes("/profile.php?id=") || href.includes("/profile.php/?id=")) {
                report["id"] = href.match(/id=(\d+)/i)[1];
            } else {
                try {
                    if (href.includes("/profile.php?id=")) {
                        report["id"] = href.split('/')[3].split('?id=')[1];
                    } else if (href.includes("/p/")) {
                        report["id"] = href.split('/')[4].match(/-(\d+)/i)[1];
					} else {
                        report["id"] = href.split('?')[0].split('/')[3];
                    }
                } catch (error) {
                    stringflujotxt += "[" + getFormattedDateTime() + "] 372 urr:  " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 372 urr:  " + error + "\n";
                    report["id"] = ""
                }
            }
        } else{
			report["id"] = href;
		} 
        var alias = await chrome.scripting.executeScript({
            target: {tabId: tab.id}, function: () => {
                var div = document.querySelector('#root');
                var div2 = div.childNodes[0].childNodes;
                var alias;
                div2.forEach(async function (elemento) {
                    if (elemento.innerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\n/g, "").replace(/\t/g, "").includes('Informacion de contacto Facebook')) {
                        alias = elemento.innerText;
                    }
                });
                return alias;
            }
        }).catch(function (error) {
            // Manejar errores
            stringflujotxt += "[" + getFormattedDateTime() + "] 394 urr:  " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 394 urr:  " + error + "\n";
        });
    } catch (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] 398 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 398 urr:  " + error + "\n";
        var alias = "";
    }
    try {
        if (alias !== "") {
            report["alias"] = alias.split('/')[1];
        } else {
            report["alias"] = report['id'];
        }
    } catch (error) {
        if ('TypeError: alias.split is not a function' in error) {
            report["alias"] = report['id'];
        } else {
            stringflujotxt += "[" + getFormattedDateTime() + "] 412 urr:  " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 412 urr:  " + error + "\n";
            report["alias"] = report['id'];
        }
    }
    report["name"] = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            try {
                if (document.querySelectorAll('strong').length > 1) {
                    var name;
                    for (let i = 0; i < document.querySelectorAll('strong').length; i++) {
                        if (document.querySelectorAll('strong')[i].parentElement.tagName == "SPAN") {
                            name = document.querySelectorAll('strong')[i].textContent;
                        }
                    }
                } else {
                    name = document.querySelectorAll('strong')[0].textContent
                }
            } catch (error) {
                name = ""
            }
            return name;
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 439 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 439 urr:  " + error + "\n";
    });
    report["imageCoverPageUrl"] = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            var image;
            try {
                image = document.querySelector('#profile_cover_photo_container').childNodes[0].childNodes[0].src;
            } catch (error) {
                image = "";
            }
            return image
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 456 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 456 urr:  " + error + "\n";
    });
    report["imageProfileUrl"] = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            return document.querySelectorAll('img')[2].src;
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 467 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 467 urr:  " + error + "\n";
    });
    report["rrss"] = "FBK";
    idusu = report["id"];
    report["pageType"] = typeuser;
    var dataextra = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            var DataExtra = [];
            try {
                var basic = document.querySelector('#basic-info').outerText;
            } catch (error) {
                var basic = ''
            }
            try {
                var overviews = document.querySelector('#year-overviews').outerText;
            } catch (error) {
                var overviews = ''
            }
            try {
                var work = document.querySelector('#work').outerText;
            } catch (error) {
                var work = ''
            }
            try {
                var education = document.querySelector('#education').outerText;
            } catch (error) {
                var education = ''
            }
            try {
                var relationship = document.querySelector('#relationship').outerText;
            } catch (error) {
                var relationship = ''
            }
            if (basic != '') {
                basic = basic.replace(/\n/g, ' ');
                basic = basic.replace(/\t/g, ' ');
				basic = basic.trim();
                DataExtra.push({basic});
            }
            if (overviews != '') {
                overviews = overviews.replace(/\n/g, ' ');
                overviews = overviews.replace(/\t/g, ' ');
				overviews = overviews.trim();
                DataExtra.push({overviews});
            }
            if (work != '') {
                work = work.replace(/\n/g, ' ');
                work = work.replace(/\t/g, ' ');
				work = work.trim();
                DataExtra.push({work});
            }
            if (education != '') {
                education = education.replace(/\\n/g, ' ');
                education = education.replace(/\\t/g, ' ');
				education = education.trim()
                DataExtra.push({education});
            }
            if (relationship != '') {
                relationship = relationship.replace(/\n/g, ' ');
                relationship = relationship.replace(/\t/g, ' ');
				relationship = relationship.trim()
                DataExtra.push({relationship});
            }
            return DataExtra;
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 537 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 537 urr:  " + error + "\n";
    });
    if (dataextra.length > 0) {
        report["dataExtra"] = dataextra;
    }
    var living = []
    living = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            try {
                elementos = document.querySelector('#living').outerText;
                var elementos2 = elementos.split('\n');
                elementos2 = elementos2.filter(elemento => elemento !== '\t');
                elementos2 = elementos2.filter(elemento => elemento !== 'Lugares de residencia');
                return elementos2;
            } catch (error) {
                return elementos2 = ''
            }
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 560 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 560 urr:  " + error + "\n";
    });
    if (living !== "") {
        try {
            if (living[0].includes('actual')) {
                report["location"] = living[1];
            }
        } catch (error) {
        }
        try {
            if (living[2].includes('natal')) {
                report["origin"] = living[3];
            }
        } catch (error) {
        }
    }
    var contact = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            var contact;
            try {
                contact = document.querySelector('#contact-info').outerText;
                contact = contact.split('\n');
                contact = contact.filter(elemento => elemento !== '\t' && elemento !== 'Informaci�n de contacto');
            } catch (error) {
                contact = ''
            }
            return contact
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 593 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 593 urr:  " + error + "\n";
    });
    //report["relatedAccountsUrl"]
    try {
        if (contact !== "") {
            for (let i = 0; i < contact.length; i++) {
                try {
                    if (contact[i] === 'Instagram') {
                        report["Instagram"] = contact[i + 1]
                    }
                } catch (error) {
                }
                try {
                    if (contact[i] === 'WhatsApp') {
                        report["phone"] = contact[i + 1]
                    }
                } catch (error) {
                }
                try {
                    if (contact[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'Correo electronico' || contact[i] === 'email') {
                        report["email"] = contact[i + 1]
                    }
                } catch (error) {
                }
                try {
                    if (contact[i] === 'TikTok') {
                        report["Tiktok"] = contact[i + 1]
                    }
                } catch (error) {
                }
                try {
                    if (contact[i] !== 'Instagram' && contact[i] !== 'WhatsApp' && contact[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "") !== 'Correo electronico' && contact[i] !== 'TikTok') {
                        report["contacto"] = contact[i + 1]
                    }
                } catch (error) {
                }
            }
        }
    } catch (error) {
    }
    var description = await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            var div = document.querySelector('#root');
            var description;
            try {
                description = div.childNodes[0].childNodes[0].childNodes[1].childNodes[1].textContent;
            } catch (error) {
                return description = '';
            }
            return description;
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 649 urr:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 649 urr:  " + error + "\n";
    });
    try {
        if (description[0] !== "") {
            report["description"] = description
        }
    } catch (error) {
    }
    var image_dict = {}
    if (report["id"] != "" && report["imageProfileUrl"] != "" && report["imageProfileUrl"] != undefined) {
        image_dict["id"] = report["id"] + '_profile.jpg';
        image_dict["url"] = report["imageProfileUrl"];
        report["imageProfile"] = report["id"] + '_profile.jpg';
        urls.push(image_dict);
    }
    if (report["id"] != "" && report["imageCoverUrl"] != "" && report["imageCoverUrl"] != undefined) {
        image_dict = {}
        image_dict["id"] = report["id"] + '_cover.jpg';
        image_dict["url"] = report["imageCoverUrl"];
        report["imageCover"] = report["id"] + '_cover.jpg';
        urls.push(image_dict);
    }
    return [report];
}

async function userfllwrfllwing(tab, iduser, idguest) {
	stringflujotxt += "Estamos en follower/following.\n"
    var url = "https://mbasic.facebook.com/profile.php?id=" + iduser + "/?v=followers"
    var fllwer = [];
    var fllwing = [];
    var moreurl = "";
    var confirmacion = "";
    var confirmacion1 = false;
    var confirmacion2 = "";
    var temporaryblock="e";
    await loadPage(tab, url, confirmacion1).then(function (resultados) {
        confirmacion1 = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 689 urf:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 689 urf:  " + error + "\n";
    });
    var urlcomparision = await geturl(tab).catch(function (error) {
		// Manejar errores
		stringflujotxt += "[" + getFormattedDateTime() + "] 694 urf:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 694 urf:  " + error + "\n";
	});
	if (urlcomparision[0] == "https://m.facebook.com/"){
		confirmacion1=false;
		stringflujotxt += "[" + getFormattedDateTime() + "] 698: urf\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 698 urf\n";
	}else{
		confirmacion1=true;
				}		
    if (confirmacion1 === true) {
        await getfllw(tab, fllwer, 1).then(function (resultados) {
            fllwer = resultados[0];
        });
        await getfllw(tab, fllwing, 2).then(function (resultados) {
            fllwing = resultados[0];
        });
        for (let i = 0; i < fllwer.length; i++) {
            try {
                confirmacion = fllwer[i]["moreurl"];
            } catch (error) {
                confirmacion = "";
            }
            if (confirmacion !== "" && confirmacion !== null && confirmacion !== undefined) {
                await chrome.scripting.executeScript({
                    target: {tabId: tab.id}, args: [temporaryblock], function: (temporaryblock) => {
                        if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                            temporaryblock = "e";
                        }else{
                            temporaryblock = 'Parece que has usado de forma indebida';
                        }
                        return [temporaryblock];
                    }
                }).then(function (resultados) {
                    temporaryblock = resultados[0]["result"][0];
                }).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] 731 urf:  " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 731 urf:  " + error + "\n";
                });
                if (!temporaryblock.includes('Parece que has usado de forma indebida')) {
                    await loadPage(tab, confirmacion, confirmacion2).then(function (resultados) {
                        confirmacion2 = resultados;
                    }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 739 urf:  " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 739 urf:  " + error + "\n";
                    });
                    if (confirmacion2 !== null) {
                        await getfllw(tab, fllwer, 1).then(function (resultados) {
                            fllwer = resultados[0];
                        });
                        fllwer.splice(i, 1);
                        fllwer.splice(i, 1);
                    }
                    //removeCache();
                }else{
					stringflujotxt += "[" + getFormattedDateTime() + "] 751 urf:  " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 751 urf:  " + error + "\n";					
				}
				await chrome.history.deleteAll();
            }
        }
        confirmacion = "";
        for (let o = 0; o < fllwing.length; o++) {
            try {
                confirmacion = fllwing[o]["moreurl"];
            } catch (error) {
                confirmacion = "";
            }
			if (TimerForScrp() === true){
				confirmacion2="";
				confirmacion=false;
				break;	
			} 
            if (confirmacion !== "" && confirmacion !== null && confirmacion !== undefined) {
                await chrome.scripting.executeScript({
                    target: {tabId: tab.id}, args: [temporaryblock], function: (temporaryblock) => {
                        if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                            temporaryblock = "e";
                        }else{
                            temporaryblock = 'Parece que has usado de forma indebida';
                        }
                        return [temporaryblock];
                    }
                }).then(function (resultados) {
                    temporaryblock = resultados[0]["result"][0];
                }).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] 778 urf:  " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 778 urf:  " + error + "\n";
                });
                if (!temporaryblock.includes('Parece que has usado de forma indebida')) {
                    await loadPage(tab, confirmacion, confirmacion2).then(function (resultados) {
                        confirmacion2 = resultados;
                    }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 786 urf:  " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 786 urf:  " + error + "\n";
                    });
					var urlcomparision = await geturl(tab).catch(function (error) {
						// Manejar errores
						stringflujotxt += "[" + getFormattedDateTime() + "] 786 urf:  " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 786 urf:  " + error + "\n";
					});
					if (urlcomparision[0] == "https://m.facebook.com/"){
						confirmacion2=false;
						stringflujotxt += "[" + getFormattedDateTime() + "] 796 urf\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 796 urf\n";
					}else{
						confirmacion2=true;
								}
                    if (confirmacion2 !== null) {
                        await getfllw(tab, fllwer, 1).then(function (resultados) {
                            fllwer = resultados[0];
                        });
                        fllwing.splice(o, 1);
                    }
                    //removeCache();
                    await chrome.history.deleteAll();
                }
            }
        }
        if (fllwer.length > 0) {
            var indiceAEliminar = fllwer.findIndex(elemento => elemento.id === idguest);

            if (indiceAEliminar !== -1) {
                fllwer.splice(indiceAEliminar, 1);
                stringflujotxt += "[" + getFormattedDateTime() + "] idguest eliminado correctamente en followers.\n";
            } else {
                stringflujotxt += "[" + getFormattedDateTime() + "] No se encontr� ning�n elemento con el idguest especificado en followers.\n";
            }
        }
        if (fllwing.length > 0) {
            var indiceAEliminar = fllwing.findIndex(elemento => elemento.id === idguest);

            if (indiceAEliminar !== -1) {
                fllwing.splice(indiceAEliminar, 1);
                try {
                    urls.splice(indiceAEliminar, 1);
                } catch (Exception) {
                }
                stringflujotxt += "[" + getFormattedDateTime() + "] idguest eliminado correctamente en followings.\n";
            } else {
                stringflujotxt += "[" + getFormattedDateTime() + "] No se encontr� ning�n elemento con el idguest especificado en followings.\n";
            }
        }
    }
    return [fllwer, fllwing];
}

async function getfllw(tab, array, v) {
    var moreurl = "";
    var indexarray;
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, args: [array, v, urls], function: (array, v, urls) => {
            var confirmacion = false;
            if (document.querySelector('#root').childNodes[v].childElementCount > 1) {
                try {
					var stringflujotxt=""
                    var index = document.querySelector('#root').childNodes[v].childElementCount;
                    try {
                        confirmacion = document.querySelector('#root').childNodes[v].childNodes[document.querySelector('#root').childNodes[v].childElementCount - 1].textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ver mas");
    					if (confirmacion===false){
							confirmacion = document.querySelector('#root').childNodes[v].childNodes[document.querySelector('#root').childNodes[v].childElementCount - 1].textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("see more");
							if (confirmacion===false){
								confirmacion = document.querySelector('#root').childNodes[v].childNodes[document.querySelector('#root').childNodes[v].childElementCount - 1].textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("view more");
								if (confirmacion===false){
									confirmacion = document.querySelector('#m_more_item').textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("see more");
									if (confirmacion===false){
										confirmacion = document.querySelector('#m_more_item').textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ver mas");
										if (confirmacion===false){
											confirmacion = document.querySelector('#m_more_item').textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("view more");
										}
									}
								} 
							}
						}                 
					} catch (error) {
						stringflujotxt += "Error al encontrar url de ver mas.\n";
                        confirmacion = false;
                    }
                    if (confirmacion === true) {
                        try {
                            moreurl = document.querySelector('#root').childNodes[v].childNodes[document.querySelector('#root').childNodes[v].childElementCount - 1].childNodes[0].href;
                        } catch (error) {
							stringflujotxt += "Error al encontrar url de ver mas, metodo 2.\n";
                            moreurl = null;
                        }
                        try {
                            indexarray = array.length;
                            if (moreurl !== null && moreurl !== "" && moreurl !== undefined) {
                                var fllw_dict = {};
                                fllw_dict["moreurl"] = moreurl;
                                array[indexarray] = fllw_dict;
                                index--;
                            }
                        } catch (error) {
							stringflujotxt += error+". Al obtener el ver mas metodo 3.\n";
                            indexarray = null;
                        }
                    }
					if (confirmacion===false && moreurl===""){
						try {
                            moreurl = document.querySelector('#m_more_item').childNodes[0].href;
                        } catch (error) {
							stringflujotxt += "Error al encontrar url de ver mas, metodo 3.\n";
                            moreurl = null;
                        }
                        try {
                            indexarray = array.length;
                            if (moreurl !== null && moreurl !== "" && moreurl !== undefined) {
                                var fllw_dict = {};
                                fllw_dict["moreurl"] = moreurl;
                                array[indexarray] = fllw_dict;
                                index--;
                            }
                        } catch (error) {
							stringflujotxt += error+". Al obtener el ver mas metodo 4.\n";
                            indexarray = null;
                        }
					}	
                    if (indexarray !== null) {
                        for (let i = 1; i < index; i++) {
                            var image_dict = {}
                            indexarray = array.length;
                            var fllw_dict = {}
                            try {
                                var posibleid = document.querySelector('#root').childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[0].href;
                                if (posibleid.includes('/profile.php?id=') == true) {
                                    fllw_dict["id"] = posibleid.match(/id=(\d+)/i)[1];
                                    fllw_dict["alias"] = fllw_dict["id"];
                                } else {
                                    fllw_dict["alias"] = posibleid.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                    if (fllw_dict["id"] === "" || fllw_dict["id"] === null || fllw_dict["id"] === undefined) {
                                        fllw_dict["id"] = fllw_dict["alias"];
                                    } else {
                                        fllw_dict["id"] = JSON.parse(fllw_dict["id"])['id'].toString();
                                    }
                                }
                            } catch (error) {
								stringflujotxt += error+". Error al buscar id y alias.\n";
                                fllw_dict["id"] = "";
                                fllw_dict["alias"] = "";
                            }
                            try {
                                fllw_dict["name"] = document.querySelector('#root').childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[0].textContent;
                            } catch (error) {
								stringflujotxt += error+". Error al buscar nombre.\n";
                                fllw_dict["name"] = "";
                            }
                            //fllw_dict["alias"]= document.querySelector('#root').childNodes[0].childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[0].href;
                            try {
                                fllw_dict["imageurl"] = document.querySelector('#root').childNodes[v].childNodes[i].childNodes[0].childNodes[0].src;
                            } catch (error) {
								stringflujotxt += error+". Error al buscar imagenurl.\n";
                                fllw_dict["imageurl"] = "";
                            }
                            //fllw_dict["category"]=document.querySelector('#root').childNodes[0].childNodes[v].childNodes[0].textContent;
                            array[indexarray] = fllw_dict;
                            if (fllw_dict["imageurl"] != "" && fllw_dict["imageurl"] != undefined) {
                                image_dict["id"] = fllw_dict["id"] + '.jpg';
                                image_dict["url"] = fllw_dict["imageurl"];
                                fllw_dict["image"] = fllw_dict["id"] + '.jpg';
                                urls.push(image_dict);
                            }
                        }
                    }
                } catch (error) {
                }
            }
            return [array, urls,stringflujotxt];
        }
    }).then(function (resultados) {
        array = resultados[0]["result"][0];
        urls = resultados[0]["result"][1];
		stringflujotxt += resultados[0]["result"][2];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 963 urf\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 963 urf\n";
    });
    return [array];
}


async function userlikes(tab, iduser) {
	stringflujotxt += "Estamos en like.\n";
    var likes = [];
    var moreurl = "";
    var confirmacion = "";
    var url = "https://mbasic.facebook.com/" + iduser + "?v=likes";
    var temporaryblock="e";
    await getlikes(tab, url, likes).then(function (resultados) {
        likes = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 981 urlk " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 796 urlk " + error + "\n";
    });
    for (var v = 0; v < likes.length; v++) {
        try {
            confirmacion = likes[v]["moreurl"];
        } catch (error) {
			stringflujotxt += "[" + getFormattedDateTime() + "] 988 urlk " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 988 urlk " + error + "\n";
            confirmacion = "";
        }
		if (TimerForScrp() === true){
			confirmacion2="";
			confirmacion="";
			break;	
		} 
        if (confirmacion !== "" && confirmacion !== null && confirmacion !== undefined) {
            await chrome.scripting.executeScript({
                target: {tabId: tab.id}, args: [temporaryblock], function: (temporaryblock) => {
                    if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                        temporaryblock = "e";
                    }else{
                        temporaryblock = 'Parece que has usado de forma indebida';
                    }
                    return [temporaryblock];
                }
            }).then(function (resultados) {
                temporaryblock = resultados[0]["result"][0];
            }).catch(function (error) {
                // Manejar errores
                stringflujotxt += "[" + getFormattedDateTime() + "] 1006 urlk " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1006 urlk " + error + "\n";
            });
            if (!temporaryblock.includes('Parece que has usado de forma indebida')) {
                await getlikes(tab, confirmacion, likes).then(function (resultados) {
                    likes = resultados[0];
                }).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] 1014 urlk " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 1014 urlk " + error + "\n";
                });
                //likes.splice(v, 1);
            }
        }else{
			v = likes.length;
		}
        //removeCache();
        await chrome.history.deleteAll();
    }
    return [likes];
}


async function getlikes(tab, url, likes) {
    var indexarray;
    var categoria = "";
    var confirmacion1 = false;
    await loadPage(tab, url, confirmacion1).then(function (resultados) {
        confirmacion1 = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 1039 urlk " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1039 urlk " + error + "\n";
    });
    var urlcomparision = await geturl(tab).catch(function (error) {
		// Manejar errores
		stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'geturl()':  " + error + "\n";
	});
	if (urlcomparision[0] == "https://m.facebook.com/"){
		confirmacion1=false;
		stringflujotxt += "[" + getFormattedDateTime() + "] 1048 urlk\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1048 urlk\n";
	}else{
		confirmacion1=true;
				}	
    if (confirmacion1 === true) {
        await chrome.scripting.executeScript({
            target: {tabId: tab.id}, args: [likes, urls], function: (likes, urls) => {
                var confirmacion;
                for (let v = 1; v < document.querySelector('#root').childNodes[0].childElementCount; v++) {
                    if (document.querySelector('#root').childNodes[0].childNodes[v].childElementCount > 1) {
                        try {
                            var index = document.querySelector('#root').childNodes[0].childNodes[v].childElementCount;
                            try {
                                confirmacion = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[document.querySelector('#root').childNodes[0].childNodes[v].childElementCount - 1].childNodes[0].textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ver mas");
                            } catch (error) {
                                try {
                                	confirmacion = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[document.querySelector('#root').childNodes[0].childNodes[v].childElementCount - 1].childNodes[0].textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("see more");
								} catch (error) {
									try {
										confirmacion = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[document.querySelector('#root').childNodes[0].childNodes[v].childElementCount - 1].childNodes[0].textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("view more");
									} catch (error) {
										confirmacion = false;
									}
								}
                            }
                            if (confirmacion === true) {
                                moreurl = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[document.querySelector('#root').childNodes[0].childNodes[v].childElementCount - 1].childNodes[0].href;
                                indexarray = likes.length;
                                categoria = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[0].textContent;
                                if (moreurl !== null && moreurl !== "" && moreurl !== undefined) {
                                    var likes_dict = {}
                                    likes_dict["moreurl"] = moreurl;
                                    likes_dict["category"] = categoria;
                                    likes[indexarray] = likes_dict;
                                    index--;
                                }
                            }
                            for (let i = 1; i < index; i++) {
                                var image_dict = {};
                                indexarray = likes.length;
                                var likes_dict = {}
                                var posibleid = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[2].href;
                                if (posibleid.includes('/profile.php?fan&id=') == true) {
                                    likes_dict["id"] = posibleid.match(/id=(\d+)/i)[1];
                                    likes_dict["alias"] = likes_dict["id"];
                                } else {
                                    likes_dict["alias"] = posibleid.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                    if (likes_dict["id"] === "" || likes_dict["id"] === null || likes_dict["id"] === undefined) {
                                        likes_dict["id"] = likes_dict["alias"];
                                    } else {
                                        likes_dict["id"] = JSON.parse(likes_dict["id"])['id'].toString();
                                    }
                                }
                                likes_dict["name"] = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[0].textContent;
                                //likes_dict["alias"]= document.querySelector('#root').childNodes[0].childNodes[v].childNodes[i].childNodes[0].childNodes[1].childNodes[0].href;
                                likes_dict["imageurl"] = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[i].childNodes[0].childNodes[0].src;
                                likes_dict["category"] = document.querySelector('#root').childNodes[0].childNodes[v].childNodes[0].textContent;
                                likes[indexarray] = likes_dict;
                                if (likes_dict["id"] != "" && likes_dict["imageurl"] != "" && likes_dict["imageurl"] != undefined) {
                                    image_dict["id"] = likes_dict["id"] + '.jpg';
                                    image_dict["url"] = likes_dict["imageurl"];
                                    likes_dict["image"] = likes_dict["id"] + '.jpg'
                                    urls.push(image_dict);
                                }
                            }
                        } catch (error) {
                        }
                    }
                }
                return [likes, urls];
            }
        }).then(function (resultados) {
            likes = resultados[0]["result"][0];
            urls = resultados[0]["result"][1];
        }).catch(function (error) {
            // Manejar errores
            stringflujotxt += "[" + getFormattedDateTime() + "] 1117 urlk " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 1117 urlk " + error + "\n";
        });
    }
    return [likes];
}

async function getfriends2(tab, iduser, idguest) {
    var friends = [];
    var repetidos = [];
    var cont = 0;
    var confirmacion3 = false;
    var confirmacion = "empezamos";
    var url = 'https://mbasic.facebook.com/' + iduser + '/friends'
    await loadPage(tab, url, confirmacion3).then(function (resultados) {
        confirmacion3 = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        confirmacion3 = false;
        stringflujotxt += "[" + getFormattedDateTime() + "] 1136 urfr " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1136 urlr " + error + "\n";
    });
    var urlcomparision = await geturl(tab).catch(function (error) {
		// Manejar errores
		stringflujotxt += "[" + getFormattedDateTime() + "] 1141 urfr " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1141 urlr " + error + "\n";
	});
	if (urlcomparision[0] == "https://m.facebook.com/"){
		confirmacion3=false;
		stringflujotxt += "[" + getFormattedDateTime() + "] 1147 urfr\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1147 urlr\n";
	}else{
		confirmacion3=true;
	}
    if (confirmacion3 === true) {
        try {
            while (confirmacion !== "Se acabo") {
                await chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    args: [friends, confirmacion, repetidos, cont, urls],
                    function: (friends, confirmacion, repetidos, cont, urls) => {
                        try {
							var stringflujotxt="";
                            var divcontender = document.querySelector('#root').childNodes[0].childNodes[2 - cont];
                            if (divcontender.childElementCount > 0) {
                                var indexarray = friends.length;
                                for (let o = 0; o < divcontender.childElementCount; o++) {
                                    var friends_dict = {};
                                    try {
                                        try {
                                            if (divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].href.includes('/profile.php?id=') == true) {
                                                friends_dict["id"] = divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].href.match(/\d+/)[0];
                                            } else {
                                                friends_dict["id"] = divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                            }
                                        } catch (error) {
											stringflujotxt += error+". Al buscar el id\n"
                                            friends_dict["id"] = "";
                                        }
                                        friends_dict["alias"] = friends_dict["id"];
                                        try {
                                            friends_dict["name"] = divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].textContent;
                                        } catch (error) {
                                            stringflujotxt += error+". Al buscar el nombre url\n"
                                        }
                                        try {
                                            friends_dict["imageurl"] = divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src;
                                        } catch (error) {
                                            stringflujotxt += error+". Al encontrar la imagen url\n"
                                        }
                                        try {
                                            if (divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].textContent !== "") {
                                                friends_dict["dataExtra"] = [divcontender.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].textContent];
                                            }
                                        } catch (error) {
                                            stringflujotxt += error+". Al buscar los datos extra\n"
                                        }
                                        //members_dict["dataUtime"]=
                                        if (!repetidos.includes(friends_dict["id"]) && friends_dict["id"] != "") {
												friends[indexarray] = friends_dict;
												repetidos.push(friends_dict["id"]);
												var images_dict = {};
												try{ 
													if (friends_dict["id"] != "" && friends_dict["imageurl"] != "") {
														images_dict["url"] = friends_dict["imageurl"];
														images_dict["id"] = friends_dict["id"] + '.jpg';
														friends_dict["image"] = friends_dict["id"] + '.jpg';
														urls.push(images_dict);
													}
												} catch (error) {
													stringflujotxt += error+". Al meter los datos en friends2\n"
												}	
									}		
                                    } catch (error) {
										stringflujotxt += error+"\n"
                                    }
                                    indexarray++;
                                }
                            } else {
								stringflujotxt += "No hay amigos\n"
                                confirmacion = null;
                            }
                            try {
                                var index = document.querySelector('#root').childNodes[0].childElementCount;
                                for (let i = 0; i < index; i++) {
                                    if (document.querySelector('#root').childNodes[0].childNodes[i].innerHTML.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ver mas") || document.querySelector('#root').childNodes[0].childNodes[i].innerHTML.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("see more") || document.querySelector('#root').childNodes[0].childNodes[i].innerHTML.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("view more") ) {
                                        confirmacion = document.querySelector('#root').childNodes[0].childNodes[i].id;
                                        break;
                                    } else {
										stringflujotxt += "No hay para ver mas\n"
                                        confirmacion = null;
                                    }
                                }
                            } catch (error) {
                                console.log(error);
                                confirmacion = null;
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        return [friends, confirmacion, repetidos, urls, stringflujotxt];
                    }
                }).then(function (resultados) {
                    friends = resultados[0]["result"][0];
                    confirmacion = escaparCaracteresEspeciales(resultados[0]["result"][1]);
                    repetidos = resultados[0]["result"][2];
                    urls = resultados[0]["result"][3];
					stringflujotxt += resultados[0]["result"][4];
                }).catch(function (error) {
                    // Manejar errores
                    confirmacion = null;
                    stringflujotxt += "[" + getFormattedDateTime() + "] 1246 urfr " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 1246 urfr " + error + "\n";
                });
				if (TimerForScrp() === true){
					confirmacion = "Se acabo";
					break;	
				} 
                if (confirmacion !== null && confirmacion !== "" && confirmacion !== undefined) {
					var min = 5;
					var max = 10;
					var numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
                    await chrome.scripting.executeScript({
                        target: {tabId: tab.id}, args: [confirmacion, numeroAleatorio], function: async function (confirmacion, numeroAleatorio) {
                            return new Promise(resolve => {
                                setTimeout(() => {
                                    try {
                                        if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                                            if (document.querySelector("#" + confirmacion).childElementCount > 0) {
                                                document.querySelector("#" + confirmacion).childNodes[0].click();
                                            } else {
                                                confirmacion = null;
                                                resolve();
                                            }
                                        } else {
                                            confirmacion = null;
                                            resolve();
                                        }
                                    } catch (error) {
                                        confirmacion = null;
                                        resolve();
                                    }
                                }, 7000)
                            });
                        }
                    }).then(function (resultados) {
                        return resultados[0]["result"];
                    }).catch(function (error) {
                        // Manejar errores
                        confirmacion = null;
                        stringflujotxt += "[" + getFormattedDateTime() + "] 1280 urfr " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 1280 urlr " + error + "\n";
                    });
                }else{
					confirmacion = "Se acabo";
					break;
				}	
                if (cont === 0) {
                    cont++;
                }
                await chrome.history.deleteAll();
            }
        } catch (error) {
            confirmacion = null;
            stringflujotxt += "[" + getFormattedDateTime() + "]  " + error + "\n";
        }
        var indiceAEliminar = friends.findIndex(elemento => elemento.id === idguest);

        if (indiceAEliminar !== -1) {
            friends.splice(indiceAEliminar, 1);
            urls.splice(indiceAEliminar, 1);
            stringflujotxt += "[" + getFormattedDateTime() + "] idguest eliminado correctamente.\n";
        } else {
            stringflujotxt += "[" + getFormattedDateTime() + "] No se encontr� ning�n elemento con el id especificado.\n";
        }
    }
    return [friends];
}

async function userjson(tab, typeuser, idguest) {
    try {
        var distanciaActual;
        var distanciaAnterior;
        var json2 = [];
        var cont = 0;
        var report = {};
        var likes = [];
        var fllwer = [];
        var fllwing = [];
		var iduser=0;
        await chrome.scripting.executeScript({
            target: {tabId: tab.id}, function: () => {
                return new Promise(resolve => {
                        setTimeout(() => {
							var cadena=window.location.href;
                            if (cadena.includes('m.facebook')) {
                                window.location.href=cadena.replace('m.facebook','mbasic.facebook');
                            } else {
                                resolve();
                            }
                        }, 4000);
                    }
                );
            }
        }).then(function (resultados) {
            return resultados[0]["result"];
        }).catch(function (error) {
            // Manejar errores
            stringflujotxt += "[" + getFormattedDateTime() + "] 1338 urj " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 1338 urlj " + error + "\n";
        });
		while(iduser===0 || iduser===undefined){ 
			await userreport(tab, typeuser).then(function (resultados) {
				report = resultados[0];
			}).catch(function (error) {
				// Manejar errores
				stringflujotxt += "[" + getFormattedDateTime() + "] 1146 urj " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1146 urj " + error + "\n";
			});
			iduser = report["id"];
			if (iduser===0 || iduser===undefined){
				stringflujotxt += "[" + getFormattedDateTime() + "] iduser no encontrado\n";
			}	
			stringflujotxt += "El iduser es " + iduser + "\n";
		}	
        iduser = report["id"];
        var nameuser = report["name"];
        var aliasuser = report["alias"];
        if (typeuser === "user") {
            await getfriends2(tab, iduser, idguest).then(function (resultados) {
                json2 = resultados[0];
            }).catch(function (error) {
                json2 = [];
                stringflujotxt += "[" + getFormattedDateTime() + "] 1363 urj " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1363 urj " + error + "\n";
            });
            //removeCache();
            await userfllwrfllwing(tab, iduser, idguest).then(function (resultados) {
                fllwer = resultados[0];
                fllwing = resultados[1];
            }).catch(function (error) {
                stringflujotxt += "[" + getFormattedDateTime() + "] 1371 urj " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1371 urj " + error + "\n";
            });
            //removeCache();
            await userlikes(tab, iduser).then(function (resultados) {
                likes = resultados[0];
            }).catch(function (error) {
                // Manejar errores
                stringflujotxt += "[" + getFormattedDateTime() + "] 1379 urj " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1379 urj " + error + "\n";
            });
            //removeCache();
        }
        var dataAccounts = {}
        dataAccounts['report'] = report //Recordar que esto es una lista
        dataAccounts['friends'] = json2
        dataAccounts['followers'] = fllwer
        dataAccounts['following'] = fllwing
        dataAccounts['likes'] = likes
        dataAccounts['groups'] = []
        dataAccounts['likers'] = []
        dataAccounts['members'] = [];
        //removeCache();
        download_resources_images_profiles(report["id"]);
    } catch (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] 1396 urj " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 1396 urj " + error + "\n";
    }
    return [report, dataAccounts];
}

async function getcomments(tab, publis, persons, idusu) {
    var pub = {};
    var morecomments = "a";
    var confirmacion3 = false;
    const indice = publis.length;
    var confirmacion1 = "";
    var confirmacion = "";
    var t="";
    for (var i = 0; i < publis.length; i++) {
        try {
            if (publis[i].hasOwnProperty('commentsurl')) {
                try {
                    morecomments = "a";
                    confirmacion1 = "";
                    confirmacion = "";
                    pub = publis[i];
                    var url = pub['commentsurl'];
                    await loadPage(tab, url, confirmacion3).then(function (resultados) {
                        confirmacion3 = resultados[0];
                    }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 1423 prgc " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 1423 prgc " + error + "\n";
                    });
                    var urlcomparision = await geturl(tab).catch(function (error) {
						// Manejar errores
						stringflujotxt += "[" + getFormattedDateTime() + "] 1428 prgc " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 1428 prgc " + error + "\n";
					});
					if (urlcomparision[0] == "https://m.facebook.com/"){
						confirmacion3=false;
						stringflujotxt += "[" + getFormattedDateTime() + "] En el getcomments no ha cargado la vista por parte de facebook. \n";
					}else{
						confirmacion3=true;
					}
                    if (confirmacion3 === true) {
                        while (morecomments !== "Se acabo") {
                            t="";
                            await chrome.scripting.executeScript({
                                target: {tabId: tab.id},
                                args: [pub, persons, morecomments, confirmacion, confirmacion1, urlsposts, t ],
                                function: async function (pub, persons, morecomments, confirmacion, confirmacion1, urlsposts, t) {
                                    var index2 = Object.keys(pub['comments']).length;
                                    var comment;
                                    var root;
                                    var index;
                                    if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                                        try {
                                            root = document.querySelector("#m_story_permalink_view");
                                            if (root === null) {
                                                root = document.querySelector("#MPhotoContent");
                                                index = root.childNodes[1].childNodes[0].childNodes[0].childElementCount;
                                                for (let u = 0; u < index; u++) {
                                                    if (root.childNodes[1].childNodes[0].childNodes[0].childNodes[u].id === undefined || root.childNodes[1].childNodes[0].childNodes[0].childNodes[u].id === '' || root.childNodes[1].childNodes[0].childNodes[0].childNodes[u].id === null) {
                                                        confirmacion = u;
                                                    }
                                                }
                                                comment = root.childNodes[1].childNodes[0].childNodes[0].childNodes[confirmacion];
                                            } else {
                                                index = root.childNodes[1].childNodes[0].childElementCount;
                                                for (let u = 0; u < index; u++) {
                                                    if (root.childNodes[1].childNodes[0].childNodes[u].id === undefined || root.childNodes[1].childNodes[0].childNodes[u].id === '' || root.childNodes[1].childNodes[0].childNodes[u].id === null) {
                                                        confirmacion = u;
                                                    }else if (root.childNodes[1].childNodes[0].childNodes[u].id.includes('comment_list')){
														confirmacion = u;
													}
                                                }
                                                comment = root.childNodes[1].childNodes[0].childNodes[confirmacion];
                                            }
                                            if (confirmacion1 === null || confirmacion1 === "" || confirmacion1 === undefined) {
                                                for (let o = 0; o < comment.childElementCount; o++) {
                                                    if (comment.childNodes[o].id.includes("see")) {
                                                        confirmacion1 = o;
                                                        break;
                                                    }
                                                }
                                            } else {
                                                var confirmacion2;
                                                for (let o = 0; o < comment.childElementCount; o++) {
                                                    if (comment.childNodes[o].id.includes("see")) {
                                                        confirmacion2 = o;
                                                        break;
                                                    }
                                                }
                                                if (confirmacion2 !== confirmacion1) {
                                                    confirmacion1 = null;
                                                }
                                            }
                                            if (confirmacion1 !== null && confirmacion1 !== "" && confirmacion1 !== undefined) {
                                                if (comment.childNodes[confirmacion1].textContent.toLowerCase().includes("ver")||comment.childNodes[confirmacion1].textContent.toLowerCase().includes("see") || comment.childNodes[confirmacion1].textContent.toLowerCase().includes("view")) {
                                                    morecomments = comment.childNodes[confirmacion1].id;
                                                } else {
                                                    morecomments = null;
                                                }
                                            } else {
                                                morecomments = null;
                                            }
                                            if ((confirmacion1 !== null && confirmacion1 !== "" && confirmacion1 !== undefined) || ((confirmacion1 === null || confirmacion1 === "" || confirmacion1 === undefined) && (comment.childElementCount > 0))) {
                                                for (let i = 0; i < comment.childElementCount; i++) {
                                                    if (i !== confirmacion1 && !comment.childNodes[i].id.includes("see")) {
                                                        comments_dict = {}
                                                        persons_dict = {}
                                                        try {
															var fecha = "";
															fecha=comment.childNodes[i].childNodes[0].childNodes[comment.childNodes[i].childNodes[0].childElementCount - i].childNodes[comment.childNodes[i].childNodes[0].childNodes[comment.childNodes[1].childNodes[0].childElementCount - i].childElementCount-1].textContent;
															fecha=fecha.replace('de','').replace('a las','').replace('.','').replace('hace','').replace(' ','');
															var fecha2=new Date();
															if(!fecha.includes(fecha2.getFullYear().toString().substr(0,3))){
                                                                try{
                                                                    new Date(fecha + ' ' + fecha2.getFullYear()).toISOString().split('.')[0].replace('T',' ');
                                                                    fecha=new Date(fecha + ' ' + fecha2.getFullYear()).toISOString().split('.')[0].replace('T',' ');
                                                                }catch (error) {
                                                                    try{
                                                                        var fecha3=parseDate(fecha);
                                                                        if (fecha3!==null && fecha3!== undefined && fecha3!=="") {
                                                                            fecha=fecha3
                                                                        }
                                                                    }catch (error) {}
                                                                }
															   } else {
															   	fecha=new Date(fecha).toISOString().split('.')[0].replace('T',' ');
															   } 
                                                            comments_dict['commentDate'] = fecha;
                                                        } catch (error) {
                                                            comments_dict['commentDate'] = fecha;
                                                        }
                                                        try {
                                                            comments_dict['commentId'] = comment.childNodes[i].id;
                                                        } catch (error) {
                                                            comments_dict['commentId'] = "";
                                                        }
                                                        try {
                                                            comments_dict['commentText'] = comment.childNodes[i].childNodes[0].childNodes[1].textContent;
                                                        } catch (error) {
                                                            comments_dict['commentText'] = ""
                                                        }
                                                        try {
                                                            if (comment.childNodes[i].childNodes[0].childNodes[2].childElementCount > 0) {
                                                                if (comment.childNodes[i].outerHTML.includes("/video_redirect/?")) {
																	try {
																		if (comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childElementCount > 1) {
																			for (let t = 0; t < comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childElementCount; t++) {
																				comments_dict['commentText'] += "\\nVideo:"+comment.childNodes[i].childNodes[0].childNodes[2].outerHTML.match(/"\/video_redirect\/?.*"/i)[0].split('" ')[0];
																			}
																		} else {
																			comments_dict['commentText'] += "\\nVideo: https://mbasic.facebook.com/"+ comment.childNodes[i].outerHTML.match(/"\/video_redirect\/?.*"/i)[0].split('" ')[0];
																		}
																	} catch (error) {
																		stringflujotxt += error+". Al obtener video.\n";
																		try {
																			comments_dict['commentText'] += "\\nVideo: https://mbasic.facebook.com/"+ comment.childNodes[i].outerHTML.match(/"\/video_redirect\/?.*"/i)[0].split('" ')[0];
																		} catch (error) {
																			stringflujotxt += error+". Al obtener video en comments 2 vez.\n";
																		}
																	}
																} else if (comment.childNodes[i].outerHTML.includes("/photo.php?")) {
																	try {
																		if (comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childElementCount > 1) {
																			for (let t = 0; t < comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childElementCount; t++) {
																				comments_dict['commentText'] += "\\nImage:"+ comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childNodes[t].childNodes[0].src;
																			}
																		} else {
																			comments_dict['commentText'] += "\\nImage:"+ comment.childNodes[i].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src;
																		}
																	} catch (error) {
																		stringflujotxt += error+". Al obtener imagen en comments.\n";
																		try {
																			comments_dict['commentText'] += "\\nImage:"+ comment.childNodes[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src;
																			urlsposts.push(image_dict);
																		} catch (error) {
																			stringflujotxt += error+". Al obtener imagen en comments 2 vez.\n";
																		}
																	}
																}
                                                            }
                                                        } catch (error) {
                                                        }
                                                        try {
                                                            if (comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.includes('/profile.php?id=') == true) {
                                                                comments_dict['personId'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                                persons_dict['id'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                                persons_dict['alias'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                            } else {
                                                                comments_dict['personId'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                                persons_dict['id'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                                persons_dict['alias'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                            }
                                                            persons_dict['name'] = comment.childNodes[i].childNodes[0].childNodes[0].childNodes[0].textContent;
                                                        } catch (error) {
                                                            comments_dict['personId'] = "";
                                                        }
                                                        if (comment.childNodes[i].textContent.includes("respuesta")||comment.childNodes[i].textContent.includes("replies")) {
                                                            comments_dict['subcommetsurl'] = comment.childNodes[i].childNodes[0].childNodes[4].childNodes[0].childNodes[0].childNodes[0].href;
                                                            pub['subcommetsurl'] = true;
                                                        }
                                                        //comment.childNodes[0].childNodes[0].childNodes[4].childNodes[0].id
                                                        try {
                                                            pub['comments'][index2] = comments_dict
                                                            persons[persons_dict['id']] = persons_dict
                                                            var image_dict = {}
                                                            try {
                                                                if (!comments_dict['videourl']) {
                                                                    if (comments_dict['videourl'] != "" && comments_dict['videourl'] != undefined) {
                                                                        image_dict = {}
                                                                        image_dict["id"] = comments_dict['commentId'] + '.mp4';
                                                                        image_dict["url"] = comments_dict['videourl'];
                                                                        comments_dict['image'] = comments_dict['commentId'] + '.mp4';
                                                                        urlsposts.push(image_dict);
                                                                    }
                                                                }
                                                            } catch (error) {
                                                            }
                                                            try {
                                                                if (!comments_dict['imageurl']) {
                                                                    if (comments_dict['imageurl'] != "" && comments_dict['imageurl'] != undefined) {
                                                                        image_dict = {}
                                                                        image_dict["id"] = comments_dict['commentId'] + '.jpg';
                                                                        image_dict["url"] = comments_dict['imageurl'];
                                                                        comments_dict['image'] = comments_dict['commentId'] + '.jpg';
                                                                        urlsposts.push(image_dict);
                                                                    }
                                                                }
                                                            } catch (error) {
                                                            }
                                                        } catch (error) {
                                                            console.log("error aqui " + error)
                                                            //morecomments=null;
                                                            //pub['comments']=comments_dict
                                                        }
                                                        try {
                                                            if (!('interactions' in pub)) {
                                                                if (root.outerHTML.includes("https://scontent-gru1-1.xx.fbcdn.net/m1/v/t6/")) {
                                                                    pub["interactions"] = true;
                                                                }
                                                            }
                                                        } catch (error) {
                                                        }
                                                        index2++;
                                                    }
                                                }
                                            } else {
                                                morecomments = null;
                                            }
                                        } catch (error) {
                                            console.log(error);
                                            morecomments = null;
                                        }
                                    }else{morecomments=null; t="bloqueo temporal";}
                                    return [pub, persons, morecomments, confirmacion1, confirmacion, urlsposts, t];
                                }
                            }).then(function (resultados) {
                                if (resultados[0]["result"] !== null) {
                                    publis[i] = resultados[0]["result"][0];
                                    pub = publis[i];
                                    persons = resultados[0]["result"][1];
                                    morecomments = escaparCaracteresEspeciales(resultados[0]["result"][2]);
                                    confirmacion1 = resultados[0]["result"][3];
                                    confirmacion = resultados[0]["result"][4];
                                    urlsposts = resultados[0]["result"][5];
									t=resultados[0]["result"][6];
                                }
                            }).catch(function (error) {
                                // Manejar errores
                                morecomments = null;
                                stringflujotxt += "[" + getFormattedDateTime() + "] 1666 prgc " + error + "\n";
								stringflujotxt2 += "[" + getFormattedDateTime() + "] 1666 prgc " + error + "\n";
                            });
							if(t.includes("bloqueo temporal")){
								i=indice;
								morecomments="Se acabo";
								stringflujotxt += "[" + getFormattedDateTime() + "] Se acabo 'getcomments' por bloqueo temporal  " + error + "\n";
								break;
							}	
							if (TimerForScrp() === true){
									morecomments = "Se acabo";
									break;	
								} 
                            if (morecomments !== null && morecomments !== "" && morecomments !== undefined) {
								var min = 5;
								var max = 10;
								var numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
                                await chrome.scripting.executeScript({
                                    target: {tabId: tab.id},
                                    args: [morecomments, numeroAleatorio],
                                    function: async function (morecomments,numeroAleatorio) {
                                        return new Promise(resolve => {
                                            setTimeout(() => {
                                                try {
                                                    if (document.querySelector("#" + morecomments) !== null) {
                                                        document.querySelector("#" + morecomments).childNodes[0].click();
                                                    } else {
                                                        morecomments = null;
                                                        resolve();
                                                    }
                                                } catch (error) {
                                                    morecomments = null;
                                                    resolve();
                                                }
                                            }, 7000)
                                        });
                                    }
                                }).then(function (resultados) {
                                    return resultados[0]["result"]
                                }).catch(function (error) {
                                    // Manejar errores
                                    morecomments = null;
                                    stringflujotxt += "[" + getFormattedDateTime() + "] 1705 prgc " + error + "\n";
									stringflujotxt2 += "[" + getFormattedDateTime() + "] 1705 prgc " + error + "\n";
                                });
                            }else{
								morecomments="Se acabo"
							}	
                            await chrome.history.deleteAll();
                        }
                    }
                } catch (error) {
                    console.log(error);
                    stringflujotxt += "[" + getFormattedDateTime() + "] 1715 prgc " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 1715 prgc " + error + "\n";
                }
            }
        } catch (error) {
            console.log(error);
            stringflujotxt += "[" + getFormattedDateTime() + "] 1721 prgc " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 1721 prgc " + error + "\n";
        }
    }
    await getSubcomments(tab, publis, persons, idusu).then(function (resultados) {
        publis = resultados[0];
        persons = resultados[1];
    });
    return [publis, persons]
}


async function getSubcomments(tab, publis, persons, idusu) {
    var pub;
    const indice = publis.length;
    var morecomments2 = "c";
    var url;
    var confirmacion1 = "";
    var confirmacion = "";
    var confirmacion3 = false;
	var block = "";
    for (var i = 0; i < publis.length; i++) {
        if (publis[i].hasOwnProperty('subcommetsurl') && (publis[i]['subcommetsurl'] == true)) {
            try {
                pub = publis[i];
                morecomments2 = "c";
                url="";
                confirmacion1 = "";
                confirmacion = "";
                confirmacion3 = false;
                for (let t = 0; t < Object.keys(pub['comments']).length; t++) {
                    if ("subcommetsurl" in pub["comments"][t]) {
                        url = pub["comments"][t]['subcommetsurl'];
                        await loadPage(tab, url, confirmacion3).then(function (resultados) {
                            confirmacion3 = resultados[0];
                        }).catch(function (error) {
                            // Manejar errores
                            stringflujotxt += "[" + getFormattedDateTime() + "] 1758 prgsc " + error + "\n";
							stringflujotxt2 += "[" + getFormattedDateTime() + "] 1758 prgsc " + error + "\n";
                        });
                        var urlcomparision = await geturl(tab).catch(function (error) {
							// Manejar errores
							stringflujotxt += "[" + getFormattedDateTime() + "] 1563 prgsc " + error + "\n";
							stringflujotxt2 += "[" + getFormattedDateTime() + "] 1563 prgsc " + error + "\n";
						});
						if (urlcomparision[0] == "https://m.facebook.com/"){
							confirmacion3=false;
							stringflujotxt += "[" + getFormattedDateTime() + "] En el getSubcomments no ha cargado la vista por parte de facebook. \n";
						}else{
							confirmacion3=true;
						}
                        if (confirmacion3 === true) {
                            while (morecomments2 != "Se acabo") {
                                await chrome.scripting.executeScript({
                                    target: {tabId: tab.id},
                                    args: [pub, persons, morecomments2, confirmacion, confirmacion1, urlsposts, block],
                                    function: async function (pub, persons, morecomments2, confirmacion, confirmacion1, urlsposts, block) {
                                        if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                                            try {
                                                var index2 = Object.keys(pub['comments']).length;
                                                var index;
                                                var root = document.querySelector("#root").childNodes[0].childNodes[2];
                                                index = document.querySelector("#root").childNodes[0].childNodes[2].childElementCount;
                                                if (confirmacion1 === null || confirmacion1 === "" || confirmacion1 === undefined) {
                                                    for (let u = 0; u < index; u++) {
                                                        if (root.childNodes[u].id.includes("comment_replies_more")) {
                                                            confirmacion1 = u;
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    var confirmacion2;
                                                    for (let u = 0; u < index; u++) {
                                                        if (root.childNodes[u].id.includes("comment_replies_more")) {
                                                            confirmacion2 = u;
                                                            break;
                                                        }
                                                    }
                                                    if (confirmacion2 !== confirmacion1) {
                                                        confirmacion1 = null;
                                                    }
                                                }
                                                if (confirmacion1 !== null && confirmacion1 !== "" && confirmacion1 !== undefined) {
                                                    if (root.childNodes[confirmacion1].textContent.toLowerCase().includes("ver") || root.childNodes[confirmacion1].textContent.toLowerCase().includes("see") || root.childNodes[confirmacion1].textContent.toLowerCase().includes("view")) {
                                                        morecomments2 = root.childNodes[confirmacion1].childNodes[0].id;
                                                    } else {
                                                        morecomments2 = null;
                                                    }
                                                } else {
                                                    morecomments2 = null;
                                                }
                                                if ((confirmacion1 !== null && confirmacion1 !== "" && confirmacion1 !== undefined) || ((confirmacion1 === null || confirmacion1 === "" || confirmacion1 === undefined)  && (root.childElementCount > 0))) {
                                                    for (let o = 0; o < root.childElementCount; o++) {
                                                        if (o !== confirmacion1 && !root.childNodes[o].id.includes("comment_replies_more")) {
                                                            comments_dict = {}
                                                            persons_dict = {}
                                                            try {
																var fecha = "";
																fecha=root.childNodes[o].childNodes[0].childNodes[3].childNodes[root.childNodes[o].childNodes[0].childNodes[3].childElementCount - 1].textContent;
																fecha=fecha.replace('de','').replace('a las','').replace('.','');
																var fecha2=new Date();
																if(!fecha.includes(fecha2.getFullYear().toString().substr(0,3))){
																	fecha=new Date(fecha + ' ' + fecha2.getFullYear()).toISOString().split('.')[0].replace('T',' ');
																   } else{
																	fecha=new Date(fecha).toISOString().split('.')[0].replace('T',' ');
																   } 
																comments_dict['commentDate'] = fecha;
															} catch (error) {
																comments_dict['commentDate'] = "";
															}
                                                            try {
                                                                comments_dict['commentId'] = root.childNodes[o].id
                                                            } catch (error) {
                                                                comments_dict['commentId'] = ""
                                                            }
                                                            try {
                                                                if (root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.includes('/profile.php?id=') == true) {
                                                                    comments_dict['personId'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                                    persons_dict['id'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                                    persons_dict['alias'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\d+/)[0];
                                                                } else {
                                                                    comments_dict['personId'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                                    persons_dict['id'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                                    persons_dict['alias'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].href.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                                                }
                                                                persons_dict['name'] = root.childNodes[o].childNodes[0].childNodes[0].childNodes[0].textContent;
                                                            } catch (error) {
                                                                comments_dict['personId'] = "";
                                                            }
                                                            try {
                                                                comments_dict['commentText'] = root.childNodes[o].childNodes[0].childNodes[1].textContent;
                                                                if (root.childNodes[o].childNodes[0].childNodes[2].childElementCount > 0) {
                                                                    if (root.childNodes[o].childNodes[0].childNodes[2].outerHTML.includes("/video_redirect/?")) {
                                                                        try {
                                                                            comments_dict['videourl'] = root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href
                                                                            comments_dict['imageurl'] = root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src
                                                                            comments_dict['commentText'] += "\\n" + root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href + "\\n" + root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src
                                                                        } catch (error) {
                                                                            comments_dict['commentText'] += "\\n" + root.childNodes[o].childNodes[0].childNodes[2].outerHTML
                                                                        }
                                                                    } else if (posts[i].outerHTML.includes("/photo.php?")) {
                                                                        try {
                                                                            comments_dict['imageurl'] = root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src
                                                                            comments_dict['commentText'] += "\\n" + root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src
                                                                        } catch (error) {
                                                                            comments_dict['commentText'] += "\\n" + root.childNodes[o].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src
                                                                        }

                                                                    } else {
                                                                        comments_dict['commentText'] += "\\n" + root.childNodes[o].childNodes[0].childNodes[2].outerHTML
                                                                    }
                                                                }
                                                            } catch (error) {
                                                                comments_dict['commentText'] = ""
                                                            }
                                                            //comment.childNodes[0].childNodes[0].childNodes[4].childNodes[0].id
                                                            try {
                                                                pub['comments'][index2] = comments_dict;
                                                                persons[persons_dict['id']] = persons_dict;
                                                                var image_dict = {}
                                                                try {
                                                                    if (!comments_dict['videourl']) {
                                                                        if (comments_dict['videourl'] != "" && comments_dict['videourl'] != undefined) {
                                                                            image_dict = {}
                                                                            image_dict["id"] = comments_dict['commentId'] + '.mp4';
                                                                            image_dict["url"] = comments_dict['videourl'];
                                                                            comments_dict['image'] = comments_dict['commentId'] + '.mp4';
                                                                            urlsposts.push(image_dict);
                                                                        }
                                                                    }
                                                                } catch (error) {
                                                                }
                                                                try {
                                                                    if (!comments_dict['imageurl']) {
                                                                        if (comments_dict['imageurl'] != "" && comments_dict['imageurl'] != undefined) {
                                                                            image_dict = {}
                                                                            image_dict["id"] = comments_dict['commentId'] + '.jpg';
                                                                            image_dict["url"] = comments_dict['imageurl'];
                                                                            comments_dict['image'] = comments_dict['commentId'] + '.jpg';
                                                                            urlsposts.push(image_dict);
                                                                        }
                                                                    }
                                                                } catch (error) {
                                                                }
                                                            } catch (error) {
                                                                console.log("error aqui " + error)
                                                                //pub['comments']=comments_dict
                                                            }
                                                            index2++;
                                                        }
                                                    }
                                                } else {
                                                    morecomments2 = null;
                                                }
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        } else {
                                            morecomments2 = null;
                                            block = "bloqueo temporal";
                                        }
                                        return [pub, persons, morecomments2, confirmacion1, confirmacion, urlsposts, block];
                                    }
                                }).then(function (resultados) {
                                    publis[i] = resultados[0]["result"][0];
                                    pub = publis[i];
                                    persons = resultados[0]["result"][1];
                                    morecomments2 = escaparCaracteresEspeciales(resultados[0]["result"][2]);
                                    confirmacion1 = resultados[0]["result"][3];
                                    confirmacion = resultados[0]["result"][4];
                                    urlsposts = resultados[0]["result"][5];
									block=resultados[0]["result"][6];
                                }).catch(function (error) {
                                    // Manejar errores
                                    morecomments2 = null;
                                    stringflujotxt += "[" + getFormattedDateTime() + "] 1936 prgsc " + error + "\n";
									stringflujotxt2 += "[" + getFormattedDateTime() + "] 1936 prgsc " + error + "\n";
                                });
								if(block.includes("bloqueo temporal")){
										morecomments2 ="Se acabo";
										i=indice;
										stringflujotxt += "[" + getFormattedDateTime() + "] Se acabo 'getsubcomments' por bloqueo temporal  " + error + "\n";
										break;
									}
								if (TimerForScrp() === true){
									morecomments2 = "Se acabo";
									break;	
								} 
                                if (morecomments2 !== null && morecomments2 !== "" && morecomments2 !== undefined) {
									var min = 5;
									var max = 10;
									var numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
                                    await chrome.scripting.executeScript({
                                        target: {tabId: tab.id},
                                        args: [morecomments2, i, indice,numeroAleatorio],
                                        function: async function (morecomments2, i, indice,numeroAleatorio) {
                                            return new Promise(resolve => {
                                                setTimeout(() => {
                                                    try {
                                                        if (document.querySelector("#" + morecomments2) !== null) {
                                                            document.querySelector("#" + morecomments2).childNodes[0].click();
                                                        } else {
                                                            morecomments2 = null;
                                                            resolve();
                                                        }
                                                    } catch (error) {
                                                        morecomments2 = null;
                                                        resolve();
                                                    }
                                                }, 7000)
                                            });
                                        }
                                    }).then(function (resultados) {
                                        return resultados[0]["result"];
                                    }).catch(function (error) {
                                        // Manejar errores
                                        morecomments2 = null;
                                        stringflujotxt += "[" + getFormattedDateTime() + "] 1974 prgc " + error + "\n";
										stringflujotxt2 += "[" + getFormattedDateTime() + "] 1974 prgc " + error + "\n";
                                    });
                                }else{
									morecomments2 ="Se acabo"
								}	
                            }
                        }
                    }
                    await chrome.history.deleteAll();
                }
            } catch (error) {
                stringflujotxt += "[" + getFormattedDateTime() + "] 1987 prgc " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 1987 prgc " + error + "\n";
            }
        }
    }
    return [publis, persons]
}

async function getPublication(tab, idusu, nameusu, aliasusu) {
	stringflujotxt += "Estamos en publicaciones.\n";
    var idposts = [];
    var confirmacion = "";
    var fechaActual = new Date(); // obtener la fecha actual
    var anhoActual = fechaActual.getFullYear(); // obtener el a�o actual
    var fecha = "01-01-" + (anhoActual + 1);
    var milisegundos = Date.parse(fecha); // convertir la fecha a milisegundos
    var segundos = milisegundos / 1000; // convertir los milisegundos a segundos
    var url = "https://mbasic.facebook.com/profile/timeline/stream/?end_time=" + segundos + "&profile_id=" + idusu;
    await loadPage(tab, url, confirmacion).then(function (resultados) {
        confirmacion = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 2008 prgp " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2008 prgp " + error + "\n";
    });
    var urlcomparision = await geturl(tab).catch(function (error) {
		// Manejar errores
		stringflujotxt += "[" + getFormattedDateTime() + "] 2013 prgc " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2013 prgc " + error + "\n";
	});
	if (urlcomparision[0] == "https://m.facebook.com/"){
		confirmacion=false;
		stringflujotxt += "[" + getFormattedDateTime() + "] En el getPublication no ha cargado la vista por parte de facebook. \n";
	}else{
		confirmacion=true;
	}
    var arrayurls = [];
    var publis = [];
    var persons = {};
    var morepost = "e";
    var cont = 1;
    if (confirmacion === true) {
		while (morepost !== "Se acabo") {
			await chrome.scripting.executeScript({
				target: {tabId: tab.id},
				args: [idposts, arrayurls, publis, idusu, nameusu, aliasusu, morepost, urlsposts],
				function: async function (idposts, arrayurls, publis, idusu, nameusu, aliasusu, morepost, urlsposts) {
					var publicaciones;
					var posts;
					var stringflujotxt = "";
					arrayurls.push(window.location.href);
					var confirmacion;
					var imageurl = [];
					var videourl = [];
					var image = [];
					var video = [];
					if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
						posts = document.querySelectorAll("div[role='article']");
                        var html="e"
						if (posts.length > 0) {
							for (let i = 0; i < posts.length; i++) {
								publicaciones = {}
								imageurl = [];
								videourl = [];
								image = [];
								video = [];
								try {
                                    confirmacion = JSON.parse(posts[i].attributes['data-ft'].textContent).tl_objid;
									if (!idposts.includes(confirmacion)) {
										try {
											if (JSON.parse(posts[i].attributes['data-ft'].textContent).tl_objid!==null && JSON.parse(posts[i].attributes['data-ft'].textContent).tl_objid!==undefined && JSON.parse(posts[i].attributes['data-ft'].textContent).tl_objid!==0){
												publicaciones['publicationId'] = JSON.parse(posts[i].attributes['data-ft'].textContent).tl_objid;
											}else{
												for (let t = 0; t < posts[i].childNodes[1].childElementCount; t++) {
													if (posts[i].childNodes[1].childNodes[t].outerHTML.includes('/composer/')){ 
														var cadena=posts[i].childNodes[1].childNodes[t].outerHTML.match(/<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i)[1];
														try{
															publicaciones['publicationId'] = cadena.match(/(ft_ent_identifier=|fbid=|sid=)([0-9]+)/g)[0].match(/\d+/g)[0];
													   }catch(error){
														   stringflujotxt += error+". Al obtener id posts primer metodo.\n";
														   // Expresi�n regular para el id del div
															const idRegex = /reactions_[0-9]/;
															const idRegex2= /like_[0-9]/
															posts.forEach(div => {
															try{
																// Verificar si el id del div coincide con la expresi�n regular
																if (idRegex.test(div.childNodes[1].childNodes[1].id) || idRegex2.test(div.childNodes[1].childNodes[1].id)) {
																// El id del div coincide, realizar la acci�n deseada
																publicaciones['publicationId']=div.childNodes[1].childNodes[1].id.match(/\d+/g)[0];
																// Puedes realizar otras acciones con el div, como cambiar su estilo, a�adir contenido, etc.
																}
															}catch (error) {
																stringflujotxt += error+". Al obtener id posts segundo metodo.\n";
															}
														  });}
													}	
												}	
											}
										} catch (error) {
											stringflujotxt += error+". Al intentar buscar el id de posts. Se intentar� una segunda vez.\n";
                                            location.reload(true);
                                            for (let t = 0; t < posts[i].childNodes[1].childElementCount; t++) {
													if (posts[i].childNodes[1].childNodes[t].outerHTML.includes('/composer/')){ 
														var cadena=posts[i].childNodes[1].childNodes[t].outerHTML.match(/<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i)[1];
														try{
															publicaciones['publicationId'] = cadena.match(/(ft_ent_identifier=|fbid=|sid=)([0-9]+)/g)[0].match(/\d+/g)[0];
													   }catch(error){
														   // Expresi�n regular para el id del div
															const idRegex = /reactions_[0-9]/;
															const idRegex2= /like_[0-9]/
															posts.forEach(div => {
															try{
																// Verificar si el id del div coincide con la expresi�n regular
																if (idRegex.test(div.childNodes[1].childNodes[1].id) || idRegex2.test(div.childNodes[1].childNodes[1].id)) {
																// El id del div coincide, realizar la acci�n deseada
																publicaciones['publicationId']=div.childNodes[1].childNodes[1].id.match(/\d+/g)[0];
																// Puedes realizar otras acciones con el div, como cambiar su estilo, a�adir contenido, etc.
																}
															}catch (error) {
															}
														  });}
													}	
												}	
										}
                                        try{
                                            if (publicaciones['publicationId']===0 || publicaciones['publicationId']==="-1"){
                                                html = document.documentElement.outerHTML;
                                            }
                                        }catch (error) {
											stringflujotxt += error+". Al obtener id posts. Se descargar� el html.\n";
                                            html = document.documentElement.outerHTML;
                                        }
										try {
											var fecha="";
											fecha=posts[i].childNodes[1].childNodes[0].childNodes[0].textContent;
											fecha=fecha.replace('de','').replace('a las','');
											var fecha2=new Date();
											if(!fecha.includes(fecha2.getFullYear().toString().substr(0,3))){
												fecha=new Date(fecha + ' ' + fecha2.getFullYear()).toISOString().split('.')[0].replace('T',' ');
											   } else{
												fecha=new Date(fecha).toISOString().split('.')[0].replace('T',' ');
											   } 
											publicaciones['publicationDate'] = fecha;
										} catch (error) {
											stringflujotxt += error+". Al obtener las fecha primer metodo.\n";
											var fecha="";
											fecha=posts[i].childNodes[1].childNodes[0].childNodes[2].textContent;
											fecha=fecha.replace('de','').replace('a las','');
											var fecha2=new Date();
											if(!fecha.includes(fecha2)){
												fecha=new Date(fecha + ' ' + fecha2).toISOString().split('.')[0].replace('T',' ');
											   } else{
												fecha=new Date(fecha).toISOString().split('.')[0].replace('T',' ');
											   } 
											publicaciones['publicationDate'] = fecha;
										}
										if (posts[i].outerHTML.includes("/video_redirect/?")) {
											publicaciones['publicationType'] = "video";
											try {
												if (posts[i].childNodes[0].childNodes[2].childNodes[0].childElementCount > 1) {
													for (let t = 0; t < posts[i].childNodes[0].childNodes[2].childNodes[0].childElementCount; t++) {
														videourl.push(posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[t].childNodes[0].href);
														var image_dict = {}
														image_dict["id"] = publicaciones['publicationId'] + '_' + [t].toString() + '.mp4';
														video.push(publicaciones['publicationId'] + '_' + [t].toString() + '.mp4');
														image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[t].childNodes[0].href;
														urlsposts.push(image_dict);
													}
												} else {
													videourl.push(posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href);
													var image_dict = {}
													image_dict["id"] = publicaciones['publicationId'] + '.mp4';
													video.push(publicaciones['publicationId'] + '.mp4');
													image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href;
													urlsposts.push(image_dict);
												}
											} catch (error) {
												stringflujotxt += error+". Al obtener video.\n";
												try {
													videourl.push(posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href);
												} catch (error) {
													stringflujotxt += error+". Al obtener video 2 vez.\n";
													videourl.push("can't found url video");
												}
											}
											publicaciones['videourl'] = videourl
										} else if (posts[i].outerHTML.includes("/photo.php?")) {
											publicaciones['publicationType'] = "photo";
											try {
												if (posts[i].childNodes[0].childNodes[2].childNodes[0].childElementCount > 1) {
													for (let t = 0; t < posts[i].childNodes[0].childNodes[2].childNodes[0].childElementCount; t++) {
														imageurl.push(posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[t].childNodes[0].src);
														var image_dict = {}
														image_dict["id"] = publicaciones['publicationId'] + '_' + [t].toString() + '.jpg';
														image.push(publicaciones['publicationId'] + '_' + [t].toString() + '.jpg');
														image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[t].childNodes[0].src;
														urlsposts.push(image_dict);
													}
												} else {
													imageurl.push(posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src);
													var image_dict = {}
													image_dict["id"] = publicaciones['publicationId'] + '.jpg';
													image.push(publicaciones['publicationId'] + '.jpg');
													image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].src;
													urlsposts.push(image_dict);
												}
											} catch (error) {
												stringflujotxt += error+". Al obtener imagen.\n";
												try {
													imageurl.push(posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src);
													var image_dict = {}
													image_dict["id"] = publicaciones['publicationId'] + '.jpg';
													image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src;
													urlsposts.push(image_dict);
												} catch (error) {
													stringflujotxt += error+". Al obtener imagen 2 vez.\n";
													imageurl.push("Can't found url");
												}
											}
											publicaciones['imageurl'] = imageurl
											publicaciones['image'] = image
										} else {
											publicaciones['publicationType'] = "text";
										}
										try {
											publicaciones['presentationPublication'] = posts[i].childNodes[0].childNodes[0].textContent;
										} catch (error) {
											console.log("Error en presentacion");
										}
										try {
											publicaciones['text'] = posts[i].childNodes[0].childNodes[1].textContent;
										} catch (error) {
											console.log("Error en text");
										}
										try {
											if (posts[i].outerHTML.toLowerCase().includes("comentario") || posts[i].outerHTML.toLowerCase().includes("comment")) {
												var posibles_comments=posts[i].querySelectorAll('a[href*="/');
												for (let u = 0; u < posibles_comments.length; u++) {
													try {
														if (posibles_comments[u].textContent.toLowerCase().includes('comentario') || posibles_comments[u].textContent.toLowerCase().includes('comment')) {
															publicaciones['totalComments'] = posibles_comments[u].textContent.match(/\d+/)[0];
															publicaciones['commentsurl'] = posibles_comments[u].href;
															publicaciones['comments'] = {};
															break;
														}
													} catch (error) {
														stringflujotxt += error+". Al obtener n�mero de comentarios.\n";
													}
												}												
                                                if (!publicaciones.hasOwnProperty('commentsurl')){
													for (let u = 0; u < posts[i].childNodes[1].childNodes[1].childElementCount; u++) {
													if (posts[i].childNodes[1].childNodes[1].childNodes[u].textContent.includes("comentario")||posts[i].childNodes[1].childNodes[1].childNodes[u].textContent.includes("comment") ) {
														try{ 
															publicaciones['totalComments'] = posts[i].childNodes[1].childNodes[1].childNodes[u].textContent.match(/\d+/)[0];
														}	catch (error) {
															stringflujotxt += error+". Al obtener comentarios.\n";
															publicaciones['totalComments'] = posts[i].childNodes[1].childNodes[2].childNodes[u].textContent.match(/\d+/)[0];
														}
														try{ 
															publicaciones['commentsurl'] = posts[i].childNodes[1].childNodes[1].childNodes[u].href;
														}	catch (error) {
															stringflujotxt += error+". Al obtener url comentarios.\n";
															publicaciones['commentsurl'] = posts[i].childNodes[1].childNodes[2].childNodes[u].href;
														}														
														publicaciones['comments'] = {};
														break;
													}
													}
                                                }
											} else {
												publicaciones['totalComments'] = "0";
											}
										} catch (error) {
											stringflujotxt += error+". No se encontro comentarios.\n";
											//publicaciones['totalComments'] = posts[6].childNodes[1].childNodes[1]
											publicaciones['totalComments'] = "0";
										}
										infoGenerator = {}
										infoGenerator['name'] = nameusu;
										infoGenerator['id'] = idusu;
										infoGenerator['alias'] = aliasusu;
										publicaciones['infoGenerator'] = infoGenerator;
										try {
											if (posts[i].attributes['data-ft'].textContent.includes("original_content_id") || posts[i].childNodes[0].outerHTML.includes('<div role="article"') ) {
												var validaciontext;
												publicaciones['text'] = publicaciones['text'] + "\n" + posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[1].textContent;
												try {
													validaciontext = posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[1].textContent
												} catch (error) {
												}
												if (validaciontext) {
													publicaciones['text'] = publicaciones['text'] + "\n" + validaciontext;
												}
												if (posts[i].outerHTML.includes("<img src")) {
													try {
														imageurl.push(posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].outerHTML.split('<img src="')[1].split('"')[0]);
														var image_dict = {}
														if (image.length > 0){ 
															image_dict["id"] = publicaciones['publicationId'] + '_' + image.length + 1 + '.jpg';
															image.push(publicaciones['publicationId'] + '_' + image.length + 1 + '.jpg');
														} else{
															image_dict["id"] = publicaciones['publicationId'] + '.jpg';
															image.push(publicaciones['publicationId'] + '.jpg');
														}	
														image_dict["url"] = posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].outerHTML.split('<img src="')[1].split('"')[0];
														urlsposts.push(image_dict);
														publicaciones['publicationType'] = "photo";
													} catch (error) {
														//publicaciones['imageurl'] = posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src
													}
												}
												if(posts[i].childNodes[0].childNodes[2].outerHTML.includes('Este contenido no est� disponible en este momento')){
														publicaciones['text'] = publicaciones['text'] + '\n' + 'Este contenido no est� disponible en este momento';
												   } 
												if (JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id !== idusu && JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id !== null && JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id !== undefined && JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id !== "") {
													publicaciones['isShared'] = true;
													infoOriginalGenerator = {}
													try {
														infoOriginalGenerator['name'] = JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id;
													} catch (error) {
														infoOriginalGenerator['name'] = ""
													}
													try {
														infoOriginalGenerator['id'] = JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id;
													} catch (error) {
														infoOriginalGenerator['id'] = ""
													}
													try {
														infoOriginalGenerator['alias'] = JSON.parse(posts[i].attributes['data-ft'].textContent).original_content_owner_id;
													} catch (error) {
														infoOriginalGenerator['alias'] = ""
													}
													publicaciones['infoOriginalGenerator'] = infoOriginalGenerator;
												} else if (!posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML.split('<a href="/')[1].split('">')[0].includes(idusu)){
													var href=posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML.split('<a href="/')[1].split('">')[0];
													var posiblealias="";
													publicaciones['isShared'] = true;
													try {
														if (href.includes("profile.php?id=")) {
															posiblealias = href.split('?id=')[1].split('&')[0];
														} else if (href.includes("profile.php/?id=")) {
															posiblealias = href.split('?id=')[1].split('&')[0];
														} else {
															posiblealias = href.split('?eav')[0];
														}
													} catch (error) {
														stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'userreport'(id por url href):  " + error + "\n";
														posiblealias = ""
													}
													infoOriginalGenerator = {}
													try {
														infoOriginalGenerator['name'] = posts[i].childNodes[0].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent;
													} catch (error) {
														infoOriginalGenerator['name'] = ""
													}
													try {
														infoOriginalGenerator['id'] = posiblealias;
													} catch (error) {
														infoOriginalGenerator['id'] = ""
													}
													try {
														infoOriginalGenerator['alias'] = posiblealias;
													} catch (error) {
														infoOriginalGenerator['alias'] = ""
													}
													publicaciones['infoOriginalGenerator'] = infoOriginalGenerator;
												}	else {
													publicaciones['isShared'] = false;
												}
											} else {
												publicaciones['isShared'] = false;
											}
										} catch (error) {
										}
										try {
											if (posts[i].outerHTML.includes('id="like_')|| posts[i].outerHTML.includes('id="reactions_')|| posts[i].outerHTML.includes("https://scontent-gru1-1.xx.fbcdn.net/m1/v/t6/")) { //||  posts[i].outerHTML.includes("id=reactions_") 
                                                try{  
                                                    publicaciones['totalLikes'] = document.querySelector('span[id="like_'+publicaciones['id']+'"]').childNodes[0].textContent;
                                                }catch(error){
													try{
														publicaciones['totalLikes'] = posts[i].childNodes[1].childNodes[1].childNodes[0].childNodes[0].textContent;
													}catch(error){
														publicaciones['totalLikes'] = posts[i].childNodes[1].childNodes[2].childNodes[0].childNodes[0].textContent;

													}
												}		
												publicaciones['interactions'] = true
											}else {
												publicaciones['totalLikes'] = "0";
											}
										} catch (error) {
											stringflujotxt += error+". Al obtener interacciones en getpublications.\n";
										}
										try {
											if (!arrayurls.includes(document.querySelector('#structured_composer_async_container').childNodes[1].childNodes[0].href)) {
												var confir='';
												try{
													confir = document.querySelector('#structured_composer_async_container').childNodes[1].id;
												}catch(error){
													confir='';
												}	
												if ( confir !== '') {
													morepost = confir;
												} else {
													morepost = null;
												}
											} else {
												morepost = null
											}
										} catch (error) {
											stringflujotxt += error+". Al obtener ver mas.\n";
											console.log(error);
											morepost = null;
										}
										publis.push(publicaciones);
										idposts.push(publicaciones["publicationId"]);
									}
								} catch (error) {
									console.log(error);
								}
							}
						} else {
							morepost = null;
						}
					}else{morepost=null;}
					return [publis, idposts, morepost, arrayurls, urlsposts, html,stringflujotxt]
				}
			}).then(function (resultados) {
				if (resultados[0]["result"] !== null) {
					download_resources_posts(idusu);
					publis = resultados[0]["result"][0];
					idposts = resultados[0]["result"][1];
					morepost = escaparCaracteresEspeciales(resultados[0]["result"][2]);
					arrayurls = resultados[0]["result"][3];
					urlsposts = resultados[0]["result"][4];
                    if (resultados[0]["result"][5]!=="e"){
                        savehtml(resultados[0]["result"][5], generarCadenaAlfanumerica(3));
                    }
					stringflujotxt += resultados[0]["result"][6];			
				}
			}).catch(function (error) {
				// Manejar errores
				morepost = null;
				stringflujotxt += "[" + getFormattedDateTime() + "] 2429 prgc " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 2429 prgc " + error + "\n";
			});
			if (publis.length >= limitepost) {
				morepost = null;
				break;
			}
			if (TimerForScrp() === true){
				morepost = null;
				break;	
			} 
			if (morepost !== null && morepost !== "" && morepost !== undefined) {
				var min = 5;
				var max = 10;
				var numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
				await chrome.scripting.executeScript({
					target: {tabId: tab.id}, args: [arrayurls, numeroAleatorio], function: async function (arrayurls, numeroAleatorio) {
						return new Promise(resolve => {
							setTimeout(() => {
                                try {
                                    if (!arrayurls.includes(document.querySelector('#structured_composer_async_container').childNodes[1].childNodes[0].href)) {
                                        document.querySelector('#structured_composer_async_container').childNodes[1].childNodes[0].click();
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
							}, 7000)
						});
					}
				}).then(function (resultados) {
					return resultados[0]["result"];
				}).catch(function (error) {
					// Manejar errores
					morepost = null;
					stringflujotxt += "[" + getFormattedDateTime() + "] 2459 prgc " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 2459 prgc " + error + "\n";
				});
			} else {
				morepost = "Se acabo"
				stringflujotxt += "[" + getFormattedDateTime() + "] apuntito de terminar.\n";
			}
			await chrome.history.deleteAll();
		}
    }
    return [publis]
}

async function getInteractions(tab, publis, idusu, interacciones) {
	stringflujotxt += "Estamos en interacciones.";
    var interactions = {};
    var pub = {}
    var moreinteractions = "";
    var indice = publis.length;
    for (var i = 0; i < publis.length; i++) {
        if (publis[i]['interactions'] == true) {
            interactions = {'idPublicacion': null, 'interacciones': []};
            var confirmacion = false;
            try {
                pub = publis[i];
                interactions['idPublicacion'] = publis[i]['publicationId'];
                var url = "https://m.facebook.com/ufi/reaction/profile/browser/?ft_ent_identifier=" + pub['publicationId']
                await loadPage(tab, url, confirmacion).then(function (resultados) {
                    confirmacion = resultados[0];
                }).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] 2491 prgi " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 2491 prgi " + error + "\n";
                });
				var urlcomparision = await geturl(tab).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'geturl()':  " + error + "\n";
                });
				if (urlcomparision[0]  === "https://m.facebook.com/"){
					stringflujotxt += "[" + getFormattedDateTime() + "] En el posts: "+publis[i]['publicationId']+" no ha cargado interacciones por parte de facebook. \n";
					var mor="1";
					await chrome.scripting.executeScript({
							target: {tabId: tab.id}, args: [pub], function: async function (pub) {
								return new Promise(resolve => {
										setTimeout(() => {
											window.location.href = "https://mbasic.facebook.com/ufi/reaction/profile/browser/?ft_ent_identifier=" + pub['publicationId'];
										}, 7000)
									}

								);
							}
						}).catch(function (error) {
							// Manejar errores
							confirmacion=false;
							stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'getInteractions':(Cambiando version)  " + error + "\n";
						});
						urlcomparision = await geturl(tab).catch(function (error) {
										// Manejar errores
										stringflujotxt += "[" + getFormattedDateTime() + "] 2518 prgi " + error + "\n";
										stringflujotxt2 += "[" + getFormattedDateTime() + "] 2518 prgi " + error + "\n";
									});
									if(urlcomparision === "https://m.facebook.com/"){
									   confirmacion=false;
									} else{
									   confirmacion=true;
								   } 
				}else{
					confirmacion=true;
				}	
                if (confirmacion === true) {
					var i2=i;
					await extractInteractions(tab,urls,i2,indice,interactions,i).then(function (resultados) {
						interactions=resultados[0];
						urls=resultados[1];
						i=resultados[2];
					}).catch(function (error) {
						// Manejar errores
						stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'extractInteractions':(interactions_dict)  " + error + "\n";
					});
                    await scrollAll(tab,pub,urls,i2,indice,interactions,i).then(function (resultados) {
						interactions=resultados[0];
						urls=resultados[1];
						i=resultados[2];
					}).catch(function (error) {
						// Manejar errores
						stringflujotxt += "[" + getFormattedDateTime() + "] Error in 'extractInteractions':(interactions_dict)  " + error + "\n";
					});
                    var urlprofile;
                    if (interactions['interacciones'].length > 0 ){
                        interacciones.push(interactions);
                    }
                    await chrome.history.deleteAll();
                }
				if (TimerForScrp() === true){
					i=publis.length
					confirmacion = false;
					break;	
				} 
            } catch (error) {
                stringflujotxt += "[" + getFormattedDateTime() + "] 2554 prgi " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 2554 prgi " + error + "\n";
            }
        }
    }
    return [publis, interacciones]
}

async function extractInteractions(tab,urls,i2,indice, interactions,i){
	await chrome.scripting.executeScript({
                        target: {tabId: tab.id}, args: [urls, i2, indice], function: async function (urls, i2, indice) {
                            if (!document.querySelector('#root').textContent.includes('forma indebida')  && !document.querySelector('#root').textContent.includes('Limitamos la fecuencia')  && !document.querySelector('#root').textContent.includes('uso indebido')&&  !document.querySelector('#root').outerHTML.includes('help/contact/571927962827151?additional_content')) {
                                var interaccion;
                                interaccion = document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1];
                                var url = window.location.href;
                                var more;
                                var interacciones = [];
                                if (interaccion === undefined || interaccion === "") {
                                    interaccion = document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0];
                                }
                                if (interaccion.childElementCount > 0) {
                                    for (let o = 0; o < (interaccion.childElementCount); o++) {
                                        interaccions_dict = {}
										if(!interaccion.childNodes[o].outerHTML.includes('more') && !interaccion.childNodes[o].outerHTML.includes('mas')){ 
                                        try {
                                            try{
                                                urlprofile = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[1].childNodes[0].href;
                                            } catch (error) {
                                                try{
                                                    urlprofile = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href;
                                            } catch (error) {
                                                    if (interaccion.childNodes[o].childNodes[0].outerHTML.includes('/profile.php?id=')){
                                                        urlprofile = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href;
                                                    }else if(interaccion.childNodes[o].childNodes[0].outerHTML.includes('<a href=')){
                                                        if(interaccion.childNodes[o].childNodes[0].outerHTML.includes('?eav=')){
                                                            urlprofile = interaccion.childNodes[o].childNodes[0].outerHTML.match(/<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i)[1];
                                                        }else{
                                                            urlprofile = interaccion.childNodes[o].childNodes[0].outerHTML.match(/<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i)[1];
                                                        }
                                                    }
                                                    }
                                            }
                                            if (urlprofile.includes('/profile.php?id=')) {
                                                urlprofile = urlprofile.match(/id=(\d+)/i)[1];
                                            } else {
                                                urlprofile = urlprofile.match(/\/([^\/?#]+)[^\/]*$/)[1];
                                            }
                                        } catch (error) {
                                        }
                                        try {
                                            interaccions_dict['id'] = urlprofile;
                                        } catch (error) {
                                            interaccions_dict['id'] = ""
                                        }
                                        try {
                                            interaccions_dict['name'] = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent;
                                        } catch (error) {
                                            try {
                                                interaccions_dict['name'] = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].textContent;
                                            } catch (error) {
                                                try {
                                                    interaccions_dict['name'] = interaccion.childNodes[o].childNodes[0].outerHTML.match(/<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))[^>]*>([^<]*)</i)[4];
                                                } catch (error) {
                                                    interaccions_dict['name'] = ""
                                                }
                                            }
                                        }
                                        try {
                                            interaccions_dict['alias'] = urlprofile;
                                        } catch (error) {
                                            interaccions_dict['alias'] = ""
                                        }
                                        try {
                                            try {
                                                interaccions_dict['ImageProfileUrl'] = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src
                                            } catch (error) {
                                                interaccions_dict['ImageProfileUrl'] = interaccion.childNodes[o].childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.cssText.match(/https?:\/\/[^\s"]+/)[0];
                                            }
                                        } catch (error) {
                                            interaccions_dict['ImageProfileUrl'] = ""
                                        }
                                        interacciones.push(interaccions_dict);
                                        if (interaccions_dict['ImageProfileUrl'] != "") {
                                            if (interaccions_dict['ImageProfileUrl'] != null && interaccions_dict['ImageProfileUrl'] != undefined) {
                                                var image_dict = {}
                                                image_dict["id"] = interaccions_dict['id'] + '.jpg';
                                                image_dict["url"] = interaccions_dict['ImageProfileUrl'];
                                                interaccions_dict['image'] = interaccions_dict['id'] + '.jpg';
                                                urls.push(image_dict);
                                            }
                                        }
									}	
                                    }
                                }
                            } else {
                                i = indice
                            }
                            return [interacciones, urls, i2, indice];
                        }
                    }).then(function (resultados) {
                        if (resultados[0]["result"]!==null) {
							if (resultados[0]["result"][0].length > 0){ 
								interactions['interacciones'] = resultados[0]["result"][0];
								interactions['interacciones']=interactions['interacciones'].filter((value, index, self) =>
								  self.indexOf(value) === index
								);
							}	
                            urls = resultados[0]["result"][1];
                            download_resources_images_profiles(idusu);
                            i = resultados[0]["result"][2];
                            indice = resultados[0]["result"][3];
                        }
                    }).catch(function (error) {
                        // Manejar errores
                        stringflujotxt += "[" + getFormattedDateTime() + "] 2668 prpj " + error + "\n";
						stringflujotxt2 += "[" + getFormattedDateTime() + "] 2668 prpj " + error + "\n";
                    });
	return [interactions,urls,i,indice] 
}  

async function publicationjson(tab, idusu, nameusu, aliasusu) {
    var dictPublications = {'publications': [], 'persons': {}};
    var interacciones = [];
    var publis;
    var persons={};
    var dictInteractions = {};
    await getPublication(tab, idusu, nameusu, aliasusu).then(function (resultados) {
        publis = resultados[0];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 2685 prpj " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2685 prpj " + error + "\n";
    });
    //download_resources_posts(idusu);
    //removeCache();
	if (TimerForScrp() === false){
		await getcomments(tab, publis, persons, idusu).then(function (resultados) {
			publis = resultados[0];
			persons = resultados[1];
		}).catch(function (error) {
			// Manejar errores
			stringflujotxt += "[" + getFormattedDateTime() + "] 2694 prpj " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 2694 prpj " + error + "\n";
		});
		//removeCache();
	}
	if (TimerForScrp() === false){
		await getInteractions(tab, publis, idusu, interacciones).then(function (resultados) {
			publis = resultados[0];
			interacciones = resultados[1];
		}).catch(function (error) {
			// Manejar errores
			stringflujotxt += "[" + getFormattedDateTime() + "] 2703 prpj " + error + "\n";
			stringflujotxt2 += "[" + getFormattedDateTime() + "] 2703 prpj " + error + "\n";
		});
		//removeCache();
	}	
    try {
        if (Object.keys(persons).length > 0) {
            dictPublications['persons'] = persons;
        }
    } catch (error) {
    }
    try {
        if (publis.length > 0) {
            dictPublications['publications'] = publis;
        } else {
            dictPublications = ""
        }
    } catch (error) {
    }
    try {
        if (interacciones.length > 0) {
            dictInteractions['meGustaPublicacion'] = interacciones;
        } else {
            dictInteractions = "";
        }
    } catch (error) {
    }
    return [dictPublications, dictInteractions]
}

async function scrollAll(tab, pub, urls,i2,indice,interactions,i) {
    var more;
    more = "t";
	var otra_vista=false;
    while (more !== "Se acabo") {
        if (more !== null && more !== "" && more !== undefined) {
			var min = 5;
			var max = 10;
			var numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
			await chrome.scripting.executeScript({
					target: {tabId: tab.id}, args: [more, numeroAleatorio], function: async function (more, numeroAleatorio) {
						try {
                            var index = 0;
                            try{
                                index=document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[2].childElementCount;
                            }catch(error){
                                try{
                                    index=document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childElementCount;
                                }catch(error){
                                    index=0;
                                }
                            }
                            if ( index > 0) {
                                try{
                                    if(document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childElementCount-1].textContent.includes('mas')
									 || document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[document.querySelector("#root").childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childElementCount-1].textContent.includes('more')){
                                        var tamano=document.querySelectorAll("a"); document.querySelectorAll("a")[tamano.length -1].click();
									}else{
                                        more = null;  
                                    }
                                }catch(error){
                                    more = null; 
                                }
                            } else if ( index === 0) {
                                more = null;
                            }
						} catch (error) {
							more = null;
						}
						return [more]
					}
				}).then(function (resultados) {
					more = resultados[0]["result"][0];
				}).catch(function (error) {
					// Manejar errores
					more = null;
					stringflujotxt += "[" + getFormattedDateTime() + "] 2778 scal " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 2778 scal " + error + "\n";
				});
        }
		await extractInteractions(tab,urls,i2,indice,interactions,i).then(function (resultados) {
					interactions=resultados[0];
					urls=resultados[1];
					i=resultados[2];
                }).catch(function (error) {
                    // Manejar errores
                    stringflujotxt += "[" + getFormattedDateTime() + "] 2788 scal " + error + "\n";
					stringflujotxt2 += "[" + getFormattedDateTime() + "] 2788 scal " + error + "\n";
                });
        if (more === null) {
			more = "Se acabo"
            break;
        }
    }
	return [interactions,urls,i,indice] 
}

async function getidcookies(tab, idguest) {
    var confirmacion;
    var facebookUrl;
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            return window.location.href;
        }
    }).then(function (resultados) {
        confirmacion = resultados[0]["result"];
    }).catch(function (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "]  " + error + "\n";
    });
    if (confirmacion.includes("m.")) {
        facebookUrl = "https://m.facebook.com";
    } else if (confirmacion.includes("mbasic.")) {
        facebookUrl = "https://mbasic.facebook.com";
    } 
    var cUserCookie = await new Promise(resolve => {
        chrome.cookies.get({url: facebookUrl, name: "c_user"}, function (cookie) {
            resolve(cookie);
        });
    }).catch(function (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] 2821 scal " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2821 scal " + error + "\n";
    });
    idguest = cUserCookie.value;
    return idguest;
}

async function changeviewfbk(tab) {
    var idguest = 0;
    chrome.scripting.executeScript({
        target: {tabId: tab.id}, args: [idguest], function: (idguest) => {
            var cadena1 = window.location.href;
            if (cadena1.includes('m.facebook')) {
                var scripts = document.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    if (scripts[i].innerHTML.includes('userid')) {
                        var objeto = scripts[i].textContent
                        break;
                    }
                }
                var startIndex = objeto.indexOf('({');
                var endIndex = objeto.lastIndexOf('});');
                var jsonString = objeto.slice(startIndex + 1, endIndex + 1);
                try {
                    var objetoJSON = JSON.parse(jsonString);
                    idguest = objetoJSON.userid;
                    //console.log('Valor de userid:', userId);
                } catch (error) {
                    //console.error('Error al analizar JSON:', error);
                }
            } else {
                window.location.href = cadena1.replace('mbasic.','m.');
                var scripts = document.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    if (scripts[i].innerHTML.includes('userid')) {
                        var objeto = scripts[i].textContent
                        break;
                    }
                }
                var startIndex = objeto.indexOf('({');
                var endIndex = objeto.lastIndexOf('});');
                var jsonString = objeto.slice(startIndex + 1, endIndex + 1);
                try {
                    var objetoJSON = JSON.parse(jsonString);
                    idguest = objetoJSON.userid;
                    //console.log('Valor de userid:', userId);
                } catch (error) {
                    //console.error('Error al analizar JSON:', error);
                }
            }
            return [idguest];
        } 
    }).then(function (resultados) {
        idguest = resultados[0]["result"][0];
    }).catch(function (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] 2876 ck " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2876 ck " + error + "\n";
    });
    if (idguest === 0) {
        for (let i = 0; i < 10; i++) {
            idguest = await getidcookies(tab).catch(function (error) {
                // Manejar errores
                stringflujotxt += "[" + getFormattedDateTime() + "] 2883 ck " + error + "\n";
				stringflujotxt2 += "[" + getFormattedDateTime() + "] 2883 ck " + error + "\n";
            });
            if (idguest !== 0) {
                break;
            }
        }
    }
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: () => {
            return new Promise(resolve => {
                    setTimeout(() => {
                        var cadena = window.location.href;
                        if (cadena.includes('m.')) {
                            cadena = cadena.replace('m.facebook', 'mbasic.facebook');
                            window.location.href = cadena;
                        } else {
                            if (document.querySelector('#root').innerHTML.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("Ahora interactuas como")) {
                                window.location.reload();
                            } else {
                                resolve();
                            }
                        }
                    }, 5000);
                }
            );
        }
    }).then(function (resultados) {
        return resultados[0]["result"];
    }).catch(function (error) {
        stringflujotxt += "[" + getFormattedDateTime() + "] 2913 ck " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2913 ck " + error + "\n";
    });
	stringflujotxt += "[" + getFormattedDateTime() + "] El idguest es :"+idguest+"\n";
    return idguest;
}

async function getuser(tab, typeuser, idguest) {
	showBadgeText('En proceso...');
    stringflujotxt += "[" + getFormattedDateTime() + "] Se ha determinado que es un perfil de usuario.\n";
    var report = {};
    var dataAccounts = {};
    var reportpublication = [];
    var reportinteraction = [];
	var objetopostJson = "";
	var objetointeractionsJson="";
	var objetouserJson="";
    await userjson(tab, typeuser, idguest).then(function (resultados) {
        report = resultados[0];
        dataAccounts = resultados[1];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 2932 gtu " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2932 gtu " + error + "\n";
    });
	objetouserJson = JSON.stringify(dataAccounts);
	if (TimerForScrp() === false){
		await publicationjson(tab, report["id"], report["name"], report["alias"], typeuser).then(function (resultados) {
        reportpublication = resultados[0];
        reportinteraction = resultados[1];
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] 2941 gtu " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2941 gtu " + error + "\n";
    });
	objetopostJson = JSON.stringify(reportpublication);
	objetointeractionsJson = JSON.stringify(reportinteraction);
	}
	try {
		await zip_resources(namefile, report["id"], objetouserJson, objetopostJson, objetointeractionsJson);
	} catch (error) {
		stringflujotxt += "[" + getFormattedDateTime() + "] 2948 gtu " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] 2948 gtu " + error + "\n";
	}
	await removecookies(tab);
	await chrome.history.deleteAll();
}

async function loadPage(tab, url, confirmacion) {
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, args: [url], function: async function (url) {
            return new Promise(resolve => {
                    setTimeout(() => {
                        window.location.href = url;
                    }, 7000)
                }
							   
            );
        }
    }).then(function (resultados) {
        if (resultados[0]["result"] === null) {
            confirmacion = true;
        }
    }).catch(function (error) {
        // Manejar errores
        confirmacion = false;
        stringflujotxt += "[" + getFormattedDateTime() + "] Error 121 ldp:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Error 121 ldp:  " + error + "\n";
    });
    return [confirmacion];
}

async function refreshPage(tab) {
	stringflujotxt += "Refrescamos p�gina\n";
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, args: [], function: async function () {
            return new Promise(resolve => {
                    setTimeout(() => {
                        location.reload();
                    }, 7000)
                }
							   
            );
        }
    }).then(function (resultados) {
        return resultados[0]["result"]
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] Error en 'refreshpage':  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Error en 'refreshpage':  " + error + "\n";
    });
}

async function fetchNextPage(tab, id) {
	stringflujotxt += "Cambiamos de user...\n";
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, args: [id], function: async function (id) {
            return new Promise(resolve => {
                    setTimeout(() => {
						var url = "https://m.facebook.com/"+id;
                        window.location.href = url;
                    }, 7000)
                }			   
            );
        }
    }).then(function (resultados) {
        return resultados[0]["result"]
    }).catch(function (error) {
        // Manejar errores
        stringflujotxt += "[" + getFormattedDateTime() + "] Error 164 fnp:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Error 164 fnp:  " + error + "\n";
    });}


async function geturl(tab) {
    var confirmacion="e"
    await chrome.scripting.executeScript({
        target: {tabId: tab.id}, function: async function () {
            return window.location.href; 
        }
    }).then(function (resultados) {
        if (resultados[0]["result"] !== null) {
            confirmacion = resultados[0]["result"];
        }
    }).catch(function (error) {
        // Manejar errores
        confirmacion = "";
        stringflujotxt += "[" + getFormattedDateTime() + "] Error 182 gu:  " + error + "\n";
		stringflujotxt2 += "[" + getFormattedDateTime() + "] Error 182 gu:  " + error + "\n";
		
    });
    return [confirmacion];
}
