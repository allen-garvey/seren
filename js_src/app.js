const Vue = require('vue');
const infiniteScroll = require('vue-infinite-scroll');
const Models = require('./models');
const ArrayUtil = require('./array-util');
const ApiHelpers = require('./api-helpers');
const Util = require('./util');

let audio = null;
let elapsedTimeTimer = null;

new Vue({
	el: '#app',
	directives: {infiniteScroll},
	created: function(){
		audio = new Audio();
		audio.addEventListener('ended', ()=>{
			if(this.hasNextTrack){
				this.playNextTrack();
			}
			else{
				this.displayTrackStopped();
			}
		});
		ApiHelpers.loadModel('artists', this);
		ApiHelpers.loadModel('genres', this);
		ApiHelpers.loadModel('composers', this);
		ApiHelpers.loadModel('albums', this);
		this.loadMoreTracks();
	},
	data: {
		tracks: null,
		artists: null,
		albums: null,
		genres: null,
		composers: null,
		displayTracks: [],
		//activeTrackTrackList: the track list when the currently playing track started playing
		//this is so that when pages are changed, the correct next track will play
		activeTrackTrackList: [],
		activeTrack: null,
		isPlaying: false,
		elapsedTime: 0,
		tabs: Models.tabsMap,
		path: ['artists'],
		searchQuery: '',
		searchResults: [],
		previousSortKey: null,
		sortAsc: true,
	},
	computed: {
		artistsMap: function(){
			return Models.mapForItems(this.artists);
		},
		albumsMap: function(){
			return Models.mapForItems(this.albums);
		},
		genresMap: function(){
			return Models.mapForItems(this.genres);
		},
		composersMap: function(){
			return Models.mapForItems(this.composers);
		},
		activeTab: function(){
			return this.path[0];
		},
		activePage: function(){
			return this.path[this.path.length - 1];
		},
		isInitialLoadComplete: function(){
			return this.tracks !== null && this.artists !== null && this.genres !== null && this.composers !== null && this.albums !== null;
		},
		isInfiniteScrollDisabled: function(){
			return !this.isInitialLoadComplete || this.activeTab !== 'tracks';
		},
		activeTrackDisplay: function(){
			if(!this.activeTrack){
				return '';
			}
			let ret = `${this.activeTrack.track.title} - ${this.artistsMap.get(this.activeTrack.track.artist_id).name}`;
			if(this.activeTrack.track.album_title){
				ret = `${ret} - ${this.activeTrack.track.album_title}`;
			}
			return ret;
		},
		playButtonTitle: function(){
			if(this.isPlaying){
				return `Pause ${this.activeTrack.track.title}`;
			}
			else if(this.activeTrack){
				return `Play ${this.activeTrack.track.title}`;
			}
			return 'Play track';

		},
		playButtonText: function(){
			if(this.isPlaying){
				return '&#9646;&#9646;';
			}
			return '&#9654;';
		},
		hasPreviousTrack: function(){
			return this.activeTrack && this.activeTrack.index > 0;
		},
		hasNextTrack: function(){
			return this.activeTrack && this.activeTrack.index < this.activeTrackTrackList.length - 1;
		},
		activePageTracks: function(){
			if(this.activeTab !== 'tracks' && this.activePage === 'tracks'){
				return this.displayTracks;
			}
			if(this.activeTab === 'search'){
				return this.searchResults;
			}
			return this.tracks;	
		},
		items: function(){
			if(this.activeTab === 'tracks' || this.activePage === 'tracks'){
				return this.activePageTracks;
			}
			switch(this.activeTab){
				case 'artists':
					return this.artists;
				case 'genres':
					return this.genres;
				case 'composers':
					return this.composers;
				case 'albums':
					return this.albums;
				default:
					return this.activePageTracks;
			}
		},
		itemColumns: function(){
			if(this.isTrackPage){
				return Models.trackItemColumns;
			}
			else if(this.activePage === 'albums'){
				return Models.albumItemColumns;
			}
			return Models.defaultItemColumns;
		},
		isTrackPage: function(){
			return this.activePage === 'tracks' || this.activePage === 'search';
		},
		isSearchEnabled: function(){
			return !!this.searchQuery;
		},
	},
	methods: {
		changeTab: function(tabKey){
			this.path = [tabKey];
		},
		loadMoreTracks: function(){
			const offset = this.tracks ? this.tracks.length : false;

			let url = `${ApiHelpers.apiUrlBase}tracks?limit=100`;
			if(offset){
				url = `${url}&offset=${offset}`;
			}
			ApiHelpers.getJson(url).then((json)=>{
				if(offset){
					this.tracks = this.tracks.concat(json.data);
				}
				else{
					this.tracks = json.data;
				}
			});
		},
		isTrackPlaying: function(track){
			return this.isPlaying && this.activeTrack && track.id === this.activeTrack.track.id;
		},
		doubleClickRowAction: function(item, rowIndex){
			if(this.isTrackPage){
				this.play(item, rowIndex, this.path);
			}
			else{
				this.displayTracksForItem(item);
			}
		},
		displayTracksForItem: function(item){
			this.displayTracks = [];
			ApiHelpers.getTracksForItem(this.activeTab, item.id).then((json)=>{
				this.displayTracks = json.data;
			});
			this.path = this.path.concat([item.id, 'tracks']);
		},
		play: function(track, trackIndex, trackPath){
			if(!this.activeTrack || !ArrayUtil.areArraysEqual(this.activeTrack.path, trackPath)){
				//if we are on tracks page, we only want to reference the tracks,
				//otherwise we want to copy it
				if(this.activePage === 'tracks'){
					this.activeTrackTrackList = this.activePageTracks;
				}
				else{
					this.activeTrackTrackList = this.activePageTracks.slice();
				}
			}
			if(!this.activeTrack || this.activeTrack.track.id !== track.id){
				this.activeTrack = {
					track: track,
					path: trackPath.slice(),
					index: trackIndex,
				};
				this.isPlaying = true;
				this.elapsedTime = 0;
				// let mediaUrl = '/media/' + encodeURI(track.file_path).replace('#', '%23').replace('?', '%3F');
				let mediaUrl = '/media/' + escape(track.file_path);
				audio.src = mediaUrl;
				audio.load();
				audio.play();
			}
			else{
				this.isPlaying = true;
				audio.play();
			}
			//only start timer if not already going
			if(elapsedTimeTimer === null){
				elapsedTimeTimer = setInterval(()=>{ 
					this.elapsedTime = audio.currentTime * 1000;
				}, 1000);
			}
		},
		stop: function(){
			this.displayTrackStopped();
			audio.pause();
		},
		displayTrackStopped: function(){
			this.isPlaying = false;
			clearInterval(elapsedTimeTimer);
			elapsedTimeTimer = null;
		},
		playButtonAction: function(){
			if(this.isPlaying){
				this.stop();
			}
			else{
				this.play(this.activeTrack.track, this.activeTrack.index, this.activeTrack.path);
			}
		},
		previousButtonAction: function(){
			//go back to beginning of track
			//if more than a fixed amount has played
			if(this.elapsedTime > 4000){
				this.elapsedTime = 0;
				audio.currentTime = 0;
			}
			else{
				this.playPreviousTrack();
			}
		},
		playPreviousTrack: function(){
			if(!this.hasPreviousTrack){
				return;
			}
			let trackIndex = this.activeTrack.index - 1;
			let track = this.activeTrackTrackList[trackIndex];
			this.play(track, trackIndex, this.activeTrack.path);
		},
		playNextTrack: function(){
			if(!this.hasNextTrack){
				return;
			}
			let trackIndex = this.activeTrack.index + 1;
			let track = this.activeTrackTrackList[trackIndex];
			this.play(track, trackIndex, this.activeTrack.path);
		},
		sortItems: function(key){
			if(key !== this.previousSortKey){
				this.sortAsc = true;
			}
			else{
				this.sortAsc = !this.sortAsc;
			}
			this.previousSortKey = key;
			const relatedFields = {
				artists: this.artistsMap,
				genres: this.genresMap,
				composers: this.composersMap,
			};
			Models.sortItems(this.items, key, this.sortAsc, relatedFields);
		},
		itemFields: function(item){
			if(this.isTrackPage){
				const track = item;
				const genre = track.genre_id !== null ? this.genresMap.get(track.genre_id).name : '';
				const composer = track.composer_id !== null ? this.composersMap.get(track.composer_id).name : '';
				const albumTitle = track.album_id !== null ? this.albumsMap.get(track.album_id).title : '';
				return [
					track.title,
					this.artistsMap.get(track.artist_id).name,
					albumTitle,
					this.formatTrackLength(track.length),
					genre,
					composer,
					track.bit_rate,
					track.play_count,
					Util.formatUtcDateToUs(track.date_added),
				];
			}
			else if(this.activePage === 'albums'){
				const album = item;
				return [
					album.title,
					this.artistsMap.get(album.artist_id).name,
				];
			}
			return [item.name];
		},
		formatTrackLength: Util.formatTrackLength,
		searchForTracks: function(){
			if(!this.isSearchEnabled){
				return;
			}
			const searchUrl = `${ApiHelpers.apiUrlBase}search/tracks?q=${encodeURIComponent(this.searchQuery)}`;
			ApiHelpers.getJson(searchUrl).then((json)=>{
				this.searchResults = json.data;
				this.path = ['search'];
			});
		},
	}
});