const jsonUrl = `/${document.querySelector(".link").innerHTML}_stats.json`;
console.log(jsonUrl);
function drawChart(XMLHttpRequestObj){
	return (event) =>{
		const stats = JSON.parse(XMLHttpRequestObj.responseText);
		console.log(stats);
		const {dates} = stats;
		const series = [];
		for(const point in dates){
			series.push(dates[point].totalVisitors);
		}
		console.log(series);
		const data = {
			labels : Object.keys(dates),
			series : [series]
		};
		const options = {
			width: 1100,
			height: 500,
		}
		new Chartist.Line('.ct-chart', data, options);
	};
}

function loadJSON(){
	const jsonReq = new XMLHttpRequest();
	jsonReq.open("GET", jsonUrl);
	jsonReq.addEventListener('load', drawChart(jsonReq));
	jsonReq.send();
}


loadJSON();
