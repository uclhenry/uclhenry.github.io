/*  Localization specific code goes here
    Requires accounting.min.js
*/
var Tesla = Tesla || {};

// List of countries flagged as EU other (see: tesla.locale.inc)
var euOtherCountries = ['BG', 'CZ', 'EE', 'GI', 'GR', 'HU', 'LV', 'LI', 'LT', 'MC', 'PL', 'PT', 'RO', 'RU', 'SM', 'SK', 'SI', 'ES', 'TR'];
// WEB-12091 - supercharging map determine region by country code
// arrays used by regionByCountryCode function below
var euCountries = ['AD','AL','AT','BA','BE','BG','BY','CH','CY','CZ','DE','DK','EE','ES','FI','FO','FR','GB','GG','GI','GR','HR','HU','IE','IM','IS','IT','JE','LI','LT','LU','LV','MC','MD','MK','MT','NL','NO','PL','PT','RO','RU','SE','SI','SJ','SK','SM','TR','UA','UK','VA','YU','EU'];
var naCountries = ['US','CA','MX'];
var apacCountries = ['AU','CN','HK','JP','MO'];
var kmCountries = new Array("de_AT", "de_CH", "de_DE", "en_AT", "en_AU", "en_BE", "en_CA", "en_CH", "en_DK", "en_EU", "en_HK", "en_IT", "en_NL", "es_ES", "es_MX", "fr_BE", "fr_CH", "fr_FR", "it_CH", "it_IT", "jp", "nl_NL", "no_NO", "fr_CA", "zh_HK", "en_MO", "zh_MO");
var validLocales = new Array("de_DE", "de_AT", "en_AU", "nl_BE", "fr_CA", "fr_CH", "it_CH", "de_CH", "da_DK", "en_HK", "es_MX", "fr_BE", "fr_FR", "it_IT", "jp", "nl_NL", "no_NO", "en_CA", "cn", "en_GB", "sv_SE", "fi_FI", "zh_HK", "en_MO", "zh_MO", "de_LU", "fr_LU");

