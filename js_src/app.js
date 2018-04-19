(function(Vue, fetch){
	const apiUrlBase = '/api/';

	const audio = new Audio();
	audio.addEventListener('ended', function(){
		if(app.hasNextTrack){
			app.playNextTrack();
		}
		else{
			app.displayTrackStopped();
		}
	});

	let elapsedTimeTimer = null;

	//navigation tabs
	//note: as of now Maps are not reactive in Vue
	const tabsMap = new Map();
	tabsMap.set('artists', {title: 'Artists'});
	tabsMap.set('albums', {title: 'Albums'});
	tabsMap.set('composers', {title: 'Composers'});
	tabsMap.set('genres', {title: 'Genres'});
	tabsMap.set('tracks', {title: 'Tracks'});
	tabsMap.set('search', {title: 'Search'});

	//based on: https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
	function padNumber(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function getJson(url){
		return fetch(url).then((response)=>{ 
			return response.json();
		});
	}

	function getTracksForItem(itemType, itemId){
		const url = `${apiUrlBase}${itemType}/${itemId}/tracks`;
		return getJson(url);
	}

	function loadModel(modelName){
		const url = `${apiUrlBase}${modelName}`;
		getJson(url).then((json)=>{
			app[modelName] = json.data;
		});
	}

	//only compares arrays of primitives (strings, booleans, numbers)
	//also will fail on NaN
	function areArraysEqual(a1, a2){
		if(a1 === a2){
			return true;
		}
		if(a1 === null || a2 === null){
			return false;
		}
		if(a1.length !== a2.length){
			return false;
		}

		for(let i=0;i<a1.length;i++){
			if(a1[i] !== a2[i]){
				return false;
			}
		}

		return true;
	}
	function isEmpty(value){
		return value === null || value === undefined;
	}

	var app = new Vue({
		el: '#app',
		mounted: function(){
			loadModel('artists');
			loadModel('genres');
			loadModel('composers');
			this.loadMoreTracks();
		},
		data: {
			tracks: null,
			artists: null,
			genres: null,
			composers: null,
			displayTracks: [],
			//activeTrackTrackList: the track list when the currently playing track started playing
			//this is so that when pages are changed, the correct next track will play
			activeTrackTrackList: [],
			activeTrack: null,
			isPlaying: false,
			elapsedTime: 0,
			tabs: tabsMap,
			path: ['artists'],
			searchQuery: '',
			searchResults: [],
		},
		computed: {
			artistsMap: function(){
				let ret = new Map();
				if(this.artists !== null){
					this.artists.forEach((item)=>{
						ret.set(item.id, item);
					});
				}
				return ret;
			},
			genresMap: function(){
				let ret = new Map();
				if(this.genres !== null){
					this.genres.forEach((item)=>{
						ret.set(item.id, item);
					});
				}
				return ret;
			},
			composersMap: function(){
				let ret = new Map();
				if(this.composers !== null){
					this.composers.forEach((item)=>{
						ret.set(item.id, item);
					});
				}
				return ret;
			},
			activeTab: function(){
				return this.path[0];
			},
			activePage: function(){
				return this.path[this.path.length - 1];
			},
			isInitialLoadComplete: function(){
				return this.tracks !== null && this.artists !== null && this.genres !== null && this.composers !== null;
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
					default:
						return this.activePageTracks;
				}
			},
			itemColumns: function(){
				if(this.isTrackPage){
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
				return [{title: 'Name', sort: 'name'}];
			},
			isTrackPage: function(){
				return this.activePage === 'tracks' || this.activePage === 'search';
			},
		},
		methods: {
			changeTab: function(tabKey){
				this.path = [tabKey];
			},
			loadMoreTracks: function(){
				let offset = this.tracks ? this.tracks.length : false;

				let url = `${apiUrlBase}tracks?limit=100`;
				if(offset){
					url = `${url}&offset=${offset}`;
				}
				getJson(url).then((json)=>{
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
				displayTracks = [];
				getTracksForItem(this.activeTab, item.id).then((json)=>{
					this.displayTracks = json.data;
				});
				this.path = this.path.concat([item.id, 'tracks']);
			},
			play: function(track, trackIndex, trackPath){
				if(!this.activeTrack || !areArraysEqual(this.activeTrack.path, trackPath)){
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
				this.items = this.items.sort((a,b)=>{
					let value1 = a[key];
					let value2 = b[key];
					if(isEmpty(value1) && isEmpty(value2)){
						return 0;
					}
					else if(isEmpty(value1)){
						return -1;
					}
					else if(isEmpty(value2)){
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
			},
			itemFields: function(item){
				if(this.isTrackPage){
					let track = item;
					let genre = track.genre_id !== null ? this.genresMap.get(track.genre_id).name : '';
					let composer = track.composer_id !== null ? this.composersMap.get(track.composer_id).name : '';
					return [
						track.title,
						this.artistsMap.get(track.artist_id).name,
						track.album_title,
						this.formatTrackLength(track.length),
						genre,
						composer,
						track.bit_rate,
						track.play_count,
						track.date_added,
					];
				}
				return [item.name];
			},
			formatTrackLength: function(trackLength){
				let hours = 0;
				let totalSeconds = Math.floor(trackLength / 1000);
				let minutes = Math.floor(totalSeconds / 60);
				if(minutes > 59){
					hours = Math.floor(minutes / 60);
					minutes = minutes % 60;
				}
				let seconds = totalSeconds % 60;
				if(hours > 0){
					return `${hours}:${padNumber(minutes, 2)}:${padNumber(seconds, 2)}`;
				}
				return `${minutes}:${padNumber(seconds, 2)}`;
			},
			searchForTracks: function(){
				const searchUrl = `${apiUrlBase}search/tracks?q=${encodeURIComponent(this.searchQuery)}`;
				getJson(searchUrl).then((json)=>{
					this.searchResults = json.data;
					this.path = ['search'];
				});
			},
		}
	});

})(Vue, window.fetch);