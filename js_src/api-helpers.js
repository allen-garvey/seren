const apiUrlBase = '/api';

function getJson(url){
	return fetch(url).then((response)=>{ 
		return response.json();
	});
}

export default {
    apiUrlBase,
    getJson,
};