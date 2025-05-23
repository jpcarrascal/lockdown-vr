/* globals AFRAME, THREE, THREEx */
var debug = false;
var vrReady = false;
window.addEventListener('load', function() {
  document.querySelector("#JPvid").pause();
  console.log("1.WINDOW LOADED")
  document.querySelector("#fb-share").href="https://facebook.com/sharer/sharer.php?u="+window.location;
  document.querySelector("#tw-share").href="https://twitter.com/intent/tweet?text=Lockdown, a VR experience by @spacebarman: "+window.location;
  document.querySelector('#restart').addEventListener('click', function (e) {
    location.reload();
  });
  
  document.querySelector('.toggle-credits').addEventListener('click', function (e) {
    var elem = document.querySelector('.toggle-credits');
    document.querySelector('#description').classList.toggle("hidden");
    document.querySelector('#credits').classList.toggle("hidden");
    if(elem.innerText.localeCompare("Credits ▶") === 0)
      elem.innerText = "◀ Back";
    else
      elem.innerText = "Credits ▶";
  });
  
  document.querySelector("#JPvid").addEventListener('ended', function() {
    console.log("X.VIDEO ENDED");
    setEndScreen();
  });
  
  document.querySelector('a-scene').addEventListener('loaded', function () {
    vrReady = true;
  });
  
  if(!AFRAME.utils.device.isMobileVR()) {
    console.log("****************Let's replace buttons...");
    document.querySelector('#startButton').style.display = "none";
    document.querySelector('#startButtonDeskMob').style.display = "block";
  }
  
  document.querySelector('a-scene').addEventListener('exit-vr', function () {
      console.log("EXIT VR!");
      const mobile = ( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
      // Restart experience:
      if(mobile) {
        location.reload();
      } else document.querySelector("#container").style.display = "flex";
    });
  document.querySelector('a-scene').addEventListener('enter-vr', function () {
      console.log("ENTERED VR!");
  });
  
  // Keyboard controls:
  document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 49:
        roomLightSwitch();
        break;
      case 67:
        switchCityLights(city,"random");
        break;
      case 86:
        switchCityLights(city,"off");
        break;
      case 76:
        {
          cloudField.flashCounter = 2;
          cloudField.lightningsOn();
          break;
        }
      case 84:
        clockDirection *= -1;
        break;
      case 32:
        spacebarHandler();
        break;
      case 27:
        if(!AFRAME.utils.device.isMobileVR()) {
          var container = document.querySelector('#container');
          if(container.style.display == "none") {
            setEndScreen();
          } else {
            container.style.display = "none";
          }
          break;
        }
    }
  });

  checkLoad();
});


// Checks if video is loaded. Source: http://atomicrobotdesign.com/blog/web-development/check-when-an-html5-video-has-loaded/
// could have used vid.addEventListener('loadeddata', function() {});
// but sometimes the video loads early and no more 'loadeddata' events are not triggered anymore.
function checkLoad() {
  var vid = document.querySelector("#JPvid");
  if(AFRAME.utils.device.isMobileVR())
    var start = document.querySelector('#startButton');
  else
    var start = document.querySelector('#startButtonDeskMob');
  var container = document.querySelector('#container');
  if (vid.readyState === 4 && vrReady == true) {
    vid.pause();
    vid.currentTime = 0;
    if(!debug) document.querySelector('#scene').pause();
    console.log("3.VIDEO READY, VR SCENE READY!")
    start.innerText="Start!";
    start.addEventListener('click', function (e) {
      if(start.innerText.localeCompare("Start!") === 0 ) {
        var playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.then(function() {
            // Only start BD, SD, HH, and scene playback when video playback is started
              startTime = 0;
              document.querySelector('#scene').play();
              const audioStartTime = vid.currentTime;
              BD.source.start(ctx.currentTime, audioStartTime, 194);
              SD.source.start(ctx.currentTime, audioStartTime, 194);
              HH.source.start(ctx.currentTime, audioStartTime, 194);
              container.style.display = "none";
              start.innerText="Go back to VR!"; 
          }).catch(function(error) {
            console.log("Error playing audio or video!!!");
          });
        }
      }
    });
  } else {
      if(vid.readyState !== 4) console.log("Video not ready...");
      if(!vrReady) console.log("VR scene not ready...");
      console.log("... had to wait...");
      setTimeout(checkLoad, 100);
  }
}

function setEndScreen() {
    if(document.querySelector('.toggle-credits').innerText.localeCompare("Credits ▶") === 0)
      document.querySelector('.toggle-credits').click();
    document.querySelector('#container').style.display = "flex";
    document.querySelector('#startButton').style.display="none";
    document.querySelector('#startButtonDeskMob').style.display="none";
    document.querySelector('#restart').style.display="block";
    document.querySelector('#play-ep').style.display="block";
}


function debugThis(text)
{
  document.querySelector('#startButton').innerText = text;
}

// https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var startTime = -1;
var BDLocation =  "images/KD.mp3";
var SDLocation= "images/SD.mp3";
var HHLocation= "images/HH.mp3";

// Create a new audio context.
var ctx = new AudioContext();
var mainVolume = ctx.createGain();
mainVolume.connect(ctx.destination);

const worldFloor = -30;
const T = 60000; // Time constant: 60000
let shrinkingFactor = 0.9999915;
let shrinkingFactor2 = shrinkingFactor;
var city, starField, cloudField;
var clockDirection = 1;
var BD = {};
var SD = {};
var HH = {}

BD.source = ctx.createBufferSource();
BD.analyzer = ctx.createAnalyser();
BD.source.connect(BD.analyzer);
BD.source.loop = true;

SD.source = ctx.createBufferSource();
SD.analyzer = ctx.createAnalyser();
SD.source.connect(SD.analyzer);
SD.source.loop = true;

