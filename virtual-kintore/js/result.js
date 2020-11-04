function loadData(){

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
	let tableHTML = document.getElementById('tableContent');
	console.log(traningOBJ)
	traningOBJ.forEach(result =>tableHTML.insertAdjacentHTML('BeforeEnd','<tr><th>'+result.date+'</th><th>'+result.menu+'</th><th>'+result.limitTime+'</th><th>'+result.times+'</th></tr>'));
}

loadData();
