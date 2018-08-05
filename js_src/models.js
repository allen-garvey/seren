const Util = require('./util');

function getTabsMap(){
    //navigation tabs
    //note: as of now Maps are not reactive in Vue
    const tabsMap = new Map();
    tabsMap.set('artists', {title: 'Artists'});
    tabsMap.set('albums', {title: 'Albums'});
    tabsMap.set('composers', {title: 'Composers'});
    tabsMap.set('genres', {title: 'Genres'});
    tabsMap.set('tracks', {title: 'Tracks'});
    tabsMap.set('search', {title: 'Search'});
    
    return tabsMap;
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

function mapForItems(items){
    const ret = new Map();
    if(items !== null){
        items.forEach((item)=>{
            ret.set(item.id, item);
        });
    }
    return ret;
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



module.exports = {
    tabsMap: getTabsMap(),
    trackItemColumns: getTrackItemColumns(),
    defaultItemColumns: getDefaultItemColumns(),
    albumItemColumns: getAlbumItemColumns(),
    mapForItems,
    sortItems,
};