HH.source = ctx.createBufferSource();
HH.analyzer = ctx.createAnalyser();
HH.source.connect(HH.analyzer);
HH.source.loop = true;

async function getFile(audioContext, filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function setupSample(location) {
    const filePath = location;
    const sample = await getFile(ctx, filePath);
    return sample;
}

setupSample(BDLocation)
    .then((sample) => {
      BD.buffer = sample;
      BD.source.buffer = BD.buffer;
});

setupSample(SDLocation)
    .then((sample) => {
      SD.buffer = sample;
      SD.source.buffer = SD.buffer;
});

setupSample(HHLocation)
    .then((sample) => {
      HH.buffer = sample;
      HH.source.buffer = HH.buffer;
});


function roomLightSwitch(status="")
{
  let light = document.querySelector("#room-light");
  let lamp = document.querySelector("#lamp");
  let sw = document.querySelector("#switch");
  const onValue = 0.7;
  const offValue = 0.05;
  const onColor = "#FFFFEE";
  const offColor = "#E0D0C0";
  const onShader = "flat";
  const offShader = "standard";
  if(status == "on")
  {
    lamp.setAttribute("material",{color: onColor, shader: onShader});
    light.setAttribute("light", {intensity: onValue});
    sw.object3D.rotation.z = -0.1;
  }
  else if(status == "off")
  {
    lamp.setAttribute("material",{color: offColor, shader: offShader});
    light.setAttribute("light", {intensity: offValue});
    sw.object3D.rotation.z = 0.1;
  }
  else
  {
    if(light.getAttribute("light").intensity < onValue)
    {
      lamp.setAttribute("material",{color: onColor, shader: onShader});
      light.setAttribute("light", {intensity: onValue});
      sw.object3D.rotation.z = -0.1;
    }
    else
    {
      lamp.setAttribute("material",{color: offColor, shader: offShader});
      light.setAttribute("light", {intensity: offValue});
      sw.object3D.rotation.z = 0.1;
    }
  }
}

AFRAME.registerComponent('x-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('xbuttondown', function (evt) {
      switchCityLights(city,"random");
    });
  }
});

AFRAME.registerComponent('y-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('ybuttondown', function (evt) {
      cloudField.flashCounter = 2;
      cloudField.lightningsOn();
    });
  }
});

AFRAME.registerComponent('a-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('abuttondown', function (evt) {
      roomLightSwitch();
    });
  }
});

AFRAME.registerComponent('b-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('bbuttondown', function (evt) {
        clockDirection *= -1;
    });
  }
});

AFRAME.registerComponent("scene-setup", {
  init: function () {
    let scene = this.el.sceneEl.object3D;
    const mobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();
    if( mobile )
    {
      this.el.setAttribute("shadow", false);
      if( AFRAME.utils.device.isMobileVR() )
        document.querySelector('#cameraRig').object3D.position.y = 0.3;
      city = notSoRandomCity("small");
    }
    else {
      //this.el.setAttribute("shadow", true);
      city = notSoRandomCity("normal");
    }
    scene.add(city);
    starField = new StarField();
    cloudField = new CloudField();
    starField.setOpacity(0);
    scene.add(starField.stars);
    scene.add(cloudField.clouds);
    scene.add(cloudField.lightnings);
    scene.add(cloudField.flash);
    document.querySelector("#switch").object3D.rotation.z = 0.1;
  }
});




