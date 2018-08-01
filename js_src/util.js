//based on: https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function padNumber(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function isEmpty(value){
	return value === null || value === undefined;
}

function formatUtcDateToUs(date){
	if(!date){
		return date;
	}
	const dateSplit = date.split('-');
	return `${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`;
}

function formatTrackLength(trackLength){
    const totalSeconds = Math.floor(trackLength / 1000);
    let hours = 0;
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

function sortItems(items, sortKey, sortAsc){
    return items.sort((a,b)=>{
        let value1 = a[sortKey];
        let value2 = b[sortKey];
        if(!sortAsc){
            value1 = b[sortKey];
            value2 = a[sortKey];
        }
        if(isEmpty(value1)){
            if(isEmpty(value2)){
                return 0;
            }
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
}

module.exports = {
    isEmpty,
    formatUtcDateToUs,
    formatTrackLength,
    sortItems,
};