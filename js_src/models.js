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



module.exports = {
    tabsMap: getTabsMap(),
};