var currency_locale = {
         'AD': {
             currency:'EUR',
             symbol: '&#8364;',
             position: 'postfix',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'AT': {
             currency:'EUR',
             symbol: '&#8364;',
             format : "%v %s",
             thousand: '.',
             decimal: ','
         },
         'en_AT': {
             currency:'EUR',
             symbol: '&#8364;',
             format : "%v %s",
             thousand: '.',
             decimal: ','
         },
         'de_AT': {
             currency:'EUR',
             symbol: '\u20AC',
             format : "%v %s",
             thousand: '.',
             decimal: ','
         },
         'AU': {
             currency:'AUD',
             symbol: '$',
             format : "%s%v"
         },
         'en_AU': {
             currency:'AUD',
             symbol: '$',
             format : "%s%v"
         },
         'BE': {
             currency:'EUR',
             symbol: '&#8364;',
             format : "%s %v",
             thousand: '.',
             decimal: ','
         },
         'en_BE': {
             currency:'EUR',
             symbol: '&#8364;',
             format : "%s %v",
             thousand: '.',
             decimal: ','
         },
         'fr_BE': {
             currency:'EUR',
             symbol: '\u20AC',
             format : "%v %s",
             thousand: '.',
             decimal: ','
         },
         'nl_BE': {
             currency:'EUR',
             symbol: '\u20AC',
             format : "%s %v",
             thousand: '.',
             decimal: ','
         },
         'CA': {
             currency: 'CAD',
             symbol:'$',
             format: "%s%v",
             decimal: ".",
             thousand: ","
         },
         'en_CA': {
             currency: 'CAD',
             symbol:'$'
         },
         'fr_CA': {
             currency: 'CAD',
             symbol:'$',
             format : "%v %s",
             thousand: ' ',
             decimal: ','
         },
         'CH': {
             currency: 'CHF',
             symbol:'CHF',
             format : "%s %v",
             thousand: "'",
             decimal: '.'
         },
         'de_CH': {
             currency: 'CHF',
             symbol:'CHF',
             format : "%s %v",
             thousand: "'",
             decimal: '.'
         },
         'fr_CH': {
             currency: 'CHF',
             symbol:'CHF',
             format : "%s %v",
             thousand: "'",
             decimal: '.'
         },
         'it_CH': {
             currency: 'CHF',
             symbol:'CHF',
             format : "%s %v",
             thousand: "'",
             decimal: '.'
         },
         'CN': {
             currency:'CNY',
             symbol: '&yen;',
             thousand: ',',
             decimal: '.',
             format: "%s %v"
         },
         'zh_CN': {
             currency:'CNY',
             symbol: '&yen;',
             thousand: ',',
             decimal: '.',
             format: "%s %v"
         },
         'CY': {
             currency:'EUR',
             symbol: '&#8364;',
             position: 'postfix',
             format : "%s %v",
             thousand: '.',
             decimal: ','
         },
         'DE': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'de_DE': {
             currency:'EUR',
             symbol: '\u20AC',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'DK': {
             currency:'DKK',
             symbol: 'kr.',
             thousand: '.',
             decimal: ',',
             format : "%s %v"
         },
         'en_DK': {
             currency:'DKK',
             symbol: 'kr.',
             thousand: '.',
             decimal: ',',
             format : "%s %v"
         },
         'da_DK': {
             currency:'DKK',
             symbol: 'kr.',
             thousand: '.',
             decimal: ',',
             format : "%s %v"
         },
         'EE': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'postfix',
             format : "%v %s"
         },
         'ES': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'prefix',
             format : "%s %v"
         },
         'EU': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'prefix',
             format : "%s %v"
         },
         'en_EU': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'prefix',
             format : "%s %v"
         },
         'FI': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'postfix',
             format : "%s %v"
         },
         'fi_FI': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'postfix',
             format : "%s %v"
         },
         'FR': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: ' ',
             decimal: ',',
             format : "%v %s"
         },
         'fr_FR': {
             currency:'EUR',
             symbol: '\u20AC',
             thousand: ' ',
             decimal: ',',
             format : "%v %s"
         },
         'GB': {
             currency:'GBP',
             symbol: '&pound;',
             thousand: ","
         },
         'en_GB': {
             currency:'GBP',
             symbol: '\u00A3',
             thousand: ","
         },
         'GR': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'postfix',
             format : "%v %s"
         },
         'HK': {
             currency:'HKD',
             symbol: '$'
         },
         'en_HK': {
             currency:'HKD',
             symbol: 'HK$ ',
             position: 'prefix'
//             format : "%s %v"
         },
         'IE': {
             currency:'EUR',
             symbol: '&#8364;'
         },
         'IT': {
             currency:'EUR',
             symbol: '&#8364;',
             format: '%s %v',
             thousand: '.',
             decimal: ','
         },
         'it_IT': {
             currency:'EUR',
             symbol: '&#8364;',
             format: '%s %v',
             thousand: '.',
             decimal: ','
         },
         'LU': {
             currency:'EUR',
             symbol: '&#8364;',
             position: 'prefix',
             thousand: '.',
             decimal: ','
         },
         'de_LU': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'fr_LU': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: ' ',
             decimal: ',',
             format : "%v %s"
         },
         'MC': {
             currency:'EUR',
             symbol: '&#8364;',
             position: 'postfix',
             thousand: ' ',
             decimal: ',',
             format : "%v %s"
         },
         'MO': {
             currency:'HKD',
             symbol: 'HK$',
             position: 'prefix'
         },
         'en_MO': {
             currency:'HKD',
             symbol: 'HK$',
             position: 'prefix'
         },
         'zh_MO': {
             currency:'HKD',
             symbol: 'HK$',
             position: 'prefix'
         },
         'MT': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ','
         },
         'NL': {
             currency:'EUR',
             symbol: '&#8364;',
             format: '%s %v',
             thousand: '.',
             decimal: ','
         },
         'nl_NL': {
             currency:'EUR',
             symbol: '\u20AC',
             format: '%s %v',
             thousand: '.',
             decimal: ','
         },
         'NO': {
             currency:'NOK',
             symbol: 'kr.',
             thousand: '.',
             decimal: ',',
             format : "%s %v"
         },
         'no_NO': {
             currency:'NOK',
             symbol: 'kr.',
             thousand: '.',
             decimal: ',',
             format : "%s %v"
         },
         'sv_SE': {
             currency:'SEK',
             symbol: 'kr',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'SE': {
             currency:'SEK',
             symbol: 'kr',
             thousand: '.',
             decimal: ',',
             format : "%v %s"
         },
         'PT': {
             currency:'EUR',
             symbol: '&#8364;',
             thousand: '.',
             decimal: ',',
             position: 'postfix',
             format : "%v %s"
         },
         'JP': {
             currency:'JPY',
             symbol: '&yen; '
         },
         'ja_JP': {
             currency:'JPY',
             symbol: '&yen; '
         },
         'US': {
             currency:'USD',
             symbol: '$',
             format: "%s%v",
             decimal: ".",
             thousand: ","
         },
         'en_US': {
             currency:'USD',
             symbol: '$'
         }
     };

