
			//===================================
			// motion capture process
			let poseStore = {};
			let coordinateStore =[];
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
			mat.position.set(0.0,0.0001,0);
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

			const gridHelper = new THREE.GridHelper( 1, 1 );
			scene.add( gridHelper );

			const axesHelper = new THREE.AxesHelper( 5 );
			scene.add( axesHelper );

			// animate
			const clock = new THREE.Clock();
			clock.start();

			let angleStore = {};

			// X axis
			function getAngleFromX(pos2, pos1) {
				return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
			}

			function getDistance(pos2,pos1){
				return ((pos2.y - pos1.y)**2+( pos2.x - pos1.x)**2)**0.5
			}

			function getBetweenAngle(vec1,vec2){
				let cos=(vec1.x*vec2.x + vec1.y*vec2.y + vec1.z*vec2.z) / ((vec1.x**2+vec1.y**2+vec1.z**2)**0.5 * (vec2.x**2+vec2.y**2+vec2.z**2)**0.5)
				//vec1,vec2で角度ができない時は0を返す
				//丸め誤差の処理,
				if ( isNaN(cos)){
					return 0
				}else if(cos>1){
					cos=1
				}else if(cos<-1){
					cos=-1
				}
				return Math.acos(cos)
			}

			function getArmPos(pos_wrist,pos_elbow,pos_shoulder1,pos_shoulder2){
				//カメラ画像上の距離,座標を定数にしておく
				//カメラ画像上の2点間の距離
				const shoulder = getDistance(pos_shoulder1,pos_shoulder2);
				const elbow = getDistance(pos_shoulder1,pos_elbow);
				//カメラ画像の座標
				const xc0=pos_shoulder1.x
				const yc0=pos_shoulder1.y
				const xc1=pos_elbow.x
				const yc1=pos_elbow.y
				const xc2=pos_wrist.x
				const yc2=pos_wrist.y

				z1=((xc1-xc0)**2+(yc1-yc0)**2)**0.5/0.1
				z2=((xc2-xc1)**2+(yc2-yc1)**2)**0.5/0.1

				return [{x:xc1-xc0,y:yc1-yc0,z:10},{x:xc2-xc1,y:yc2-yc1,z:10}]
			}
			function getArmAngle(vec1,vec2){//上腕と前腕のベクトルから角度を算出
				//vec1={x:1,y:-2,z:-1}
				//vec2={x:1,y:-2,z:-1}

				//単位ベクトルの成分
				const x1=vec1.x/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const y1=vec1.y/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const z1=vec1.z/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const x2=x1+vec2.x/(vec2.x**2+vec2.y**2+vec2.z**2)**0.5

				const theta=-getBetweenAngle(vec1,vec2)

				const upperArm={x:0,//他の角度がもとまってから代入
								y:0,
								z:0,}

				const lowerArm={x:0,//前腕は人間の構造から1軸に近似
								y:theta,
								z:0}

				if(theta==0){//前腕が曲がっていないとき(ひねりなし)
					upperArm.x=0
					upperArm.z=Math.asin(-y1)
					upperArm.y=-Math.acos(x1/Math.cos(upperArm.z))
				}else{//前腕が曲がっているとき
					upperArm.y=Math.atan(1/Math.tan(theta/2)-(x2/(x1*Math.sin(theta))))
					upperArm.z=Math.acos(x1/Math.cos(upperArm.y))
					upperArm.x=Math.atan2(y1,z1)-Math.atan2(-Math.sin(upperArm.z),-Math.sin(upperArm.y),Math.cos(upperArm.z))

				}
				//console.log({upperArm,lowerArm})
				return {upperArm,lowerArm}
			}

