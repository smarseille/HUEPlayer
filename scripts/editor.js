var changed = 'no';
var picker = new CP(document.querySelector('input[type="text"]'));
var hexssend = '';
var framespeed = '';
var mousedn = 'no'; 


$(document).mousedown(function() {
	mousedn = 'yes';
});
$(document).mouseup(function() {
	mousedn = 'no';
});
const dialog = require('electron').remote.dialog 
picker.on("drag", function(color) {
	document.getElementById("colorpicker").value = '#' + color;
	document.getElementById("colorpicker").style.backgroundColor = '#' + color;
});
$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}

$("#colorpicker").on('keyup', function (e) {
    if (e.keyCode === 13) {
		document.getElementById("colorpicker").style.backgroundColor = document.getElementById("colorpicker").value;
    }
});

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }
    return tempArray;
}

function seqsave() {
	var seqid = $('#seq_id').val();
	var seqname = $('#seqname').val();
	if (seqname == '') {
		dialog.showErrorBox('Save','Unable to save, please enter a name.');
		return 0;
	} else {
		var tmpseq = new Array();
		tmpseq = new Array();
		tmpseq[0] = $('#seqname').val();
		tmpseq[1] = $('#seq_id').val();
		tmpseq[2] = new Array();
		tmpseq[3] = $('#framespeed').val();
		var y = 0;
		var hexarray = new Array();
		
		$('#frame').children('.frameitem').each(function(){		
			
			$(this).children('.led').each(function(){		
				var hexi = $(this).css('background-color').substring(1);
				hexarray.push(hexi); 
			});
			tmpseq[2][y] = [...hexarray];
			hexarray.length = 0;
			y++;
			
		});
		ipcRenderer.send("fullsave",tmpseq);
		ipcRenderer.send("getids");
		changed = 'no';
		return 1;
	}
}

ipcRenderer.on('updatelist',(event, arg) => {
	
	$('#seqload').children('option').remove(); 
	$('#seqload').append('<option value="new">New sequence</option>');	
	
	arg.forEach(element => {
		$('#seqload').append('<option value="' + element[1] + '">' + element[0] + '</option>');	
	});
	
});

ipcRenderer.on('loadseq',(event, arg, arg2) => {
		var seqname = arg[0];
		var seqid = arg[1];
		var seq = arg[2];
		var seqspeed = arg[3]
		$("#seqname").val(seqname);
		$("#seq_id").val(seqid);
		$("#framespeed").val(seqspeed);
		$("#content").html('');
		
		$("#content").append("   <div class=\"frame\" id=\"frame\"> </div>");
		// load frames first
		seq.forEach(element => { 
			$("#frame").append( "<div class=\"frameitem\"></div>");
		});
		
		// add the leds
		$("#frame").children('.frameitem').each(function() {
			var counter = 1;
			while (counter <= 80) {
				$(this).append("		 	<div title=\"#000000\"class=\"led\"></div> ");
				if (counter == 20 || counter == 40 || counter == 60) {
					$(this).append("		 	<div class=\"spacing\"></div>");
				}
				counter++;
			}
			$(this).append("		 	<div class=\"framebut clone\" id=\"clone\">Clone</div>");
			$(this).append("		    <div class=\"framebut testframe\" id=\"testframe\">Test</div>");
			$(this).append("		    <div class=\"framebut delframe\" id=\"delframe\">Delete</div>");
			$(this).append("   <div class=\"spacehor\"></div>  ");
		});
		
	
		// load the colors
		var frameid = 0;
		$("#frame").children('.frameitem').each(function() {
			var ledid = 0;
			$(this).children('.led').each( function(){
				$(this).css("background-color", '#' + seq[frameid][ledid]);
				$(this).attr("title",seq[frameid][ledid]);
				if (seq[frameid][ledid] == "000000") {
					$(this).css("border","1px solid black");
				} else {
					$(this).css("border","1px solid white");
				}
				
				ledid++;
			});
			frameid++;
		});
		changed = 'no';
		setupclick();

	 if (arg2 == "clone") {
		 // if it is clone, just update the name, make new id and set changed to yes, no need for double load
			$("#seqname").val(seqname + ' (Cloned)');
			$("#seq_id").val(makeid(35));
			changed = 'yes';

	}
	 setframeid();
});


