(function() {
 var DEBUG, before, c, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 DEBUG = false;
//  DEBUG = true;

 c.width = 800;

 c.height = 600;

 keysDown = {};

 keysPressed = {};

 images = [];

 audios = [];

 framesThisSecond = 0;
 fpsElapsed = 0;
 fps = 0

 ttp = 0

 click = false
 down = false

 clicked = 0;

 text = '';
 score = 0;
 things = '';
 maxLength = 8192;

 var db = firebase.firestore();

 const settings = {timestampsInSnapshots: true};
 db.settings(settings);

 db.collection('root').doc('things').onSnapshot(function(doc) {
    things = doc.data().content;
 });

 window.addEventListener("keydown", function(e) {
         keysDown[e.keyCode] = true;
         console.log(e);

         if(things.length >= maxLength) {
            return;
         }

         if(e.key.length == 1) {
             things += e.key.toLowerCase();
             db.collection('root').doc('things').set({'content': things});
         }

         return keysPressed[e.keyCode] = true;
         }, false);

 window.addEventListener("keyup", function(e) {
         return delete keysDown[e.keyCode];
         }, false);

 window.addEventListener("click", function(e) {
    console.log(e.offsetX, e.offsetY);
    click = {
        x: e.offsetX,
        y: e.offsetY,
    }
 });

 window.addEventListener("mousedown", function(e) {
    console.log(e.offsetX, e.offsetY);
    down = {
        x: e.offsetX,
        y: e.offsetY,
    }
 });

 window.addEventListener("mouseup", function(e) {
    console.log(e.offsetX, e.offsetY);
    down = false;
 });

 setDelta = function() {
     now = Date.now();
     delta = (now - before) / 1000;
     return before = now;
 };

 if (!DEBUG) {
     console.log = function() {
         return null;
     };
 }

 ogre = false;

 popups = []

 tick = function() {
     setDelta();
     elapsed += delta;
     update(delta);
     draw(delta);
     keysPressed = {};
     click = false;
     if (!ogre) {
         return window.requestAnimationFrame(tick);
     }
 };

 update = function(delta) {
     framesThisSecond += 1;
     fpsElapsed += delta;

     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }

     for(var i = 0; i < popups.length; i++) {

         var popup = popups[i];

         popup.ttl -= delta;

         if(popup.ttl <=0) {
            popups.splice(i, 1);
            i--;
            break;
         }

         popup.x += 8 * delta;
         popup.y -= 36 * delta;
     }

 };

 draw = function(delta) {
     ctx.fillStyle = "#000000";
     ctx.fillRect(0, 0, c.width, c.height);

     if(DEBUG) {
        ctx.fillStyle = "#111111";
        ctx.font = "20px Visitor";
        ctx.fillText(Math.round(fps), 20, 40);
     }

     var chunk = 130;
     if(things) {
         for(var i = 0, j = 0; i < things.length; i += chunk, j++) {

             ctx.fillStyle = "#ffffff";
             ctx.font = "10px Visitor";
             ctx.textAlign = "left";
             ctx.fillText(things.slice(i, i + chunk), 10, 10 + j * 7);

         }
     }

     ctx.fillStyle = "#ffffff";
     ctx.font = "24px Visitor";
     ctx.fillText(text, 400, 260);
     ctx.textAlign = "center";

     ctx.fillStyle = "#ffffff";
     ctx.font = "24px Visitor";
     ctx.fillText(things.length + '/' + maxLength, 400, 500);
     ctx.textAlign = "center";

     for(var i = 0; i < popups.length; i++) {
         var popup = popups[i];

         ctx.fillStyle = "#bbbbbb";
         ctx.font = "42px Visitor";
         ctx.fillText(popup.text, popup.x, popup.y);
     }
 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

 loadImage = function(name, callback) {
    var img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded ' + name)
        images[name] = img
        loading -= 1
        if(callback) {
            callback(name);
        }
    }

    img.src = 'img/' + name + '.png'
 }

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
