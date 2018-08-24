const apiUrlBase = '/api';

function getJson(url){
	return fetch(url).then((response)=>{ 
		return response.json();
	});
}

function getTracksForItem(itemType, itemId){
	const url = `${apiUrlBase}/${itemType}/${itemId}/tracks`;
	return getJson(url);
}

export default {
    apiUrlBase,
    getJson,
    getTracksForItem,
};