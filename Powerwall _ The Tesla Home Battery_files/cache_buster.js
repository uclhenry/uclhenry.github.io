function cache_buster_set_cookie(days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "expires="+date.toGMTString()+";";
    }
    else var expires = "";
    document.cookie = "NO_CACHE=Y;"+expires+"path=/";
}