Tesla.formatMoney =  function(value, region, precision, showCurrSymbol) {

  var currency_default, attrname;
   /* These are taken from the acountancy defaults, apart from currency */
   currency_default = {
      currency: 'USD', // This is custom, we add it.
      symbol: "$",   // default currency symbol is '$'
      format : "%s%v",  // controls output: %s = symbol, %v = value (can be object, see docs)
      decimal : ".",    // decimal point separator
      thousand : ",",   // thousands separator
      precision : 2,    // decimal places
      grouping : 3    // digit grouping (not implemented yet)
    };

  // Set currency defaults in the accounting.settings.currency object.
  if (!region || region == 'default') {
    for (var def_attr in currency_default) {
      accounting.settings.currency[def_attr] = currency_default[def_attr];
    }
  }
  else { // Read from the currency_locale object
    for (var reg_attr in currency_locale[region]) {
       accounting.settings.currency[reg_attr] = currency_locale[region][reg_attr];
            // Show currency symbol or not
        if ( showCurrSymbol == false ){
            accounting.settings.currency["symbol"] = "";
        }
    }
  }
  // set decimal places if sent as an arg, otherwise, use default setting.
  accounting.settings.currency.precision = typeof precision == 'undefined' ? accounting.settings.currency.precision : precision;

  // Run our values through the accounting formatMoney method.
  if (value || value === 0) {
    return accounting.formatMoney(value, accounting.settings.currency);
  }

  return "";

};

/** WEB-12091 - supercharging map determine region by country code
 * using country arrays set above.
 * @countryCode => passed in from page based on Drupal.settings.tesla.country
 * euCountries => array of EU countries
 * naCountries => array of NA countries
 * apacCountries => array of APAC countries
 * returns a default of "north_america"
 */
Tesla.regionByCountryCode = function(countryCode) {

    var region;
    if (_.indexOf(euCountries,countryCode) >= 0) {
        region = 'europe';
    }
    else if (_.indexOf(naCountries,countryCode) >= 0) {
        region = 'north_america';
    }
    else if (_.indexOf(apacCountries,countryCode) >= 0) {
        region = 'asia_pacific';
    }
    else {
        region = 'north_america';
    }

    return region;
};

function localizeCost(c, floating_points) {
  var i18n_c, i18n_c_string;
  if (Drupal.settings.tesla) { // Added on Document ready in common.js
    if (Drupal.settings.tesla.locale === 'fr_CA') {
      i18n_c = Number(c).toFixed(floating_points).replace('.',',');
      i18n_c_string = i18n_c + " $";
    } else {
      i18n_c = Number(c).toFixed(floating_points);
      i18n_c_string = "$" + i18n_c;
    }
  }
  return i18n_c_string;
}

