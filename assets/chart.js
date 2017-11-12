const jsonUrl = `/${document.querySelector(".shortUrl").innerHTML}_stats.json`;

/**
 * Used to generate a series from an object containing stats.
 * @param  {object} statsObject The object containing your stats.
 * @param  {string} property    The name of the property you'd like to pull a series from.
 * @return {array}             	A 7 item long array containing the data from the object.
 */
function generateSeries(statsObject, property){
		const series = [];
		for(const date in statsObject){
			// if the property is an array...
			if(typeof statsObject[date][property] === 'object'){
				series.push(statsObject[date][property].length);
			} else {
				series.push(statsObject[date][property]);	
			}
		}
		// if there is less than 7 days of data
		while(series.length < 7){
			series.unshift(0);
		}
		return series;
}

/**
 * Draw the chart using Chartist API.
 * @param  {object} XMLHttpRequestObj  The XMLHttpRequestObj you created.
 * @return {undefined}                  No return value
 */
function drawChart(XMLHttpRequestObj){
	return (event) =>{
		const stats = JSON.parse(XMLHttpRequestObj.responseText);
		
		const dates = Object.keys(stats.dates);
		const totalVisitorsSeries = generateSeries(stats.dates, 'totalVisitors');
		const totalUniqueVisitorsSeries = generateSeries(stats.dates, 'totalUnique');

		// If there is less than 7 days of data.
		while(dates.length < 7){
			const lastDay = dates[0].split(" ");
			lastDay[2]--; // lower the day of the month of last day by one.
			const date = new Date(lastDay.join(" "));
			dates.unshift(date.toDateString());
		}
		const data = {
			labels : dates,
			series : [totalVisitorsSeries, totalUniqueVisitorsSeries]
		};
		const options = {
			width: 1000,
			height: 500,
			showPoint: false,
			showLine: false,
			axisX : {showGrid: false},
			showArea: true
		}
		new Chartist.Line('.ct-chart', data, options);
	};
}

// make the JSON call
function loadJSON(){
	const jsonReq = new XMLHttpRequest();
	jsonReq.open("GET", jsonUrl);
	jsonReq.addEventListener('load', drawChart(jsonReq));
	jsonReq.send();
}


loadJSON();