function setupclick() {
	$('.led').unbind();
	$('.testframe').unbind();
	$('.clone').unbind();
	$('.delframe').unbind();
	$('.led').click(function() {
		changed = 'yes';
		$(this).css("background-color", $("#colorpicker").css( "background-color" ));
		$(this).attr("title",$("#colorpicker").css( "background-color" ));
		if ($("#colorpicker").css( "background-color") == "#000000") {
			$(this).css("border","1px solid black");
		} else {
			$(this).css("border","1px solid white");
		}
		
	}).mouseover(function(){
		if (mousedn == 'yes') {
			changed = 'yes';
			$(this).css("background-color", $("#colorpicker").css( "background-color" ));
			$(this).attr("title",$("#colorpicker").css( "background-color" ));
			if ($("#colorpicker").css( "background-color") == "#000000") {
				$(this).css("border","1px solid black");
			} else {
				$(this).css("border","1px solid white");
			}	
		}
		
	});
	
	$('.delframe').click(function() {
		changed = 'yes';
		$(this).parent().remove();
		setframeid();
	});
	
	$('.testframe').click(function() {
		var hexarray = new Array();
		$(this).parent().children('.led').each(function(){
			var hexi = $(this).css('background-color').substring(1);
			var splitcol = hexi.match(/.{2}/g);
			hexi = splitcol[1] + splitcol[0]  + splitcol[2];
			hexarray.push(hexi);
		});
		var result = chunkArray(hexarray,20);
		ipcRenderer.send("testframe",result);
	});
	
	$('.clone').click(function() {
		changed = 'yes';
		var elid = $(this).parents('div')[0].outerHTML;
		$('#frame').append($(this).parents('div')[0].outerHTML); 
		setupclick();
		setframeid();
	});

};



var CloseBtn = document.getElementById('close');

CloseBtn.addEventListener('click', function (event) {
	if (changed == 'no') {
		ipcRenderer.send("closeedit");
	} else {
		const options = {
			    type: 'warning',
			    buttons: ['Cancel', 'Yes', 'No'],
			    defaultId: 0,
			    title: 'Save',
			    message: 'The sequence is changed.',
			    detail: 'Do you want to save?',
		};
		let response = dialog.showMessageBoxSync(null, options);
		// cancel = 0
		// yes = 1
		// no = 2
		
		var value;
		switch (response) {
			case 0:
				break;
			case 1:
				value = seqsave();
				if (value == 1) {
					ipcRenderer.send("closeedit");
				}
				
				break;
			case 2:
				ipcRenderer.send("closeedit");
				break;
		}	
	}
});
var newedit = document.getElementById('addseq');

addseq.addEventListener('click', function (event) {
	var seqedit = $('#seqload :selected').val();
	if (changed == 'no') {
		if (seqedit == "new") {
			newseq();
			changed = 'yes';
		} else {
			ipcRenderer.send("loadseq",seqedit,"load");
		}
	} else {
		const options = {
			    type: 'warning',
			    buttons: ['Cancel', 'Yes', 'No'],
			    defaultId: 0,
			    title: 'Save',
			    message: 'The sequence is changed.',
			    detail: 'Do you want to save?',
		};
		let response = dialog.showMessageBoxSync(null, options);
		// cancel = 0
		// yes = 1
		// no = 2
		switch (response) {
			case 0:

				break;
			case 1:
				value = seqsave();
				if (value == 1) {
					if (seqedit == "new") {
						newseq();
						changed = 'yes';
					} else {
						ipcRenderer.send("loadseq",seqedit,"load");
					}
				}
				break;
			case 2:
				if (seqedit == "New") {
					newseq();
					changed = 'yes';
				} else {
					ipcRenderer.send("loadseq",seqedit,"load");
				}
				break;
		}	
		 
	}
	
});
function makeid(length) {
	   var result           = '';
	   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	   var charactersLength = characters.length;
	   for ( var i = 0; i < length; i++ ) {
	      result += characters.charAt(Math.floor(Math.random() * charactersLength));
	   }
	   return result;
}

