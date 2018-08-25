<template>
	<div class="app-container">
		<div class="search-bar-container">
			<input type="search" placeholder="Search tracks" v-model="searchQuery" @keyup.enter="searchForTracks" aria-labelledby="Search tracks"/>
			<button @click="searchForTracks" :disabled="!searchQuery" class="outline-button">Search</button>
		</div>
		<Nav-Tabs :search-query="searchQuery" />
		<router-view v-if="isInitialLoadComplete" :load-more-tracks="loadMoreTracks" :is-track-playing="isTrackPlaying" :sort-items-func="sortItems" :play-track="playTrack" :get-items="getItems" :artists-map="artistsMap" :albums-map="albumsMap" :genres-map="genresMap" :composers-map="composersMap" />
		<div class="media-controls-container">
			<template v-if="hasActiveTrack">
				<div class="active-track-container marquee">
					<div class="active-track-display">
						<span>{{activeTrackDisplay}}</span>
						<span>{{activeTrackDisplay}}</span>
					</div>
				</div>
				<div class="track-time">
					<span>{{formatTrackLength(elapsedTime)}}</span>
					<span>{{formatTrackLength(activeTrack.track.length)}}</span>
				</div>
				<div class="media-controls">
					<button class="button-previous media-controls-button media-controls-button-rounded" @click="previousButtonAction" :disabled="!hasPreviousTrack" title="Play previous track">&#9194;</button>
					<button class="button-play media-controls-button" :class="{'is-paused': !isPlaying}" @click="playButtonAction" :disabled="!activeTrack" :title="playButtonTitle">
						<span v-html="playButtonText"></span>
					</button>
					<button class="button-next media-controls-button media-controls-button-rounded" @click="playNextTrack" :disabled="!hasNextTrack" title="Play next track">&#9193;</button>
				</div>
			</template>
			<div v-if="!isInitialLoadComplete">Loading&hellip;</div>
		</div>
	</div>
</template>

<script>
import infiniteScroll from 'vue-infinite-scroll';
import TrackList from './track-list.vue';
import NavTabs from './nav-tabs.vue';
import Models from '../models';
import ApiHelpers from '../api-helpers';
import Util from '../util';

let audio = null;
let elapsedTimeTimer = null;

