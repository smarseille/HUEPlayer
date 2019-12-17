const electron = require('electron');
const {Howl, Howler, Audio} = require('howler');
const {dialog} = require('electron')
var musicfile;
var sound;

function openfile() {
	  dialog.showOpenDialog( {
		  properties: ['openFile'],  
		  filters: [
			    { name: 'MP3', extensions: ['mp3'] },
			  ]
		}).then(result => {
		musicfile = result.filePaths;
		sound = new Howl({
			  src: ['music.mp3'],
		  	  format: ['mp3']
		  });
		   console.log(musicfile)
		}).catch(err => {
		  console.log(err)
		})

	
}
exports.musicfile = musicfile;
exports.sound = sound;
module.exports = {
		openfile
}