(function(Vue, fetch){
	var apiUrlBase = '/api/';

	var artists = null;
	var artistsMap = null;

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

	function formatTrackLength(trackLength){
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
	}

	function getJson(url){
		return fetch(url).then((response)=>{ 
			return response.json();
		});
	}

	function getTracks(offset){
		let url = `${apiUrlBase}tracks?limit=100`;
		if(offset){
			url = `${url}&offset=${offset}`;
		}
		getJson(url).then((json)=>{
			if(offset){
				app.tracks = app.tracks.concat(json.data);
			}
			else{
				app.tracks = json.data;
			}
		});
	}

	function getArtists(){
		let url = `${apiUrlBase}artists`;
		getJson(url).then((json)=>{
			artists = json.data;

			artistsMap = new Map();

			artists.forEach((artist)=>{
				artistsMap.set(artist.id, artist);
			});
		});
	}

	function isEmpty(value){
		return value === null || value === undefined;
	}

	var app = new Vue({
		el: '#app',
		mounted: function(){
			getArtists();
			getTracks();
		},
		data: {
			tracks: null,
			activeTrack: null,
			activeTrackIndex: null,
			isPlaying: false,
			elapsedTime: 0,
			tabs: tabsMap,
			activeTab: 'tracks',
		},
		computed: {
			isInitialLoadComplete: function(){
				return this.tracks !== null && artists !== null;
			},
			isInfiniteScrollDisabled: function(){
				return !this.isInitialLoadComplete || this.activeTab !== 'tracks';
			},
			activeTrackDisplay: function(){
				if(!this.activeTrack){
					return '';
				}
				let ret = `${this.activeTrack.title} - ${this.activeTrack.artist}`;
				if(this.activeTrack.album_title){
					ret = `${ret} - ${this.activeTrack.album_title}`;
				}
				return ret;
			},
			hasPreviousTrack: function(){
				return this.activeTrack && this.activeTrackIndex > 0;
			},
			hasNextTrack: function(){
				return this.activeTrack && this.activeTrackIndex < this.tracks.length - 1;
			},
			items: function(){
				if(this.activeTab === 'artists'){
					return artists;
				}
				return this.tracks;
			},
			itemColumns: function(){
				if(this.activeTab === 'tracks'){
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
				this.activeTab = tabKey;
			},
			loadMoreTracks: function(){
				getTracks(this.tracks.length);
			},
			isTrackPlaying: function(track){
				return this.isPlaying && this.activeTrack && track.id === this.activeTrack.id;
			},
			play: function(track, trackIndex){
				if(!this.activeTrack || this.activeTrack.id !== track.id){
					this.activeTrack = track;
					this.activeTrackIndex = trackIndex;
					this.isPlaying = true;
					this.elapsedTime = 0;
					let mediaUrl = '/media/' + encodeURI(track.file_path);
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
				let trackIndex = this.activeTrackIndex - 1;
				let track = this.tracks[trackIndex];
				this.play(track, trackIndex);
			},
			playNextTrack: function(){
				if(!this.hasNextTrack){
					return;
				}
				let trackIndex = this.activeTrackIndex + 1;
				let track = this.tracks[trackIndex];
				this.play(track, trackIndex);
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
				if(this.activeTab == 'tracks'){
					let track = item;
					return [
						track.title,
						artistsMap.get(track.artist_id).name,
						track.album_title,
						formatTrackLength(track.length),
						track.genre,
						track.composer,
						track.bit_rate,
						track.play_count,
						track.date_added,
					];
				}
				return [item.name];
			},
		}
	});

})(Vue, window.fetch);