function newseq() {
	$('#seqname').val('');
	$("#seq_id").val(makeid(35));
	var htmlelem = "   <div class=\"frame\" id=\"frame\"> ";
	htmlelem = htmlelem + "   <div class=\"spacehor\"></div>  ";
	htmlelem = htmlelem + "<div class=\"frameitem\" id=\"\">";
	var counter = 1;
	while (counter <= 80) {
		htmlelem = htmlelem + "		 	<div title=\"#000000\"class=\"led\"></div> ";
		if (counter == 20 || counter == 40 || counter == 60) {
			htmlelem = htmlelem + "		 	<div class=\"spacing\"></div>";
		}
		counter++;
	}
	htmlelem = htmlelem + "		 	<div class=\"framebut clone\" id=\"clone\">Clone</div>";
	htmlelem = htmlelem + "		    <div class=\"framebut testframe\" id=\"testframe\">Test</div>";
	htmlelem = htmlelem + "		    <div class=\"framebut delframe\" id=\"delframe\">Delete</div>";
	htmlelem = htmlelem + "   <div class=\"spacehor\"></div>  ";
	htmlelem = htmlelem + "</div>";
	htmlelem = htmlelem + "</div>";
	htmlelem = htmlelem + "</div>";
	$("#content").html(htmlelem);
	changed = 'no';
	setupclick();
}

function setframeid() {
	var count = 0; 
	$("#content").children(".frame").children(".frameitem").each(function() {
		$(this).attr('title',count);
		count++;
	});
}

$('#adv').click(function() {
	ipcRenderer.send("openadvanced");
});





$('#cloneseq').click(function() {
	var seqedit = $('#seqload :selected').val();
	if (changed == 'no') {
			ipcRenderer.send("loadseq",seqedit,"clone");
	} else {
		const options = {
			    type: 'warning',
			    buttons: ['Cancel', 'Yes', 'No'],
			    defaultId: 0,
			    title: 'Save',
			    message: 'The sequence is changed.',
			    detail: 'Do you want to save?',
		};
		let response = dialog.showMessageBoxSync(null, options);
		// cancel = 0
		// yes = 1
		// no = 2
		switch (response) {
			case 0:
				break;
			case 1:
				value = seqsave();
				if (value == 1) {
					ipcRenderer.send("loadseq",seqedit,"clone");
				}
				break;
			case 2:
				ipcRenderer.send("loadseq",seqedit,"clone");
				break;
		}	
		 
	}
});
$('#play').click(function() {
	var hexarray = new Array();
	var y = 0;
	var hexssend = new Array();		
	var framespeed = $('#framespeed :selected').val();
	$('#frame').children('.frameitem').each(function(){		
		$(this).children('.led').each(function(){		
			var hexi = $(this).css('background-color').substring(1);
			var splitcol = hexi.match(/.{2}/g);
			hexi = splitcol[1] + splitcol[0]  + splitcol[2];
			hexarray.push(hexi); 
		});
		hexssend[y] = chunkArray(hexarray,20);
		hexarray.length = 0;
		y++;
	});
	ipcRenderer.send("testrun",hexssend,framespeed);
});
$('#deleteseq').click(function() {
	
	ipcRenderer.send("deleteseq",$('#seqload :selected').val());
	// ipcRenderer.send("fullsave",tmpseq);
	ipcRenderer.send("getids");
});


