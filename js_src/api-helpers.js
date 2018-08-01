const apiUrlBase = '/api/';

function getJson(url){
	return fetch(url).then((response)=>{ 
		return response.json();
	});
}

function getTracksForItem(itemType, itemId){
	const url = `${apiUrlBase}${itemType}/${itemId}/tracks`;
	return getJson(url);
}

function loadModel(modelName, target){
	const url = `${apiUrlBase}${modelName}`;
	getJson(url).then((json)=>{
		target[modelName] = json.data;
	});
}

module.exports = {
    apiUrlBase,
    getJson,
    getTracksForItem,
    loadModel,
};