export default {
	name: 'Seren-App',
	directives: {infiniteScroll},
	components: {
		TrackList,
		NavTabs,
	},
	created(){
		audio = new Audio();
		audio.addEventListener('ended', ()=>{
			if(this.hasNextTrack){
				this.playNextTrack();
			}
			else{
				this.displayTrackStopped();
			}
		});

		Promise.all([
			Models.loadModelAndMap('artists', this, this.artistsMap),
			Models.loadModelAndMap('genres', this, this.genresMap),
			Models.loadModelAndMap('composers', this, this.composersMap),
			Models.loadModelAndMap('albums', this, this.albumsMap),
			this.loadMoreTracks(),
		]).then(()=>{
			this.isInitialLoadComplete = true;
		});
	},
	data(){
		return {
			tracks: [],
			artists: [],
			albums: [],
			genres: [],
			composers: [],
			artistsMap: new Map(),
			albumsMap: new Map(),
			genresMap: new Map(),
			composersMap: new Map(),
			displayTracks: [],
			//activeTrackTrackList: the track list when the currently playing track started playing
			//this is so that when pages are changed, the correct next track will play
			activeTrackTrackList: [],
			//initializing activeTrack to empty objects simplifies logic since we can reduce null checks
			activeTrack: {
				track: {},
			},
			isPlaying: false,
			elapsedTime: 0,
			searchQuery: '',
			searchResults: [],
			savedSearchResultsQuery: '',
			isInitialLoadComplete: false,
		};
	},
	computed: {
		hasActiveTrack(){
			return 'id' in this.activeTrack.track;
		},
		activeTrackDisplay(){
			if(!this.hasActiveTrack){
				return '';
			}
			let ret = `${this.activeTrack.track.title} - ${this.artistsMap.get(this.activeTrack.track.artist_id).name}`;
			if(this.activeTrack.track.album_title){
				ret = `${ret} - ${this.activeTrack.track.album_title}`;
			}
			return ret;
		},
		playButtonTitle(){
			if(this.isPlaying){
				return `Pause ${this.activeTrack.track.title}`;
			}
			else if(this.hasActiveTrack){
				return `Play ${this.activeTrack.track.title}`;
			}
			return 'Play track';

		},
		playButtonText(){
			if(this.isPlaying){
				return '&#9646;&#9646;';
			}
			return '&#9654;';
		},
		hasPreviousTrack(){
			return this.hasActiveTrack && this.activeTrack.index > 0;
		},
		hasNextTrack(){
			return this.hasActiveTrack && this.activeTrack.index < this.activeTrackTrackList.length - 1;
		},
	},
	methods: {
		getItems(key){
			if(typeof key === 'object'){
				const apiUrl = `${ApiHelpers.apiUrlBase}/${key.apiPath}`;
				return ApiHelpers.getJson(apiUrl);
			}

			if(key === 'searchTracks'){
				const searchQuery = this.$route.query.q;
				if(!searchQuery || this.savedSearchResultsQuery === searchQuery){
					const searchResults = !searchQuery ? [] : this.searchResults;
					return new Promise((resolve, reject)=>{
						resolve(searchResults);
					});
				}
				const searchUrl = `${ApiHelpers.apiUrlBase}/search/tracks?q=${encodeURIComponent(searchQuery)}`;
				return ApiHelpers.getJson(searchUrl).then((searchResults)=>{
					this.searchResults = searchResults;
					this.savedSearchResultsQuery = searchQuery;
					return this.searchResults;
				});
			}

			return new Promise((resolve, reject)=>{
				resolve(this[key]);
			});
		},
		loadMoreTracks(){
			const offset = this.tracks ? this.tracks.length : false;

			let url = `${ApiHelpers.apiUrlBase}/tracks?limit=100`;
			if(offset){
				url = `${url}&offset=${offset}`;
			}
			return ApiHelpers.getJson(url).then((tracks)=>{
				if(offset){
					this.tracks = this.tracks.concat(tracks);
				}
				else{
					this.tracks = tracks;
				}
			});
		},
		isTrackPlaying(track){
			return this.isPlaying && this.hasActiveTrack && track.id === this.activeTrack.track.id;
		},
		playTrack(track, trackIndex, items){
			this.play(track, trackIndex, this.$route.path, items);
		},
		play(track, trackIndex, trackPath, items){
			if(this.activeTrack.path !== trackPath){
				//if we are on tracks page, we only want to reference the tracks,
				//otherwise we want to copy it
				if(this.$route.name === 'tracksIndex'){
					this.activeTrackTrackList = this.tracks;
				}
				else{
					this.activeTrackTrackList = items.slice();
				}
			}
			if(this.activeTrack.track.id !== track.id){
				this.activeTrack = {
					track: track,
					path: trackPath,
					index: trackIndex,
				};
				this.isPlaying = true;
				this.elapsedTime = 0;
				// const mediaUrl = '/media/' + encodeURI(track.file_path).replace('#', '%23').replace('?', '%3F');
				const mediaUrl = '/media/' + escape(track.file_path);
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
		stop(){
			this.displayTrackStopped();
			audio.pause();
		},
		displayTrackStopped(){
			this.isPlaying = false;
			clearInterval(elapsedTimeTimer);
			elapsedTimeTimer = null;
		},
		playButtonAction(){
			if(this.isPlaying){
				this.stop();
			}
			else{
				this.play(this.activeTrack.track, this.activeTrack.index, this.activeTrack.path);
			}
		},
		previousButtonAction(){
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
		playPreviousTrack(){
			if(!this.hasPreviousTrack){
				return;
			}
			let trackIndex = this.activeTrack.index - 1;
			let track = this.activeTrackTrackList[trackIndex];
			this.play(track, trackIndex, this.activeTrack.path);
		},
		playNextTrack(){
			if(!this.hasNextTrack){
				return;
			}
			let trackIndex = this.activeTrack.index + 1;
			let track = this.activeTrackTrackList[trackIndex];
			this.play(track, trackIndex, this.activeTrack.path);
		},
		sortItems(items, key, sortAsc){
			const relatedFields = {
				artists: this.artistsMap,
				genres: this.genresMap,
				composers: this.composersMap,
			};
			Models.sortItems(items, key, sortAsc, relatedFields);
		},
		formatTrackLength: Util.formatTrackLength,
		searchForTracks(){
			this.$router.push({name: 'searchTracks', query: { q: this.searchQuery }});
		},
	}
};
</script>