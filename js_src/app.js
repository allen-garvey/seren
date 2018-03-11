(function(Vue, fetch){
	var apiUrlBase = '/api/';

	var audio = new Audio();
	audio.addEventListener('ended', function(){
		if(app.hasNextTrack){
			app.playNextTrack();
		}
		else{
			app.displayTrackStopped();
		}
	});

	var elapsedTimeTimer = null;

	//navigation tabs
	//note: as of now Maps are not reactive in Vue
	var tabsMap = new Map();
	tabsMap.set('artists', {title: 'Artists'});
	tabsMap.set('albums', {title: 'Albums'});
	tabsMap.set('composers', {title: 'Composers'});
	tabsMap.set('genres', {title: 'Genres'});
	tabsMap.set('tracks', {title: 'Tracks'});

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
		let url = `${apiUrlBase}${itemType}/${itemId}/tracks`;
		return getJson(url);
	}

	function getArtists(){
		let url = `${apiUrlBase}artists`;
		getJson(url).then((json)=>{
			app.artists = json.data;

			app.artistsMap = new Map();

			app.artists.forEach((artist)=>{
				app.artistsMap.set(artist.id, artist);
			});
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
			getArtists();
			this.loadMoreTracks();
		},
		data: {
			tracks: null,
			artists: null,
			artistsMap: null,
			displayTracks: [],
			//activeTrackTrackList: the track list when the currently playing track started playing
			//this is so that when pages are changed, the correct next track will play
			activeTrackTrackList: [],
			activeTrack: null,
			isPlaying: false,
			elapsedTime: 0,
			tabs: tabsMap,
			path: ['tracks'],
		},
		computed: {
			activeTab: function(){
				return this.path[0];
			},
			activePage: function(){
				return this.path[this.path.length - 1];
			},
			isInitialLoadComplete: function(){
				return this.tracks !== null && this.artists !== null && this.artistsMap !== null;
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
				return this.tracks;	
			},
			items: function(){
				if(this.activeTab === 'tracks' || this.activePage === 'tracks'){
					return this.activePageTracks;
				}
				switch(this.activeTab){
					case 'artists':
						return this.artists;
					default:
						return this.activePageTracks;
				}
			},
			itemColumns: function(){
				if(this.activePage === 'tracks'){
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
				return this.isPlaying && this.activeTrack && track.id === this.activeTrack.id;
			},
			doubleClickRowAction: function(item, rowIndex){
				if(this.activePage === 'tracks'){
					this.play(item, rowIndex);
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
			//isCycle is when previous or next buttons are pressed
			play: function(track, trackIndex, isCycle=false){
				if(!isCycle && (!this.activeTrack || !areArraysEqual(this.activeTrack.path, this.path))){
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
						path: this.path.slice(),
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
				else if(!this.isPlaying){
					this.isPlaying = true;
					audio.play();
				}
				else{
					this.displayTrackStopped();
					audio.pause();
				}
				if(this.isPlaying){
					elapsedTimeTimer = setInterval(()=>{ 
						this.elapsedTime = audio.currentTime * 1000;
					}, 1000);
				}
			},
			displayTrackStopped: function(){
				this.isPlaying = false;
				clearInterval(elapsedTimeTimer);
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
				this.play(track, trackIndex, true);
			},
			playNextTrack: function(){
				if(!this.hasNextTrack){
					return;
				}
				let trackIndex = this.activeTrack.index + 1;
				let track = this.activeTrackTrackList[trackIndex];
				this.play(track, trackIndex, true);
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
				if(this.activePage === 'tracks'){
					let track = item;
					return [
						track.title,
						this.artistsMap.get(track.artist_id).name,
						track.album_title,
						this.formatTrackLength(track.length),
						track.genre,
						track.composer,
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
		}
	});

})(Vue, window.fetch);