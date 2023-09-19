import * as THREE from 'three';
//import { DbReader } from "../js/avLib/dbSetup"
import { DbReader, dbParser, createDoc } from '../js/avLib/dbSetup2'; 
import { VideoSetup, GLTFLd, Feedback, UnrealBloom } from "../js/avLib/videoSetup"
import { HydraTex } from '../js/avLib/hydraSetup' // en deep se perdió esta referencia. HydraTex podría ser sustituído en el futuro por un generador de shaders
import { AudioSetup, Analyser, Player2, UploadFile, Load } from '../js/avLib/audioSetup'
import { ImprovedNoise } from '../static/jsm/math/ImprovedNoise.js';
import { EditorParser } from '../js/avLib/editorParser'
// import { twCamera } from './js/avLib/controlSetup.js' 
import * as TWEEN from 'tween'; 
import { FontLoader } from '../static/jsm/loaders/FontLoader.js';
import { Player } from '../js/avLib/Player.js'; 
import { map_range } from '../js/avLib/utils.js';
// import { printTHesis } from './print.js'; 
///////////////////////////////////////////////////


const mouse = [.5, .5]
const audioFile1 = document.getElementById('audio_file1') // onload que lo decodifique 

let a = new AudioSetup(); 
let th = new VideoSetup(); 
const hy = new HydraTex();
const db = new DbReader();
db.read("./sql/document.db");

let cosa;
let boolCosa; 

// let twC; 
let tween;
let tweenBool = false; 
//const avButton = avButton.addEventListener('click', renderAV);

let interStr = ''; 

function renderAV(){
    // la versión render av no debería desplegar code Mirror 
    console.log("render AV"); 
}

document.getElementById("container").onclick = change;

//const pdfButton = document.getElementById('pdf');
//pdfButton.addEventListener('click', printPDF );

// extras intervención oci

const meshes = [],materials = [],xgrid = 1, ygrid = 4;
let material, mesh;
let an; 

function printPDF(){

    const dbp = new dbParser(db.postdb);
    const cdoc = new createDoc(dbp.db); 
    // console.log(db.postdb); 

    // la opción print pdf debería también desplegar los renders pero no dibujarlos en el navegador. 

    //db.prepare(db.postdb); 
    // db.print(db.result2);
    
    
    // Hay un problema al seleccionar el texto a imprimir y la impresión. Tal vez es necesario relacionar el análisis del texto con la lectura y no tanto con el método de impresión. 
    // Parece ser que aquí necesitaremos expresiones regulares para hacer cosas como limpiar la base o separar cada cierto número de caracteres y agregar nuevas hojas.
    // También hace falta diseñar la base de datos desde trilium y subir esto para que pueda trabajar directamente con la base del servidor. 

}

const clock = new THREE.Clock();

//const fixButton = document.getElementById('edit');
//fixButton.addEventListener('click', init);

let cubos = [];
let geometry; 
// const geometry = new THREE.SphereGeometry(2, 3, 4 );
//const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: hy.vit } );
let pX = [], pY = [], pZ = []; 

let sphere; 
let raycaster;
let INTERSECTED;
const pointer = new THREE.Vector2();
 
let menuC1str = ['regresar', '+ info', 'visualizar', 'imprimir']; 
const group = new THREE.Group();

var cursorX;
var cursorY;

