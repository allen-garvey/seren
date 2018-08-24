import TrackList from './components/track-list.vue'
import Models from './models';
import Util from './util';

export default {
    mode: 'history',
    routes: [
        { 
            path: '/', 
            name: 'home',
            redirect: '/artists' 
        },
        { 
            path: '/artists',
            name: 'artistsIndex', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.defaultItemColumns,
                    itemFields(item){
                        return [item.name];
                    },
                    getItemsKey: 'artists',
                }; 
            },
        },
        { 
            path: '/albums',
            name: 'albumsIndex', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.albumItemColumns,
                    itemFields(album){
                        return [
                            album.title,
                            this.artistsMap.get(album.artist_id).name,
                        ];
                    },
                    getItemsKey: 'albums',
                }; 
            },
        },
        { 
            path: '/composers',
            name: 'composersIndex', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.defaultItemColumns,
                    itemFields(item){
                        return [item.name];
                    },
                    getItemsKey: 'composers',
                }; 
            },
        },
        { 
            path: '/genres',
            name: 'genresIndex', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.defaultItemColumns,
                    itemFields(item){
                        return [item.name];
                    },
                    getItemsKey: 'genres',
                }; 
            },
        },
        { 
            path: '/tracks',
            name: 'tracksIndex', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.trackItemColumns,
                    itemFields(track){
                        const genre = track.genre_id !== null ? this.genresMap.get(track.genre_id).name : '';
                        const composer = track.composer_id !== null ? this.composersMap.get(track.composer_id).name : '';
                        const albumTitle = track.album_id !== null ? this.albumsMap.get(track.album_id).title : '';
                        return [
                            track.title,
                            this.artistsMap.get(track.artist_id).name,
                            albumTitle,
                            Util.formatTrackLength(track.length),
                            genre,
                            composer,
                            track.bit_rate,
                            track.play_count,
                            Util.formatUtcDateToUs(track.date_added),
                        ];
                    },
                    getItemsKey: 'tracks',
                    isInfiniteScrollDisabled: false,
                }; 
            },
        },
    ],
};