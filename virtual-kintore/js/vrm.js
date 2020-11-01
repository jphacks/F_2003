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
