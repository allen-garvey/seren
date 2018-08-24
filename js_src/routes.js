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
                    itemFields: Models.defaultItemFields,
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
                    itemFields: Models.albumItemFields,
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
                    itemFields: Models.defaultItemFields,
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
                    itemFields: Models.defaultItemFields,
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
                    itemFields: Models.trackItemFields,
                    getItemsKey: 'tracks',
                    isInfiniteScrollDisabled: false,
                }; 
            },
        },
        { 
            path: '/search/tracks',
            name: 'searchTracks', 
            component: TrackList,
            props: (route) => {
                return {
                    itemColumns: Models.trackItemColumns,
                    itemFields: Models.trackItemFields,
                    getItemsKey: 'searchTracks',
                }; 
            },
        },
    ],
};