AFRAME.registerComponent("scene-update", {
  schema: {    
  },
  
  init: function () {
    this.T = T; // Time constant
    this.night = false;
    this.dusk = false;
    this.dawn = false;
    this.shrinkX = document.querySelector("#room-shrink").object3D.scale.x;
    this.shrinkY = document.querySelector("#room-shrink").object3D.scale.y;
    this.shrinkZ = document.querySelector("#room-shrink").object3D.scale.z;
    this.tableX = 2.10;//1.95; //document.querySelector("#table-object").object3D.position.x;
    this.drumkitX = 0.88;
    this.lampY = 3;//document.querySelector("#lamp-object").object3D.position.y; // WHYYYYYYYY!!!!
    document.querySelector("#cameraRig").object3D.rotation.z = 0;
    // Audio stuff:
    this.peak = false;
    this.peakCount = -1;
    
  },
  
  pause: function() {
    console.log("2.MAIN LOOP PAUSED")
    startTime = 0;
    this.night = false;
    this.dusk = false;
    this.dawn = false;
  },
  
  play: function() {

  },
  
  tick: function(time, timeDelta) {
    if(startTime == 0)
      startTime = time;
    time -= startTime;
    let R = 1000; // Sun's orbit radius
    let sun = document.querySelector('#sun');
    let ambient = document.querySelector('#ambient');
    let sunlight = document.querySelector('#sunlight');
    let sunlight2 = document.querySelector('#sunlight2');
    let streetLight = document.querySelector('#street-light');
    let hours = document.querySelector('#hours');
    let minutes = document.querySelector('#minutes');
    let lightSequencer = document.querySelector("#scene");

    // Stuff that happens during the song. The song is 3:12 long (last hit at 3:03)
    if(time < 183100 && startTime >=0 )
    {
      shrinkingFactor = 1-time*19e-7; // 1-time*17e-7
      shrinkingFactor2 = 1-time*22e-7;
      document.querySelector("#room-shrink").object3D.scale.x = this.shrinkX * shrinkingFactor;
      document.querySelector("#room-shrink").object3D.scale.y = this.shrinkY * shrinkingFactor;
      document.querySelector("#room-shrink").object3D.scale.z = this.shrinkZ * shrinkingFactor;
      document.querySelector("#lamp-object").object3D.position.y = this.lampY * shrinkingFactor;
      document.querySelector("#table-object").object3D.position.x = this.tableX * shrinkingFactor2;
      document.querySelector("#drumkit").object3D.position.x = this.drumkitX * shrinkingFactor2;
      document.querySelector("#cameraRig").object3D.rotation.z += 0.000015;
      
      let orbitCos = -Math.cos(Math.PI-Math.PI*time/this.T);
      let orbitSin = -Math.sin(Math.PI-Math.PI*time/this.T);
      sun.object3D.position.y = R*orbitCos;
      sun.object3D.position.z = R*orbitSin;
      sunlight2.object3D.position.y = orbitCos*12;
      sunlight2.object3D.position.z = orbitSin*12;

      hours.object3D.rotation.x += clockDirection*timeDelta/(this.T/6);//= clockDirection*((6*time/this.T)+Math.PI/4);
      minutes.object3D.rotation.x = hours.object3D.rotation.x*12;

      var sunFade = 1;
      if (orbitCos > 0.2) sunFade = 1;
      else if(orbitCos < -0.2) sunFade = 0;
      else sunFade = orbitCos.map(0.2, -0.2, 1, 0);

      sunlight.setAttribute("light", {intensity: sunFade});
      sunlight2.setAttribute("light", {intensity: 1*sunFade });      

      if(orbitCos > 0)
        ambient.setAttribute("light", {intensity: (sunFade-0.4)*0.8 })
      else
        ambient.setAttribute("light", {intensity: 0.05 });
      
      const duskTop = 0.5, duskMid = 0, duskBottom = -0.1; // Dusk/Dawn boundaries
      if(orbitCos < duskTop && orbitCos > duskBottom)
      {
        if(orbitSin < 0 && !this.dusk)
        {
          console.log("Dusk! " + time);
          lightSequencer.setAttribute("light-sequencer",{running: true, mode: "dusk"});
          console.log("Sequencer started")
          this.dusk = true;
        }
        else if (orbitSin > 0 && !this.dawn)
        {
          console.log("Dawn! " + time);
          lightSequencer.setAttribute("light-sequencer",{running: true, mode: "dawn"});
          this.dawn = true;
        }
      }
      else
      {
        this.dawn = false;
        this.dusk = false;
        if(!this.night && orbitCos < duskMid)
        {
          lightSequencer.setAttribute("light-sequencer",{running: false});
          console.log("Night! " + time);
          this.night = true;
        }
        else if(this.night && orbitCos > duskMid)
        {
          console.log("Day! " + time);
          lightSequencer.setAttribute("light-sequencer",{running: false});
          switchCityLights(city,"off");
          this.night = false;
        }
      }
      if(time > 178000) lightSequencer.setAttribute("light-sequencer",{running: true, mode: "dawn"});
    }
    //else if(time > 189000 && time < 189100)
    //else if(time > 189100 && time < 189200)
    else if(time>189200 && time <= 195000)
    {
      roomLightSwitch("off");
      streetLight.setAttribute("light",{intensity:0.1});
    }
    else if(time > 195000)
    {
      roomLightSwitch("off");
      if(cloudField.flashOn)
      {
        if(cloudField.flashCounter == 0)
          cloudField.lightningsOff();
        else
          cloudField.flashCounter--;
      };
    }
    /*----- Sky update -----*/
    
    /*if(startTime == 0)
      startTime = time;
    time -= startTime;*/
    let orbitCos = -Math.cos(Math.PI-Math.PI*time/this.T);
    let orbitSin = -Math.sin(Math.PI-Math.PI*time/this.T);
    /*
      Top and Mid colors for day, dawn and night:
                Mid              Top
      Day:   rgba(87,191,255) rgba(137,232,255)
      Dusk/Dawn:  rgba(248,84,255) rgba(35,168,255) 
      Night: rgba(6,0,66)     rgba(35,0,93)    
    */
    const topDayR = 137,   topDayG = 232,   topDayB = 255;
    const midDayR = 87,   midDayG = 191,   midDayB = 255;
    const topDuskR = 35,  topDuskG = 168,  topDuskB = 255;
    const midDuskR = 248,  midDuskG = 84,  midDuskB = 255;
    const topNightR = 5, topNightG = 0, topNightB = 40;
    const midNightR = 20, midNightG = 0, midNightB = 60;
    const duskTop = 0.5, duskMid = 0, duskBottom = -0.1; // Down boundaries
    let topRGB, midRGB;
    let sky = document.querySelector('a-sky');
    if(orbitCos < duskTop)
    {
      // Starfield rotation
      starField.stars.rotation.y += clockDirection*timeDelta/(this.T) //= time/this.T;
      starField.stars.rotation.z -= clockDirection*timeDelta/(this.T)//= -time/this.T;
    }
    // Clouds movement
    cloudField.clouds.rotation.y += -clockDirection*3*timeDelta/(this.T); //= -time/(this.T*0.35);
    cloudField.lightnings.rotation.y = cloudField.clouds.rotation.y;
    
    if(time < 183100 && startTime >=0 )
    {     
      topRGB = "rgb(" + topDayR + "," + topDayG + "," + topDayB + ")";
      midRGB = "rgb(" + midDayR + "," + midDayG + "," + midDayB + ")";      
      
      if(orbitCos < duskTop && orbitCos > duskMid) // Transition to dusk
      {
        starField.setOpacity(orbitCos.map(duskMid, duskTop, 0.5, 0));
        let topR = Math.round(orbitCos.map(duskMid, duskTop, topDuskR, topDayR));
        let topG = Math.round(orbitCos.map(duskMid, duskTop, topDuskG, topDayG));
        let topB = Math.round(orbitCos.map(duskMid, duskTop, topDuskB, topDayB));
        let midR = Math.round(orbitCos.map(duskMid, duskTop, midDuskR, midDayR));
        let midG = Math.round(orbitCos.map(duskMid, duskTop, midDuskG, midDayG));
        let midB = Math.round(orbitCos.map(duskMid, duskTop, midDuskB, midDayB));
        topRGB = "rgb(" + topR + "," + topG + "," + topB + ")";
        midRGB = "rgb(" + midR + "," + midG + "," + midB + ")";
      }      
      else if(orbitCos < 0 && orbitCos > -0.1) // Transition to night
      {
        starField.setOpacity(orbitCos.map(duskBottom, duskMid,1, 0.5));
        cloudField.setOpacity(orbitCos.map(duskBottom, duskMid, 0.05, 0.3));
        let topR = Math.round(orbitCos.map(duskBottom, duskMid, topNightR, topDuskR));
        let topG = Math.round(orbitCos.map(duskBottom, duskMid, topNightG, topDuskG));
        let topB = Math.round(orbitCos.map(duskBottom, duskMid, topNightB, topDuskB));
        let midR = Math.round(orbitCos.map(duskBottom, duskMid, midNightR, midDuskR));
        let midG = Math.round(orbitCos.map(duskBottom, duskMid, midNightG, midDuskG));
        let midB = Math.round(orbitCos.map(duskBottom, duskMid, midNightB, midDuskB));
        topRGB = "rgb(" + topR + "," + topG + "," + topB + ")";
        midRGB = "rgb(" + midR + "," + midG + "," + midB + ")";  
      }      
      else if(orbitCos < -0.1) // Night
      {
        starField.setOpacity(1);
        //cloudField.setOpacity(0.1);
        topRGB = "rgb(" + topNightR + "," + topNightG + "," + topNightB + ")";
        midRGB = "rgb(" + midNightR + "," + midNightG + "," + midNightB + ")";
      }
      else // Day
      {
        starField.setOpacity(0);
        //cloudField.setOpacity(0.3);
      }
      sky.setAttribute("material",{topColor: topRGB, middleColor: midRGB });
      // Storm
      if(time > 154500 && time < 169000) // if(time > 154500 && time < 169000)
      {
        roomLightSwitch("off");
        if(!cloudField.flashOn)
        {
          if(Math.random() > 0.8)
          {
            cloudField.lightningsOn();
            cloudField.flashCounter = 2;
            roomLightSwitch("off");
          }
        } else if(Math.random() > 0.5) roomLightSwitch("on");
      }
    }
    else
    {
        topRGB = "rgb(" + topNightR + "," + topNightG + "," + topNightB + ")";
        midRGB = "rgb(" + midNightR + "," + midNightG + "," + midNightB + ")";
        sky.setAttribute("material",{topColor: topRGB, middleColor: midRGB });      
    }
    if(cloudField.flashOn)
    {
      if(cloudField.flashCounter == 0)
        cloudField.lightningsOff();
      else
        cloudField.flashCounter--;
    }
    /*----- Sky update end -----*/
    /*----- Audio update starts -----*/
    if(time < 183100 && startTime >=0 )
    {
      let pos = this.el.object3D.position;
      let snareDrum = document.querySelector('#snare-drum');
      var bassDrum = document.querySelector('#bass-drum');
      var hhTop = document.querySelector('#hh-top');
      let BDAnalysis = analyze(BD.analyzer);
      let SDAnalysis = analyze(SD.analyzer);
      let HHAnalysis = analyze(HH.analyzer);
      if(HHAnalysis > -38)
      {
        if(this.peak == false)
        {
          this.peak = true;
          if(time > 154500 && time < 168500) // 2:34:500  2:48.500
            switchCityLights(city,"seq",this.peakCount);
          else if(time > 164000 && time < 169000) // 2:44
            switchCityLights(city,"random");
          this.peakCount++;
        }
      }
      else
        this.peak = false;
      
      if(time > 91200 && time < 103750 )
      {
        SDAnalysis = -999999;
        HHAnalysis = -999999;
        if( (time > 91200 && time < 92400) || (time > 92800 && time < 94000) || (time > 94500 && time < 95600) || (time > 96100 && time < 97200) )
          BDAnalysis = -999999;
        if( (time > 97700 && time < 98900) || (time > 99300 && time < 100500) || (time > 101000 && time < 102100) || (time > 102600 && time < 103700) )
          BDAnalysis = -999999;
      }
      bassDrum.object3D.scale.y=1-(2/BDAnalysis);
      snareDrum.object3D.scale.y=1+(3/SDAnalysis);
      hhTop.object3D.position.y=0.007+(1/HHAnalysis);
    }
    
    /*---- Audio update ends ----*/
    /*---- Room boundaries start ----*/
    let head = document.querySelector('#rig');
    let headX = head.object3D.position.x;
    let headZ = head.object3D.position.z;
    // Keep player inside the room:
    if(!debug)
    {
      let boundary = 2.5 * shrinkingFactor * 0.8;
      if(headX > boundary){
          head.object3D.position.x = boundary;
      }
      if(headX < -boundary){
          head.object3D.position.x = -boundary;
      }
      if(headZ > boundary){
          head.object3D.position.z = boundary;
      }
      if(headZ < -boundary){
          head.object3D.position.z = -boundary;
      }
    }
    /*---- Room boundaries ends ----*/
    
    //spacebarHandler();
    /* Experimental: detect object collisions: */
    /*
    var tmp;
    if( detectCollision(document.querySelector("#t1").object3D, document.querySelector("#t2").object3D) )
      tmp = "YEAH";
    else
      tmp = "no";
    document.querySelector('#hud').setAttribute("text",{value: tmp});
    */
  } /*tick() ends here */
});


