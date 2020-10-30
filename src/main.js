require("nw");

var win = nw.Window.open('https://adamschwartz.co/chrome-tabs/', {}, function(win) {});
/*// Create a new window and get it
var window = gui.Window.open('index.html', {frame: true, toolbar: false});

// And listen to new window's focus event
window.on('focus', function() {
  console.log('New window is focused');
});*/