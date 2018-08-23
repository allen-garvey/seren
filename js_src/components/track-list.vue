<template>
    <table class="track-list" v-infinite-scroll="loadMoreTracks" infinite-scroll-distance="10" infinite-scroll-disabled="isInfiniteScrollDisabled" infinite-scroll-immediate-check="false">
        <thead>
            <th class="col-play-btn"></th>
            <template v-for="(column, i) in itemColumns">
                <th :key="i" @click="sortItems(column.sort)">{{column.title}}</th>
            </template>
        </thead>
        <tbody>
            <template v-for="(item, i) in items">
                <tr @dblclick="doubleClickRowAction(item, i)" :key="i">
                    <td @click="play(item, i)" class="col-play-btn track-play-button" :class="{'pause': isTrackPlaying(item)}"></td>
                    <template v-for="(field, j) in itemFields(item)">
                        <td :key="`${item.id}${i}${field}${j}`">{{field}}</td>
                    </template>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<script>
import infiniteScroll from 'vue-infinite-scroll';

export default {
	name: 'Track-List',
    directives: {infiniteScroll},
    props: {
        loadMoreTracks: {
            type: Function,
            required: true,
        },
        itemColumns: {
            type: Array,
            required: true,
        },
        itemFields: {
            type: Function,
            required: true,
        },
        isTrackPlaying: {
            type: Function,
            required: true,
        },
        items: {
            // type: Array, //can be null
            required: true,
        },
        sortItemsFunc: {
            type: Function,
            required: true,
        },
        playTrack: {
            type: Function,
            required: true,
        },
        doubleClickRowAction: {
            type: Function,
            required: true,
        },
        isInfiniteScrollDisabled: {
            type: Boolean,
            required: true,
        },
    },
	created(){

	},
	data(){
		return {
			previousSortKey: null,
			sortAsc: true,
		};
	},
	computed: {
	},
	methods: {
		sortItems: function(key){
			if(key !== this.previousSortKey){
				this.sortAsc = true;
			}
			else{
				this.sortAsc = !this.sortAsc;
			}
			this.previousSortKey = key;
            this.sortItemsFunc(key, this.sortAsc);
		},
	}
};
</script>