function spacebarHandler () {
    if(document.querySelector('#hud')) {
      var clockAbsPos = new THREE.Vector3();
      var swAbsPos = new THREE.Vector3();
      document.querySelector('#clock').object3D.getWorldPosition(clockAbsPos);
      document.querySelector('#switch').object3D.getWorldPosition(swAbsPos);
      var headX = document.querySelector('#rig').object3D.position.x;
      var headZ = document.querySelector('#rig').object3D.position.z;
      var headRotation = document.querySelector('#head').object3D.rotation.y/(Math.PI*2);
      var lookingAt = headRotation - Math.floor(headRotation);
      var dClock = distance2d( headX, headZ, clockAbsPos.x, clockAbsPos.z );
      var dSw = distance2d( headX, headZ, swAbsPos.x, swAbsPos.z );
      var hud= "";
      if( dClock<0.7 && (lookingAt > 0.6 && lookingAt < 0.9) ) {
        clockDirection *= -1;
        hud = "Clock";
      }
      else if( dSw<0.7 && (lookingAt > 0.1 && lookingAt < 0.4) ) {
        hud = "Switch"
        roomLightSwitch();
      }
      else
        hud = "";
      //document.querySelector('#hud').setAttribute("text",{value: hud}); 
    }
}

function detectCollision(object1, object2) {
  var box1, box2;
  if(object1.geometry) {
    object1.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);
  } else {
    object1.updateMatrixWorld();
    box1 = new THREE.Box3().setFromObject(object1);
    box1.applyMatrix4(object1.matrixWorld);
  }
  
  if(object2.geometry) {
    object2.geometry.computeBoundingBox();
    object2.updateMatrixWorld();
    box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);
  } else {
    object2.updateMatrixWorld();
    box2 = new THREE.Box3().setFromObject(object1);
    box2.applyMatrix4(object2.matrixWorld);
  }

  if(box1.intersectsBox(box2))
    console.log("YES")
  return box1.intersectsBox(box2);
}


