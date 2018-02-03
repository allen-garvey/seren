(function(Vue, fetch){
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

	//based on: https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
	function padNumber(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function getTracks(offset){
		let url = '/api/tracks?limit=100';
		if(offset){
			url = `${url}&offset=${offset}`;
		}
		fetch(url).then((response)=>{ 
			return response.json();
		}).then((json)=>{
			if(offset){
				app.tracks = app.tracks.concat(json.data);
			}
			else{
				app.tracks = json.data;
			}
		});
	}

	function isEmpty(value){
		return value === null || value === undefined;
	}

	var app = new Vue({
		el: '#app',
		mounted: function(){
			getTracks();
		},
		data: {
			tracks: null,
			activeTrack: null,
			activeTrackIndex: null,
			isPlaying: false,
			elapsedTime: 0,
		},
		computed: {
			areTracksLoaded: function(){
				return this.tracks !== null;
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
				return this.areTracksLoaded && this.activeTrack && this.activeTrackIndex > 0;
			},
			hasNextTrack: function(){
				return this.areTracksLoaded && this.activeTrack && this.activeTrackIndex < this.tracks.length - 1;
			},
		},
		methods: {
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
			sortTracks: function(key){
				this.tracks = this.tracks.sort((a,b)=>{
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
		}
	});

})(Vue, window.fetch);