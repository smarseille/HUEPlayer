var CloseBtn = document.getElementById('close');
CloseBtn.addEventListener('click', function (event) {
		ipcRenderer.send("closeadv");
});

$('#addfr').click(function() {
	var frames = $("#frames").val();
	if (typeof(frames) != 'undefined' && frames != '') {
		ipcRenderer.send("addframes",frames);
	}
});


$('#addfo').click(function() {

	var items = new Array();
	items[0] = $("#fostled").val(); // start led
	items[1] = $("#foenled").val(); // stop led
	items[2] = $("#fostfr").val(); // start frame
	items[3] = $("#fomaxfr").val(); // amount of frames
	items[4] = $("#focolor").val(); // colors
	
	if (typeof(items[0]) != 'undefined' && items[0] != '' && typeof(items[2]) != 'undefined' && items[2] != '' &&	typeof(items[3]) != 'undefined' && items[3] != '' && typeof(items[4]) != 'undefined' && items[4] != '' ) {
	
		ipcRenderer.send("fadeout",items);
		
	}
});

$('#addfi').click(function() {

	var items = new Array();
	items[0] = $("#fistled").val(); // start led
	items[1] = $("#fienled").val(); // stop led
	items[2] = $("#fistfr").val(); // start frame
	items[3] = $("#fimaxfr").val(); // amount of frames
	items[4] = $("#ficolor").val(); // colors
	
	if (typeof(items[0]) != 'undefined' && items[0] != '' && typeof(items[2]) != 'undefined' && items[2] != '' &&	typeof(items[3]) != 'undefined' && items[3] != '' && typeof(items[4]) != 'undefined' && items[4] != '' ) {
	
		ipcRenderer.send("fadein",items);
		
	}
});

$('#addft').click(function() {
	
	var items = new Array();
	items[0] = $("#ftstled").val(); // start led
	items[1] = $("#ftenled").val(); // stop led
	items[2] = $("#ftstfr").val(); // start frame
	items[3] = $("#ftmaxfr").val(); // amount of frames
	items[4] = $("#ftstcolor").val(); // colors
	items[5] = $("#ftendcolor").val(); // colors
	
	if (typeof(items[0]) != 'undefined' && items[0] != '' && typeof(items[2]) != 'undefined' && items[2] != '' &&	typeof(items[3]) != 'undefined' && items[3] != '' && typeof(items[4]) != 'undefined' && items[4] != '' && typeof(items[5]) != 'undefined' && items[5] != '' ) {
	
		ipcRenderer.send("fadeto",items);
		
	}
});

$('#mvltr').click(function() {
	
	var items = new Array();
	items[0] = $("#mvstfr").val(); // start frame
	items[1] = $("#mvdfr").val(); // dupe effect for x frames
	items[2] = $("#mvstled").val(); // led start position
	items[3] = $("#mvhled").val(); // headleds
	items[4] = $("#mvtled").val(); // trail led (to black).
	items[5] = $("#mvpos").val(); // positions to move
	items[6] = $("#mvcolor").val(); // colors
	items[7] = $("#skippos").val(); // colors
	
	if (typeof(items[0]) != 'undefined' && items[0] != '' && typeof(items[2]) != 'undefined' && items[2] != '' &&	typeof(items[3]) != 'undefined' && items[3] != '' && typeof(items[4]) != 'undefined' && items[4] != '' && typeof(items[5]) != 'undefined' && items[5] != '' ) {
		ipcRenderer.send("mvltr",items);
		
	}
});

$('#mvrtl').click(function() {
	
	var items = new Array();
	items[0] = $("#mvstfr").val(); // start frame
	items[1] = $("#mvdfr").val(); // dupe effect for x frames
	items[2] = $("#mvstled").val(); // led start position
	items[3] = $("#mvhled").val(); // headleds
	items[4] = $("#mvtled").val(); // trail led (to black).
	items[5] = $("#mvpos").val(); // positions to move
	items[6] = $("#mvcolor").val(); // colors
	items[7] = $("#skippos").val(); // colors
	

	if (typeof(items[0]) != 'undefined' && items[0] != '' && typeof(items[2]) != 'undefined' && items[2] != '' &&	typeof(items[3]) != 'undefined' && items[3] != '' && typeof(items[4]) != 'undefined' && items[4] != '' && typeof(items[5]) != 'undefined' && items[5] != '' && typeof(items[6]) != 'undefined' && items[6] != '' ) {
		ipcRenderer.send("mvrtl",items);
		
	}
});