function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function distance2d( x1, y1, x2, y2 )
{
    var dx = x1 - x2;
    var dy = y1 - y2;

    return Math.sqrt( dx * dx + dy * dy );
}


class StarField {
  constructor() {
    // From: https://aerotwist.com/tutorials/creating-particles-with-three-js/
    // and THREE.js PointsMaterial page
    var vertices = [];
    const radius = 1900;
    for ( var i = 0; i < 80; i ++ ) {
      var theta = THREE.Math.randFloatSpread(180);
      var phi = THREE.Math.randFloatSpread(180);
      var x = radius * Math.sin(theta) * Math.cos(phi);
      var y = radius * Math.sin(theta) * Math.sin(phi);
      var z = radius * Math.cos(theta);
      vertices.push( x, y, z );
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    var texture = new THREE.TextureLoader().load( 'images/particle.png' );
    var material = new THREE.PointsMaterial( { color: 0x888888,
                                              size: 40,
                                              map: texture,
                                              blending: THREE.AdditiveBlending,
                                              transparent: true,
                                              opacity: 0.5
                                             } );
    this.stars = new THREE.Points( geometry, material );
  }
  setOpacity(opacity){
    this.stars.material.opacity = opacity;
  }
}

// Clouds:
class CloudField{
  constructor(opacity=0.3) {
    this.baseOpacity = opacity;
    // From: https://medium.com/@joshmarinacci/procedural-geometry-low-poly-clouds-b86a0e66bcad
    //randomly displace the x,y,z coords by the `per` value
    const jitter = (geo, jitterX=0, jitterY=0, jitterZ=0) => geo.vertices.forEach(v => {
        v.x += Math.random().map(0,1,-jitterX,jitterX)
        v.y += Math.random().map(0,1,-jitterY,jitterY)
        v.z += Math.random().map(0,1,-jitterZ,jitterZ)
    })

    this.clouds = new THREE.Group();
    this.lightnings = new THREE.Group();
    this.flashOn = false;
    this.flashCounter = 0;
    const cloudRadius = 40;
    const vertexes = 10;
    const jitterX = 20;
    const jitterY = 20;
    const elongation = 12;
    let cloudF = new THREE.Mesh(new THREE.CircleGeometry(cloudRadius,vertexes),
                                new THREE.MeshBasicMaterial({
                                  color:'white',
                                  transparent: true,
                                  opacity: 0.3
                                }));
    cloudF.position.z = -600;
    cloudF.position.y = 100;
    cloudF.scale.set(elongation,1,1);
    jitter(cloudF.geometry,jitterX,jitterY);
    cloudF.updateMatrix();
    this.clouds.add(cloudF);
    
    let cloudB = new THREE.Mesh(new THREE.CircleGeometry(cloudRadius,vertexes), 
                                new THREE.MeshBasicMaterial({
                                  color:'white',
                                  transparent: true,
                                  opacity: 0.3
                                }));
    cloudB.position.z = 600;
    cloudB.position.y = 100;
    cloudB.rotation.y = Math.PI;
    cloudB.scale.set(elongation,1,1);
    jitter(cloudB.geometry,jitterX,jitterY);
    this.clouds.add(cloudB);

    let cloudL = new THREE.Mesh(new THREE.CircleGeometry(cloudRadius,vertexes), 
                                new THREE.MeshBasicMaterial({
                                  color:'white',
                                  transparent: true,
                                  opacity: 0.3
                                }));
    cloudL.rotation.y = Math.PI/2;
    cloudL.position.x = -600;
    cloudL.position.y = 100;
    cloudL.scale.set(elongation,1,1);
    jitter(cloudL.geometry,jitterX,jitterY);
    this.clouds.add(cloudL);

    let cloudR = new THREE.Mesh(new THREE.CircleGeometry(cloudRadius,vertexes), 
                                new THREE.MeshBasicMaterial({
                                  color:'white',
                                  transparent: true,
                                  opacity: 0.3
                                }));
    cloudR.rotation.y = -Math.PI/2;
    cloudR.position.x = 600;
    cloudR.position.y = 100;
    cloudR.scale.set(elongation,1,1);
    //cloudR.updateMatrix();
    jitter(cloudR.geometry,jitterX,jitterY);
    this.clouds.add(cloudR);
    
    let lightning = new Lightning(cloudF.position.x, cloudF.position.y, cloudF.position.z, -130);
    lightning.material.visible = false;
    this.lightnings.add(lightning);
    lightning = new Lightning(cloudB.position.x, cloudB.position.y, cloudB.position.z, -130);
    lightning.material.visible = false;
    this.lightnings.add(lightning);
    lightning = new Lightning(cloudL.position.x, cloudL.position.y, cloudL.position.z, -130);
    lightning.material.visible = false;
    this.lightnings.add(lightning);
    lightning = new Lightning(cloudR.position.x, cloudR.position.y, cloudR.position.z, -130);
    lightning.material.visible = false;
    this.lightnings.add(lightning);
    
    //light="type: point; color: #DEF; intensity: 0; distance: 20; castShadow: true;" position="0 3 -5"
    this.flash = new THREE.PointLight( 0xddeeff, 0, 100 );
    this.flash.position.set(0, 3, -50);

    //+THREE.Math.randFloatSpread(30);
    this.clouds.name="clouds!";
  }
  setOpacity(opacity) {
    this.baseOpacity = opacity;
    for(var i=0;i<this.clouds.children.length;i++)
      this.clouds.children[i].material.opacity = opacity;
  }
  randomLightningOn() {
    let pick = Math.round(Math.random()*3);
    let l = this.lightnings.children[pick];
    l.twitch(l);
    l.material.visible = true;
    this.clouds.children[pick].material.opacity = 0.8;
    this.flash.intensity = 1;
  }
  lightningsOn() {
    this.flashOn = true;
    for(var i=0;i<this.lightnings.children.length;i++)
    {
      this.lightnings.children[i].twitch();
      this.clouds.children[i].material.opacity = 0.8;
      this.lightnings.children[i].material.visible = true;
    }
    this.flash.intensity = 1;
  }
  lightningsOff() {
    for(var i=0;i<this.lightnings.children.length;i++)
    {
      this.clouds.children[i].material.opacity = this.baseOpacity;
      this.lightnings.children[i].material.visible = false;
    }
    this.flash.intensity = 0;
    this.flashOn = false;
  }
  twitch(flash){
    let geom = flash.geometry;
    for(let i=1; i<geom.vertices.length; i++)
    {
      geom.vertices[i].x = this.x+((Math.random()-0.5)*10);
      geom.vertices[i].z = this.z+((Math.random()-0.5)*10);
    }
    geom.verticesNeedUpdate = true;
  }
}

class Lightning extends THREE.Line{
  constructor(x=0, y=30, z=-20, ground=-30) {
    // From: https://aerotwist.com/tutorials/creating-particles-with-three-js/
    // and THREE.js PointsMaterial page
    super();
    this.x = x;
    this.y = y;
    this.z= z;
    let segments = 20;
    let vertices = [];
    let segmentLengh = (this.y - ground)/segments;
    let vx = this.x, vy = this.y, vz = this.z;
    for ( var i = 0; i < segments; i ++ ) {
      vertices.push( new THREE.Vector3( vx, vy, vz ) );
      vx += ((Math.random()-0.5)*10);
      vy = (this.y-i*segmentLengh)+(Math.random()-0.5)*segmentLengh;
      vz += ((Math.random()-0.5)*10);
    }
    vertices.push( new THREE.Vector3( vx, ground, vz ) );
    this.geometry = new THREE.Geometry().setFromPoints( vertices );
    this.material = new THREE.LineBasicMaterial( { color: 0xfefeff } );
    //this.flash = new THREE.Line( geometry, material );
  }
  twitch(){
    let geom = this.geometry;
    for(let i=1; i<geom.vertices.length; i++)
    {
      geom.vertices[i].x = this.x+((Math.random()-0.5)*10);
      geom.vertices[i].z = this.z+((Math.random()-0.5)*10);
    }
    geom.verticesNeedUpdate = true;
  }
}


AFRAME.registerComponent("light-sequencer", {
  schema: {
    running: {type: 'boolean', default: false},
    mode: {type: 'string', default: ""}
  },
  init: function () {
    this.interval = 101.351;
    this.offInterval = this.interval/3;
    this.seqPointer = 0;
    this.eightAccum = 0;
    this.seqPointer = 0;
    this.j = 0;
  },
  pause: function () {
    this.seqPointer = 0;
    this.eightAccum = 0;
    this.seqPointer = 0;
    this.j = 0;
  },
  tick: function(time, timeDelta) {
    let numBuildings = city.children.length;
    let interval = this.interval;
    let offInterval = this.offInterval;
    const mobile = ( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
    if(this.data.running)
    {
      if(this.data.mode == "dusk")
      {
        this.eightAccum += timeDelta;   
        if(this.eightAccum > interval) // time
        {
          // Switch lights on randomly:
          for(var i=0;i<numBuildings;i++)
          {
            var numWindows = (city.children[i].children[1].children.length)-1;
            let j = Math.round( numWindows * Math.random() );
            if(mobile)
              city.children[i].children[1].children[j].material.emissiveIntensity=1;
            else
            {
              let prob = city.children[i].userData / city.userData.maxFloors;
              if(prob>Math.random())
                city.children[i].children[1].children[j].material.emissiveIntensity=1;
            }
          }
          this.eightAccum = 0;
          this.seqPointer++;
          if(this.seqPointer==8) this.seqPointer = 0;
        }
      }
      else if(this.data.mode == "dawn")
      {
        this.eightAccum += timeDelta;   
        if(this.eightAccum > offInterval) // time
        {
          // Switch lights off in sequence:
          for(var i=0; i<numBuildings;i++)
          {
            var numWindows = (city.children[i].children[1].children.length);
            if(this.j < numWindows)
              city.children[i].children[1].children[this.j].material.emissiveIntensity=0;
          }
          this.j++;
          this.eightAccum = 0;
          this.seqPointer++;
          if(this.seqPointer==8) this.seqPointer = 0;
        } 
      }
    }
    else
    {
      this.seqPointer = 0;
      this.eightAccum = 0;
      this.seqPointer = 0;
      this.j = 0;
    }

  }
});



function switchCityLights(city, mode, val=0)
{
  if(mode=="random")
  {
    for(var i=0; i<city.children.length;i++)
    {
      var numWindows = city.children[i].children[1].children.length;
      for(var j=0; j<numWindows ;j++)
        if(Math.random()>0.5) city.children[i].children[1].children[j].material.emissiveIntensity=1;
        else city.children[i].children[1].children[j].material.emissiveIntensity=0;
    }
  }
  else if(mode=="on")
  {
    for(var i=0; i<city.children.length;i++)
    {
      var numWindows = city.children[i].children[1].children.length;
      for(var j=0; j<numWindows ;j++)
          city.children[i].children[1].children[j].material.emissiveIntensity=1;
    }
  }
  else if(mode=="off")
  {
    for(var i=0; i<city.children.length;i++)
    {
      var numWindows = city.children[i].children[1].children.length;
      for(var j=0; j<numWindows ;j++)
          city.children[i].children[1].children[j].material.emissiveIntensity=0;
    }
  }
  else if(mode=="level")
  {
    for(var i=0; i<city.children.length;i++)
    {
      let building = city.children[i];
      //roomsPerFloorFront, roomsPerFloorSide
      let val = Math.round( val.map (0,1,1,building.userData) ); //function (in_min, in_max, out_min, out_max) 
      for(var j=0; j<building.children[1].children.length ;j++)
      {
        if(building.children[1].children[j].userData < val)
          building.children[1].children[j].material.emissiveIntensity=1;
        else
          building.children[1].children[j].material.emissiveIntensity=0;
      }
    }
  }
  else if(mode=="seq")
  {
    val = val%8;
    for(var i=0; i<city.children.length;i++)
    {
      var numWindows = city.children[i].children[1].children.length;
      for(var j=0; j<numWindows ;j++)
      {
          if(j%val==0)
            city.children[i].children[1].children[j].material.emissiveIntensity=1;
          else
            city.children[i].children[1].children[j].material.emissiveIntensity=0;
      }
    }
  }
  
}



function notSoRandomCity(size="normal")
{
  var city = new THREE.Group();  
  let maxBlocksPerSide = 3;
  let sideBuildingsBaseHeight = 2;
  let maxFloors = 0;
  if(size=="small") sideBuildingsBaseHeight = 5;
  else
  {
    for(var i=0;i<maxBlocksPerSide*2;i++)
    {
      let x = (i-maxBlocksPerSide)*70;
      for(var j=1; j<4;j++)
      {
        let zrandom = Math.random();
        let z = -j*65+10;
        let floors = Math.round(Math.random() * (20*zrandom) +2);
        //let width = Math.round(Math.random() * 20) + 20;
        //let depth = Math.round(Math.random() * 20) + 20
        let b = new Building(x,worldFloor,z,floors);
        if(i!=maxBlocksPerSide)
          city.add( b.building );
        if(floors > maxFloors)
        maxFloors = floors;
      }
    }    
  }
  let a = new Building(0 ,worldFloor,-45, 2, 36, 30);
  city.add( a.building );
  a = new Building(40,worldFloor,-45, Math.round(Math.random()*3+sideBuildingsBaseHeight), 36, 30);
  city.add( a.building );
  a = new Building(-40,worldFloor,-45, Math.round(Math.random()*3+sideBuildingsBaseHeight), 36, 30);
  city.add( a.building );
  city.userData.maxFloors = maxFloors;
  city.name = "city";
  return city;
}


class Building {
  constructor(x=-30,y=worldFloor,z=-100,floors = 7,width=34, depth=34) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.floors = floors;
    this.width = width;
    this.depth = depth;
    var winHeight = 3; // has to be less than 5
    var winWidth = 2;
    var floorThick = 5-winHeight; 
    var height = (floors+1) * (winHeight+floorThick) + winHeight;
    this.roomsPerFloorFront = Math.round(this.width/(winWidth*2)) - 1;
    this.roomsPerFloorSide = Math.round(this.depth/(winWidth*2)) - 1;
    var m = 2;
    var n = 2;
    if( this.width%(winWidth*2) > 0)
      m = 3/2;
    if( this.depth%(winWidth*2) > 0)
      n = 3/2;
    var buildingColor = 0x666666;
    var windowColor = 0x111111;
    this.building = new THREE.Object3D();
    let windows = new THREE.Group();
    var buildingMaterial = new THREE.MeshLambertMaterial( {color: buildingColor} );//THREE.MeshToonMaterial( {color: buildingColor} );
    var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( this.width, height, this.depth ), buildingMaterial );
    mesh.position.set(0,height/2,0);
    this.building.add(mesh);
    // front/back face
    for(var i=0;i<floors;i++)
    {
      for(var j=0;j<this.roomsPerFloorFront;j++)
      {
        var windowMaterial = new THREE.MeshLambertMaterial( {color: windowColor, emissive: 0xFFFF00, emissiveIntensity: 0} );
        var mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(winWidth, winHeight, this.depth+0.4), windowMaterial);
        mesh.position.set(-this.width/2+winWidth*m+2*j*winWidth, (winHeight+floorThick)+i*(winHeight+floorThick), 0);
        mesh.name = "win-front-"+i+"-"+j;
        mesh.userData = i+1;
        windows.add(mesh);
      }
    }
    // lateral faces
    for(var i=0;i<floors;i++)
    {
      for(var j=0;j<this.roomsPerFloorSide;j++)
      {
        var windowMaterial = new THREE.MeshLambertMaterial( {color: windowColor, emissive: 0xFFFF00, emissiveIntensity: 0} );
        var mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(this.width+0.4, winHeight, winWidth), windowMaterial);
        mesh.position.set(0, (winHeight+floorThick)+i*(winHeight+floorThick), -this.depth/2+winWidth*n+2*j*winWidth);
        mesh.name = "win-side-"+i+"-"+j;
        mesh.userData = i+1;
        windows.add(mesh);
      }
    }
    this.building.add(windows);
    this.building.name = this.floors+"-"+this.width;
    this.building.userData = this.floors;
    this.building.rotation.set(0, 0, 0);
    this.building.position.set(x, y, z);
    toonize(this.building,0.005, false);
  }
}



