let pagestate = "en";

const addQueryParam = (key, value) => {
	const url = new URL(window.location.href);
	url.searchParams.set(key, value);
	window.history.pushState({}, '', url.toString());
};

function switchTo(lang) {
	let alltexts = document.querySelectorAll(".g-version");
	for (let i = 0; i < alltexts.length; i++) {
		alltexts[i].classList.remove("g-show");
	}
	let versiontexts = document.querySelectorAll("." + lang);
	for (let i = 0; i < versiontexts.length; i++) {
		versiontexts[i].classList.add("g-show");
	}
    pagestate = lang;
    addQueryParam("v", lang)
}

const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('v');

if (lang && lang != pagestate) {
    switchTo(lang);
}

document.querySelector(".g-read.g-cn").addEventListener("click", function(){
    switchTo("cn")
})

document.querySelector(".g-read.g-en").addEventListener("click", function(){
    switchTo("en")
})

import * as THREE from './three-155-min.js';
import { OrbitControls } from './orbit-controls.js';

export const mainScript = {
	_init: function (props, data) {
		// settings
		let assetHeight = window.innerWidth < 600 ? 23000 : 20000, 
		isMobile = window.innerWidth < 460,
		scrollPct = 0, 
		containerCanvas = null, 
		labelscont = document.querySelector('.g-3d-labels-cont'), 
		container = document.querySelector('.g-asset-container'), 
		scrollStart = 0.0, 
		scrollEnd = 1.0, 
		frameLength = 750, 
		debug = false, 
		scene = null, 
		camera = null, 
		renderer = null, 
		now = null, 
		controls = null, 
		then = Date.now(), 
		fpsInterval = 1000 / 60, 
		scrollPctAdj = 0, 
		lerpDivider = 12, 
		frameCurr = 0, 
		frameSegIndex = 0, 
		useOrbit = window.location.href.indexOf('orbit') > -1, 
		throttleResize = false,
		addAxes = false,
		myreq = null,
		inkLoader = new THREE.TextureLoader(),
		inkBlack = null,
		worldWidth = 2500,
		worldDepth = 1400,
		options = { backgroundColor: 0x000000 },
		desktopCameraPos = [
			{ id: 0, frame: 0,    pos: { x: 0, y: 1600, z: 1800, ease: 'easeOut' } },
			{ id: 1, frame: 50,   pos: { x: 0, y: 1725, z: 1200, ease: 'easeOut' } },
			{ id: 2, frame: 90,   pos: { x: 0, y: 1725, z: 1200, ease: 'easeOut' } },
			{ id: 3, frame: 140,  pos: { x: 700, y: 1300, z: 500, ease: 'easeOut' } },
			{ id: 4, frame: 220,  pos: { x: 700, y: 1300, z: 500, ease: 'easeOut' } },
			{ id: 5, frame: 300,  pos: { x: 500, y: 1300, z: 500, ease: 'easeOut' } },
			{ id: 6, frame: 350,  pos: { x: 200, y: 1100, z: 500, ease: 'easeOut' } },
			{ id: 7, frame: 430,  pos: { x: 100, y: 1100, z: 500, ease: 'easeOut' } },
			{ id: 7, frame: 550,  pos: { x: 0, y: 1100, z: 500, ease: 'easeOut' } },
			{ id: 8, frame: 630,  pos: { x: -400, y: 1100, z: 500, ease: 'easeOut' } },
			{ id: 9, frame: 740,  pos: { x: -400, y: 1100, z: 500, ease: 'easeOut' } },
			{ id: 10, frame: 750, pos: { x: 0, y: 1725, z: 1200, ease: 'easeOut' } },
		], desktopcameraAimPos = [
			{ id: 0, frame: 0,    pos: { x: 0, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 1, frame: 70,   pos: { x: 20, y: 0, z: 0, ease: 'easeOut' } },
			{ id: 2, frame: 90,   pos: { x: 20, y: 0, z: 0, ease: 'easeOut' } },
			{ id: 3, frame: 140	,  pos: { x: 800, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 4, frame: 220,  pos: { x: 700, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 5, frame: 300,  pos: { x: 500, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 6, frame: 350,  pos: { x: 200, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 7, frame: 430,  pos: { x: 100, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 7, frame: 550,  pos: { x: -100, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 8, frame: 630,  pos: { x: -400, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 9, frame: 740,  pos: { x: -300, y: 150, z: 0, ease: 'easeOut' } },
			{ id: 10, frame: 750, pos: { x: 20, y: 0, z: 0, ease: 'easeOut' } },
		];

		let mobileCameraPos = [
			{ id: 0, frame: 0,    pos: { x: 0, y: 3000, z: 2500, ease: 'easeOut' } },
			{ id: 1, frame: 50,   pos: { x: 100, y: 5800, z: 1000, ease: 'easeOut' } },
			{ id: 2, frame: 90,   pos: { x: 100, y: 5800, z: 1000, ease: 'easeOut' } },
			{ id: 3, frame: 140,   pos: { x: 900, y: 1000, z: 800, ease: 'easeOut' } },
			{ id: 3.5, frame: 260,   pos: { x: 650, y: 1800, z: 800, ease: 'easeOut' } },
			{ id: 4, frame: 305,   pos: { x: 650, y: 2000, z: 800, ease: 'easeOut' } },
			{ id: 5, frame: 320,   pos: { x: 200, y: 2000, z: 800, ease: 'easeOut' } },
			{ id: 6, frame: 380,   pos: { x: 100, y: 2000, z: 800, ease: 'easeOut' } },
			{ id: 7, frame: 500,   pos: { x: -50, y: 1500, z: 800, ease: 'easeOut' } },
			{ id: 8, frame: 630,   pos: { x: -350, y: 2000, z: 800, ease: 'easeOut' } },
			{ id: 9, frame: 700,   pos: { x: -400, y: 2000, z: 800, ease: 'easeOut' } },
			{ id: 10, frame: 750,  pos: { x: 150, y: 5800, z: 1000, ease: 'easeOut' } },
		], mobileCameraAimPos = [
			{ id: 0, frame: 0,    pos: { x: 0, y: 600, z: 0, ease: 'easeOut' } },
			{ id: 1, frame: 70,   pos: { x: 100, y: 0, z: 500, ease: 'easeOut' } },
			{ id: 2, frame: 90,   pos: { x: 100, y: 0, z: 500, ease: 'easeOut' } },
			{ id: 3, frame: 140,  pos: { x: 900, y: 200, z: 0, ease: 'easeOut' } },
			{ id: 3.5, frame: 260,  pos: { x: 650, y: 200, z: 0, ease: 'easeOut' } },
			{ id: 4, frame: 305,  pos: { x: 650, y: 200, z: 0, ease: 'easeOut' } },
			{ id: 5, frame: 320,  pos: { x: 200, y: 250, z: 0, ease: 'easeOut' } },
			{ id: 6, frame: 380,  pos: { x: 100, y: 0, z: 0, ease: 'easeOut' } },
			{ id: 7, frame: 500,  pos: {  x: -50, y: 300, z: 0, ease: 'easeOut' } },
			{ id: 8, frame: 630,  pos: { x: -350, y: 300, z: 0, ease: 'easeOut' } },
			{ id: 9, frame: 700,  pos: { x: -400, y: 300, z: 0, ease: 'easeOut' } },
			{ id: 10, frame: 740, pos: { x: 100, y: 600, z: 0, ease: 'easeOut' } },
		];

		let cameraPos = window.innerWidth > 600 ? desktopCameraPos : mobileCameraPos;
		let cameraAimPos = window.innerWidth > 600 ? desktopcameraAimPos : mobileCameraAimPos;
				
		let whatwhereDesktop = [
			{ totalFrames: 1968, sections: "path",  frames: [-1, 120] },
			{ totalFrames: 235,  sections: "1",     frames: [120, 220] },
			{ totalFrames: 796,  sections: "2-4",	frames: [220,  310] },
			{ totalFrames: 253,  sections: "5",		frames: [310,  430] },
			{ totalFrames: 450,  sections: "6-8",  	frames: [430,  620] },
			{ totalFrames: 469,  sections: "9-10", 	frames: [620,  740] },
			{ totalFrames: 1968,  sections: "path", 	frames: [740,  750] },
		]

		let whatwhereMobile = [
			{ totalFrames: 1968, sections: "path",  frames: [-1, 110] },
			{ totalFrames: 235,  sections: "1",     frames: [130, 240] },
			{ totalFrames: 796,  sections: "2-4",	frames: [240,  330] },
			{ totalFrames: 253,  sections: "5",		frames: [330,  450] },
			{ totalFrames: 450,  sections: "6-8",  	frames: [450,  620] },
			{ totalFrames: 469,  sections: "9-10", 	frames: [620,  700] },
			{ totalFrames: 1968,  sections: "path", 	frames: [700,  750] },
		]

		let whatwhere = isMobile ? whatwhereMobile : whatwhereDesktop;

		let labels = [
			{
				"top_calc": 0.55,
				"left_calc": isMobile ? 0.605 : 0.618,
				"text": "Kowloon\rPeak",
				"text_cn": "飛鵝山",
				type: "mt",
				frames: [[700,750]]
			},
			{
				"top_calc": 0.55,
				"left_calc": isMobile ? 0.62 : 0.63,
				"text": "Kowloon\rPeak",
				"text_cn": "飛鵝山",
				type: "mt",
				frames: isMobile ? [[330, 430]] : [[310, 430]],
			},
			{
				"top_calc": isMobile ? 0.54 : 0.535,
				"left_calc": 0.561,
				"text": "Lion\rRock",
				"text_cn": "獅子山",
				frames: isMobile ? [[-1,110],[330, 430]] : [[-1,110],[310, 430]],
				type: "mt"
			},
			{
				"top_calc": 0.73,
				"left_calc": 0.55,
				"text": "Hong Kong\rIsland",
				"text_cn": "香港島",
				type: "small"
			},
			{
				"top_calc": isMobile ? 0.505 : 0.38,
				"left_calc": isMobile ? 0.79 : 0.84,
				"text": "Sai\rKung",
				"text_cn": "西貢",
				frames: [[-1,110],[700,750]]
			},
			{
				"top_calc": isMobile ? 0.40 : 0.38,
				"left_calc": isMobile ? 0.84 : 0.84,
				"text": "Sai\rKung",
				"text_cn": "西貢",
				frames: [[110,200]]
			},
			{
				"top_calc": 0.29,
				"left_calc": 0.765,
				"text": "Ma On\rShan",
				"text_cn": "馬鞍山",
				frames: isMobile ? [[240,330]] : [[240,310]],
				type: "mt",
				align: "bottom"
			},
			{
				"top_calc": isMobile ? 0.41 : 0.40,
				"left_calc": isMobile ? 0.452 : 0.466,
				"text": "Tai Mo\rShan",
				"text_cn": "大帽山",
				frames: [[-1,110],[700,750]],
				type: "mt"
			},
			{
				"top_calc": 0.395,
				"left_calc": 0.467,
				"text": "Tai Mo\rShan",
				"text_cn": "大帽山",
				frames: isMobile ? [[450,500]] : [[430,500]],
				type: "mt"
			},
			{
				"top_calc": 0.40,
				"left_calc": 0.21,
				"text": "Tuen\rMun",
				"text_cn": "屯門",
				frames: [[200, 730]]
			},
			{
				"top_calc": 0.40,
				"left_calc": isMobile ? 0.175 : 0.2,
				"text": "Tuen\rMun",
				"text_cn": "屯門",
				frames: [[-1,200],[730,750]]
			},
			{
				"top_calc": 0.73,
				"left_calc": 0.18,
				"text": "Lantau\rIsland",
				"text_cn": "大嶼山",
				type: "small"
			},
			{
				"top_calc": isMobile ? 0.20 : 0.22,
				"left_calc": 0.45,
				"text": "MacLeHose Trail\r100 kilometers",
				"text_cn": "麥理浩徑\r100公里",
				"type": "big",
				frames: [[-1,110],[730,750]]
			}
		]


		// const wall = {"note":[{"height":worldDepth,"width":worldWidth,"rotation":0,"center":[0,0],"distance": 1000, "level": 1,"name": "influence","color":"green"}]}
		// let sectionIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		// let frames = [1353, 85, 122, 77, 108, 97, 35, 59, 80, 52, 128];
		// const sections = [];
		// sectionIds.forEach(function (section) {
		// 	sections.push({ section: section });
		// });

		if (isMobile) {
			let textConts = document.querySelectorAll('.g-text-cont');
			for (var i = 0; i < textConts.length; i++) {
				let el = textConts[i];
				let mobileFrame = el.getAttribute("data-mobile-frame");
				if (mobileFrame) {
					el.style.top = mobileFrame/750*100 + "%";

				}
			}
		}

		const trail = {};

		let frames = {
			"all": 2000,
			// "1": 
		}

		labelscont.innerHTML = '';

		const addDebugElems = () => {
			for (let i = 0; i < 1.005; i += 0.005) {
				let debugTick = document.createElement('div'), tickRange = scrollEnd - scrollStart, tickPct = (i - scrollStart) / tickRange, viewHeight = window.innerHeight, halfHeight = viewHeight / 2;

				debugTick.className = 'g-asset-debug-pct';
				debugTick.style.top = halfHeight + (assetHeight - viewHeight) * i + 'px';

				if (i < scrollStart || i - 0.005 > scrollEnd) {
					let percent = i < scrollStart ? 0 : frameLength;
					debugTick.innerHTML = percent.toFixed(1) + '&nbsp;';
					debugTick.classList.add('g-asset-debug-pct-soft');
				} else {
					debugTick.innerHTML = (tickPct * frameLength).toFixed(1) + '&nbsp;';
				}
				container.appendChild(debugTick);
			}
		};

		const valueTween = (sPos, ePos, time, dur, ease) => {
			let change = ePos - sPos, locTime = time;

			if (!dur || dur === 1 || time === dur) return ePos;

			switch (ease) {
				case 'linear':
					return sPos + change * (time / dur);
				case 'easeIn':
					return change * (locTime /= dur) * locTime * locTime + sPos;
				case 'easeOut':
					return change * ((locTime = time / dur - 1) * locTime * locTime + 1) + sPos;
				case 'easeInOut':
					if ((locTime /= dur / 2) < 1) return (change / 2) * locTime * locTime * locTime + sPos;
					return (change / 2) * ((locTime -= 2) * locTime * locTime + 2) + sPos;
				default:
					return sPos + change * (time / dur);
			}
		};

		const onPageScroll = () => {
			const scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

			let assetHeight = container.offsetHeight, containerTop = container.offsetTop, containerBottom = containerTop + container.offsetHeight, containerStart = containerTop, containerEnd = containerBottom - containerCanvas.offsetHeight;

			let startStopLength = scrollStart + (1 - scrollEnd), startHeight = assetHeight * scrollStart, startStopHeight = assetHeight * startStopLength;

			scrollPct =
				(scrollTop - containerStart - startHeight) /
				(containerEnd - containerStart - startStopHeight);
			scrollPct = scrollPct < 0 ? 0 : scrollPct > 1 ? 1 : scrollPct;

			// console.log(scrollPct)
		};

		const onWindowResize = () => {
			if (!throttleResize) {
				const width = window.innerWidth;
				const height = window.innerHeight;

				renderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				setTimeout(function () {
					throttleResize = false;
				}, 150);
			}
		};

		const setupScene = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(35, width / height, 1e-6, 1e27);

			if (useOrbit) {
				controls = new OrbitControls(camera, container);
				controls.panSpeed = 10.0;
				// controls.enablePan = false;
				controls.addEventListener('change', () => console.log(controls.object.position));
				document.querySelector('.g-body').style.display = 'none';
				document.querySelector('.map').classList.add("orbit");
			}

			if (addAxes) {
				const axesHelper = new THREE.AxesHelper(20000);
				scene.add(axesHelper);
			}

			camera.position.x = cameraPos[0].pos.x;
			camera.position.y = cameraPos[0].pos.y;
			camera.position.z = cameraPos[0].pos.z;

			renderer = new THREE.WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: true,
				alpha: true
			});
			renderer.setClearColor(new THREE.Color(options.backgroundColor));
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			containerCanvas = renderer.domElement;
			container.appendChild(containerCanvas);
		};

		const setupLights = () => {
			const ambient = new THREE.AmbientLight(0xffffff);
			scene.add(ambient);

			var light = new THREE.DirectionalLight(0xffffff, 1);
			// light.position.set(10000, 1000, -10000);
			light.position.set(0, 0, 0);
			scene.add(light);
		};

		const addGround = () => {
			const groundGroup = new THREE.Group();

			let baseMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
			let baseGeo = new THREE.PlaneGeometry(worldWidth, worldDepth);
			baseGeo.computeVertexNormals();

			let baseMesh = new THREE.Mesh(baseGeo, baseMat);
			baseMesh.rotation.x = -Math.PI / 2;
			baseMesh.position.set(0, 1.5, 0);
			groundGroup.add(baseMesh);

			const groundGeo = new THREE.PlaneGeometry(
				worldWidth,
				worldDepth,
				worldWidth - 1,
				worldDepth - 1
			);

			let disMap = new THREE.TextureLoader().load('dem.jpg');
			let mapbaseuse = innerWidth > 600 ? "mapbase2-desktop.png" : "mapbase2.png";
			let texture = new THREE.TextureLoader().load(mapbaseuse);

			let groundMat = new THREE.MeshStandardMaterial({
				color: 0xffffff,
				displacementMap: disMap,
				displacementScale: 50,
				map: texture,
				metalness: 0.3,
				roughness: 1,
				castShadow: true,
				receiveShadow: true,
				transparent: true
			});

			let groundMesh = new THREE.Mesh(groundGeo, groundMat);
			groundMesh.rotation.x = -Math.PI / 2;
			groundMesh.position.set(0, 0, 0);
			groundGroup.add(groundMesh);

			let groundMat2 = new THREE.MeshStandardMaterial({
				map: texture,
				metalness: 0.3,
				roughness: 1,
				depethTest: false,
				transparent: true
			});

			let groundMesh2 = new THREE.Mesh(groundGeo, groundMat2);
			groundMesh2.rotation.x = -Math.PI / 2;
			groundMesh2.position.set(0, 0, 0);
			groundGroup.add(groundMesh2);

			scene.add(groundGroup);
		};

		const loadTexture = (feature) => {
			const positionLoader = new THREE.TextureLoader();
			let imguse = innerWidth > 600 ? "path.png" : "path-mobile.png";
			positionLoader.load(imguse, function (texture) {
				// texture.minFilter = THREE.NearestFilter;
				// texture.magFilter = THREE.NearestFilter;
				feature.material.uniforms.uImageWritingPosition.value = texture;
				feature.material.uniforms.uFrames.value = frames.all; // frames[feature.section];
				// feature.material.uniforms.uImageWritingColor.value = inkBlack;
			});

			const displacementLoader = new THREE.TextureLoader();
			displacementLoader.load("dem.jpg", function (texture) {
				feature.material.uniforms.uDisplacementMap.value = texture;
				feature.material.uniforms.uDisplacementStrength.value = 100.0;
			});

			const mapbaseLoader = new THREE.TextureLoader();
			let mapbaseuse = innerWidth > 600 ? "mapbase2-desktop.png" : "mapbase2.png";
			mapbaseLoader.load(mapbaseuse, function (texture) {
				feature.material.uniforms.uMixImage.value = texture;
				feature.material.uniforms.uMixStrength.value = 0.5;
			});

			const inkLoader = new THREE.TextureLoader();
			inkLoader.load("ink-white.png", function (texture) {
				feature.material.uniforms.uImageWritingColor.value = texture;
			});

		};


		const addPath = () => {
			const group = new THREE.Group();
			const material = shaderShapes(trail);
			const geo = new THREE.PlaneGeometry(worldWidth, worldDepth, 100, 100);
			geo.computeVertexNormals();
			const mesh = new THREE.Mesh(geo, material);
			mesh.position.set(0, 0, 0);
			mesh.rotation.x = -Math.PI / 2;
			mesh.castShadow = true;
			material.transparent = true;
			trail.material = material;
			loadTexture(trail);
			group.add(mesh);
			scene.add(group);
		};

		const shaderShapes = () => {
			var material = new THREE.ShaderMaterial({
				uniforms: {
					uDisplacementMap: {
						value: null, // Displacement map texture
						type: "t"
					},
					uDisplacementStrength: {
						value: 1.0, // Strength of the displacement
					},
					uMixImage: {
						value: null, // Texture for the new image
						type: "t"
					},
					uMixStrength: {
						value: 0.0
					},
					bboxMin: {
						value: [0.0, 0.0, 0.0]
					},
					bboxMax: {
						value: [worldWidth, worldDepth, 1.0]
					},
					uSection: {
						value: 0.0
					},
					uHasWritten: {
						value: 0.0
					},
					uImageWritingPosition: {
						value: null,
						type: "t"
					},
					uImageWritingColor: {
						value: null,
						type: "t"
					},
					uFrames: {
						value: 1.0,
					},
					uDrawPct: {
						value: 0.0
					},
					uDistance: {
						value: 1000
					},
					uIsClear: {
						value: 0.0
					}
				},
				vertexShader: `
			  uniform vec3 bboxMin;
			  uniform vec3 bboxMax;
			  uniform sampler2D uDisplacementMap;
			  uniform float uDisplacementStrength;
			  uniform sampler2D uMixImage;
			  uniform float uMixStrength; 

			  varying vec2 vUv;
			  varying vec2 vTexCoord;
		  
			  void main() {
				vTexCoord = uv;
				// vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
				// vUv.x = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);

				float displacement = texture2D(uDisplacementMap, vUv).r; // Using red channel for displacement
				vec3 normalizedNormal = normalize(normal);
				vec3 displacedPosition = position + normalizedNormal * displacement * uDisplacementStrength;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition,1.0);
			  }
			`,
				fragmentShader: `
			  uniform vec3 color1;
			  uniform vec3 color2;
			  uniform sampler2D uDisplacementMap;
			  uniform sampler2D uImageWritingPosition;
			  uniform sampler2D uImageWritingColor;
			  uniform sampler2D uMixImage;
			  uniform float uMixStrength; 
			  uniform float uDrawPct;
			  uniform vec2 uTexCoord;
			  uniform float uFrames;
			  uniform float uDistance;
			  uniform float uIsClear;
		
			  varying vec2 vTexCoord;
			
			  varying vec2 vUv;
			  
			  void main() {
			  
			  	// Sample the existing textures
				vec4 tex2D = texture2D (uImageWritingPosition, vTexCoord);
				vec4 color2D = texture2D (uImageWritingColor, vTexCoord);

			  	// Existing color logic
				vec3 blended = vec3(color2D.r, color2D.g, color2D.b); 
				vec4 textColor = vec4 (blended, tex2D.b);

				// Calculate pixel percentage
				float red = tex2D.r;
				float green = tex2D.g;
				float pixelPct = ((red * 255.0) + (green * 65280.0)) / uFrames;
			  
			  	// Existing output color
				vec4 outColor = red + green > 0.0 && uDrawPct > pixelPct ? textColor :  vec4(255.0, 255.0, 255.0, 0.0);

				// Sample the new image
				vec4 mixImageColor = texture2D(uMixImage, vTexCoord);

				// Extract alpha channels
				float foregroundAlpha = outColor.a;   // Alpha of outColor (foreground)

				// Perform alpha compositing
				vec3 finalRGB = mixImageColor.rgb * (1.0 - foregroundAlpha) + outColor.rgb * foregroundAlpha;
				float finalAlpha = max(mixImageColor.a, foregroundAlpha); // Keep max alpha for visibility

				float displacement = texture2D(uDisplacementMap, vTexCoord).r;
				finalRGB += displacement * 0.1;

				// Set the final color
				gl_FragColor = vec4(finalRGB, finalAlpha);

			  }
			`,
				wireframe: false,
				side: THREE.FrontSide
			});

			return material;
		};

		const sluggify = (x) => {
			return x
				.toLowerCase()
				.split(' ')
				.join('-')
				.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, '');
		};

		const getScreenPos = (x, y, z) => {
			var p = new THREE.Vector3(x, y, z);
			var vector = p.project(camera);
			vector.x = ((vector.x + 1) / 2) * window.innerWidth;
			vector.y = (-(vector.y - 1) / 2) * window.innerHeight;
			return vector;
		};

		function componentToHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		}

		function rgbToHex(r, g, b) {
			return componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		const addLabels = () => {
			labels.forEach(function (d,i) {
				let id = "text-" + i;

				let textEl = document.createElement('div');
				textEl.classList.add('g-3d-label');
				textEl.classList.add(id);

				if (d.type) {
					textEl.classList.add(d.type);
				}
				
				if (d.align) {
					textEl.classList.add(d.align);
				}

				// if (d.frames && d.frames[0][0] == 0 || !d.frames){
				// 	textEl.classList.add("active")
				// }
				// textEl.classList.add(d.align);
				// textEl.classList.add(d.valign);

				let innerEl = document.createElement('div');
				innerEl.classList.add('g-inner');

				let span_en = document.createElement('div');
				span_en.classList.add('en');
				span_en.classList.add('g-version');

				if (lang == "en" || !lang) {
					span_en.classList.add('g-show');
				}

				span_en.innerHTML =
					d.text.indexOf('\r') > -1 ? d.text.replace('\r', '<span>') + '</span>' : d.text;
				innerEl.appendChild(span_en);

				let span_cn = document.createElement('div');
				span_cn.classList.add('cn');
				span_cn.classList.add('g-version');

				if (lang == "cn") {
					span_cn.classList.add('g-show');
				}

				span_cn.innerHTML =
					d.text_cn.indexOf('\r') > -1 ? d.text_cn.replace('\r', '<span>') + '</span>' : d.text_cn;
				innerEl.appendChild(span_cn);

				textEl.appendChild(innerEl);
				labelscont.appendChild(textEl);

				const geometry = new THREE.CircleGeometry(1.2, 32);
				const material = new THREE.MeshBasicMaterial({
					color: +('0xffffff'),
					depthTest: false
				});
				const circle = new THREE.Mesh(geometry, material);

				d.pos = { x: 0, y: 0, z: 0 };
				d.pos.z =
					d.top_calc > 0.5 ? (d.top_calc - 0.5) * worldDepth : -(0.5 - d.top_calc) * worldDepth;
				d.pos.x =
					d.left_calc > 0.5 ? (d.left_calc - 0.5) * worldWidth : -(0.5 - d.left_calc) * worldWidth;

				circle.position.set(d.pos.x, d.pos.y, d.pos.z);
				circle.rotation.x = -Math.PI / 2;
				circle.name = id;
				scene.add(circle);
			});
		};

		let prevSegment = -1;
		const animate = () => {
			now = Date.now();

			if (now - then > fpsInterval) {
				then = now - ((now - then) % fpsInterval);
				scrollPctAdj += (scrollPct - scrollPctAdj) / lerpDivider;
				frameCurr = frameLength * scrollPctAdj;

				for (let i = cameraPos.length - 1; i >= 0; i--) {
					if (frameCurr >= cameraPos[i].frame && cameraPos[i + 1]) {
						let tweening = 'easeInOut', //debug ? "linear" : "easeInOut",
							segmentPct = (frameCurr - cameraPos[i].frame) / (cameraPos[i + 1].frame - cameraPos[i].frame), newX = valueTween(
								cameraPos[i].pos.x,
								cameraPos[i + 1].pos.x,
								segmentPct * 100,
								100,
								cameraPos[i].ease
							), newY = valueTween(
								cameraPos[i].pos.y,
								cameraPos[i + 1].pos.y,
								segmentPct * 100,
								100,
								cameraPos[i].ease
							), newZ = valueTween(
								cameraPos[i].pos.z,
								cameraPos[i + 1].pos.z,
								segmentPct * 100,
								100,
								cameraPos[i].ease
							), newAimX = valueTween(
								cameraAimPos[i].pos.x,
								cameraAimPos[i + 1].pos.x,
								segmentPct * 100,
								100,
								cameraAimPos[i].ease
							), newAimY = valueTween(
								cameraAimPos[i].pos.y,
								cameraAimPos[i + 1].pos.y,
								segmentPct * 100,
								100,
								cameraAimPos[i].ease
							), newAimZ = valueTween(
								cameraAimPos[i].pos.z,
								cameraAimPos[i + 1].pos.z,
								segmentPct * 100,
								100,
								cameraAimPos[i].ease
							);

						if (!useOrbit) {
							camera.position.set(newX, newY, newZ);
							camera.lookAt(newAimX, newAimY, newAimZ);
						}

						labels.forEach(function (d,i) {
							let id = "text-" + i;
							let textEl = document.querySelector('.' + id);
							let textpos = getScreenPos(d.pos.x, d.pos.y, d.pos.z);
							textEl.style.top = textpos.y + 'px';
							textEl.style.left = textpos.x + 'px';

							// if (textEl.classList.contains('active')) {
							// 	textEl.classList.remove('active');
							// }

							if (textEl.classList.contains('active')) {
								textEl.classList.remove('active');
							}

							if (d.frames) {
								d.frames.forEach(function(frame){
									if (frameCurr > frame[0] && frameCurr < frame[1]) {
										if (!textEl.classList.contains('active')) {
											textEl.classList.add('active');
										}
									}
								})
							} else {
								if (!textEl.classList.contains('active')) {
									textEl.classList.add('active');
								}
							}

						});

						frameSegIndex = i;

						if (prevSegment != frameSegIndex) {
							// console.log(prevSegment);
						}

						i = -1;
						prevSegment = frameSegIndex;
					}
				}


				// // wall.note[0].material.uniforms.uDrawPct.value = scrollPct;

				animateThings(frameCurr);

				renderer.render(scene, camera);
			}
			myreq = requestAnimationFrame(animate);
		};

		function animateThings(frameCurr) {

			let noframes = true;
			whatwhere.forEach(function(what,i){
				let img = what.sections == "path" && innerWidth < 600 ?  "path-mobile.png" : what.sections == "path" ? "path.png" : "section" + what.sections + ".png";
				if (frameCurr > what.frames[0] && frameCurr < what.frames[1]) {
					noframes = false;
					if (trail.material.uniforms.uSection.value != i) {
						const positionLoader = new THREE.TextureLoader();
						positionLoader.load(img, function (texture) {
							trail.material.uniforms.uDrawPct.value = 0.0;
							trail.material.uniforms.uHasWritten.value = 0.0;
							trail.material.uniforms.uImageWritingPosition.value = texture;
							trail.material.uniforms.uSection.value = i;
							trail.material.uniforms.uFrames.value = what.totalFrames;
						});
					}

					const hasWritten = trail.material.uniforms.uHasWritten.value;
					if (trail.material.uniforms.uHasWritten.value != 1) {
						let drawPct = trail.material.uniforms.uDrawPct.value;
						//   drawPct += frames[feature[i].name] < 60 ? 1 / frames[feature[i].name] : 20 / frames[feature[i].name];
						let increment = innerWidth < 600 && i == 0 ? 1 : i == 0 ? 0.1 : 0.03;
						drawPct += increment
						if (drawPct > 1) {
							
							trail.material.uniforms.uHasWritten.value = 1.0;
							trail.material.uniforms.uDrawPct.value = 1.0;
						} else {
							trail.material.uniforms.uDrawPct.value = drawPct;
						} 
					}
				}
			})

			if (noframes) {
				trail.material.uniforms.uDrawPct.value = 0.0;
			}

			// if (frameCurr > 20 && frameCurr < 100) {
			// 	let drawPct = trail.material.uniforms.uDrawPct.value;
			// 	drawPct += 0.005;
			// 	if (drawPct > 1) {
			// 		trail.material.uniforms.uDrawPct.value = 1.0;
			// 	} else {
			// 		trail.material.uniforms.uDrawPct.value = drawPct;
			// 	}
			// } else if (frameCurr < 20 || frameCurr > 100) {
			// 	let drawPct = trail.material.uniforms.uDrawPct.value;
			// 	drawPct -= 0.02;
			// 	if (drawPct < 0) {
			// 		trail.material.uniforms.uDrawPct.value = 0.0;
			// 	} else {
			// 		trail.material.uniforms.uDrawPct.value = drawPct;
			// 	}
			// }

			// if (frameCurr > 100) {
			// 	const positionLoader = new THREE.TextureLoader();
			// 	positionLoader.load("section1.png", function (texture) {
			// 		trail.material.uniforms.uImageWritingPosition.value = texture;
			// 		trail.material.uniforms.uFrames.value = frames.all;
			// 		trail.material.uniforms.uDrawPct.value = 1.0;
			// 	});
			// }

		}




		container.style.height = assetHeight + 'px';

		setupScene();
		setupLights();
		// addGround();
		addLabels();

		addPath();

		window.addEventListener('resize', onWindowResize);
		window.addEventListener('scroll', onPageScroll);

		if (debug) addDebugElems();

		cancelAnimationFrame(myreq);
		animate();
	},
	get init() {
		return this._init;
	},
	set init(value) {
		this._init = value;
	},
};

	
