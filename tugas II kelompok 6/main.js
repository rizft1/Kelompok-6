// import three.module.js
import * as THREE from 'https://cdn.skypack.dev/three@0.133.1';
import {OrbitControls} from '../JS/OrbitControls.js';

var scene;
var camera;
var renderer;
var clock;
var holder;
var intersects;
var level = 1;
var totalLevels = 5;
var score = 0;
var totalTargets = 3;
var speed = 0.01;
var complete = false;
var comments = ["LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4", "LEVEL 5"];
var myLevel = document.getElementById("level");
var myScore = document.getElementById("score");
var myPause = document.getElementById("pause");
var paused = false;
var req;
var controls;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function myScene () {
	scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
	camera.position.z = 30;

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setSize( width, height );
	document.getElementById("webgl-container").appendChild(renderer.domElement);
	clock = new THREE.Clock();
	controls = new OrbitControls(camera, renderer.domElement);
	
	var sLight = new THREE.SpotLight( 0xffffff );
	sLight.position.set( -100, 100, 100 );
	scene.add( sLight );

	var aLight = new THREE.AmbientLight( 0xffffff );
	scene.add( aLight );		
}

function addHolder () {
	holder = new THREE.Object3D();

	for (var i = 0; i < totalTargets; i++) {
		var ranCol = new THREE.Color();
		ranCol.setRGB( Math.random(), Math.random(), Math.random() );

		var geometry = new THREE.BoxGeometry(2,2,2);
		var material = new THREE.MeshPhongMaterial( {color: ranCol, ambient: ranCol } );

		var cube = new THREE.Mesh(geometry, material);
		cube.position.x = i + 6;

		var spinner = new THREE.Object3D();
		spinner.rotation.x = Math.PI * i * 4.5;

		spinner.add(cube);
		holder.add(spinner);
	};
	scene.add(holder);
}

function animate() {
	if (!paused) {
		myPause.innerHTML = "";
		render();
		
	} else {
		myPause.innerHTML = "<strong>PAUSE</strong>";
	}

	controls.update();
	req = requestAnimationFrame( animate );
	
}

function render () {

	holder.children.forEach(function (elem, index, array) {
		elem.rotation.y += (speed * (totalTargets - index));
		elem.children[0].rotation.x += 0.01;
		elem.children[0].rotation.y += 0.01;
	});
	
	renderer.render(scene, camera);
}

document.getElementById("webgl-container").addEventListener('mousedown', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {
	event.preventDefault();
	
	if (complete) {
		complete = false;
		score = 0;
		restartScene();
		return;
	}
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );
	
	if (score < totalTargets) {
		holder.children.forEach(function (elem, index, array) {
			intersects = raycaster.intersectObjects( elem.children );
			if (intersects.length > 0 && intersects[0].object.visible && !paused) {
				intersects[0].object.visible = false;
				
				score += 1;
				
				if (score < totalTargets) {
					myScore.innerHTML = "<span class='hit'>HIT!</span> Score: " + score + "/" + totalTargets;
				} else {
					complete = true;
					
					if (level < totalLevels) {
						myScore.innerHTML = "<strong>LEVEL CLEAR</strong> CLICK THE SCREEN FOR NEXT LEVEL.";
					} else {
						myScore.innerHTML = "<strong>YOU WIN</strong> Click the screen to play again.";
					}
				};
			}
		});
	}
}

function onKeyDown(event)
{
	if (event.keyCode == 32)
	{
		paused = !paused;
	}
}

document.addEventListener("keydown", onKeyDown);

function restartScene () {
	myScore.innerHTML = "";
	
	if (level < totalLevels) {
		speed += 0.005;
		totalTargets += 1;
		level += 1;
	} else {
		speed = 0.01;
		totalTargets = 3;
		level = 1;
	}

	myLevel.innerText = comments[level-1];
	scene.remove(holder);
	addHolder();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

window.onload = function() {
	myLevel.innerText = comments[level-1];
	myScene();
	addHolder();
	animate();

	window.addEventListener( 'resize', onWindowResize, false );
};