// https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode
function analyze(analyzer)
{
  analyzer.fftSize = 64;
  const sampleBuffer = new Float32Array(analyzer.fftSize);
  analyzer.getFloatTimeDomainData(sampleBuffer);
  // Compute average power over the interval.
  let sumOfSquares = 0;
  for (let i = 0; i < sampleBuffer.length; i++) {
    sumOfSquares += sampleBuffer[i] ** 2;
  }
  const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
  const avg = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
  /*
  let peakInstantaneousPower = 0;
  for (let i = 0; i < sampleBuffer.length; i++) {
    const power = sampleBuffer[i] ** 2;
    peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
  }
  const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
  */
  return(avgPowerDecibels);
}


/////////////////////////


AFRAME.registerComponent('wireframe', {
  schema: {
    thickness: {type: 'number', default: 0},
    changeMaterial: {type: 'boolean', default: false}
  },

  init: function () {
    var data = this.data;
    var el = this.el;  // Entity.
    wireframize(el.object3D);
  }
});

AFRAME.registerComponent('toon', {
  schema: {
    thickness: {type: 'number', default: 0},
    changeMaterial: {type: 'boolean', default: false},
    depthWrite: {type: 'boolean', default: true}
  },

  init: function () {
    var data = this.data;
    var el = this.el;  // Entity.
    toonize(el.object3D, data.thickness, data.changeMaterial, data.depthWrite);
  }
});