init(); // los elementos particulares de este init podrían ir en otro lado. En todo caso podría delimitar la escena que antes se detonaba con esta función.     
function init(){

    a.initAudio();

    /*
    audioFile1.addEventListener("change", (event) => {
	const archivo = new LoadFile(a.audioCtx, audioFile1);
	});
    */

    // console.log(a.audioCtx); 
    raycaster = new THREE.Raycaster();
    document.addEventListener( 'mousemove', onPointerMove );
    
    // document.body.style.cursor = 'none';
    th.initVideo();
    th.camera.position.z = 200; 

    const light = new THREE.PointLight(  0xffffff, 1 );
    light.position.set( 0, 0, 500 );
    th.scene.add( light );

    th.renderer2.outputColorSpace = THREE.LinearSRGBColorSpace;
    th.renderer2.toneMapping = THREE.ReinhardToneMapping;
    th.renderer2.toneMappingExposure = Math.pow( 0.6, 1.5 )
    
    un = new UnrealBloom(th.scene, th.camera, th.renderer2); 
    // retro = new Feedback(th.scene, th.renderer2, 1080);
    const geometry44 = new THREE.BoxGeometry( 100, 100, 100 ); 
    const material44 = new THREE.MeshStandardMaterial( { color: 0xffffff, map:hy.vit, roughness: 0.6 } ); 
    sphere44 = new THREE.Mesh( geometry44, material44 );

    sphere44.userdata = {id:'iniciar'};
    console.log(sphere44.userdata.id); 
    th.scene.add( sphere44 );
    // sphere44.position.z = -20; 

    document.onmousemove = function(e){
	cursorX = e.pageX;
	cursorY = e.pageY;
    }

    osc(2, ()=>cursorX*0.001, 1 ).color(1.75, 0.5, 1.97).rotate(1, 0.1, 0.5).modulateScrollX(o0, 1.001).out(o0);

    container = document.getElementById( 'container' );
    container.appendChild(th.renderer2.domElement);
 
    cubeCount = 0;

    let ox, oy, geometryTex;

    const ux = 1 / xgrid;
    const uy = 1 / ygrid;

    const xsize = 1000 / xgrid;
    const ysize = 1000 / ygrid;
    
    for(let i = 0; i < menuC1str.length; i++){
	
	const geometry = new THREE.BoxGeometry( 7, 2, 0.1); 
	change_uvs( geometry, ux, uy, 0, i);
	materials[i] = new THREE.MeshStandardMaterial({color:0xffffff,map:hy.vit, roughness:0.7});
	//const material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
	material2 = materials[i]; 
	cubos[i] = new THREE.Mesh( geometry, material2 );    

	/*
	var posX, posY, posZ;
	var theta1 = Math.random() * (Math.PI*2);
	var theta2 = Math.random() * (Math.PI*2); 
	posX = Math.cos(theta1) * Math.cos(theta2)*1;
	posY = Math.sin(theta1)*1;
	posZ = Math.cos(theta1) * Math.sin(theta2)*1;
	pX[i] = posX;
	pY[i] = posY;
	pZ[i] = posZ;
	*/
	
	cubos[i].position.y = ((i+1) *2)-5.5; 
	//cubos[i].position.y = pY[i] * 2;
	//cubos[i].position.z = pZ[i] * 2;
	//th.scene.add(cubos[i]);
	cubos[i].userdata = {id: menuC1str[i]}; 
	// group.add(cubos[i]);
	th.scene.add(cubos[i]); 
	
    }

    // texto(); 
    // twC = new twCamera(th.camera); 
    animate(); 
    
}

function onPointerMove( event ) {
    
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
}

function animate(){ 

    th.camera.updateMatrixWorld();

    if(boolCosa){
	// la función map aquí no funciona jaja
	// parece que no funciona dinámicamente, solo una vez, al inicio. 
	cosa.pointer = cursorX / 10;
	cosa.freqScale =  (cursorY/200)-2.2; 
	// cosa.freqScale = map_range(cursorY, 0, 1080, 0.5, 4);
	// console.log((cursorY/200)-2.2); 
    }    

    //let interStr = ''; 
    // find intersections

    var time2 = Date.now() * 0.0005;
    raycaster.setFromCamera( pointer, th.camera );
    const intersects = raycaster.intersectObjects( th.scene.children, true );

    if ( intersects.length > 0 ) {
	if ( INTERSECTED != intersects[ 0 ].object ) { // si INTERSECTED es tal objeto entonces realiza tal cosa

	    // console.log(intersects[ 0 ].object.userdata); 

	    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	    
	    INTERSECTED = intersects[ 0 ].object;
	    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
	    INTERSECTED.material.emissive.setHex( 0xffffff );
	    /// primer nivel 
	    document.getElementById("container").style.cursor = "pointer";
	    interStr = INTERSECTED.userdata.id;
	    // console.log(interStr);
	    document.getElementById("instrucciones").innerHTML = interStr;
	}
	
    } else {
	
	if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	
	INTERSECTED = null;
	document.getElementById("container").style.cursor = "default";
	interStr = '';
	document.getElementById("instrucciones").innerHTML = "";
    }

    TWEEN.update();
   
    hy.vit.needsUpdate = true; 
    const delta = clock.getDelta();
    requestAnimationFrame( animate );

    /*
    sphere44.rotation.x += 0.0001  
    sphere44.rotation.y += 0.0002; 
    sphere44.rotation.z -= 0.0001; 
    */
    
    th.renderer2.render( th.scene, th.camera );
    un.render2(delta);}
    

