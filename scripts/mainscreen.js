var changed = 'yes'
ipcRenderer.on('updatelist',(event, arg) => {

	// temp removed from seq list
	$('#content').children('.sequence').each(function(){
		$(this).children('.sequencesel').each(function(){	
			$(this).children('option').remove(); 
			arg.forEach(element => {
				$(this).append('<option frs="' + element[3] + '" frms="' + element[2] + '" value="' + element[1] + '">' + element[0] + '</option>');	
			});
			
			$(this).val($(this).parents(".sequence").children(".info").children("#seqtitle").attr('seqid')).change();
		});	
	});
});

var last = -1;
var curfr = 0;
ipcRenderer.on('updateseq',(event, arg) => {
if (arg == 'off') { 
		$('#content').children('.sequence').each(function() {
			$(this).removeClass("selected");
		});
		curfr = 0;
	} else {
		
		if (last != arg) {
			curfr = 0;
			$('#content').children('.sequence').each(function() {
				$(this).removeClass("selected");
			});
			var x = 0;
			$('#content').children('.sequence').each(function() {
				
				if (x == arg) {
					var topPos = $(this).offsetTop;
					$('#content').scrollTop = topPos;
					last = x;
					$(this).addClass("selected");
				}
				x++;
			});
		}
		$('#curframe')[0].innerHTML  = curfr;
		curfr++;
	}
});
ipcRenderer.on('updatesel',(event) => { 
	ipcRenderer.send("getids");
});
ipcRenderer.on('makeseq',(event, arg) => {

	// empty first
	$('#content').empty();
	
	// loop through sequence list
	arg.forEach(element => {
		// make the divs.
		$('#content').append("<div class=\"sequence\"></div>");
	});
	
	var elid = 0;
	$('#content').children(".sequence").each(function () {
		$(this).append("<div class=\"info\"></div");
		$(this).children(".info").append("<div class=\"label\"> Seq ID: </div><div class=\"value seqtitle\" seqid=\""+arg[elid]+"\" id=\"seqtitle\"></div>")
		$(this).children(".info").append("<div class=\"label\"> Frames: </div><div class=\"valuesm\" id=\"frames\"></div>");
		$(this).children(".info").append("<div class=\"label\"> Speed: </div><div class=\"valuesm\" id=\"speed\"></div>");
		$(this).append("<select class=\"framebut sequencesel\" id=\"sequencesel\"></select>");
		$(this).append("<div class=\"framebut seqTest\" id=\"seqTest\">Test</div>");
		$(this).append("<div class=\"framebut seqClone\" id=\"seqClone\">Clone</div>");
		$(this).append("<div class=\"framebut seqDelete\"  id=\"seqDelete\">Delete</div>");
		
		elid++;
	});
		ipcRenderer.send("getids");
		setupclick();
		
	
});


function playseq() {
	var arr = new Array();
	$('#content').children(".sequence").each(function() {
		arr.push($(this).children("#sequencesel").val());
	});
	ipcRenderer.send("runseq",arr);
}