AFRAME.registerComponent('toon-model', {
  schema: {
    thickness: {type: 'number', default: 0},
    changeMaterial: {type: 'boolean', default: false}
  },
  
  init: function () {
    // Wait for model to load.
    this.el.addEventListener('model-loaded', () => {
      var data = this.data;
      var el = this.el;  // Entity.
      toonize(el.object3D, data.thickness, data.changeMaterial);
    });
  },
  
  
});

function outlineMaterial(depthWrite=true)
{
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000, 
        side:THREE.BackSide,
        depthWrite: depthWrite
    })
    material.onBeforeCompile = (shader) => {
        const token = '#include <begin_vertex>'
        //const customTransform = `vec3 transformed = position + objectNormal*0.03;`
        const customTransform = `vec3 transformed = position;`
        shader.vertexShader = shader.vertexShader.replace(token,customTransform)
    }
    return material;
}

function toonize(object, thickness=0, changeMaterial=true, depthWrite=true)
{
    // Uncomment to activate toon effect
    return;
    //if( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
    //  return;
    const s = 1 + thickness;

    object.traverse( function( node ) {
      if( node.material && node.name.indexOf("win") < 0 ) {
        if(changeMaterial)
        {
          let origColor = node.material.color;
          node.material = new THREE.MeshToonMaterial({gradientMap: gradientMaps.threeTone});
          node.material.color.set(origColor);//(0x2194ce);
        }
        if(thickness>0)
        {
          var outline = node.clone();
          outline.scale.set(s,s,s);
          outline.material = outlineMaterial(depthWrite);
          outline.name = "outline for "+node.name;
          object.add(outline);
        }
      }
    });
}

