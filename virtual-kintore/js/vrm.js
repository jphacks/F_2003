
			//===================================
			// motion capture process
			let squadCount=0;
			let beginTime=new Date();
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
				let mes=document.getElementById('mes')
				mes.style.display='none';
				setInterval(function () { detectAndDraw(net); }, 100);
			});

			let standUpFlag=false;


			function checkSquad(rightShoulder,lefttShoulder){

					let times=document.getElementById('times')
					let state=document.getElementById('state')
					if( (rightShoulder.y+lefttShoulder.y)/2> (sitY+3*standY)/4){
						state.innerHTML = '立ち上がっている'
						standUpFlag=true;
					}else if((rightShoulder.y+lefttShoulder.y)/2< (sitY*3+standY)/4){
						if(standUpFlag===true){
							standUpFlag=false;
							squadCount+=1;
							play(squadCount);
							times.innerHTML = squadCount
							state.innerHTML = 'しゃがんでいる'
						}
					}else{
						state.innerHTML = '移動中'
					}

			}


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

			function getArmPos(pos_wrist,pos_elbow,pos_shoulder1,theta_Hip){
				//カメラ画像上の距離,座標を定数にしておく
				//カメラ画像上の2点間の距離
			//カメラ画像の座標
				const xc0=pos_shoulder1.x
				const yc0=pos_shoulder1.y
				const xc1=pos_elbow.x
				const yc1=pos_elbow.y
				const xc2=pos_wrist.x
				const yc2=pos_wrist.y
				const theta=getAngleFromX(pos_elbow, pos_shoulder1)-getAngleFromX(pos_wrist, pos_shoulder1)

				const c075= Math.cos(0.075*Math.PI)
				const s075= Math.sin(0.075*Math.PI)
				const cHip= Math.cos(theta_Hip)
				const sHip= Math.sin(theta_Hip)

				return [{x:s075,y:sHip,z:c075*cHip},{x:s075,y:sHip,z:c075*cHip}]
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
				let theta_Hip=0
				if ( currentVrm ) {
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.y = 0.425*Math.PI;
					currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.y = -0.425*Math.PI;

					if (poseStore.leftShoulder && poseStore.rightShoulder) {

						checkSquad(poseStore.leftShoulder , poseStore.rightShoulder);
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
						/*
						// spine & shoulder
						let angle = getAngleFromX(poseStore.rightShoulder, poseStore.leftShoulder);
						if (angle !== null) {
							angle = angle * -1;
							angleStore.Spine = angle;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Spine ).rotation.z = angle;
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
						*/
						}
						if (poseStore.rightShoulder && poseStore.rightElbow && poseStore.rightWrist) {
							const vec = getArmPos(poseStore.rightWrist,poseStore.rightElbow,poseStore.rightShoulder,theta_Hip)
							const angle = getArmAngle(vec[0],vec[1])
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.x = angle.upperArm.x;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.y = angle.upperArm.y;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ).rotation.z = angle.upperArm.z;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.LeftLowerArm ).rotation.y = angle.lowerArm.y;
						}
						//モデル右腕(カメラ左腕)

						if (poseStore.leftShoulder && poseStore.leftElbow && poseStore.leftWrist ) {
							const vec=getArmPos(poseStore.leftWrist,poseStore.leftElbow,poseStore.leftShoulder,theta_Hip)
							const angle = getArmAngle(vec[0],vec[1])
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.x = angle.upperArm.x;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.y = -angle.upperArm.y;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightUpperArm ).rotation.z = -angle.upperArm.z;
							currentVrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.RightLowerArm ).rotation.y = -angle.lowerArm.y;
						}
					  currentVrm.update( deltaTime  );
				 }
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

			window.onbeforeunload = function(e) {
					let getjson = localStorage.getItem('result');
					console.log(getjson)
					let traningOBJ=[];
					if (getjson!==null){
							try {
								traningOBJ= JSON.parse(getjson);
							}
							catch (e) {
								localStorage.setItem('result',JSON.stringify(traningOBJ));
							}
					}else{
						localStorage.setItem('result',JSON.stringify(traningOBJ));
					}
					const date1 = new Date();
					const diff = date1.getTime() - beginTime.getTime();
					const min=diff/60000|0
					const sec=((diff%60000)/1000)|0
					console.log(traningOBJ)
					traningOBJ.push({date:date1.toLocaleString(),menu:"スクワット",	limitTime: min+"分"+sec+"秒"	,times:squadCount+"回"})

					localStorage.setItem('result',JSON.stringify(traningOBJ));
					e.returnvalue="今回の記録\n時間: "+min+"分"+sec+"秒\n 回数: "+squadCount+"回"
			}


