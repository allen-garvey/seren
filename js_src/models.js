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



module.exports = {
    tabsMap: getTabsMap(),
    trackItemColumns: getTrackItemColumns(),
    defaultItemColumns: getDefaultItemColumns(),
    albumItemColumns: getAlbumItemColumns(),
    mapForItems,
};