$('#save').click(function() {
	seqsave();
});



$('#export').click(function() {
	if (changed == 'yes') {
		dialog.showErrorBox('Save','Save the sequence before exporting.');
		
	} else {
		var seqid = $('#seq_id').val();
	
		if ($('#seq_id').val() != "empty") {
			var filename = $('#seqname').val() + '.hpjson';
			ipcRenderer.send("export",seqid,filename);
		} else {
			dialog.showErrorBox('Save','No sequence loaded.');
		}
	}
});

$('#impseq').click(function() {
	if (changed == 'yes') {
		dialog.showErrorBox('Save','Save the sequence before importing.');
	} else {
		ipcRenderer.send("import");
	}
});
document.addEventListener('DOMContentLoaded', function(){
	ipcRenderer.send("getids"); 
	setupclick();
		
});

// advanced dialog
ipcRenderer.on('addframes',(event, arg) => {
	var cnt = 0;
	if ($("#seq_id").val() == 'empty') { 
		$("#content").append("   <div class=\"frame\" id=\"frame\"> </div>");
		$("#seq_id").val(makeid(35));
	}
	var htmlelem = "";
	while (cnt < arg) {
		htmlelem = htmlelem + "   <div class=\"spacehor\"></div>  ";
		htmlelem = htmlelem + "<div class=\"frameitem\" id=\"\">";
		var counter = 1;
		while (counter <= 80) {
			htmlelem = htmlelem + "		 	<div title=\"#000000\"class=\"led\"></div> ";
			if (counter == 20 || counter == 40 || counter == 60) {
				htmlelem = htmlelem + "		 	<div class=\"spacing\"></div>";
			}
			counter++;
		}
		htmlelem = htmlelem + "		 	<div class=\"framebut clone\" id=\"clone\">Clone</div>";
		htmlelem = htmlelem + "		    <div class=\"framebut testframe\" id=\"testframe\">Test</div>";
		htmlelem = htmlelem + "		    <div class=\"framebut delframe\" id=\"delframe\">Delete</div>";
		htmlelem = htmlelem + "   <div class=\"spacehor\"></div>  ";
		htmlelem = htmlelem + "</div>";
		htmlelem = htmlelem + "</div>";
		$("#frame").append(htmlelem);
		changed = 'yes';
		htmlelem = "";
		cnt++;
	} 
	setupclick();
	
});



