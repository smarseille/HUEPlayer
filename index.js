// basic items
// Author: MiraiM
// Date: 10/12/2019
// Project build time: 5 days
// Demo another X days
// ALPHACODE - MAY NOT WORK AS EXPECTED
// Current issues in playback:
// Sometimes the loop is instable, often changing between 1 ms, but can have jumps up to 60ms.
//
// Thanks:
// Aareksio - https://github.com/Aareksio
// I know, ancient Javascript ;_; sorry to make you cry :( it is only like few days I had to throw it out as a PoC.
// Special NO Thanks:
// Puff - Keep slacking.. :( learn NodeJS so you can help me!

const electron = require('electron');
const {remote, app, BrowserWindow, Menu, dialog} = require('electron')
const {ipcMain}	= require('electron'); 
const fs = require('fs');
var HID = require('node-hid');
var colors = require('colors');
var devices = HID.devices();
var detectedHID = new Array();
var opendev = new Array();
var cur = 0;
var i = 0;
var editor;
var seqdata = new Array();
mp3 = require('./mp3.js');
Menu.setApplicationMenu(false)
var stopseq = 'no';
let mainWindow;

console.log(process.version)
// detection set for led devices
function detecthue() {
	console.log('Detecting NXZT HID Device');
	var i = 0;
	devices.forEach(element => {
		if (element.vendorId == "7793" && element.productId == "8194") {
			detectedHID[i] = element;
	        i++;
		}
		});
	var i = 0;
	detectedHID.forEach(element => {
		console.log('[DETECTED] NXZT HUB: ' + colors.green(element.product) + ' at path: ' + colors.yellow(element.path))
		opendev[i] = new HID.HID(element.path);
		console.log('Opened path: ' + colors.yellow(element.path) + ' at: ' +  colors.green(i));
		i++;
	});
	module.exports.detectedHID = detectedHID;
	module.exports.opendev = opendev;
}

detecthue();

function sendCommand (type, dev, ch, strip, fxcolors) {
	//type = effect type, such as static.
	//dev = device number, based on detected devices.
	//ch = 1 or 2, depending if more channels are supported.
	//strip = first or second part of the channel, as it can only send up to 20 led status. When device supports up to 40: 0 - first 20, 1 = second 20.
	//fxcolors = array of hex colors.
	if (type == "static") {
		var stripsend = new Array();
		strip = strip + 10;
		 stripsend.push(parseInt(22, 16)); // the command reference
		 stripsend.push(parseInt(strip, 16)); //set of leds
		 stripsend.push(parseInt(ch, 16)); // Channel reference
		 stripsend.push(parseInt(0, 16)); // spacer?

		if (fxcolors.length == 20) { 
			fxcolors.forEach(element => {
				var splitcol = element.match(/.{2}/g);
				splitcol.forEach(tohex => {
					 stripsend.push(parseInt(tohex, 16));
				})
			})
		} else {
			return false;
		}
		
		if (stripsend.length == 64) {
			opendev[dev].write(stripsend);
		
			return true;
		} else {
			opendev[dev].write(stripsend);
		
			return false;
		}
	}
	if (type == "fixed") {
		var stripsend = new Array();
		strip = strip + 10;
		 stripsend.push(parseInt(28, 16)); // the command reference
		 stripsend.push(parseInt(03, 16)); // Unknown?
		 stripsend.push(parseInt(ch, 16)); // Channel reference
		 stripsend.push(parseInt(28, 16)); // it is either 18 or 28, opposite of channel ID. (1=28,2=18) -test shows didn't matter what it is.
		 stripsend.push(parseInt(0, 16)); // Unknown?
		 stripsend.push(parseInt(0, 16)); // Unknown?
		 stripsend.push(parseInt(0, 16)); // Unknown?
		 stripsend.push(parseInt(0, 16)); // Unknown?
		 stripsend.push(parseInt(1, 16)); // Unknown?
		 stripsend.push(parseInt(0, 16)); // Unknown?
		 
			var splitcol = fxcolors.match(/.{2}/g);
			splitcol.forEach(tohex => {
				stripsend.push(parseInt(tohex, 16));
			});

		var i = 1;
		while (i < 52) {
			stripsend.push(parseInt(0, 16)); // fill
			i++;
		}
	
		if (stripsend.length == 64) {
			opendev[dev].write(stripsend);
		
			return true;
		} else {
		
	
			return false;
		}
	}
}