function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

    const uvs = geometry.attributes.uv.array;

    for ( let i = 0; i < uvs.length; i += 2 ) {

	uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
	uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;
	
    }
    
}

// ¿Esto también podría ir a otra parte?

function change(){
    
    if(interStr == 'imprimir'){
	printPDF(); 
    }
 
    if(interStr == 'iniciar'){

	// cargar un archivo, poner un loader o algo así
	// pasar el reloj al smpl sin que se pierda la secuencia y el audioctx 
	//const smpl = new Player(a.audioCtx, audioFile1); // tercer parámetro de reloj y que internamente decida o de plano enviar todo al control	
	// smpl.sequence([1, 0, 0, 1, 0]); // es el reloj
	// let algo = new UploadFile(a.audioCtx, audioFile1);

	//let otro = new Load(a.audioCtx, 'snd/cello.mp3');
	//console.log(otro.buffer); 
	
	// let pl2 = new Player2(a.audioCtx);
	
	//pl2.play();
	
	const coords = {x: th.camera.position.x,
			y: th.camera.position.y,
			z: th.camera.position.z} // Start at (0, 0)

	tween = new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
	    .to({x: 0, y: 0, z: 10}, 2000) // Move to (300, 200) in 1 second.
	    .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
	    .onUpdate(() => {
		th.camera.position.z=coords.z;
		// console.log(coords); 
	    })  
	    .onStart(() => {
	// 	th.camera.remove(sphere44); 
		// Pienso que onComplete está bien para eliminar objetos no utilizados
		// Podría reproducir algún sonido 
		document.getElementById("info").innerHTML = ""; // cuando tween termine 
	    })
	    .onComplete(() => {

/*
		// parece que solamente puede funcionar un Player por vez
		let buffer = 0; 
		let reader = new FileReader();    
		reader.onload = function (ev) {
		    a.audioCtx.decodeAudioData(ev.target.result).then(function (buffer2) {
			buffer = buffer2;
			boolCosa = true; 
			cosa = new Player2(a.audioCtx);
			//buffer, pointer, freqScale, windowSize, overlaps, windowratio/
			cosa.set(buffer, Math.random(), 2, 1.5, 0.1, 0.6);
			cosa.start();
		    })
		}
		reader.readAsArrayBuffer(audioFile1.files[0]);
		})
*/
		const request = new XMLHttpRequest();
		request.open('GET', 'snd/cello.mp3', true);
		request.responseType = 'arraybuffer';
		self.buffer = 0; 
		// console.log(this.request.response); 
		
		request.onload = function() {
		    let audioData = request.response;
		    // console.log(audioData); 
		    a.audioCtx.decodeAudioData(audioData, function(buffer) {
			// buffer = buffer2;
			boolCosa = true; 
			cosa = new Player2(a.audioCtx);
			//buffer, pointer, freqScale, windowSize, overlaps, windowratio/
			cosa.set(buffer, Math.random(), 2, 1.5, 0.1, 0.6);
			cosa.start();
		    },
						  function(e){"Error with decoding audio data" + e.error});
	
    }
    
	    	request.send();
	    })

	
	//trambién hay onComplete
	    .start() // Start the tween immediately. No poner alguna propiedad, supongo que sustituye el tiempo de inicio y llegada. 
    }
        
    if(interStr == 'regresar'){
	
	const coords = {x: th.camera.position.x,
			y: th.camera.position.y,
			z: th.camera.position.z} // Start at (0, 0) 

	tween = new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
	    .to({x: 0, y: 0, z: 200}, 2000) // Move to (300, 200) in 1 second.
	    .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
	    .onUpdate(() => {
		th.camera.position.z=coords.z;
	    })  
	    .onStart(() => {
	// 	th.camera.remove(sphere44); 
		// Pienso que onComplete está bien para eliminar objetos no utilizados
		// Podría reproducir algún sonido 
		document.getElementById("info").innerHTML = 'portada'; // cuando tween termine 
	    })
	//trambién hay onComplete
	    .start() // Start the tween immediately.
    }
}