function wireframize(object, thickness=1, changeMaterial=true)
{
    const s = 1 + thickness;
    var outlines = new THREE.Group();
    object.traverse( function( node ) {
      if( node.material && node.name.indexOf("win") < 0 ) {
        if(changeMaterial)
        {
          let origColor = node.material.color;
          node.material = new THREE.MeshToonMaterial({gradientMap: gradientMaps.fiveTone});
          node.material.color.set(origColor);//(0x2194ce);
        }
        if(true)
        {
          var geometry = node.geometry;
          var edges = new THREE.EdgesGeometry( geometry );
          //edges.material.polygonOffset = true;
          //edges.material.polygonOffsetFactor = 1;
          //edges.material.polygonOffsetUnits = 1;
          //edges.material.linewidth = 2;
          var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xf000000 } ) );
          outlines.add(line);
        }
      }
    });
    if(thickness>0)
      object.add(outlines);
}


var gradientMaps = ( function () {
  var textureLoader = new THREE.TextureLoader();  var threeTone = textureLoader.load( 'images/threeTone.jpg' );
  threeTone.minFilter = THREE.NearestFilter;
  threeTone.magFilter = THREE.NearestFilter;
  var fiveTone = textureLoader.load( 'images/fiveTone.jpg' );
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;

  return {
    none: null,
    threeTone: threeTone,
    fiveTone: fiveTone
  };

} )();