function switchToMiles(dm) {
  if (Drupal.settings.tesla.locale === 'fr_CA' || Drupal.settings.tesla.locale === 'en_CA') {
	dm = dm / 1.6
  }
  return dm;
}

/**
*
* Return a formatted data based on locale
* @param m {number} ~ Month for a given locale
* @param day {number} ~ Day for a given month in a specific locale
* @param year {number} ~ Year for a given locale
* @param flags {object} ~ Determiners for how to filter and return the formatted data
*        type {boolean} ~ Return type. Default: string. Options: array | object
*
**/

function localizeDate(m, day, year, flags) {

    var teslaRegion = '';

    if ( Drupal.settings.tesla.locale == 'de_CH' ) {
        teslaRegion = 'DE';
    }
    else if ( Drupal.settings.tesla.locale == 'fr_CH' ) {
        teslaRegion = 'FR';
    }
    else if ( Drupal.settings.tesla.locale == 'it_CH' ) {
        teslaRegion = 'IT';
    }
    else {
        teslaRegion = Drupal.settings.tesla.region;
    }

    flags = flags || {};

    var curCarInfo = curCarInfo || {};

    switch(teslaRegion) {
    case 'CA':
      if (Drupal.settings.tesla.locale == 'fr_CA') {
        monthArray = {1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril", 5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août", 9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"};
    	month = monthArray[m];
        curCarInfo.date = day+" "+month+" "+year;
      }
      else {
        monthArray = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
        month = monthArray[m];
        curCarInfo.date = day+" "+month+", "+year;
      }
      break;
    case 'FR':
      monthArray = {1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril", 5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août", 9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"};
      month = monthArray[m];
      curCarInfo.date = day+" "+month+" "+year;
      break;
    case 'EN':
      monthArray = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
      month = monthArray[m];
      curCarInfo.date = day+" "+month+", "+year;
      break;
    case 'DE':
      monthArray = {1: "Januar", 2: "Februar", 3: "März", 4: "April", 5: "Mai", 6: "Juni", 7: "Juli", 8: "August", 9: "September", 10: "October", 11: "November", 12: "Dezember"};
      month = monthArray[m];
      curCarInfo.date = day+". "+month+" "+year;
      break;
    case 'IT':
      monthArray = {1: "January", 2: "Febbraio", 3: "Marzo", 4: "Aprile", 5: "May", 6: "Giugno", 7: "Luglio", 8: "August", 9: "September", 10: "Ottobre", 11: "Novembre", 12: "Dicembre"};
      month = monthArray[m];
      curCarInfo.date = day+" "+month+" "+year;
      break;
    case 'JP':
      monthArray = {1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12"};
      month = monthArray[m];
      curCarInfo.date = year+"年"+month+"月"+day+"日";
      break;
    case 'MX':
      monthArray = {1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"};
      month = monthArray[m];
      curCarInfo.date = day+" "+month+", "+year;
      break;
    case 'NO':
      monthArray = {1: "Januar", 2: "februar", 3: "Mars", 4: "April", 5: "May", 6: "June", 7: "Juli", 8: "August", 9: "September", 10: "Oktober", 11: "November", 12: "Desember"};
      month = monthArray[m];
      curCarInfo.date = day+". "+month+" "+year;
      break;
    case 'NL':
      monthArray = {1: "Januari", 2: "Februari", 3: "March", 4: "April", 5: "Mei", 6: "June", 7: "July", 8: "August", 9: "September", 10: "Oktober", 11: "November", 12: "December"};
      month = monthArray[m];
      curCarInfo.date = day+" "+month+" "+year;
      break;
    default:
      monthArray = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
      month = monthArray[m];
      curCarInfo.date = month + " " + day + ", " + year;
    }

    if ( flags["type"] && flags["type"] == "array" ) {
        formatted_data = curCarInfo.date.replace(/,/g, "");
        return formatted_data.split(" ");
    }
    return curCarInfo.date;

}

function localizeDay(m, day, year) {

    var teslaRegion = '';

    if ( Drupal.settings.tesla.locale == 'de_CH' ) {
        teslaRegion = 'DE';
    }
    else if ( Drupal.settings.tesla.locale == 'fr_CH' ) {
        teslaRegion = 'FR';
    }
    else if ( Drupal.settings.tesla.locale == 'it_CH' ) {
        teslaRegion = 'IT';
    }
    else {
        teslaRegion = Drupal.settings.tesla.region;
    }

    var d = new Date(parseInt(year), parseInt(m)-1, parseInt(day));
    var monthArray = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
    var month = monthArray[m];
    var weekday = new Array(7);
    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n = weekday[d.getDay()];
    return n + ", " + month + " " + day;
}

/**
 * Is EU other country
 *
 * @param string Country code
 * @return boolean Is EU other country
 */
Tesla.isEuOtherCountry =  function(countryCode) {
    return jQuery.inArray(countryCode, euOtherCountries) > -1;
};

/**
 * Maps the saved locale to the user country
 * Used when manipulating TC.userCountry for EU other countries where mismatch may occur
 *
 * @param string Country code as specificed by TC.userCountry
 * @param string Locale saved in the configuration
 * @return string Country code as specificed by TC.userCountry
 */
Tesla.mapSavedLocaleToUserCountry =  function(userCountry, savedLocale) {
    isEuOtherCountry = this.isEuOtherCountry(userCountry);
    // MAP LI country (for de_CH) to CH
    if (savedLocale == 'de_CH' && userCountry != 'CH' && isEuOtherCountry) {
        userCountry = 'CH';
    }
    // Map EU other countries
    else if (savedLocale == 'en_EU' && userCountry != 'EU' && isEuOtherCountry) {
        userCountry = 'EU';
    }
    return userCountry;
};

Tesla.isValidLocale = function(locale) {
    var isValidLocale = _.indexOf(validLocales,locale) >= 0 ? true : false;
    return isValidLocale;
};


/**
 * Following the five to six home rule, format money. Like this:
 * 11.5 -> 11 ;   11.6 -> 12
 */
Tesla.fiveToSixHomeFormat = function(num) {
    num = isNaN(num) || num === '' || num === null ? 0.00 : num;
    return Math.ceil((num / 10 - 0.05) * 10);
};

/**
 * Parse the locale from given domain and pathname
 * @param domain {string} the domain of the url
 * @param pathName {string} the pathname of the url
 * @return the locale parsed by given domain and pathname
 */
Tesla.getLocaleFromURL = function(domain, pathname) {
    if (!domain || !pathname) {
        return '';
    }
    var isChina = /tesla\.cn/.test(domain);
    var localePrefix = pathname.match(/^\/([a-z]{2}_[A-Z]{2}|jp|cn)/);
    if (!localePrefix) {
        return isChina ? 'zh_CN' : 'en_US';
    }
    else if (localePrefix[1] === 'jp') {
        return 'ja_JP';
    }
    else {
        return localePrefix[1];
    }
};

/**
 * Get the locale prefix by given country code
 * @param countryCode {string} two letters country code
 * @return the localePrefix by given countryCode
 */
Tesla.getLocaleByCountryCode = function(countryCode) {
    var localePrefix = '';
    if (Tesla.isEuOtherCountry(countryCode)) {
        localePrefix = 'en_EU';
    }
    else if(countryCode === 'CN') {
        localePrefix = 'zh_CN';
    }
    else if (countryCode === 'JP') {
        localePrefix = 'ja_JP';
    }
    else {
        _.each(validLocales, function(locale) {
            if (locale.indexOf(countryCode) > -1) {
                localePrefix = locale;
            }
        });
        localePrefix = (localePrefix != '') ? localePrefix : 'en_US';
    };
    debug.info("Tesla.getLocaleByCountryCode ",localePrefix);
    return localePrefix;
};

/**
 * Get the locale prefix by given country code
 * @param countryCode {string} two letters country code
 * @return the localePrefix by given countryCode
 */
Tesla.getLocalePrefixByCountryCode = function(countryCode) {
    var localePrefix = '';
    if (Tesla.isEuOtherCountry(countryCode)) {
        localePrefix = 'en_EU';
    }
    //else if (['CN', 'US'].indexOf(countryCode) > -1) {
    else if(countryCode === 'CN') {
        if (/tesla\.cn/.test(location.host)) {
            return '';
        }
        else {
            return 'cn';
        }
    }
    else if(countryCode === 'US') {
        localePrefix = '';
    }
    else if (countryCode === 'JP') {
        localePrefix = 'jp';
    }
    else {
        var localePrefix = '';
        _.each(validLocales, function(locale) {
            if (locale.indexOf(countryCode) > -1) {
                localePrefix = locale;
            }
        });
    }
    return localePrefix;
};

/*
This is a function to format numbers depending on the thousand seperator
*/
Tesla.formatNumberPerLocale = function(number,seperator){
    number += '';
    splitNumber = number.split('.');
    number1 = splitNumber[0];
    number2 = splitNumber.length > 1 ? '.' + splitNumber[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(number1)) {
        number1 = number1.replace(rgx, '$1' + seperator + '$2');
    }
    return number1 + number2;
};

/* These are the moment.js i18n config objects.
 *  We will load them into Drupal.settings.momentConfig.
 */
var momentConfig = {};

momentConfig.de_DE = {
    months : "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
    monthsShort : "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
    weekdays : "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
    weekdaysShort : "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
    weekdaysMin : "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
    longDateFormat : {
        LT: "H:mm U\\hr",
        L : "DD/MM/YYYY",
        LL : "D. MMMM YYYY",
        LLL : "D. MMMM YYYY LT",
        LLLL : "dddd, D. MMMM YYYY LT"
    },
    calendar : {
        sameDay: "[Heute um] LT",
        sameElse: "L",
        nextDay: '[Morgen um] LT',
        nextWeek: 'dddd [um] LT',
        lastDay: '[Gestern um] LT',
        lastWeek: '[letzten] dddd [um] LT'
    },
    relativeTime : {
        future : "in %s",
        past : "vor %s",
        s : "ein paar Sekunden",
        m : "einer Minute",
        mm : "%d Minuten",
        h : "einer Stunde",
        hh : "%d Stunden",
        d : "einem Tag",
        dd : "%d Tagen",
        M : "einem Monat",
        MM : "%d Monaten",
        y : "einem Jahr",
        yy : "%d Jahren"
    },
    ordinal : function (number) {
        return '.';
    }
};

momentConfig.de_AT = {
    months : "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
    monthsShort : "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
    weekdays : "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
    weekdaysShort : "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
    weekdaysMin : "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
    longDateFormat : {
        LT: "H:mm U\\hr",
        L : "DD/MM/YYYY",
        LL : "D. MMMM YYYY",
        LLL : "D. MMMM YYYY LT",
        LLLL : "dddd, D. MMMM YYYY LT"
    },
    calendar : {
        sameDay: "[Heute um] LT",
        sameElse: "L",
        nextDay: '[Morgen um] LT',
        nextWeek: 'dddd [um] LT',
        lastDay: '[Gestern um] LT',
        lastWeek: '[letzten] dddd [um] LT'
    },
    relativeTime : {
        future : "in %s",
        past : "vor %s",
        s : "ein paar Sekunden",
        m : "einer Minute",
        mm : "%d Minuten",
        h : "einer Stunde",
        hh : "%d Stunden",
        d : "einem Tag",
        dd : "%d Tagen",
        M : "einem Monat",
        MM : "%d Monaten",
        y : "einem Jahr",
        yy : "%d Jahren"
    },
    ordinal : function (number) {
        return '.';
    }
};

momentConfig.de_CH = {
    months : "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
    monthsShort : "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
    weekdays : "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
    weekdaysShort : "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
    weekdaysMin : "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
    longDateFormat : {
        LT: "H:mm U\\hr",
        L : "DD/MM/YYYY",
        LL : "D. MMMM YYYY",
        LLL : "D. MMMM YYYY LT",
        LLLL : "dddd, D. MMMM YYYY LT"
    },
    calendar : {
        sameDay: "[Heute um] LT",
        sameElse: "L",
        nextDay: '[Morgen um] LT',
        nextWeek: 'dddd [um] LT',
        lastDay: '[Gestern um] LT',
        lastWeek: '[letzten] dddd [um] LT'
    },
    relativeTime : {
        future : "in %s",
        past : "vor %s",
        s : "ein paar Sekunden",
        m : "einer Minute",
        mm : "%d Minuten",
        h : "einer Stunde",
        hh : "%d Stunden",
        d : "einem Tag",
        dd : "%d Tagen",
        M : "einem Monat",
        MM : "%d Monaten",
        y : "einem Jahr",
        yy : "%d Jahren"
    },
    ordinal : function (number) {
        return '.';
    }
};


momentConfig.en_BE = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }
};

momentConfig.en_DK = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }
};
momentConfig.en_GB = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }
};

