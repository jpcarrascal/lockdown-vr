/* globals AFRAME, THREE */
var debug = false;
window.addEventListener('load', function() {
  document.querySelector("#fb-share").href="https://facebook.com/sharer/sharer.php?u=http://www.spacebarman.com";
  document.querySelector('#action').pause();
  if( !AFRAME.utils.device.isMobile() && !AFRAME.utils.device.isMobileVR() ) document.querySelector(".a-enter-vr").style.display='none';
  checkLoad();
});

// enter-vr and exit-vr:
document.querySelector('a-scene').addEventListener('enter-vr', function () {
   console.log("ENTERED VR");
});

// Checks if video is loaded. Source: http://atomicrobotdesign.com/blog/web-development/check-when-an-html5-video-has-loaded/
// could have used vid.addEventListener('loadeddata', function() {});
// but sometimed the video loads early and no more 'loadeddata' events are not triggered anymore.
function checkLoad() {
  let vid = document.querySelector("#JPvid");
  let start = document.querySelector('#start');
  let veil = document.querySelector('#veil');
  let mobile = ( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
  if(!mobile) document.querySelector(".a-enter-vr").style.display='none';
  //  document.querySelector("a-scene").setAttribute("vr-mode-ui",{enterVRButton: "#start"})
  //class="a-enter-vr-button"
  if (vid.readyState === 4) {
    document.querySelector("#start").innerText="Start!";
    start.addEventListener('click', function (e) {
      document.querySelector('#action').play();
      var playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.then(function() {
          // Only start BD, SD and HH playback when video playback is started
          startTime = 0;
          //const audioStartTime = Math.abs(startTime)/1000;
          const audioStartTime = vid.currentTime;
          BD.source.start(ctx.currentTime, audioStartTime, 194);
          SD.source.start(ctx.currentTime, audioStartTime, 194);
          HH.source.start(ctx.currentTime, audioStartTime, 194);
          //song.source.start(ctx.currentTime, audioStartTime, 194);
          veil.style.display = 'none';
        }).catch(function(error) {
          console.log("Error playing video!!!");
        });
      }
      });
    } else {
        setTimeout(checkLoad, 100);
    }
}


function debugThis(text)
{
  document.querySelector('#start').innerText = text;
}

// https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var startTime = -1;
// var songLocation= "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FLockdown-trim.mp3?v=1588790687348";
var BDLocation =  "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FKD.mp3?v=1588790685488";
var SDLocation= "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FSD.mp3?v=1588790686804";
var HHLocation= "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FHH.mp3?v=1588790683823";

// Create a new audio context.
var ctx = new AudioContext();
var mainVolume = ctx.createGain();
mainVolume.connect(ctx.destination);

const worldFloor = -30;
const T = 60000; // Time constant: 60000
let shrinkingFactor = 0.9999915;
var city;
var BD = {};
var SD = {};
var HH = {}
/*
var song = {};
song.source = ctx.createBufferSource();
song.volume = ctx.createGain();
song.source.connect(song.volume);
song.volume.connect(mainVolume);
song.source.loop = false;
*/

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

/*
setupSample(songLocation)
    .then((sample) => {
      song.buffer = sample;
      song.source.buffer = song.buffer;
});
*/

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
  let sw = document.querySelector("#room-light");
  let lamp = document.querySelector("#lamp");
  const onValue = 1;
  const offValue = 0.1;
  const onColor = "#FFFFEE";
  const offColor = "#E0D0C0";
  const onShader = "flat";
  const offShader = "standard";
  if(status == "on")
  {
    lamp.setAttribute("material",{color: onColor, shader: onShader});
    sw.setAttribute("light", {intensity: onValue});
  }
  else if(status == "off")
  {
    lamp.setAttribute("material",{color: offColor, shader: offShader});
    sw.setAttribute("light", {intensity: offValue});
  }
  else
  {
    if(sw.getAttribute("light").intensity < onValue)
    {
      lamp.setAttribute("material",{color: onColor, shader: onShader});
      sw.setAttribute("light", {intensity: onValue});
    }
    else
    {
      lamp.setAttribute("material",{color: offColor, shader: offShader});
      sw.setAttribute("light", {intensity: offValue});
    }
  }
}

