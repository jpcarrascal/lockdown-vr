/* globals AFRAME, THREE */
window.addEventListener('load', function() {
  var start = document.querySelector('#start');
    start.addEventListener('click', function (e) {
        drums.source.start(ctx.currentTime);
        bass.source.start(ctx.currentTime);
        start.style.display = 'none';
    });
});


//https://www.html5rocks.com/en/tutorials/webaudio/positional_audio/

var drumsFileName =  "https://cdn.glitch.com/b1074378-45f1-4f58-8a5a-8fe9b3de8387%2FLockdown-drums.mp3?v=1586799345504";
var bassFileName =  "https://cdn.glitch.com/b1074378-45f1-4f58-8a5a-8fe9b3de8387%2FLockdown-bass%2Bharmony.mp3?v=1586799998107";

// Create a new audio context.
var ctx = new AudioContext();
var mainVolume = ctx.createGain();
mainVolume.connect(ctx.destination);


var drums = {};
var bass = {};
loadTrack(drumsFileName, drums);
loadTrack(bassFileName, bass);
//drums.panner.setPosition(1, 1.7, -4);
//bass.panner.setPosition(-1, 1.7, -4);

AFRAME.registerComponent('init-scene', {
  init: function () {
    var bassBall = document.querySelector('#bass');
    var drumBox = document.querySelector('#drums');

    var bassPos = bassBall.getAttribute('position');
    var drumPos = drumBox.getAttribute('position');

    drums.panner.setPosition(drumPos.x, drumPos.y, drumPos.z);
    bass.panner.setPosition(bassPos.x, bassPos.y, bassPos.z);
    var sceneEl = this.el;
  }
});




//drums.source.start(ctx.currentTime);
//bass.source.start(ctx.currentTime);


AFRAME.registerComponent("head-reader", {
  tick: function() {
        var pos = this.el.object3D.position;
        ctx.listener.setPosition(pos.x, pos.y, pos.z);
        var bassBall = document.querySelector('#bass');
        bassBall.setAttribute("radius",0.2-(2/analyze(bass.analyzer)));
        var drumBox = document.querySelector('#drums');
        drumBox.setAttribute("height",0.5+(2/analyze(drums.analyzer)));
        //var torus = document.querySelector('#torus');
        //console.log(toonProps);
        //torus.setAttribute("toon", {size: 0.5+(2/analyze(drums.analyzer))} ); //size: 0.5; color: blue; shape:torus
  }
});

AFRAME.registerComponent("sequencer", {
  schema: {
    night: {type: 'number', default: 0},
    eightAccum: {type: 'number', default: 0},
    seqPointer: {type: 'number', default: 0}
  },
  init: function () {
  },
  pause: function () {
    this.data.seqPointer = 0;
  },
  tick: function(time, timeDelta) {
    let bassDrum = document.querySelector('#bass-drum');
    let snareDrum = document.querySelector('#snare-drum');
    let HH = document.querySelector('#hh-top');
    this.data.eightAccum += timeDelta;

    if(bassDrum.object3D.scale.y=1.1)
      bassDrum.object3D.scale.y = 1.05;
    else
      bassDrum.object3D.scale.y = 1;
    
    if(bassDrum.object3D.scale.y=0.9)
      snareDrum.object3D.scale.y = 0.95;
    else
      snareDrum.object3D.scale.y = 1;
    
    if(HH.object3D.position.y = -0.01)
      HH.object3D.position.y = -0.005;
    else
      HH.object3D.position.y = 0;    
    
    if(this.data.eightAccum > 101.351) // time
    {
      //console.log("KD: " + KDSeq[this.data.seqPointer] + "\tSD:" + SDSeq[this.data.seqPointer] + "\tHH:" + HHSeq[this.data.seqPointer]);
      bassDrum.object3D.scale.y += KDSeq[this.data.seqPointer]/10;
      snareDrum.object3D.scale.y -= SDSeq[this.data.seqPointer]/10;
      HH.object3D.position.y -= HHSeq[this.data.seqPointer]*(1/100);
      this.data.eightAccum = 0;
      this.data.seqPointer++;
      if(this.data.seqPointer==8) this.data.seqPointer = 0;
    }
  }
});

var KDSeq  = [1,1,0,0, 1,1,0,0, 1,1,0,1, 1,1,0,0];
var KDSeq2 = [1,1,0,0, 0,0,0,0, 1,1,0,0, 0,0,0,0];
var SDSeq  = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
var HHSeq  = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];

function singleBuildingComplex()
{
  let scene = document.querySelector('a-scene').object3D;
  var floors = 20;
  var floorThick = 2;
  var floorHeight = 4;
  var height = ((floors-1) * 4)+floorThick;
  var x = -30;
  var y = worldFloor;
  var z = -100;
  var side = 30;
  var color = 0x666666;
  let building = new THREE.Object3D();
  for(var i=0;i<4;i++)
  {
    var mat = new THREE.MeshStandardMaterial( {color: color} );
    var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 2, height, 2 ), mat );
    mesh.position.set(i<2?(1/2*side):(-1/2*side), 1/2*height, i%2?(-1/2*side):(1/2*side));
    building.add(mesh);    
  }
  for(i=0;i<floors;i++)
  {
    var mat = new THREE.MeshStandardMaterial( {color: color} );
    var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( side, floorThick, side ), mat ); 
    mesh.position.set(0, i*floorHeight+floorThick/2, 0);
    building.add(mesh);
  }
  building.rotation.set(0, 0, 0);
  building.position.set(x, y, z);
  scene.add( building );
}