momentConfig.en_US = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "MM/DD/YYYY",
        LL : "MMMM D YYYY",
        LLL : "MMMM D YYYY LT",
        LLLL : "dddd, MMMM D YYYY LT"
    },
    meridiem : function (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }

};

momentConfig.fr_FR = {
    months : "Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Décembre".split("_"),
    monthsShort : "Jan_Fev_Mar_Avr_Mai_Juin_Juil_Aou_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi".split("_"),
    weekdaysShort : "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    longDateFormat : {
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY HH:mm",
        LLLL : "dddd, D MMMM YYYY HH:mm"
    },
    meridiem : {
        AM : 'AM',
        am : 'am',
        PM : 'PM',
        pm : 'pm'
    },
    calendar : {
        sameDay: "[Ajourd'hui à] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [denier à] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "il y a %s",
        s : "secondes",
        m : "une minute",
        mm : "%d minutes",
        h : "une heure",
        hh : "%d heures",
        d : "un jour",
        dd : "%d jours",
        M : "un mois",
        MM : "%d mois",
        y : "une année",
        yy : "%d années"
    },
    ordinal : function (number) {
      return (~~ (number % 100 / 10) === 1) ? 'er' : 'ème';
    }
};

momentConfig.fr_CH = {
    months : "Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Décembre".split("_"),
    monthsShort : "Jan_Fev_Mar_Avr_Mai_Juin_Juil_Aou_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi".split("_"),
    weekdaysShort : "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    longDateFormat : {
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY HH:mm",
        LLLL : "dddd, D MMMM YYYY HH:mm"
    },
    meridiem : {
        AM : 'AM',
        am : 'am',
        PM : 'PM',
        pm : 'pm'
    },
    calendar : {
        sameDay: "[Ajourd'hui à] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [denier à] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "il y a %s",
        s : "secondes",
        m : "une minute",
        mm : "%d minutes",
        h : "une heure",
        hh : "%d heures",
        d : "un jour",
        dd : "%d jours",
        M : "un mois",
        MM : "%d mois",
        y : "une année",
        yy : "%d années"
    },
    ordinal : function (number) {
      return (~~ (number % 100 / 10) === 1) ? 'er' : 'ème';
    }
};

