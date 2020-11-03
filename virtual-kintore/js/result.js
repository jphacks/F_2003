function loadData(){

	let getjson = localStorage.getItem('result');
	console.log(getjson)
	let traningOBJ=[];
	if (getjson!==null){
			traningOBJ= JSON.parse(getjson);
	}else{
		localStorage.setItem('result',{results:[]});
	}
	let tableHTML = document.getElementById('tableContent');
	console.log(traningOBJ)
	traningOBJ.forEach(result =>tableHTML.insertAdjacentHTML('BeforeEnd','<tr><th>'+result.date+'</th><th>'+result.menu+'</th><th>'+result.limitTime+'</th><th>'+result.times+'</th></tr>'));
}

loadData();
