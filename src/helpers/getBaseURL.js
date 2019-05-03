// TODO fix so this works when youre in a subdomain
export default function getBaseURL(href) {
    let arr = href.split('/');
    let ourArr = arr.splice(0, 3);
    return ourArr.join('/');
}