momentConfig.it_CH = {
    months : "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
    monthsShort : "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
    weekdays : "Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),
    weekdaysShort : "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
    weekdaysMin : "D_L_Ma_Me_G_V_S".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay: '[Oggi alle] LT',
        nextDay: '[Domani alle] LT',
        nextWeek: 'dddd [alle] LT',
        lastDay: '[Ieri alle] LT',
        lastWeek: '[lo scorso] dddd [alle] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s fa",
        s : "secondi",
        m : "un minuto",
        mm : "%d minuti",
        h : "un'ora",
        hh : "%d ore",
        d : "un giorno",
        dd : "%d giorni",
        M : "un mese",
        MM : "%d mesi",
        y : "un anno",
        yy : "%d anni"
    },
    ordinal: function () {
        return 'º';
    }
};

momentConfig.it_IT = {
    months : "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
    monthsShort : "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
    weekdays : "Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),
    weekdaysShort : "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
    weekdaysMin : "D_L_Ma_Me_G_V_S".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay: '[Oggi alle] LT',
        nextDay: '[Domani alle] LT',
        nextWeek: 'dddd [alle] LT',
        lastDay: '[Ieri alle] LT',
        lastWeek: '[lo scorso] dddd [alle] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s fa",
        s : "secondi",
        m : "un minuto",
        mm : "%d minuti",
        h : "un'ora",
        hh : "%d ore",
        d : "un giorno",
        dd : "%d giorni",
        M : "un mese",
        MM : "%d mesi",
        y : "un anno",
        yy : "%d anni"
    },
    ordinal: function () {
        return 'º';
    }
};