function setupclick() {
	$('.seqClone').unbind();
	$('.seqDelete').unbind();
	$('.sequencesel').unbind();
	$('.sequencesel').unbind();
	
	$('.seqDelete').click(function() {
		changed = 'yes';
		$(this).parent().remove();
	});
	
	$('.seqClone').click(function() {
		changed = 'yes';
		$('#content').append($(this).parents('.sequence')[0].outerHTML); 	
		setupclick();
		ipcRenderer.send("getids");
	});
	
	$('.sequencesel').change(function() {
		changed = 'yes';
		$(this).parents(".sequence").children(".info").children("#seqtitle")[0].innerHTML = $(this).val();
		$(this).parents(".sequence").children(".info").children("#seqtitle").attr('seqid',$(this).val());
		$(this).parents(".sequence").children(".info").children("#frames")[0].innerHTML = $('option:selected', this).attr("frms"); 	
		$(this).parents(".sequence").children(".info").children("#speed")[0].innerHTML = $('option:selected', this).attr("frs");	
		
	}).click(function() {
		changed = 'yes';
		$(this).parents(".sequence").children(".info").children("#seqtitle").attr('seqid',$(this).val());
		$(this).parents(".sequence").children(".info").children("#seqtitle")[0].innerHTML = $(this).val(); 	
		$(this).parents(".sequence").children(".info").children("#frames")[0].innerHTML = $('option:selected', this).attr("frms");; 	
		$(this).parents(".sequence").children(".info").children("#speed")[0].innerHTML = $('option:selected', this).attr("frs"); 
	});;

	$('.seqTest').click(function() {
		ipcRenderer.send("testid",$(this).parents(".sequence").children("#sequencesel").val()); 	
		
	});
}
document.addEventListener('DOMContentLoaded', function(){
	var Player = function(playlist) {
		this.playlist = playlist;
		this.index = 0;
	};
	
	CloseBtn = document.getElementById('close');
	openedit = document.getElementById('editseq');
	notifyBtn = document.getElementById('Opnf');
	playBtn = document.getElementById('play');
	 
	Player.prototype = {

			  play: function(index) {
			    var self = this;
			    var sound;
			    index = typeof index === 'number' ? index : self.index;
			    var data = self.playlist[index];
			   
			    // If we already loaded this track, use the current one.
			    // Otherwise, setup and load a new Howl.
			    if (data.howl) {
			      sound = data.howl;
			    } else {
			      sound = data.howl = new Howl({
			        src: [data.file],
			        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
			        onplay: function() {
			     	
			          self.step();
	
	
			        },
			        onload: function() {
			          // Start the wave animation.
	
			        },
			        onend: function() {
			          // Stop the wave animation.
	
			          self.skip('next');
			        },
			        onpause: function() {
			          // Stop the wave animation.
	
			        },
			        onstop: function() {
			        	ipcRenderer.send("stopseqp", "yes"); 
			          // Stop the wave animation.
	
			        },
			        onseek: function() {
			        	
			          // Start upating the progress of the track.
			          //requestAnimationFrame(self.step.bind(self));
			        }
			      });
			    }
			    if (sound.playing()) {
			    	sound.stop();
			    }
			    // Begin playing the sound.
			    ipcRenderer.send("stopseqp", "no"); 
			    playseq();
			    sound.play();
	
			    // Update the track display.
	
			    // Show the pause button.
	
	
			    // Keep track of the index we are currently playing.
			    self.index = index;
			  },
	
			  stop: function() {
				    var self = this;
				    var sound = self.playlist[self.index].howl;
				    if (typeof(sound) != 'undefined'){
					    if (sound.playing()) {
					    	sound.stop();
					    }
				    }
			  },
			  /**
			   * Pause the currently playing track.
			   */
			  pause: function() {
			    var self = this;
	
			    // Get the Howl we want to manipulate.
			    var sound = self.playlist[self.index].howl;
	
			    // Puase the sound.
			    sound.pause();
			  },
		
			  /**
			   * Seek to a new position in the currently playing track.
			   * @param  {Number} per Percentage through the song to skip.
			   */
			  seek: function(per) {
			    var self = this;
	
			    // Get the Howl we want to manipulate.
			    var sound = self.playlist[self.index].howl;
	
			    // Convert the percent into a seek position.
			    if (sound.playing()) {
			      sound.seek(sound.duration() * per);
			    }
			  },
	
			  /**
			   * The step called within requestAnimationFrame to update the playback position.
			   */
			  step: function() {
			    var self = this;
		
			    // Get the Howl we want to manipulate.
			    var sound = self.playlist[self.index].howl;
	
			    // Determine our current seek position.
			    var seek = sound.seek() || 0;
			    document.getElementById("timer").innerHTML = self.formatTime(Math.round(seek));
			    document.getElementById("slide").value = (((seek / sound.duration()) * 200) || 0) ;
			    //ipcRenderer.send("Play",Math.floor(seek * 10));
			    //progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';
	
			    // If the sound is still playing, continue stepping.
			    if (sound.playing()) {
			      requestAnimationFrame(self.step.bind(self));
			    }
			  },
	
			  /**
			   * Format the time from seconds to M:SS.
			   * @param  {Number} secs Seconds to format.
			   * @return {String}      Formatted time.
			   */
			  formatTime: function(secs) {
			    var minutes = Math.floor(secs / 60) || 0;
			    var seconds = (secs - minutes * 60) || 0;
	
			    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
			  }
	}   
	notifyBtn.addEventListener('click', function (event) {
		ipcRenderer.send("OpenFile"); 
	});
	
	var addseq = document.getElementById('addseq');

	addseq.addEventListener('click', function (event) {
    	var inhtm = "<div class=\"sequence\">";
    		inhtm = inhtm + "		<div class=\"info\">";
    		inhtm = inhtm + "			<div class=\"label\"> Seq ID: </div><div class=\"value seqtitle\" id=\"seqtitle\"></div>";
    		inhtm = inhtm + "			<div class=\"label\"> Frames: </div><div class=\"valuesm\" id=\"frames\"></div>";
    		inhtm = inhtm + "			<div class=\"label\"> Speed: </div><div class=\"valuesm\" id=\"speed\"></div>";
    		inhtm = inhtm + "		</div>";
    		inhtm = inhtm + "		<select class=\"framebut sequencesel\" id=\"sequencesel\">";
    		inhtm = inhtm + "		</select>";
    		inhtm = inhtm + "		<div class=\"framebut seqTest\" id=\"seqTest\">Test</div>";
    		inhtm = inhtm + "		<div class=\"framebut seqClone\" id=\"seqClone\">Clone</div>";
    		inhtm = inhtm + " 		<div class=\"framebut seqDelete\"  id=\"seqDelete\">Delete</div>";
    		inhtm = inhtm + "	</div>";
    		$('#content').append(inhtm);
    		ipcRenderer.send("getids");
    		setupclick();
	});
	var stopbtn = document.getElementById('stop');
	stopbtn.addEventListener('click', function (event) {
		player.stop();
	});
	var loadsong = document.getElementById('Opnf');

	loadsong.addEventListener('click', function (event) {
		ipcRenderer.send("loadmusic");
	});
	playBtn.addEventListener('click', function (event) {
		//ipcRenderer.send("Play");
		player.play();
	});
	
	openedit.addEventListener('click', function (event) {
		ipcRenderer.send("Openeditor");
	});
	var player = new Player([ {  } ]);;

	ipcRenderer.on('openfile',(event, arg) => {
		player.stop();
		cursong = arg;
		player = new Player([
			  {
			    title: 'one song',
			    file: arg,
			    howl: null
			  }
			  
			]);
	});
	$('#testseq').click(function() {
		playseq();
	});
	$('#savep').click(function() {
		var expect = 0; // expect nothing!
		var seqidarr = new Array(); 
		$('#content').children('.sequence').each(function () {
			seqidarr[expect] = $(this).children("#sequencesel").val();   
			expect++;
		});
		ipcRenderer.send('saveseq',seqidarr,cursong);
	});
	$('#loadp').click(function() {
		ipcRenderer.send('loadseqp');
	});
	setupclick();
	ipcRenderer.send("getids");
	var cursong = '';
}, false);