let pauseCount=0
	function calibration(){
		let mes=document.getElementById('mes')
		mes.style.display="block"
		mes.innerHTML="<h2><span>カメラの</span><span>前で</span><span>ミライコマチと</span><span>同じ体制に</span><span>なりましょう！</span><h2>";
		pauseCount=squadCount
		poseStore={}
		let standHipY
		//カメラが腰と肩を認識し始めるまで待つ
		let id1 = setInterval(function(){
			if(poseStore!=={}){
				if(poseStore.leftShoulder&&poseStore.rightShoulder&&poseStore.leftHip&&poseStore.rightHip){
					clearInterval(id1);
					console.log("")
					calkStandY();
				}
			}
		}, 100);

	}


	function calkStandY(){
		let calibrationArr=[[],[]]
		let id2 = setInterval(function(){
			calibrationArr[0].push((poseStore.leftShoulder.y+poseStore.rightShoulder.y)/2)
			calibrationArr[1].push((poseStore.leftShoulder.y+poseStore.rightShoulder.y)/2)
			if(calibrationArr[0].length > 30){　
				clearInterval(id2);　//idをclearIntervalで指定している
				calibrationArr[0]=calibrationArr[0].slice(10)//前半のデータを捨てる
				calibrationArr[1]=calibrationArr[1].slice(10)//前半のデータを捨てる
				standY = calibrationArr[0].reduce(function (acc, cur) {	return acc + cur;	})/calibrationArr[0].length;
				standHipY= calibrationArr[1].reduce(function (acc, cur) {return acc + cur;})/calibrationArr[1].length;

				let mes=document.getElementById('mes')
				mes.style.display="block"
				mes.innerHTML="<h2><span>カメラの</span><span>前で</span><span>スクワットを</span><span>一回</span><span>してください</span><h2>";
				let sit=standY
				let id1 = setInterval(function(){
					sit=(poseStore.leftShoulder.y+poseStore.rightShoulder.y)/2
					if(sit<(2*standY+standHipY)/3){
						clearInterval(id1);
						calkSitY();
					}
				}, 100);
			}
		}, 25);
	}

	function calkSitY(){
		calibrationArr=[]
		let id3 = setInterval(function(){
			calibrationArr.push((poseStore.leftShoulder.y+poseStore.rightShoulder.y)/2)
			if(calibrationArr.length > 75){　
				clearInterval(id3);　//idをclearIntervalで指定している
				console.log(calibrationArr)
				console.log(Math.min(...calibrationArr))

				sitY=Math.min(...calibrationArr)

				let mes=document.getElementById('mes')
				mes.style.display="block"

  			setTimeout(mesHide, 1000);
				mes.innerHTML="<h2><span>調整完了</span><span>しました。</span><span>お疲れ様</span><span>でした！</span>";
				squadCount=pauseCount+1;
				console.log(standY,sitY)
				localStorage.setItem('standY',standY);
				localStorage.setItem('sitY',sitY);
			}
		}, 20);
	}

	function mesHide(){
		let mes=document.getElementById('mes')
		mes.style.display="none"
	}

	let standY=localStorage.getItem('standY')
	let sitY=localStorage.getItem('sitY')
	console.log(standY,sitY)
	if (standY === null || sitY === null){
			standY=200
			sitY=-10
			calibration()
	}
