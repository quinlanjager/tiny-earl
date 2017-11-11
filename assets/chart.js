const jsonUrl = `/${document.querySelector(".link").innerHTML}_stats.json`;
console.log(jsonUrl);
function drawChart(XMLHttpRequestObj){
	return (event) =>{
		const stats = JSON.parse(XMLHttpRequestObj.responseText);
		console.log(stats);
		for(let user in stats.visitors){
			const date = stats.visitors[user].dateVisited.
			if(!date )
		}
		const data = {

		}
	};
}

function loadJSON(){
	const jsonReq = new XMLHttpRequest();

	jsonReq.open("GET", jsonUrl);
	
	jsonReq.addEventListener('load', drawChart(jsonReq));
	
	jsonReq.send();
}


loadJSON();
