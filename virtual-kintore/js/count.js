let count=0
const praise=[]
praise.push(new Audio('assets/sound/good.mp3'));
praise.push(new Audio('assets/sound/excellent.mp3'));
praise.push(new Audio('assets/sound/marvelous.mp3'));
const num=[];
num.push(new Audio('assets/sound/one.mp3'));
num.push(new Audio('assets/sound/two.mp3'));
num.push(new Audio('assets/sound/three.mp3'));
num.push(new Audio('assets/sound/four.mp3'));
num.push(new Audio('assets/sound/five.mp3'));
num.push(new Audio('assets/sound/six.mp3'));
num.push(new Audio('assets/sound/seven.mp3'));
num.push(new Audio('assets/sound/eight.mp3'));
num.push(new Audio('assets/sound/nine.mp3'));
const numZero=[]
numZero.push(new Audio('assets/sound/ten.mp3'));
numZero.push(new Audio('assets/sound/twenty.mp3'));
numZero.push(new Audio('assets/sound/thirty.mp3'));
numZero.push(new Audio('assets/sound/forty.mp3'));
numZero.push(new Audio('assets/sound/fifty.mp3'));

const num2digits=[]
num2digits.push(new Audio('assets/sound/ten1.mp3'));
num2digits.push(new Audio('assets/sound/twenty1.mp3'));
num2digits.push(numZero[2]);
num2digits.push(numZero[3]);
num2digits.push(new Audio('assets/sound/fifty1.mp3'));

function play(count){
	if(count<10){
		num[count-1].play()
	}else if( count<50){
		if(count%10===0){
			numZero[(count/10|0)-1].play()
		}else{

			let time=600
			if (count%10==1){
				time=400
			}
			setTimeout(function () {
				num[count%10-1].play();
			},600);
			num2digits[(count/10|0)-1].play()
		}
	}else{
		praise[Math.floor(Math.random()*3)].play();  // 再生
	}
	console.log(count)
}