// algún día retomar los cubos

/*
function initCubes(){

    document.body.style.cursor = 'none'; 

    const par = new EditorParser();     
    
    //const overlay = document.getElementById( 'overlay' );
    //overlay.remove();
    
    //const blocker = document.getElementById( 'blocker' );
    //const instructions = document.getElementById( 'instructions' );
    //instructions.remove(); 
    //blocker.remove();

    th.renderer2.outputColorSpace = THREE.LinearSRGBColorSpace;
    th.renderer2.toneMapping = THREE.ReinhardToneMapping;
    //th.renderer2.toneMappingExposure = Math.pow( 0.6, 1.5 )
    
    un = new UnrealBloom(th.scene, th.camera, th.renderer2); 
    retro = new Feedback(th.scene, th.renderer2, 1080); 
     
    var cursorX;
    var cursorY;
    document.onmousemove = function(e){
	cursorX = e.pageX;
	cursorY = e.pageY;
    }

    osc(4, ()=>cursorX*0.0001, 0 ).color(0.6, 0.6, 0.6).rotate(1, 0.3, 0.5).modulateScrollX(o0, 1.001).out(o0);

    let ox, oy, geometryTex;

    const ux = 1 / xgrid;
    const uy = 1 / ygrid;

    const xsize = 1000 / xgrid;
    const ysize = 1000 / ygrid;

    const parameters = { color: 0xffffff, map: hy.vit };

    a.initAudio(); 
    an = new Analyser(a.audioCtx);
    an.initAnalyser(128, 0.95);    

    cubeCount = 0;
    
    // podrían tener un orden inicial y luego descomponerse 

    // malla de 2x2 ¿Podría ser de otra manera?
    
    for(let i = 0; i < xgrid; i++){
	for (let j = 0; j < ygrid; j++){
	    
	    // geometry = new THREE.SphereGeometry(4, 3, 4 );
	    const geometry = new THREE.BoxGeometry(8, 4, 2); 
	    change_uvs( geometry, ux, uy, i, j );

	    materials[ cubeCount] = new THREE.MeshStandardMaterial( { color: 0xffffff, map: hy.vit, roughness: 0.8, metalness:0.1 } );
	    // materials[ cubeCount ] = new THREE.MeshLambertMaterial( parameters );
	    material2 = materials[ cubeCount ];
	    
	    cubos[cubeCount] = new THREE.Mesh( geometry, material2 );
	    
	    var posX, posY, posZ;
	    var theta1 = Math.random() * (Math.PI*2);
	    var theta2 = Math.random() * (Math.PI*2); 
	    posX = Math.cos(theta1) * Math.cos(theta2)*1;
	    posY = Math.sin(theta1)*1;
	    posZ = Math.cos(theta1) * Math.sin(theta2)*1;
	    pX[cubeCount] = posX;
	    pY[cubeCount] = posY;
	    pZ[cubeCount] = posZ; 
	    cubos[cubeCount].position.x = pX[cubeCount] * 1 ; 
	    cubos[cubeCount].position.y = pY[cubeCount] * 1;
	    cubos[cubeCount].position.z = pZ[cubeCount] *  1;
	    cubos[cubeCount].rotation.x = Math.random() * 360; 
	    cubos[cubeCount].rotation.y = Math.random() * 360; 
	    cubos[cubeCount].rotation.z = Math.random() * 360; 
	    th.scene.add( cubos[cubeCount] );
	    cubeCount++; 
	}
    }
	
    container = document.getElementById( 'container' );
    container.appendChild(th.renderer2.domElement);
    
    animate();
    // stein(20); 
    
}
*/ 