AFRAME.registerComponent('x-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('xbuttondown', function (evt) {
      roomLightSwitch();
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

AFRAME.registerComponent("scene-setup", {
  init: function () {
    //sceneEl.pause();
    if( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
    {
      this.el.setAttribute("shadow", false);
      if( AFRAME.utils.device.isMobileVR() )
        document.querySelector('#cameraRig').object3D.position.y = 0.3;
      city = notSoRandomCity("small");
    } 
    else city = notSoRandomCity("normal");
    this.el.object3D.add(city);
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
    this.lampY = 3;//document.querySelector("#lamp-object").object3D.position.y; // WHYYYYYYYY!!!!
    //this.camRotZ = document.querySelector("#cameraRig").object3D.rotation.z; // WHYYYYYYYY!!!!
    document.addEventListener('keydown', function(event) {
      if(event.keyCode == 49) {
        roomLightSwitch();
      }
    });
    
  },
  pause: function() {
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
    let lightSequencer = document.querySelector("#action");

    // Stuff that happens during the song. The song is 3:12 long (last hit at 3:03)
    if(time < 183100 && startTime >=0 )
    {
      //if(time > 178000)
      //  this.T *= 1.00007;//+=6; // Slow down world
      shrinkingFactor = 1-time*17e-7;//1-time*7.8e-10;
      document.querySelector("#room-shrink").object3D.scale.x = this.shrinkX * shrinkingFactor;
      document.querySelector("#room-shrink").object3D.scale.y = this.shrinkY * shrinkingFactor;
      document.querySelector("#room-shrink").object3D.scale.z = this.shrinkZ * shrinkingFactor;
      document.querySelector("#lamp-object").object3D.position.y = this.lampY * shrinkingFactor;
      //document.querySelector("#cameraRig").object3D.rotation.z = this.camRotZ * (1-time*1e-9); // WHYYYYYYYY!!!!
      document.querySelector("#cameraRig").object3D.rotation.z += 0.000012;
      
      let orbitCos = -Math.cos(Math.PI-Math.PI*time/this.T);
      let orbitSin = -Math.sin(Math.PI-Math.PI*time/this.T);
      sun.object3D.position.y = R*orbitCos;
      sun.object3D.position.z = R*orbitSin;
      sunlight2.object3D.position.y = orbitCos*12;

      hours.object3D.rotation.x = (6*time/this.T)+Math.PI/4;
      minutes.object3D.rotation.x = hours.object3D.rotation.x*12;

      var sunFade = 1;
      if (orbitCos > 0.2) sunFade = 1;
      else if(orbitCos < -0.2) sunFade = 0;
      else sunFade = orbitCos.map(0.2, -0.2, 1, 0);

      sunlight.setAttribute("light", {intensity: sunFade});
      sunlight2.setAttribute("light", {intensity: 1*sunFade });      

      if(orbitCos > 0)
        ambient.setAttribute("light", {intensity: sunFade-0.4 })
      else
        ambient.setAttribute("light", {intensity: 0 });
      
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
    else if(time>189200)
    {
      roomLightSwitch("off");
      streetLight.setAttribute("light",{intensity:0.1})
    }
  }
});



AFRAME.registerComponent("room-boundaries", {
  pause: function() {
    
  },
  tick: function() {
    let head = document.querySelector('#head');
    // Keep player inside the room:
    if(!debug)
    {
      let headX = head.object3D.position.x;
      let headZ = head.object3D.position.z;
      let boundary = 2.5 * shrinkingFactor * 0.9;
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
// This takes the camera to the other side of the room:
/*    if( Math.abs(headX) > 2.5 * shrinkingFactor)
        head.object3D.position.x = -(headX*0.9) * shrinkingFactor;
      if( Math.abs(headZ) > 2.5 * shrinkingFactor)
        head.object3D.position.z = -(headZ*0.9) * shrinkingFactor;
*/
    }
  }
});

AFRAME.registerComponent("sky", {
  pause: function() {
    this.night = false;
    this.dusk = false;
    this.dawn = false;
  },
  init: function () {
    this.starField = new StarField();
    this.cloudField = new CloudField();
    this.starField.setOpacity(0);
    this.el.sceneEl.object3D.add(this.starField.stars);
    this.el.sceneEl.object3D.add(this.cloudField.clouds);
    this.el.sceneEl.object3D.add(this.cloudField.lightnings);
    this.el.sceneEl.object3D.add(this.cloudField.flash);
    this.T = T;
    this.night = false;
    this.dusk = false;
    this.dawn = false;
    this.flashOn = false;
  },
  tick: function(time, deltaTime) {
    if(startTime == 0)
      startTime = time;
    time -= startTime;
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
      this.starField.stars.rotation.y=time/this.T;
      this.starField.stars.rotation.z=-time/this.T;
    }
    // Cloudfield movement
    this.cloudField.clouds.rotation.y=-time/(this.T*0.35);
    this.cloudField.lightnings.rotation.y=this.cloudField.clouds.rotation.y;
    
    if(time < 183100 && startTime >=0 )
    {     
      topRGB = "rgb(" + topDayR + "," + topDayG + "," + topDayB + ")";
      midRGB = "rgb(" + midDayR + "," + midDayG + "," + midDayB + ")";      
      
      if(orbitCos < duskTop && orbitCos > duskMid) // Transition to dusk
      {
        this.starField.setOpacity(orbitCos.map(duskMid, duskTop, 0.5, 0));
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
        this.starField.setOpacity(orbitCos.map(duskBottom, duskMid,1, 0.5));
        this.cloudField.setOpacity(orbitCos.map(duskBottom, duskMid, 0.05, 0.3));
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
        this.starField.setOpacity(1);
        //this.cloudField.setOpacity(0.1);
        topRGB = "rgb(" + topNightR + "," + topNightG + "," + topNightB + ")";
        midRGB = "rgb(" + midNightR + "," + midNightG + "," + midNightB + ")";
      }
      else // Day
      {
        this.starField.setOpacity(0);
        //this.cloudField.setOpacity(0.3);
      }
      sky.setAttribute("material",{topColor: topRGB, middleColor: midRGB });
      
      if(time > 154500 && time < 169000) // if(time > 154500 && time < 169000)
      {
        if(!this.flashOn)
        {
          if(Math.random() > 0.9)
          {
            this.cloudField.lightningsOn()
            console.log("LIGHTNING on " + this.flashOn)
            this.flashOn = true;
          }
        }
        else
        {
          console.log("--------- off " + this.flashOn);
          this.cloudField.lightningsOff()
          this.flashOn = false;
        }        
      }
      
      
    }
    else
    {
        topRGB = "rgb(" + topNightR + "," + topNightG + "," + topNightB + ")";
        midRGB = "rgb(" + midNightR + "," + midNightG + "," + midNightB + ")";
        sky.setAttribute("material",{topColor: topRGB, middleColor: midRGB });      
    }
  }
});


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
    var texture = new THREE.TextureLoader().load( 'https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fparticle.png?v=1589106936463' );
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
     
    const cloudRadius = 40;
    const vertexes = 10;
    const jitterX = 20;
    const jitterY = 20;
    const elongation = 12;
    let cloudF = new THREE.Mesh(new THREE.CircleGeometry(cloudRadius,vertexes),
                                new THREE.MeshBasicMaterial({
                                  color:'white',
                                  transparent: true,
                                  opacity: 0.3,
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
                                  opacity: 0.3,
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
                                  opacity: 0.3,
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
                                  opacity: 0.3,
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

AFRAME.registerComponent("audio-update", {
  pause: function() {
    
  },
  init: function()
  {
    this.peak = false;
    this.peakCount = -1;
  },
  tick: function(time, deltaTime) {
    if(startTime == 0)
      startTime = time;
    time -= startTime;
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
  }
});


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
    var scene = this.el.sceneEl;
    wireframize(el.object3D);
  }
});

AFRAME.registerComponent('toon', {
  schema: {
    thickness: {type: 'number', default: 0},
    changeMaterial: {type: 'boolean', default: false},
    deep: {type: 'boolean', default: true}
  },

  init: function () {
    var data = this.data;
    var el = this.el;  // Entity.
    var scene = this.el.sceneEl;
    toonize(el.object3D, data.thickness, data.changeMaterial);
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
      var scene = this.el.sceneEl;
      toonize(el.object3D, data.thickness, data.changeMaterial);
    });
  }
});