ipcRenderer.on('fadeout',(event, arg) => {
	var beginfr = arg[2];
	var frameto = parseInt(arg[2]) + parseInt(arg[3]);
	var ledst = arg[0];
	if (typeof(arg[1]) == 'undefined' && arg[1] == '') {
		var ledend = arg[0];
	} else {
		var ledend = arg[1];
	}
	var colour = arg[4];
	
	
	colour = colour.substr(1);
	colour = colour.match(/.{2}/g);
	var rcol = parseInt(colour[0],16);
	var gcol = parseInt(colour[1],16);
	var bcol = parseInt(colour[2],16);
	
	
			var total = frameto - beginfr;
			var stepping = 255 / total; 
			var strt = 0;
			var ledpos = 0;

			var rstep = rcol / total;
			var gstep = gcol / total;
			var bstep = bcol / total;
			
			$("#content").children(".frame").children('.frameitem').each(function() {
				if (strt >= beginfr && strt <= frameto ) {
				
					ledpos = 0;
					$(this).children(".led").each(function() {
						if (ledpos >= ledst && ledpos <= ledend) {
							$(this).css("background-color", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0"));
							$(this).attr("title", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0") );
							$(this).css("border","1px solid white");
							if (ledpos == ledend) {
								rcol = rcol - rstep;
								gcol = gcol - gstep;
								bcol = bcol - bstep;
							}
						}
						ledpos++;
					})
					
				}
				strt++;
			});

})


ipcRenderer.on('fadein',(event, arg) => {
	var beginfr = arg[2];
	var frameto = parseInt(arg[2]) + parseInt(arg[3]);

	var ledst = arg[0];
	if (typeof(arg[1]) == 'undefined' && arg[1] == '') {
		var ledend = arg[0];
	} else {
		var ledend = arg[1];
	}
	var colour = arg[4];
	
	
	colour = colour.substr(1);
	colour = colour.match(/.{2}/g);
	var rcol = parseInt(colour[0],16);
	var gcol = parseInt(colour[1],16);
	var bcol = parseInt(colour[2],16);


	
			var total = frameto - beginfr;
			var rstep = rcol / total;
			var gstep = gcol / total;
			var bstep = bcol / total;
			var stepping = 255 / total; 
			var strt = 0;
			var ledpos = 0;

		//	var rcol = parseInt(colour[0],16);
		// var gcol = parseInt(colour[1],16);
		//	var bcol = parseInt(colour[2],16);
			var rcol = 0;
			var bcol = 0;
			var gcol = 0;
			
			$("#content").children(".frame").children('.frameitem').each(function() {
				if (strt >= beginfr && strt <= frameto ) {
				
					ledpos = 0;
					$(this).children(".led").each(function() {
						if (ledpos >= ledst && ledpos <= ledend) {
							$(this).css("background-color", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0"));
							$(this).attr("title", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0") );
							$(this).css("border","1px solid white");
							if (ledpos == ledend) {
								rcol = parseInt(rcol) + parseInt(rstep);
								gcol = parseInt(gcol) + parseInt(gstep);
								bcol = parseInt(bcol) + parseInt(bstep);
							}
						}
						ledpos++;
					})
					
				}
				strt++;
			});

})






ipcRenderer.on('fadeto',(event, arg) => {
	var beginfr = arg[2];
	var frameto = parseInt(arg[2]) + parseInt(arg[3]);
	var ledst = arg[0];
	if (typeof(arg[1]) == 'undefined' && arg[1] == '') {
		var ledend = arg[0];
	} else {
		var ledend = arg[1];
	}
	var colour = arg[4];	
	colour = colour.substr(1);
	colour = colour.match(/.{2}/g);
	var rcol = parseInt(colour[0],16);
	var gcol = parseInt(colour[1],16);
	var bcol = parseInt(colour[2],16);

	
	// so I need to make a few things here: 
	// get begin colors, get end colors
			var bcolour = arg[4];	
			bcolour = bcolour.substr(1);
			bcolour = bcolour.match(/.{2}/g);
			
			var ecolour = arg[5];	
			ecolour = ecolour.substr(1);
			ecolour = ecolour.match(/.{2}/g);
			
			
			var brcol = parseInt(bcolour[0],16);
			var bgcol = parseInt(bcolour[1],16);
			var bbcol = parseInt(bcolour[2],16);
			
			var ercol = parseInt(ecolour[0],16);
			var egcol = parseInt(ecolour[1],16);
			var ebcol = parseInt(ecolour[2],16);
			
		// Now I need to see if I have to substract or add per colorchannel.
			var total = frameto - beginfr;
			if ( brcol < ercol) {
				//add
				brtype = 'add';
				rstep = (ercol - brcol) / total;
				
			} else {
				//substract
				brtype = 'substract';
				rstep = (brcol - ercol) / total;
			}
			
			if ( bgcol < egcol) {
				//add
				bgtype = 'add';
				gstep = (egcol - bgcol) / total;
				
			} else {
				//substract
				bgtype = 'substract';
				gstep = (bgcol - egcol) / total;
			}
			
			if ( bbcol < ebcol) {
				//add
				bbtype = 'add';
				bstep = (ebcol - bbcol) / total;
				
			} else {
				//substract
				bbtype = 'substract';
				bstep = (bbcol - ebcol) / total;
			}



			
			var stepping = 255 / total; 
			var strt = 0;
			var ledpos = 0;

			// moving the start colors so I do not have to adjust the whole code here 
			var rcol = brcol;
			var bcol = bbcol;
			var gcol = bgcol;
			
			$("#content").children(".frame").children('.frameitem').each(function() {
				if (strt >= beginfr && strt <= frameto ) {
				
					ledpos = 0;
					$(this).children(".led").each(function() {
						if (ledpos >= ledst && ledpos <= ledend) {
							$(this).css("background-color", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0"));
							$(this).attr("title", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0") );
							$(this).css("border","1px solid white");
							if (ledpos == ledend) {
								if (brtype == 'add') {
									rcol = parseInt(rcol) + parseInt(rstep);
								} else {
									rcol = parseInt(rcol) - parseInt(rstep);
								}
								
								if (bgtype == 'add') {
									gcol = parseInt(gcol) + parseInt(gstep);
								} else {
									gcol = parseInt(gcol) - parseInt(gstep);
								}
								
								
								if (bbtype =- 'add') {
									bcol = parseInt(bcol) + parseInt(bstep);
								} else {
									bcol = parseInt(bcol) - parseInt(bstep);
								}
							}
						}
						ledpos++;
					})
					
				}
				strt++;
			});
});

ipcRenderer.on('mvltr',(event, arg) => {

	var startframe = arg[0];
	if (typeof(arg[1]) != 'undefined' && arg[1] != '') {
		var dupeframe = arg[1] - 1;
	} else {
		var dupeframe = 0;
	}
	if (typeof(arg[7]) != 'undefined' && arg[7] != '') {
		var xskip = arg[7];
	} else {
		var xskip = 1;
	}

	var startled = arg[2];
	var headleds = parseInt(arg[3]);
	var tailleds = parseInt(arg[4]); 
	var positions = arg[5] - 1;
	var colour = arg[6];

	colour = colour.substr(1);
	colour = colour.match(/.{2}/g);
	var rcol = parseInt(colour[0],16);
	var gcol = parseInt(colour[1],16);
	var bcol = parseInt(colour[2],16);

	var additional = parseInt(headleds) + parseInt(tailleds);
	var ledcolors = new Array();
	var cnt = 0;
	
	while (cnt <= headleds) {		
		var tmparr = new Array();
		tmparr[0] = rcol;
		tmparr[1] = gcol;
		tmparr[2] = bcol;
		ledcolors[cnt] = [...tmparr];
		cnt++;
	}
	
	var rstep = rcol / tailleds ;
	var gstep = gcol / tailleds ;
	var bstep = bcol / tailleds ;
	
	var rcol = parseInt(rcol) - rstep;
	var gcol = parseInt(gcol) - gstep;
	var bcol = parseInt(bcol) - bstep;
	
	while (cnt <= additional) {
		// ledcolors[cnt][0] = rcol;
		// ledcolors[cnt][1] = gcol;
		// ledcolors[cnt][2] = bcol;
		tmparr[0] = rcol;
		tmparr[1] = gcol;
		tmparr[2] = bcol;
		ledcolors[cnt] = [...tmparr];
		rcol = parseInt(rcol) - rstep;
		gcol = parseInt(gcol) - gstep;
		bcol = parseInt(bcol) - bstep;
		cnt++;
	}
	var strt = 0;
	var cntframes = 0;
	var rcol = '';
	var gcol = '';
	var bcol = '';
	var ledrev = ledcolors.length - 1;
	var bufferVariable = startled;
	bufferVariable = bufferVariable - ledcolors.length;
	var xmax = 80 + parseInt(ledrev);
	alert(bufferVariable);
	
	
	$("#content").children(".frame").children('.frameitem').each(function() {
		
		if (strt >= startframe && cntframes <= positions ) {
			var x = bufferVariable;
			var frcnt = 0;
			var ledrev = ledcolors.length - 1;
		
			ledpos = 0;
			while (x <= xmax) {
				if (ledpos >= startled && frcnt <= additional) {
					if (typeof($(this).children(".led")[x]) != 'undefined') {
						
						rcol = ledcolors[ledrev][0];
						gcol = ledcolors[ledrev][1];
						bcol = ledcolors[ledrev][2];
						$($(this).children(".led")[x]).css("background-color", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0"));
						$($(this).children(".led")[x]).attr("title", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0") );
						$($(this).children(".led")[x]).css("border","1px solid white");	
					}
					frcnt++;
					ledrev--;
				}
				ledpos++;
				
				
				
				x++
			}
			
				

			startled = parseInt(startled) + parseInt(xskip);
			cntframes++;
		}
		strt++;
		
	});
})


ipcRenderer.on('mvrtl',(event, arg) => {
	
	var startframe = arg[0];
	if (typeof(arg[1]) != 'undefined' && arg[1] != '') {
		var dupeframe = arg[1] - 1;
	} else {
		var dupeframe = 0;
	}
	if (typeof(arg[7]) != 'undefined' && arg[7] != '') {
		var xskip = arg[7];
	} else {
		var xskip = 1;
	}

	var startled = arg[2];
	var headleds = parseInt(arg[3]) + 1;
	var tailleds = parseInt(arg[4]) + 1; 
	var positions = arg[5] - 1;
	var colour = arg[6];

	colour = colour.substr(1);
	colour = colour.match(/.{2}/g);
	var rcol = parseInt(colour[0],16);
	var gcol = parseInt(colour[1],16);
	var bcol = parseInt(colour[2],16);

	var additional = parseInt(headleds) + parseInt(tailleds);
	var ledcolors = new Array();
	var cnt = 0;
	
	while (cnt <= headleds) {		
		var tmparr = new Array();
		tmparr[0] = rcol;
		tmparr[1] = gcol;
		tmparr[2] = bcol;
		ledcolors[cnt] = [...tmparr];
		cnt++;
	}
	
	var rstep = rcol / tailleds ;
	var gstep = gcol / tailleds ;
	var bstep = bcol / tailleds ;
	
	var rcol = parseInt(rcol) - rstep;
	var gcol = parseInt(gcol) - gstep;
	var bcol = parseInt(bcol) - bstep;
	
	while (cnt <= additional) {
		// ledcolors[cnt][0] = rcol;
		// ledcolors[cnt][1] = gcol;
		// ledcolors[cnt][2] = bcol;
		tmparr[0] = rcol;
		tmparr[1] = gcol;
		tmparr[2] = bcol;
		ledcolors[cnt] = [...tmparr];
		rcol = parseInt(rcol) - rstep;
		gcol = parseInt(gcol) - gstep;
		bcol = parseInt(bcol) - bstep;
		cnt++;
	}
	var strt = 0;
	var cntframes = 0;
	var rcol = '';
	var gcol = '';
	var bcol = '';
	ipcRenderer.send("log",ledcolors);
	$("#content").children(".frame").children('.frameitem').each(function() {
		if (strt >= startframe && cntframes <= positions ) {
			var frcnt = 0;
			ledpos = 0;
			$(this).children(".led").each(function() {
				if (ledpos >= startled && frcnt <= additional) {
					
					rcol = ledcolors[frcnt][0];
					gcol = ledcolors[frcnt][1];
					bcol = ledcolors[frcnt][2];
					$(this).css("background-color", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0"));
					$(this).attr("title", '#' + Math.floor(rcol).toString(16).padStart(2,"0") +  Math.floor(gcol).toString(16).padStart(2,"0") + Math.floor(bcol).toString(16).padStart(2,"0") );
					$(this).css("border","1px solid white");	
					frcnt++;
				}
				ledpos++;
				
			})
			startled = startled - xskip;
			cntframes++;
		}
		strt++;
	});
	// we will just build a array for all the colors.
})
