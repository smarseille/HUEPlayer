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


//setting requirements 
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


//
// HUE/USB HID COMMANDS
//

// detection set for led devices
function detecthue() {
	console.log('Detecting NXZT HID Device');
	var i = 0;
	devices.forEach(element => {
		// the 7793 / 8194 vendor/productId is for the Hue v2 Ambient! Need to change to correct version for the normal Hue v2. If anyone have this information or want to help me out getting it, please.
		if (element.vendorId == "7793" && element.productId == "8194") {
			detectedHID[i] = element;
	        i++;
		}
		});
	var i = 0;
	detectedHID.forEach(element => {
		// report the detected devices and array number it is 'opened' at. 
		console.log('[DETECTED] NXZT HUB: ' + colors.green(element.product) + ' at path: ' + colors.yellow(element.path))
		opendev[i] = new HID.HID(element.path);
		console.log('Opened path: ' + colors.yellow(element.path) + ' at: ' +  colors.green(i));
		i++;
	});
	module.exports.detectedHID = detectedHID;
	module.exports.opendev = opendev;
}



// usb commands for the NZXT Hubs.
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

// For each time you apply colors per led, you need to tell the hub to apply.
function sendApply(dev,ch) {
	opendev[0].write([0x22,0xa0,parseInt(0 + ch, 16),0x00,0x01,0x00,0x00,0x27,0x00,0x00,0x80,0x00,0x32,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);		
}


//
// Log to console 
//

//a call to send information to log, better then alert() as alert blocks buttons after displayhed and shorter than dialog box.
ipcMain.on("log",function (event,arg) {
	console.log(arg);
});



//
//  BASIC WINDOW FUNCTIONS
// 
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

// Editor window
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
	    // and load editor.html
	  winx.loadFile('./ins/editor.html')
	  //winx.webContents.openDevTools()
	  return winx;
}


// advanced window
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

//open editor from main window button "create/edit sequence" 
ipcMain.on("Openeditor",function (event,arg) {
	if (typeof(editor) == 'undefined' || editor == '') {
		editor = openEditor();	
	}
});

// open advanced settings from editor window "advanced" 
ipcMain.on("openadvanced",function (event) {
	
	if (typeof(openadv) == 'undefined' || openadv == '') {
		openadv = openAdvanced();	
	}
	
});
// close window on x button.
ipcMain.on("closeadv",function (event,arg) {
		openadv.close();
		openadv = '';
});
//close the app from main window x button

ipcMain.on("Close",function (event) {
	app.exit();
});


/////////////
//ipc calls//
/////////////



//
// Main window calls
//

//Call from stop button to stop running the sequence.
ipcMain.on("stopseqp",function (event,arg) {
	stopseq = arg;
});

// load sequence file.
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

//Run the sequence (on play button from main window)
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


// save the project including path to song.
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

//export the selected sequence to json format.
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


// Eject button behaviour, select a mp3
ipcMain.on("loadmusic", function (event) {
	const optionssave = {  
			properties: ['openFile'], 
			filters: [ { name: "Music MP3", extensions: ['mp3']} ],
				
			}
	dialog.showOpenDialog(null, optionssave).then(result => {
		  if (result.canceled == false) {	  
				console.log(result.filePaths);
				
				result.filePaths.forEach( item => {
					// return the path to the main window to process the open in Howler
					event.sender.send('openfile',item);
				});
		  }
		}).catch(err => {
		  console.log(err)
		});
});

//
// Editor calls
// 

// Call from editor to save data, when requesting to save the sequence.
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

// Delete sequence from main sequence file
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

// close edit window
ipcMain.on("closeedit",function (event,arg) {
	editor.close();
	editor = '';
	mainWindow.webContents.send('updatesel');
});

// display the current frame on the Hue device
ipcMain.on("testframe",function(event,arg) {
	sendCommand('static',0,1,0,arg[0]);
	sendCommand('static',0,1,1,arg[1]);
	sendCommand('static',0,2,0,arg[2]);
	sendCommand('static',0,2,1,arg[3]);
	sendApply(0,1);
	sendApply(0,2);
});