function sendApply(dev,ch) {
	opendev[0].write([0x22,0xa0,parseInt(0 + ch, 16),0x00,0x01,0x00,0x00,0x27,0x00,0x00,0x80,0x00,0x32,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);		
}



// Windows
function createWindow () {
  // Create the browser window.
	mainWindow = new BrowserWindow({
	  width: 800,
	  height: 600,
	  webPreferences: {
    	nodeIntegration: true,
  		webSecurity: false,
  		plugins: true
  		
    },
	frame: false
  })
    // and load the index.html of the app.
	mainWindow.loadFile('index.html')
	
}


function openEditor () {
	  // Create the browser window.
		let winx = new BrowserWindow({
		  width: 1000,
		  height: 600,
		  webPreferences: {
	    	nodeIntegration: true,
	  		webSecurity: false,
	  		plugins: true
	  		
	    },
		frame: false
	  })
	    // and load the index.html of the app.
	  winx.loadFile('./ins/editor.html')
	//winx.webContents.openDevTools()
	  return winx;
}



function openAdvanced () {
	  // Create the browser window.
		let winx = new BrowserWindow({
		  width: 750,
		  height: 500,
		  webPreferences: {
	    	nodeIntegration: true,
	  		webSecurity: false,
	  		plugins: true
	  		
	    },
		frame: false
	  })
	    // and load the index.html of the app.
	  winx.loadFile('./ins/advanced.html')
	//winx.webContents.openDevTools()
	  return winx;
}



app.on('ready', createWindow);



//ipc calls
ipcMain.on("Close",function (event) {
	app.exit();
});
ipcMain.on("log",function (event,arg) {
	console.log(arg);
});


ipcMain.on("stopseqp",function (event,arg) {
	stopseq = arg;
	
});

ipcMain.on("Openeditor",function (event,arg) {
	if (typeof(editor) == 'undefined' || editor == '') {
		editor = openEditor();	
	}
});


ipcMain.on("openadvanced",function (event) {
	
	if (typeof(openadv) == 'undefined' || openadv == '') {
		openadv = openAdvanced();	
	}
	
});
ipcMain.on("closeadv",function (event,arg) {
		openadv.close();
		openadv = '';
});

ipcMain.on("fullsave",function (event,arg) {
		var arrayid = 0;
		var match;
		seqdata.forEach(element => {
			if (element[1] === arg[1]) {
				match = arrayid;
			}
			arrayid++;
		});
	
		if (typeof(match) != 'undefined') {
			seqdata[match] = [...arg];
		} else {
			seqdata[arrayid] = [...arg];
		}
		jsonsave = JSON.stringify(seqdata);

		fs.writeFileSync("seqdata.json", jsonsave, 'utf8');
		
});

ipcMain.on("deleteseq",function (event,arg) {
	var arrayid = 0;
	var match;
	seqdata.forEach(element => {
		if (element[1] === arg) {
			match = arrayid;
		}
		arrayid++;
	});

	if (typeof(match) != 'undefined') {
		seqdata.splice(match, 1);
		
		jsonsave = JSON.stringify(seqdata);
		fs.writeFileSync("seqdata.json", jsonsave, 'utf8');
		
	};
});

ipcMain.on("getids",function (event) {
	var values = new Array;
	var count = 0;
	if (seqdata.length != 0) {
		seqdata.forEach(element => {
			values[count] = new Array();
			values[count][0] = element[0];
			values[count][1] = element[1];
			values[count][2] = element[2].length;
			values[count][3] = element[3];
			count++;
		});
	}
	event.sender.send('updatelist',values);
});

ipcMain.on("loadseq",function (event,arg,arg2) {
	var values = new Array;
	var count = 0;
	seqdata.forEach(element => {
		if (element[1] === arg) {
			match = count;
		}
		count++;
 	});
	
	if (typeof(match) != 'undefined') {
				event.sender.send('loadseq',seqdata[match],arg2);
	}
	

});



ipcMain.on("closeedit",function (event,arg) {
	editor.close();
	editor = '';
	mainWindow.webContents.send('updatesel');
});



ipcMain.on("testframe",function(event,arg) {
	sendCommand('static',0,1,0,arg[0]);
	sendCommand('static',0,1,1,arg[1]);
	sendCommand('static',0,2,0,arg[2]);
	sendCommand('static',0,2,1,arg[3]);
	sendApply(0,1);
	sendApply(0,2);
});


ipcMain.on("testrun", async function(event,arg,frspeed) {
	var y = 0;
	var arrc = arg.length - 1;
	frspeed = frspeed - 1;
	while (y <= arrc) {
		var x = 0;
		while (x <= frspeed) {
			sendCommand('static',0,1,0,arg[y][0]);
			sendCommand('static',0,1,1,arg[y][1]);
			sendCommand('static',0,2,0,arg[y][2]);
			sendCommand('static',0,2,1,arg[y][3]);
			sendApply(0,1);
			sendApply(0,2);
			await sleep(15);
			x++;
		};
		y++;
	};
});


ipcMain.on("testid", async function(event,arg) {
	var arr = new Array();
	var sendarr = new Array();
	arr = getseq(arg);
	sendarr = prepseq(arr[1],arr[0])
	
	await runstream(sendarr);
});

ipcMain.on("runseq", async function(event,arg) {
	var sendarr = new Array();
	var arr = new Array();
	var x = 0;
	arg.forEach(element => {		
		arr = getseq(element);
		
		sendarr[x] = prepseq(arr[1],arr[0]); 
		arr.length = 0;
		x++;
	});
	//rebuild the array to be compatible with playback
	var finalarr = new Array();
	var x = 0;
	var y = 0;
	
	sendarr.forEach(element => {
		element.forEach( row => { 
			finalarr[x] = [...row];
			finalarr[x][4] = y;
			x++;
		});
		y++; // update seq id, to update back to the interface
	});
	await  runstream(finalarr);
});




ipcMain.on("export", function (event, id, filename) {
	const options = {
			filters: [ { name: "HuePlayer JSON", extensions: ['hpjson','hpj']} ],
			defaultPath: filename,
	}
	dialog.showSaveDialog(null, options).then(result => {
		  if (result.canceled == false) {
			  
				var arrayid = 0;
				var match;
				seqdata.forEach(element => {
					if (element[1] === id) {
						jsonsave = JSON.stringify(element);
					}
					arrayid++;
				});				
				fs.writeFileSync(result.filePath, jsonsave, 'utf8');
		  }
		}).catch(err => {
		  console.log(err)
		});
});

ipcMain.on("saveseq", function (event, seqlist, song) {
	const options = {
			filters: [ { name: "HuePlayer sequence JSON", extensions: ['hpseqj']} ],
			defaultPath: "untitled.hpseqj",
	}
	dialog.showSaveDialog(null, options).then(result => {
		  if (result.canceled == false) {
			  // get the song, put it in [0]
			  
			  // get all sequences and put it into [1]
			  // get seq list, put it in [2]
			  var jsonarr = new Array();
			  jsonarr[0] = song;
			  jsonarr[2] = [...seqlist];
			  var arrayid = 0;
			  let unique = [...new Set(seqlist)];
			  jsonarr[1] = new Array();
			  unique.forEach( element => {
					seqdata.forEach(row => {
						if (element === row[1]) {
							jsonarr[1][arrayid] = [...row];
						}
					});
					arrayid++;
			  });
			  jsonsave = JSON.stringify(jsonarr);
			  fs.writeFileSync(result.filePath, jsonsave, 'utf8');

		  }
		}).catch(err => {
		  console.log(err)
		});
});


ipcMain.on("loadseqp", function (event) {
	
	
});
ipcMain.on("loadseqp", function (event) {
	const options = {
		    type: 'warning',
		    buttons: ['Yes', 'No'],
		    defaultId: 0,
		    title: 'Load',
		    message: 'All duplicate sequences will be overwritten!',
		    detail: 'Do you want to overwrite the duplicate sequences?',
	};
	let response = dialog.showMessageBoxSync(null, options);

	switch (response) {
		case 0:
			runload();
			break;
		case 1:
			break;
	}
	
});

ipcMain.on("import", function (event,id, filename) {
	const optionssave = {  
				properties: ['openFile'], 
				filters: [ { name: "HuePlayer JSON", extensions: ['hpjson','hpj']} ],
			}
	dialog.showOpenDialog(null, optionssave).then(result => {
		  if (result.canceled == false) {	  
				console.log(result.filePaths);
				
				result.filePaths.forEach( item => {
					var tempdata = JSON.parse(fs.readFileSync(item));
					var arrayid = 0;
					var match = 'no';
					if (Array.isArray(tempdata) != false ) {

						console.log('Array OK');
						seqdata.forEach(element => {
							if (element[1] === tempdata[1]) {
								match = 'yes';
								console.log('already exists');
								const options = {
									    type: 'warning',
									    buttons: ['Yes', 'No'],
									    defaultId: 0,
									    title: 'Import',
									    message: 'The sequence already exists.',
									    detail: 'Do you want to overwrite the sequence?',
								};
								let response = dialog.showMessageBoxSync(null, options);
						
								switch (response) {
									case 0:
										seqdata[arrayid] = [...tempdata];
										break;
									case 1:
										break;
								}
								arrayid++;
							} else {
			
							}
		
						});
						if (match == 'no') {
							console.log('New import');
							seqdata[arrayid] = [...tempdata];
						}
					} else {
						console.log('import was not an array');
					}
				});
				jsonsave = JSON.stringify(seqdata);
				fs.writeFileSync("seqdata.json", jsonsave, 'utf8');
		  }
		}).catch(err => {
		  console.log(err)
		});
});



ipcMain.on("loadmusic", function (event) {
	const optionssave = {  
			properties: ['openFile'], 
			filters: [ { name: "Music MP3", extensions: ['mp3']} ],
				
			}
	dialog.showOpenDialog(null, optionssave).then(result => {
		  if (result.canceled == false) {	  
				console.log(result.filePaths);
				
				result.filePaths.forEach( item => {
					event.sender.send('openfile',item);
				});
		  }
		}).catch(err => {
		  console.log(err)
		});
});


//temporary democode
ipcMain.on("Play",function (event,arg,frpeed) {
		console.log(arg);
		cur = arg;
		
		var xdc = new Array();
		xdc = ['000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000','000000']

		sendCommand('static',0,1,1,xdc);
		sendCommand('static',0,2,0,xdc);
		sendCommand('static',0,2,1,xdc);
	
		var xd = new Array();
		
		var y = 0;
	
		
		while (y < 19) {
				if (i == y) {
					xd.push('00ff00');
					if (y != 19) {
					
					xd.push('00ff00');
					} else {
						
						
					}
					
				} else {
					xd.push('000000');
				}
				y++;
				if (i == 19) {
					i = 0;
				}
		}
		i++;
		sendCommand('static',0,1,0,xd);
		sendCommand('static',0,1,1,xd);
		sendCommand('static',0,2,0,xd);
		sendCommand('static',0,2,1,xd);
		sendApply(0,1);
		sendApply(0,2);
});



function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function loadfile() {
		var newdata = fs.readFileSync("seqdata.json").toString();
		
		if (isJson(newdata) ) {
			seqdata = JSON.parse(fs.readFileSync("seqdata.json"));
		} else {
			
		} 
}
loadfile();

async function runstream(arg) {
	var y = 0;
	var arrc = arg.length - 1;
	var rmtime = 0;
	while (y <= arrc) {
		
		if (typeof(arg[4]) != 'undefined') {
			var start = new Date().getTime();
			mainWindow.webContents.send('updateseq',arg[y][4]);
		}
			
			sendCommand('static',0,1,0,arg[y][0]);
			sendCommand('static',0,1,1,arg[y][1]);
			sendCommand('static',0,2,0,arg[y][2]);
			sendCommand('static',0,2,1,arg[y][3]);
			sendApply(0,1);
			sendApply(0,2);
			
			
			var end = new Date().getTime();
			var time = end - start;
			var wait = 21 - time;
			wait = wait - rmtime
			await sleep(wait);
			end = new Date().getTime();
			time = end - start;
			console.log('Execution time: ' + time);
			if (time <= 20) {
				await sleep(1);
			}
			if (time > 21) {
				rmtime = time - 21;
			} else {
				rmtime = 0;
			}
		y++;
		if (stopseq == 'yes') {
			stopseq = 'no';
	//		mainWindow.webContents.send('updateseq','off');
			break;
		}

	}
 mainWindow.webContents.send('updateseq','off');
}


function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);
    }
    return tempArray;
}


