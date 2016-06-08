/*
 * IP detection to reroute customers to their locale
 * https://issues.teslamotors.com/browse/WEB-31125
 *
 * For new sessions, automatically open the change country dialog if the IP country != locale
 * Remember (i.e., don’t ask again) for the remainder of the session
 * Store in cookie and automatically route once for future sessions
 * Limit to homepage for now, but we may extend it to all pages if it works well
 */
$(function(){
    var parsed_url = Drupal.behaviors.common.parseURL(location.href);
    if(parsed_url.params.redirect == 'no'){
        Drupal.behaviors.common.createCookie('ip_lookup_desired_locale', Drupal.settings.tesla.locale, 360, true);
        Drupal.behaviors.common.createCookie('ip-lookup-have-i-asked', 'Y', .04, true);
    }
    else {
        IPlookup.init();
    }
});

(function(IPlookup, $, undefined) {
    "use strict";

    IPlookup.init = function(){
        var desired_locale = Drupal.behaviors.common.readCookie('ip_lookup_desired_locale');
        var actual_locale = Drupal.settings.tesla.locale;

        if(desired_locale == null && typeof geoip2 !== 'undefined'){
            geoip2.city(IPlookup.createCookies, IPlookup.onError);
        }

        if(actual_locale != desired_locale && desired_locale != null) {
            IPlookup.rerouteToSavedLocale(desired_locale);
        }
        else {
            if(typeof geoip2 !== 'undefined'){
                geoip2.city(IPlookup.onSuccess, IPlookup.onError);
            }
        }
    }
    IPlookup.createCookies = function(data){
        var detected_country = data.country.iso_code;
        var website_country = Drupal.settings.tesla.country;

        if(detected_country == website_country){
            Drupal.behaviors.common.createCookie('ip_lookup_desired_locale', Drupal.settings.tesla.locale, 360, true);
            Drupal.behaviors.common.createCookie('ip-lookup-have-i-asked', 'Y', .04, true);
        }
    }
    IPlookup.onSuccess = function(data){
        var detected_country = data.country.iso_code;
        var website_country = Drupal.settings.tesla.country;

        if(detected_country != website_country){
            if(!IPlookup.haveIAlreadyAsked()) {
                IPlookup.toggleLocaleSelector();
            }
        }
    }
    IPlookup.onError = function(data){
        debug.log('could not detect country, do nothing');
    }
    IPlookup.toggleLocaleSelector = function(){
        $("#locale-modal").modal();
    }
    IPlookup.haveIAlreadyAsked = function(){
        var response = false;
        if(Drupal.behaviors.common.readCookie('ip-lookup-have-i-asked') == 'Y'){
            response = true;
        }
        else {
            Drupal.behaviors.common.createCookie('ip-lookup-have-i-asked', 'Y', .04, true);
        }
        return response;
    }
    IPlookup.rerouteToSavedLocale = function(prefix){
        if(prefix == 'en_US'){
            prefix = '/';
        }
        else if(prefix == 'ja_JP'){
            prefix = '/jp/';
        }
        else {
            prefix = '/' + prefix + '/';
        }

        if(Drupal.settings.tesla.isFront){
            var url = Drupal.settings.tesla.baseUrl + prefix;
        }
        else {
            var url = Drupal.settings.tesla.baseUrl + prefix + Drupal.settings.tesla.pathAlias;
        }

        var parsed_url = Drupal.behaviors.common.parseURL(window.location);
        if(parsed_url.query == ''){
            url = url + '?redirect=no';
        }
        else {
            url = url + parsed_url.query + '&redirect=no';
        }
        window.location.assign(url);
    }

} (window.IPlookup = window.IPlookup || {}, jQuery));