function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function outlineMaterial()
{
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000, 
        side:THREE.BackSide
    })

    material.onBeforeCompile = (shader) => {
        const token = '#include <begin_vertex>'
        //const customTransform = `vec3 transformed = position + objectNormal*0.03;`
        const customTransform = `vec3 transformed = position;`
        shader.vertexShader = shader.vertexShader.replace(token,customTransform)
    }
    return material;
}

function toonize(object, thickness=0, changeMaterial=true, deep=true)
{
    if( AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR() )
      return;
    const s = 1 + thickness;
    var outlines = new THREE.Group();
    if(deep)
    {
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
            outline.material = outlineMaterial();
            outline.name = "outline for "+node.name;
            outlines.add(outline);
          }
        }
      });
    } 
    else
    {
      if(changeMaterial)
      {
        let origColor = object.material.color;
        object.material = new THREE.MeshToonMaterial({gradientMap: gradientMaps.threeTone});
        object.material.color.set(origColor);//(0x2194ce);
      }
      if(thickness>0)
      {
        var outline = object.clone();
        outline.scale.set(s,s,s);
        outline.material = outlineMaterial();
        outline.name = "outline for "+object.name;
        outlines.add(outline);
      }
    }
    if(thickness>0)
      object.add(outlines);
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
  var textureLoader = new THREE.TextureLoader();
  var threeTone = textureLoader.load( 'https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FthreeTone.jpg?v=1588790683498' );
  threeTone.minFilter = THREE.NearestFilter;
  threeTone.magFilter = THREE.NearestFilter;

  var fiveTone = textureLoader.load( 'https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FfiveTone.jpg?v=1588790683738' );
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;

  return {
    none: null,
    threeTone: threeTone,
    fiveTone: fiveTone
  };

} )();