function prepseq(arr,frspeed) {	
	var hexarray = new Array();
	var y = 0;
	var hexssend = new Array();
	var x = 0;
	var i = 0;
	var hexi;
	arr.forEach (element => {
		element.forEach (row => {
			hexi = row;
			var splitcol = hexi.match(/.{2}/g);
			hexi = splitcol[1] + splitcol[0]  + splitcol[2];
			hexarray.push(hexi); 	
		});
		
		hexssend[y] = [...hexarray];
		hexarray.length = 0;
		y++;
	});
	
	var conarray = new Array;
	var tmpcolor;
	hexssend.forEach (element => {

		tmpcolor = element;
		i = 1;
		while (i <= frspeed) {
			conarray[x] = chunkArray(tmpcolor,20);
			x++;
			i++;
		};
	});
	return conarray;
}

function getseq(arg) {
	var tmparray = new Array();
	seqdata.forEach(element => {
		if (element[1] === arg) {
			//grab 2 and 3, seq and frspeed
			tmparray[0] = element[3];
			tmparray[1] = element[2];
		} else {

		}
	});
	return tmparray;
};

function runload() {
	const optionssave = {  
			properties: ['openFile'], 
				filters: [ { name: "HuePlayer sequence JSON", extensions: ['hpseqj']} ],
			}
	dialog.showOpenDialog(null, optionssave).then(result => {
		  if (result.canceled == false) {	  
				result.filePaths.forEach( item => {
					var tempdata = JSON.parse(fs.readFileSync(item));
					var arrayid = 0;
					var matched = 'no';
					
					var songpath = tempdata[0];
					console.log(songpath);
					if (Array.isArray(tempdata[1]) != false ) {
						tempdata[1].forEach(row => {
							if (seqdata.length == 0 ) {
								console.log('add' + arrayid);
								seqdata[arrayid] = [...row];
							} else {
								
								seqdata.forEach(element => {
								
									if (element[1] === row[1]) {
										seqdata[arrayid] = [...row];
										
										matched = "yes";
									} else {
													
									}	
								
									arrayid++;
								});
								if (matched == 'no') {
									seqdata[arrayid] = [...row];
								}
							}
							matched = "no";
							arrayid = 0;
						});
						
					}
					if (typeof(songpath) != 'undefined') {
						mainWindow.webContents.send('openfile',songpath);
						jsonsave = JSON.stringify(seqdata);
						fs.writeFileSync("seqdata.json", jsonsave, 'utf8');
						mainWindow.webContents.send('makeseq',tempdata[2]);
					}
				});
				
				
				// event.sender.send('setupseq',tempdata[2]);
				// just to save the progress

		  }
		}).catch(err => {
		  console.log(err)
		});
}

// advanced dialog communications 
// addframes

ipcMain.on("addframes",function (event, arg) {
	editor.webContents.send('addframes', arg);
});

ipcMain.on("fadeout",function (event, arg) {
	editor.webContents.send('fadeout', arg);
});

ipcMain.on("fadein",function (event, arg) {
	editor.webContents.send('fadein', arg);
});

ipcMain.on("fadeto",function (event, arg) {
	editor.webContents.send('fadeto', arg);
});

ipcMain.on("mvltr",function (event, arg) {
	editor.webContents.send('mvltr', arg);
});

ipcMain.on("mvrtl",function (event, arg) {
	editor.webContents.send('mvrtl', arg);
});



