export default function stringifyQueryMap(map) {
    const ret = [];
    for (let d in map) {
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(map[d]));
    }
    return ret.join('&');
}