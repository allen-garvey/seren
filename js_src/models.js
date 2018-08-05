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
        {title: 'Genre', sort: 'Genre'},
        {title: 'Composer', sort: 'Composer'},
        {title: 'Bit Rate', sort: 'Bit Rate'},
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

function sortItems(items, sortKey, sortAsc, artistsMap){
    const getValueByKey = (item) =>{
        return item[sortKey];
    };
    const getArtistName = (item) =>{
        return artistsMap.get(item.artist_id).name;
    };

    const itemValueFunc = sortKey === 'artist' ? getArtistName : getValueByKey;

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