//test current sequence from the edit play button, without music.
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


// imports a project
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

//
//advanced dialog communications
//

//it will send these back to the editor to be run inside the editor:

//send the command to add amount of frames 
ipcMain.on("addframes",function (event, arg) {
	editor.webContents.send('addframes', arg);
});


//send the command fade out from color to black
ipcMain.on("fadeout",function (event, arg) {
	editor.webContents.send('fadeout', arg);
});

//send the command fade in from black to color
ipcMain.on("fadein",function (event, arg) {
	editor.webContents.send('fadein', arg);
});

//send the command fade to from color a to color b
ipcMain.on("fadeto",function (event, arg) {
	editor.webContents.send('fadeto', arg);
});

//move left to right 
ipcMain.on("mvltr",function (event, arg) {
	editor.webContents.send('mvltr', arg);
});

//move right to left 
ipcMain.on("mvrtl",function (event, arg) {
	editor.webContents.send('mvrtl', arg);
});



// 
// Shared calls
//

// Not a good name, but it when called, it will return all sequence names, their unique ID's, amount of frames and playback speed.
// It will update within the editor window at the select field, as well for the main window per sequence entry.
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



//
// other functions
//

// json check to avoid an error popup
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// sleep function
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

// split function to set arrays into multiple chunks. As you can set only per 20 lights and I process a frame of 80, this function is used to split them in 4x 20.
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

// Load settings file
function loadfile() {
		var newdata = fs.readFileSync("seqdata.json").toString();
		
		if (isJson(newdata) ) {
			seqdata = JSON.parse(fs.readFileSync("seqdata.json"));
		} else {
			
		} 
}

// main function to run the sequence when playing the song, part of the play button
async function runstream(arg) {
	// set variables to count
	var y = 0; //current frame number
	var arrc = arg.length - 1; // max frame number
	var rmtime = 0; // time that will be removed from wait if bigger than 22 ms
	
	while (y <= arrc) {
		// set start time of frame
		var start = new Date().getTime();
		
		if (typeof(arg[4]) != 'undefined') {
			mainWindow.webContents.send('updateseq',arg[y][4]);
		}
			// process the frame to the hue device
			sendCommand('static',0,1,0,arg[y][0]);
			sendCommand('static',0,1,1,arg[y][1]);
			sendCommand('static',0,2,0,arg[y][2]);
			sendCommand('static',0,2,1,arg[y][3]);
			sendApply(0,1);
			sendApply(0,2);
			
			// set end time of frame and do some calculations to see how long to wait to become close to 22ms
			var end = new Date().getTime();
			var time = end - start;
			var wait = 21 - time;
			wait = wait - rmtime
			
			// wait
			await sleep(wait);
			
			// see how long it really took
			end = new Date().getTime();
			time = end - start;
			
			// log to console
			console.log('Execution time: ' + time);
			// Ugly hack to try to get as stable to 21/22 ms:
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
			// stop the play of the sequence
			stopseq = 'no';
	//		mainWindow.webContents.send('updateseq','off');
			break;
		}

	}
 mainWindow.webContents.send('updateseq','off');
}



// prepare the sequence into a format to be played over USB HID (changing color values and make a big array)
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

//receive the call to load sequence
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

// Load dialog for sequence file from disk, main dialog.
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
									// saving sequence to the 'global' sequence array.
									seqdata[arrayid] = [...row];
								}
							}
							matched = "no";
							arrayid = 0;
						});
						
					}
					if (typeof(songpath) != 'undefined') {
						// If the sequence file contains a song, load it.
						mainWindow.webContents.send('openfile',songpath);
						
					}
					// save the settings file
					jsonsave = JSON.stringify(seqdata);
					fs.writeFileSync("seqdata.json", jsonsave, 'utf8');
					// execute the makeseq command at main window to display the sequences in gui.
					mainWindow.webContents.send('makeseq',tempdata[2]);
				});			

		  }
		}).catch(err => {
		  console.log(err)
		});
}




// initiate everything
detecthue();
loadfile();
app.on('ready', createWindow);