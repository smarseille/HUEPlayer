# HUE Player

A Sequence player for light patterns, added a music player to make some interesting effects.

Result: https://www.youtube.com/watch?v=VSWzPIpE1No

Note: Only compatible with the NZXT Hue v2, I used the ambient version so it might not recognize the normal version.
IT DOES NOT WORK WITH THE V1: This version is based on Serial, and v2 is based on USB HID.

## Usage
To open the GUI, run: electron index.js


## Developing
It is very ALPHA and might not work as expected. It currently is flawed that if the system is not idle it might go out of sync very fast. 
Sometimes setTimeout(); spikes delaying up to 60ms, as I try to maintain a stable 22ms. 

I am very new to NodeJS, and never used before. You might cry reading through the code as it is totally not the way it should be written. 
It is merely a PoC to show you can do way more with the NZXT Hue v2.

There are bugs here and there and there are almost no validations in place (for example, if input should be only numbers, it does not validate if you enter alphabetic characters).

## Thanks <3
Aareksio - https://github.com/Aareksio - Thank you for bringing me to Node JS as it was the easiest to get communicating with the USBHID, and some other minor things.
I know, ancient Javascript. sorry to make you cry :( it is only like few days I had to throw it out as a PoC.

## Special NO Thanks
Puff - Keep slacking.. :( learn NodeJS so you can help me <3 !

## Help

Help is wanted, more to improve myself as well to improve this player. I also have a bigger idea after creating this kind of player to make a timeline based editor with way more functionality.

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.

### Requirements:
NodeJS
app: ^0.1.0
colors: ^1.4.0
electron: ^7.1.4
fs: 0.0.1-security
howler: ^2.1.2
jquery: ^3.4.1
jsdom: ^15.2.1
node-hid: ^1.1.0
spectrum-colorpicker: ^1.8.0
