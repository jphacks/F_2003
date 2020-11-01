
			//===================================
			// motion capture process
			let poseStore = {};
			let coordinateStore =[];
			const webacamCanvas = document.getElementById("webacamCanvas");
			const webcamCtx = webacamCanvas.getContext("2d");
			const video = document.getElementById('video');
			// display camera movie Canvas detected parts
			function detectAndDraw(net) {
				webcamCtx.drawImage(video, 0, 0, 480, 320);

				net.estimateSinglePose(video, {
					flipHorizontal: false
				})
				.then(function(pose) {
					drawKeypoints(pose);
				});
			}
			// draw detected parts by PoseNet
			function drawKeypoints(pose) {




				pose.keypoints.forEach(keypoint => {
					if (keypoint.score > 0.4) {
						poseStore[keypoint.part] = {
							x: 480/2 - keypoint.position.x,
							y: 320/2 - keypoint.position.y,
							score:keypoint.score
						};


						webcamCtx.beginPath();
						webcamCtx.fillStyle = "rgb(255, 255, 0)"; // 黄色
						webcamCtx.arc(
							keypoint.position.x,
							keypoint.position.y,
							5,
							(10 * Math.PI) / 180,
							(80 * Math.PI) / 180,
							true
						);
						webcamCtx.fill();
						webcamCtx.fillText(
							keypoint.part,
							keypoint.position.x,
							keypoint.position.y + 10
						);

					}
				});
			}
			// get camera movie
			navigator.mediaDevices.getUserMedia({ audio: false, video: true })
			.then(function (mediaStream) {
				// set video tag srcObject
				video.srcObject = mediaStream;
				video.onloadedmetadata = function (e) {
					video.play();
				};
				return posenet.load();
			})
			.then(function (net) {
				var loadingIndicator = document.getElementById("loading-indicator");
				loadingIndicator.style.display = 'none';
				setInterval(function () { detectAndDraw(net); }, 100);
			});




const renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setPixelRatio( window.devicePixelRatio );
			document.body.appendChild( renderer.domElement );




			// camera
			const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
			camera.position.set( 0.0, 1.0, 5.0 );

			// camera controls
			const controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.screenSpacePanning = true;
			controls.target.set( 0.0, 1.0, 0.0 );
			controls.update();

			// scene
			const scene = new THREE.Scene();

			const wallGeometry = new THREE.PlaneGeometry( 10, 20, 32 );
			const matGeometry = new THREE.PlaneGeometry( 2, 20, 32 );
			const wallMaterial = new THREE.MeshBasicMaterial( {color: 0xf2f7fa, side: THREE.DoubleSide} );
			const floarMaterial = new THREE.MeshBasicMaterial({colot:0xaed4eb, side: THREE.DoubleSide} );
			const matMaterial = new THREE.MeshBasicMaterial( {color: 0xa9c8db, side: THREE.DoubleSide} );
			const wall = new THREE.Mesh( wallGeometry, wallMaterial );
			const ground = new THREE.Mesh( wallGeometry, floarMaterial );
			const mat = new THREE.Mesh( matGeometry , matMaterial );
			wall.position.set(0.0,0.0,-3.0);
			mat.position.set(0.0,0.00001,0);
			ground.rotation.x = Math.PI / -2;
			mat.rotation.x = Math.PI / -2;


			scene.add( wall );
			scene.add( ground );
			scene.add(mat);
			// light
			const light = new THREE.DirectionalLight( 0xffffff );
			light.position.set( 1.0, 1.0, 1.0 ).normalize();
			scene.add( light );

			// gltf and vrm
			let currentVrm = undefined;
			const loader = new THREE.GLTFLoader();

			function load( url ) {

				loader.crossOrigin = 'anonymous';
				loader.load(

					url,

					( gltf ) => {

						THREE.VRMUtils.removeUnnecessaryJoints( gltf.scene );

						THREE.VRM.from( gltf ).then( ( vrm ) => {

							if ( currentVrm ) {

								scene.remove( currentVrm.scene );
								currentVrm.dispose();

							}

							currentVrm = vrm;
							scene.add( vrm.scene );

							vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;

							console.log( vrm );

						} );

					},

					( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

					( error ) => console.error( error )

				);

			}

			load( './assets/vrm/Miraikomachi.vrm' );

			// helpers
			const gridHelper = new THREE.GridHelper( 10, 10 );
			scene.add( gridHelper );

			const axesHelper = new THREE.AxesHelper( 5 );
			scene.add( axesHelper );

			// animate
			const clock = new THREE.Clock();
			clock.start();

			function animate() {

				requestAnimationFrame( animate );

				if ( currentVrm ) { currentVrm.update( clock.getDelta() ); }
				renderer.render( scene, camera );

			}

			animate();

			// dnd handler
			window.addEventListener( 'dragover', function( event ) {

				event.preventDefault();

			} );

			window.addEventListener( 'drop', function( event ) {

				event.preventDefault();

				// read given file then convert it to blob url
				const files = event.dataTransfer.files;
				if ( !files ) { return; }
				const file = files[0];
				if ( !file ) { return; }
				const blob = new Blob( [ file ], { type: "application/octet-stream" } );
				const url = URL.createObjectURL( blob );
				load( url );

			} );