/////////////// From Three.js effects examples
/////////////// https://threejs.org/examples/#webgl_materials_variations_toon
/*
	var uniformsOutline = {
		outlineThickness: { value: THREE.defaultThickness },
		outlineColor: { value: new THREE.Color( 0x000000 ) },
		outlineAlpha: { value: THREE.defaultAlpha }
	};

	var vertexShader = [
		"#include <common>",
		"#include <uv_pars_vertex>",
		"#include <displacementmap_pars_vertex>",
		"#include <fog_pars_vertex>",
		"#include <morphtarget_pars_vertex>",
		"#include <skinning_pars_vertex>",
		"#include <logdepthbuf_pars_vertex>",
		"#include <clipping_planes_pars_vertex>",

		"uniform float outlineThickness;",

		"vec4 calculateOutline( vec4 pos, vec3 normal, vec4 skinned ) {",
		"	float thickness = outlineThickness;",
		"	const float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
		"	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + normal, 1.0 );",
		// NOTE: subtract pos2 from pos because BackSide objectNormal is negative
		"	vec4 norm = normalize( pos - pos2 );",
		"	return pos + norm * thickness * pos.w * ratio;",
		"}",

		"void main() {",

		"	#include <uv_vertex>",

		"	#include <beginnormal_vertex>",
		"	#include <morphnormal_vertex>",
		"	#include <skinbase_vertex>",
		"	#include <skinnormal_vertex>",

		"	#include <begin_vertex>",
		"	#include <morphtarget_vertex>",
		"	#include <skinning_vertex>",
		"	#include <displacementmap_vertex>",
		"	#include <project_vertex>",

		"	vec3 outlineNormal = - objectNormal;", // the outline material is always rendered with BackSide

		"	gl_Position = calculateOutline( gl_Position, outlineNormal, vec4( transformed, 1.0 ) );",

		"	#include <logdepthbuf_vertex>",
		"	#include <clipping_planes_vertex>",
		"	#include <fog_vertex>",

		"}",

	].join( "\n" );

	var fragmentShader = [

		"#include <common>",
		"#include <fog_pars_fragment>",
		"#include <logdepthbuf_pars_fragment>",
		"#include <clipping_planes_pars_fragment>",

		"uniform vec3 outlineColor;",
		"uniform float outlineAlpha;",

		"void main() {",

		"	#include <clipping_planes_fragment>",
		"	#include <logdepthbuf_fragment>",

		"	gl_FragColor = vec4( outlineColor, outlineAlpha );",

		"	#include <tonemapping_fragment>",
		"	#include <encodings_fragment>",
		"	#include <fog_fragment>",
		"	#include <premultiplied_alpha_fragment>",

		"}"

	].join( "\n" );

	function createMaterial() {

		return new THREE.ShaderMaterial( {
			type: 'OutlineEffect',
			uniforms: THREE.UniformsUtils.merge( [
				THREE.UniformsLib[ 'fog' ],
				THREE.UniformsLib[ 'displacementmap' ],
				uniformsOutline
			] ),
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide
		} );

	}
  
// Horrible function not working anyway:  
function cloudsSVG(scene)
{
  var loader = new THREE.SVGLoader();
  loader.load(
	// resource URL
	'https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FCloud1.svg?v=1589379677158',
	// called when the resource is loaded
    function ( data ) {
      var paths = data.paths;
      var group = new THREE.Group();
      var material = new THREE.MeshBasicMaterial( {
        color: 0xff0000,
        side: THREE.DoubleSide,
        depthWrite: false
      } );
      for ( var i = 0; i < paths.length; i ++ ) {
        var path = paths[ i ];
        var shapes = path.toShapes( true );
        for ( var j = 0; j < shapes.length; j ++ ) {
          var shape = shapes[ j ];
          var geometry = new THREE.ShapeBufferGeometry( shape );
          var mesh = new THREE.Mesh( geometry, material );
          group.add( mesh );
        }

      }
      group.position.x = 0;
      group.position.y = 0;
      group.position.z = 0;
      group.scale.set(100,100,100);
      group.name = "Cloud1";
      scene.add(group);
      console.log(group);

    },
    // called when loading is in progresses
    function ( xhr ) {

      console.log("Cloud " + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
	// called when loading has errors
    function ( error ) {

      console.log( 'An error happened' );

    }
  );
}
  
  */