// 以下をいじる
			function getLegAngle(vec1,vec2){//上腕と前腕のベクトルから角度を算出
				//vec1={x:1,y:-2,z:-1}
				//vec2={x:1,y:-2,z:-1}

				//単位ベクトルの成分
				const x1=vec1.x/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const y1=vec1.y/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const z1=vec1.z/(vec1.x**2+vec1.y**2+vec1.z**2)**0.5
				const x2=x1+vec2.x/(vec2.x**2+vec2.y**2+vec2.z**2)**0.5

				const theta=-getBetweenAngle(vec1,vec2)

				const upperLeg={x:0,//他の角度がもとまってから代入
								y:0,
								z:0,}

				const lowerLeg={x:theta,//前腕は人間の構造から1軸に近似
								y:0,
								z:0}

				if(theta==0){//前腕が曲がっていないとき(ひねりなし)
					upperLeg.x=0
					upperLeg.z=Math.asin(-y1)
					upperLeg.y=-Math.acos(x1/Math.cos(upperLeg.z))
				}else{//前腕が曲がっているとき
					upperLeg.y=Math.atan(1/Math.tan(theta/2)-(x2/(x1*Math.sin(theta))))
					upperLeg.z=Math.acos(x1/Math.cos(upperLeg.y))
					upperLeg.x=Math.atan2(y1,z1)-Math.atan2(-Math.sin(upperLeg.z),-Math.sin(upperLeg.y),Math.cos(upperLeg.z))

				}
				//console.log({upperArm,lowerArm})
				return [upperLeg,lowerLeg]
			}

			const deltaTime = clock.getDelta();
			console.log(deltaTime)

			const animationTime=3
			const animationFrame=animationTime/0.03;
			let i=0

			function animate() {

				requestAnimationFrame( animate );


				if ( currentVrm ) {

					let t=i*2*Math.PI/animationFrame
					let frame=(1-Math.cos(t))/2.0*Math.PI
					let theta_Arm=0.25*frame
					let theta_Hip=0.275*frame;
					let theta_UpperLeg=0.7*frame;
					let theta_UpperLeg_X=0.7*frame;
					//let theta_UpperLeg_X=Math.acos(Math.cos(theta_UpperLeg)/Math.cos(0.15*Math.PI));
					const phi_UpperLeg=0.10*Math.PI;

					let theta_LowerLeg=-0.525*frame;
					let theta_foot=0.1*frame;

					let theta_pos_Hip=0.5*frame;
					let upperLeg, lowerLeg

					i+=1
					i%=animationFrame

					let uvec_UpperLeg={x:Math.sin(phi_UpperLeg),y:Math.sin(theta_UpperLeg),z:Math.cos(theta_UpperLeg)}
					let uvec_LowerLeg={x:Math.sin(phi_UpperLeg),y:Math.sin(theta_UpperLeg)*Math.sin(theta_LowerLeg),z:Math.cos(theta_UpperLeg)*Math.cos(theta_LowerLeg)}

					[upperLeg,lowerLeg] = getLegAngle(uvec_UpperLeg,uvec_UpperLeg)
					console.log(upperLeg,lowerLeg)

					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.y = Math.PI*0.425;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.y = -Math.PI*0.425;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.z = theta_Arm;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.z = -theta_Arm;

					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.x = theta_Hip;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Spine ).rotation.x = -Math.PI*0.375;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Neck ).rotation.x = theta_Hip;

					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperLeg ).rotation.x = upperLeg.x;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg ).rotation.x = upperLeg.x;

					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperLeg ).rotation.y = upperLeg.y;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg ).rotation.y = -upperLeg.y;

					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperLeg ).rotation.z = upperLeg.z;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg ).rotation.z = -upperLeg.z;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperLeg ).rotation.z = theta_UpperLeg_Y;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg ).rotation.z = -theta_UpperLeg_Y;

					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightLowerLeg ).rotation.x = lowerLeg.x;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg ).rotation.x = lowerLeg.x;

					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightLowerLeg ).rotation.z = -lowerLeg.z;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg ).rotation.z = lowerLeg.z;

					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightLowerLeg ).rotation.y = -lowerLeg.y;
					//currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg ).rotation.y = lowerLeg.y;

					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightFoot ).rotation.x = theta_foot;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftFoot ).rotation.x = theta_foot;

					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).position.set( 0, 0.65+0.3*math.cos(theta_pos_Hip), -0.3*math.sin(theta_pos_Hip) );

					currentVrm.update( 0.01 );//deltatime

				 }
				renderer.render( scene, camera );

			}

			setInterval(animate(), 10);

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
