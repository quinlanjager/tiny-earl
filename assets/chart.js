const jsonUrl = `/${document.querySelector(".link").innerHTML}_stats.json`;
console.log(jsonUrl);
function loadJSON(){
	const jsonReq = new XMLHttpRequest();
	jsonReq.addEventListener('load', (event)=>{
		console.log(jsonReq.responseText);
	})
	jsonReq.open("GET", jsonUrl);
	jsonReq.send();
}
loadJSON();