momentConfig.nl_NL = {
    months : "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
    monthsShort : function (m, format) {
        var monthsShortWithDots = "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_");
        var monthsShortWithoutDots = "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_");
        if (/-MMM-/.test(format)) {
            return monthsShortWithoutDots[m.month()];
        } else {
            return monthsShortWithDots[m.month()];
        }
    },
    weekdays : "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
    weekdaysShort : "zo._ma._di._wo._do._vr._za.".split("_"),
    weekdaysMin : "Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
    },
    calendar : {
        sameDay: '[Vandaag om] LT',
        nextDay: '[Morgen om] LT',
        nextWeek: 'dddd [om] LT',
        lastDay: '[Gisteren om] LT',
        lastWeek: '[afgelopen] dddd [om] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "over %s",
        past : "%s geleden",
        s : "een paar seconden",
        m : "één minuut",
        mm : "%d minuten",
        h : "één uur",
        hh : "%d uur",
        d : "één dag",
        dd : "%d dagen",
        M : "één maand",
        MM : "%d maanden",
        y : "één jaar",
        yy : "%d jaar"
    },
    ordinal : function (number) {
        return (number === 1 || number === 8 || number >= 20) ? 'ste' : 'de';
    }
};

momentConfig.no_NO = {
    months : "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
    monthsShort : "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
    weekdays : "søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),
    weekdaysShort : "søn_man_tir_ons_tor_fre_lør".split("_"),
    weekdaysMin : "sø_ma_ti_on_to_fr_lø".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
    },
    calendar : {
        sameDay: '[I dag klokken] LT',
        nextDay: '[I morgen klokken] LT',
        nextWeek: 'dddd [klokken] LT',
        lastDay: '[I går klokken] LT',
        lastWeek: '[Forrige] dddd [klokken] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "om %s",
        past : "for %s siden",
        s : "noen sekunder",
        m : "ett minutt",
        mm : "%d minutter",
        h : "en time",
        hh : "%d timer",
        d : "en dag",
        dd : "%d dager",
        M : "en måned",
        MM : "%d måneder",
        y : "ett år",
        yy : "%d år"
    },
    ordinal : function (number) {
        return '.';
    }
};

momentConfig.en_CA = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "MM/DD/YYYY",
        LL : "MMMM D YYYY",
        LLL : "MMMM D YYYY LT",
        LLLL : "dddd, MMMM D YYYY LT"
    },
    meridiem : function (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }

};

momentConfig.fr_CA = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "MM/DD/YYYY",
        LL : "MMMM D YYYY",
        LLL : "MMMM D YYYY LT",
        LLLL : "dddd, MMMM D YYYY LT"
    },
    meridiem : function (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }

};

momentConfig.en_EU = {
    months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    longDateFormat : {
        LT : "h:mm A",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[last] dddd [at] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s ago",
        s : "a few seconds",
        m : "a minute",
        mm : "%d minutes",
        h : "an hour",
        hh : "%d hours",
        d : "a day",
        dd : "%d days",
        M : "a month",
        MM : "%d months",
        y : "a year",
        yy : "%d years"
    },
    ordinal : function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    }
};

if ((typeof(Drupal) !== "undefined") && Drupal.settings) {
    Drupal.settings.momentConfig = momentConfig;
}

