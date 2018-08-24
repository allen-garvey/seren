import Util from './util';
import ApiHelpers from './api-helpers';

function getTabs(){
    return [
        {
            path: 'artists', 
            title: 'Artists',
            routeName: 'artistsIndex',
        },
        {
            path: 'albums', 
            title: 'Artists',
            routeName: 'albumsIndex',
        },
        {
            path: 'composers', 
            title: 'Composers',
            routeName: 'composersIndex',
        },
        {
            path: 'genres', 
            title: 'Genres',
            routeName: 'genresIndex',
        },
        {
            path: 'tracks', 
            title: 'Tracks',
            routeName: 'tracksIndex',
        },
        {
            path: 'search', 
            title: 'Search',
            routeName: 'albumsIndex',
        },
    ];
}

//item columns for tracks
function getTrackItemColumns(){
    return [
        {title: 'Title', sort: 'title'},
        {title: 'Artist', sort: 'artist'},
        {title: 'Album', sort: 'album_title'},
        {title: 'Length', sort: 'length'},
        {title: 'Genre', sort: 'genre'},
        {title: 'Composer', sort: 'composer'},
        {title: 'Bit Rate', sort: 'bit_rate'},
        {title: 'Play Count', sort: 'play_count'},
        {title: 'Date Added', sort: 'date_added'},
    ];
}

//item columns for everything except tracks and albums
function getDefaultItemColumns(){
    return [{title: 'Name', sort: 'name'}];
}

function getAlbumItemColumns(){
    return [
                {title: 'Title', sort: 'title'},
                {title: 'Artist', sort: 'artist'},
            ];
}

function sortItems(items, sortKey, sortAsc, relatedFields){
    function getRelatedFieldValueBuilder(itemKey, relatedFieldIdMap, relatedFieldKey='name'){
        return (item)=>{
            //relatedFieldId might be null
            const relatedFieldId = item[itemKey];
            return Util.isEmpty(relatedFieldId) ? null : relatedFieldIdMap.get(relatedFieldId)[relatedFieldKey];
        };
    }
    
    const getValueByKey = (item) =>{
        return item[sortKey];
    };
    let itemValueFunc;
    switch(sortKey){
        case 'artist':
            itemValueFunc = getRelatedFieldValueBuilder('artist_id', relatedFields.artists);
            break;
        case 'composer':
            itemValueFunc = getRelatedFieldValueBuilder('composer_id', relatedFields.composers);
            break;
        case 'genre':
            itemValueFunc = getRelatedFieldValueBuilder('genre_id', relatedFields.genres);
            break;
        default:
            itemValueFunc = getValueByKey;
            break;
    }

    return items.sort((a,b)=>{
        let value1;
        let value2;
        if(!sortAsc){
            value1 = itemValueFunc(b);
            value2 = itemValueFunc(a);
        }
        else{
            value1 = itemValueFunc(a);
            value2 = itemValueFunc(b);
        }
        if(Util.isEmpty(value1)){
            if(Util.isEmpty(value2)){
                return 0;
            }
            return -1;
        }
        else if(Util.isEmpty(value2)){
            return 1;
        }
        if(typeof value1 === 'number'){
            return value1 - value2;
        }
        if(typeof value1 === 'string'){
            value1 = value1.toUpperCase();
            value2 = value2.toUpperCase();
        }
        if(value1 > value2){
            return 1;
        }
        else if(value1 < value2){
            return -1;
        }
        return 0;
    });
}

function loadModelAndMap(modelName, target, itemsMap){
	const url = `${ApiHelpers.apiUrlBase}${modelName}`;
	return ApiHelpers.getJson(url).then((json)=>{
        const items = json.data;
        target[modelName] = items;
        
        items.forEach((item)=>{
            itemsMap.set(item.id, item);
        });
	});
}



export default {
    getTabs,
    trackItemColumns: getTrackItemColumns(),
    defaultItemColumns: getDefaultItemColumns(),
    albumItemColumns: getAlbumItemColumns(),
    sortItems,
    loadModelAndMap,
};