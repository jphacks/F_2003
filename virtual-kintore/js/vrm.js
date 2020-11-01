
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
			//===================================

			// renderer
			const renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setPixelRatio( window.devicePixelRatio );
			document.getElementById('vrm').appendChild( renderer.domElement );

			// camera
			const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
			camera.position.set( 0.0, 2.3, 3 );

			// camera controls
			const controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.screenSpacePanning = true;
			controls.target.set( 0.0, 2.3, 0.0 );
			controls.update();

			// scene
			const scene = new THREE.Scene();

			// light
			const light = new THREE.DirectionalLight( 0xffffff );
			light.position.set( 0, 3.0, 1.0 ).normalize();
			scene.add( light );


			// sublight
			const light1 = new THREE.DirectionalLight( 0xffffff );
			light1.position.set( -3.0, 0, 1.0 ).normalize();
			scene.add( light1 );

			const light2 = new THREE.DirectionalLight( 0xffffff );
			light2.position.set( 3.0, 0, 1.0 ).normalize();
			scene.add( light2 );


			// gltf and vrm
			let currentVrm = undefined;
			const loader = new THREE.GLTFLoader();
			loader.crossOrigin = 'anonymous';
			loader.load(

				"./Lucario.vrm",

				( gltf ) => {

					console.log(gltf)

					THREE.VRM.from( gltf ).then( ( vrm ) => {

						scene.add( vrm.scene );
						currentVrm = vrm;

						vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;

						console.log( vrm );

					} );

				},

				( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

				( error ) => console.error( error )

			);

			// helpers
			const gridHelper = new THREE.GridHelper( 10, 10 );
			scene.add( gridHelper );

			const axesHelper = new THREE.AxesHelper( 5 );
			scene.add( axesHelper );

			// animate
			const clock = new THREE.Clock();

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


			function animate() {

				requestAnimationFrame( animate );

				const deltaTime = clock.getDelta();

				if ( currentVrm ) {

					if (poseStore) {

						if (poseStore.leftEye && poseStore.rightEye) {
							// ear $ eyes
							let a=getDistance(poseStore.rightEye,poseStore.leftEye)
							if(poseStore.leftEar && poseStore.rightEar){
								if (poseStore.leftEar.score>poseStore.rightEar.score){
									let b=getDistance(poseStore.leftEar,poseStore.leftEye)
									let angle=Math.atan((b/a*0.7-Math.cos(4/15*Math.PI))/Math.sin(4/15*Math.PI))
									currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ).rotation.y = angle;
									angle=Math.atan((poseStore.leftEar.y - poseStore.nose.y)/(poseStore.leftEar.x - poseStore.nose.x))
									currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ).rotation.x = angle;
								}else{
									let b=getDistance(poseStore.rightEar,poseStore.rightEye)
									let angle=-Math.atan((b/a*0.7-Math.cos(4/15*Math.PI))/Math.sin(4/15*Math.PI))
									currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ).rotation.y = angle;
									angle=Math.atan((poseStore.rightEar.y - poseStore.nose.y)/(poseStore.rightEar.x - poseStore.nose.x))
									currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ).rotation.x = -angle;
								}
							}
						}

						if (poseStore.leftShoulder && poseStore.rightShoulder) {
							// spine & shoulder
							let angle = getAngleFromX(poseStore.rightShoulder, poseStore.leftShoulder);
							if (angle !== null) {
								angle = angle * -1;
								angleStore.Spine = angle;
								currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Spine ).rotation.z = angle;
							}
						}
						if (poseStore.leftEye && poseStore.rightEye) {
							// neck $ eyes
							let angle = getAngleFromX(poseStore.rightEye, poseStore.leftEye);
							if (angle !== null) {
								angle = angle * -1;
								angleStore.Head = angle;
								angle = angle - (angleStore.Spine || 0);
								currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ).rotation.z = angle;
							}
						}


						//モデル左腕(カメラ右腕)
						if (poseStore.rightShoulder && poseStore.rightElbow && poseStore.rightWrist && poseStore.leftShoulder) {
							const vec = getArmPos(poseStore.rightWrist,poseStore.rightElbow,poseStore.rightShoulder,poseStore.leftShoulder)
							const angle = getArmAngle(vec[0],vec[1])
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.x = angle.upperArm.x;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.y = angle.upperArm.y;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.z = angle.upperArm.z;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftLowerArm ).rotation.y = angle.lowerArm.y;
						}
						//モデル右腕(カメラ左腕)

						if (poseStore.leftShoulder && poseStore.leftElbow && poseStore.leftWrist && poseStore.rightShoulder) {
							const vec=getArmPos(poseStore.leftWrist,poseStore.leftElbow,poseStore.leftShoulder,poseStore.rightShoulder)
							vec[0].x*=-1
							vec[1].x*=-1
							const angle = getArmAngle(vec[0],vec[1])
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.x = angle.upperArm.x;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.y = -angle.upperArm.y;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.z = -angle.upperArm.z;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightLowerArm ).rotation.y = -angle.lowerArm.y;
						}
					}

					// update vrm
					currentVrm.update( deltaTime );

				}

				renderer.render( scene, camera );

			}

			animate();