function loadTrack(soundFileName, sound) {

  sound.source = ctx.createBufferSource();
  sound.volume = ctx.createGain();
  sound.panner = ctx.createPanner();
  sound.analyzer = ctx.createAnalyser();
  sound.source.connect(sound.volume);
  sound.source.connect(sound.analyzer);
  sound.volume.connect(sound.panner);
  // Hook up the panner to the main volume.
  sound.panner.connect(mainVolume);
  
  //sound.volume.connect(mainVolume);
  sound.source.loop = true;

  // Load a sound file using an ArrayBuffer XMLHttpRequest.
  var request = new XMLHttpRequest();
  request.open("GET", soundFileName, true);
  request.responseType = "arraybuffer";
  request.onload = function(e) {
    // Create a buffer from the response ArrayBuffer.
    ctx.decodeAudioData(
      this.response,
      function onSuccess(buffer) {
        sound.buffer = buffer;
        // Make the sound source use the buffer and start playing it.
        sound.source.buffer = sound.buffer;
      },
      function onFailure() {
        alert("Decoding the audio buffer failed");
      }
    );
  };
  request.send();
}


function analyze(analyzer)
{
  analyzer.fftSize = 2048;
  const sampleBuffer = new Float32Array(analyzer.fftSize);
  analyzer.getFloatTimeDomainData(sampleBuffer);
  // Compute average power over the interval.
  let sumOfSquares = 0;
  for (let i = 0; i < sampleBuffer.length; i++) {
    sumOfSquares += sampleBuffer[i] ** 2;
  }
  const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
  return(avgPowerDecibels);
}

function randomCity()
{
  let scene = document.querySelector('a-scene').object3D;
  let maxBlocksPerSide = 8;
  let maxFloors = 0;
  for(var i=0;i<maxBlocksPerSide*2;i++)
  {
    //let x = Math.round((Math.random()-0.5)*5)*50;
    let x = (i-maxBlocksPerSide)*50;
    let zrandom = Math.random();
    let z = zrandom * (-100)-20;
    let floors = Math.round(Math.random() * (20*zrandom) +2);
    let width = Math.round(Math.random() * 20) + 20;
    let depth = Math.round(Math.random() * 20) + 20
    let b = new Building(x,worldFloor,z,floors,width, depth);
    if(i!=maxBlocksPerSide)
      city.add( b.building );
    if(floors > maxFloors)
      maxFloors = floors;
  }
    let a = new Building( -5,worldFloor,-45, 2 );
    city.add( a.building );
    a = new Building( 40,worldFloor,-45, Math.random()*3+2 );
    city.add( a.building );
    a = new Building( -45,worldFloor,-45, Math.random()*3+2 );
    city.add( a.building );
    city.userData = maxFloors;
    scene.add (city);
}

/////////////////////////




AFRAME.registerComponent('toon', {
  schema: {
    size: {type: 'number', default: 1},
    color: {type: 'color', default: '#0FF'},
    shape: {type: 'string', default: 'torus'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;  // Entity.
    switch (this.shape) {
      case 'box':
        this.geometry = new THREE.BoxBufferGeometry(data.size, data.size/3, data.size);
        break;
      case 'torus':
        this.geometry = new THREE.SphereBufferGeometry(data.size, 16, 16);
        break;
      default:
        this.geometry = new THREE.TorusKnotBufferGeometry(data.size, data.size/3, data.size);
    }
    
    this.object = new THREE.Mesh(
        this.geometry,
        new THREE.MeshToonMaterial({ //new THREE.MeshPhongMaterial({
            color: data.color,
            side: THREE.FrontSide
        })
    )
    
    this.outlineMaterial = new THREE.MeshLambertMaterial({
        color:'black', 
        side:THREE.BackSide 
    })
    this.outlineMaterial.onBeforeCompile = (shader) => {
        const token = '#include <begin_vertex>'
        //const customTransform = `vec3 transformed = position + objectNormal*0.03;`
        const customTransform = `vec3 transformed = position;`
        shader.vertexShader = shader.vertexShader.replace(token,customTransform)
    }
    
    this.outline = new THREE.Mesh(this.geometry, this.outlineMaterial);
    const s = 1.05
    this.outline.scale.set(s,s,s)
    this.obj = new THREE.Group();
    

    this.obj.add(this.object);
    this.obj.add(this.outline);
    
    el.setObject3D('mesh', this.obj);
  }
});


AFRAME.registerComponent('toon-outline', {
  schema: {
    thickness: {type: 'number', default: 0.2},
  },

  init: function () {
    var data = this.data;
    var el = this.el;  // Entity.
    var scene = this.el.sceneEl.object3D;
    var geometry = el.getObject3D('mesh').geometry;
    var matrix = el.matrix;
    
    var outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000, 
        side:THREE.BackSide
    })
    
    
    outlineMaterial.onBeforeCompile = (shader) => {
        const token = '#include <begin_vertex>'
        //const customTransform = `vec3 transformed = position + objectNormal*0.03;`
        const customTransform = `vec3 transformed = position;`
        shader.vertexShader = shader.vertexShader.replace(token,customTransform)
    }
    
    //geometry = new THREE.BoxBufferGeometry( 0.3, .3, 0.3 );
    var outline = new THREE.Mesh(geometry, outlineMaterial);
    const s = 4 + data.thickness
    outline.scale.set(s,s,s)
    var obj = new THREE.Group();
    
    outline = el.getObject3D('mesh').clone();
    outline.scale.set(s,s,s);
    outline.material = outlineMaterial;
    
    //obj.add(el.getObject3D('mesh').clone());
    //obj.add(outline);
    
    
    //scene.add(obj); //works
    //el.setObject3D('mesh', obj); //works, loses attributes
    el.getObject3D('mesh').add(outline);
    console.log("SUCCESS??")
  }
});
