$ = jQuery;

Tesla = window.Tesla || {};

/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
  if (!window.console) {
    window.console = {};
  }
  // union of Chrome, FF, IE, and Safari console methods
  var m = [
    "log", "info", "warn", "error", "debug", "trace", "dir", "group",
    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
  ];
  // define undefined methods as noops to prevent errors
  for (var i = 0; i < m.length; i++) {
    if (!window.console[m[i]]) {
      window.console[m[i]] = function() {};
    }
  }
})();

function log( str ) {
    debug.log( str );
}

var urlParams = {};

var webFormModal = null;

(function () {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

    while (e = r.exec(q))
       urlParams[d(e[1])] = d(e[2]);
})();


// Commenting this section out because touchscreen.css does not exist on the D7 side <eritchey 2015-02-26>
/* Touchscreen modifications */
// (function () {

//     var isVehicleBrowser = (navigator.userAgent.toLowerCase().indexOf('qtcarbrowser') !== -1);

//     if (isVehicleBrowser) {
//         document.write("<link rel=\"stylesheet\" href=\"\/sites\/all\/themes\/tesla\/styles\/touchscreen.css?20140414\" \/>");
//     }

// }());

/*
 *  Checks to see if it's a Smartling country. If so, Smartling takes care
 *  of the translation.
 */
Tesla.Smartling = Tesla.Smartling || {};
Tesla.Smartling.Countries = [ "da_DK", "fr_BE", "nl_BE", "sv_SE", "zh_CN", "cn" ];

Tesla.Smartling.getVariable = ( function( smartling, other ) {
    return ( ( Tesla.Smartling.Countries.indexOf( Drupal.settings.tesla.locale ) != -1 ) ? smartling : other );
} );

function include(filename) {
    var head = document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';
    head.appendChild(script);
}


// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers).
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function() {
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}


/*
 * Cookie functions
 */
function createCookie(name,value,days,domain) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";

    var this_domain = '';
    if (domain) {
        this_domain = ";domain="+domain
    }

    document.cookie = name+"="+value+expires+"; path=/"+this_domain;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}


/*
 * Generic window opening function
 */
function openWin(url, name, opts) {
    document.domain = 'teslamotors.com';
    if (!opts) {
        opts = "";
    }
    return window.open(url, name, opts);
}

// D7-TODO: Check to see if this is used, if not remove it
$(function() {
    /* Featured owner photostrip hovers */
    if ($('div.view-featured-owners-nq').length) {
        $('div.view-featured-owners-nq div.views-field-field-photo-fid img').mouseenter(
            function() {
                $('#clone', $(this).parents()).remove(); //gc
                var owner = $(this).parents('div.views-row');
                var pos = getOrdinalPosition(owner);
                var x_offset = pos * 75;
                // clone the div as a popup
                var clone = owner.clone();
                clone.addClass('hovered');
                clone.attr('id','clone');
                clone.css('left', x_offset);
                clone.mouseout(function() {
                    $(this).remove();
                });
                clone.appendTo('#featured-owners .view-content');
            });
    }
});

/*
 * Initialize store page photo galleries
 */
function initGalleries() {
    if (window.Galleria && Drupal.settings.tesla.flickr_api_key) {
        Galleria.loadTheme('/sites/all/themes/tesla/js/galleria/src/themes/classic/galleria.classic.js');
        var flickr = new Galleria.Flickr(Drupal.settings.tesla.flickr_api_key); // initialize the plugin

        $('#gallery-index li a').click(function() {
            $('#gallery-index li').removeClass('selected');
            $(this).parent().addClass('selected');
            var href = $(this).attr('href').split('=');
            var set_id = href[1];
            flickr.getSet(set_id, {size:'medium'}, function(data) {
                $('#galleria').galleria({
                    data_source: data
                });
            });
            return false;
        });

        // trigger click on first gallery item
        $('#gallery-index li.first a').trigger('click');
    }
}

// delay-remove fade status messages (from e.g. region picker)
function fadeAlerts () {
    $('.messages.fade').fadeOut(400);

}

// given an element, figure out which oridinal position it has
// among its siblings
function getOrdinalPosition(el) {
    var position = -1;
    // we have to do this because el.siblings() does not return the element itself
    var siblings = el.parent().children();
    $.each(siblings, function(key, value) {
    if (value == el[0]) {
        position = key;
        return false;
    }
    });
    return position;
}


/*
 * Initialize analytics custom events
 * D7-TODO: Refactor all analytics calls for D7
 */
function initAnalyticsEvents() {
    // Event tracking for the Home page and Model S
    // Order, Test Drive, and Call Me buttons
    if ($('#page-homepage').length) {
        $('#page-homepage #models-landing-buttons a.red').click(function() {
            debug.log('Track Event for Homepage order button');
            ga('send', 'event',  'OrderButton', 'Click - Home Page');
        });
        $('#page-homepage #models-landing-buttons a.grey:first').click(function() {
            debug.log('Track Event for Homepage test drive button');
            ga('send', 'event', 'TestDriveButton', 'Click - Home Page');
        });
        $('#page-homepage #models-landing-buttons a.grey.models-requestcallback-button').click(function() {
            debug.log('Track Event for Homepage Call Me button');
            ga('send', 'event', 'CallMeButton', 'Click - Home Page');
        });
    }

    if ($('#page-models').length) {
        $('#page-models #models-landing-buttons a.red').click(function() {
            debug.log('Track Event for Model S Page order button');
            ga('send', 'event', 'OrderButton', 'Click - Model S Page');
        });
        $('#page-models #models-landing-buttons a.grey:first').click(function() {
            debug.log('Track Event for Model S Page test drive button');
            ga('send', 'event', 'TestDriveButton', 'Click - Model S Page');
        });
        $('#page-models #models-landing-buttons a.grey.models-requestcallback-button').click(function() {
            debug.log('Track Event for Model S Page Call Me button');
            ga('send', 'event', 'CallMeButton', 'Click - Model S Page');
        });
    }
    // End event tracking for the Home page and Model S


    $('.page-own a#request-callback').click(function() {
        debug.log("Track pageview for /own/callback_form");
        ga('send', 'pageview', '/own/callback_form');
    });

    $('body#page-goelectric-incentives a#request-callback').click(function() {
        debug.log("Track pageview for /incentives/callback_form");
        ga('send', 'pageview', '/incentives/callback_form');
    });

    $('#store-body a.schedule-button').click(function() {
        debug.log("Track pageview for /store/appointment_form");
        ga('send', 'pageview', '/store/appointment_form');
    });

    $('#store-body a.callback-button').click(function() {
        debug.log("Track pageview for /store/callback_form");
        ga('send', 'pageview', '/store/callback_form');
    });

    $('body#page-goelectric #hero-action .replace-text').click(function() {
        debug.log("Track pageview for /video/goelectric_v1");
        ga('send', 'pageview', '/video/goelectric_v1');
    });

    if ($('body#page-roadster').length) {
        // Buy button in Roadster page slider
        $('#page-roadster #buy .button a').click(function() {
            debug.log("Track pageview for /roadster/buy_click");
            ga('send', 'pageview', '/roadster/buy_click');
        });

        // Appt button in Roadster page slider
        $('#page-roadster #drive .button a').click(function() {
            debug.log("Track pageview for /roadster/appt_click");
            ga('send', 'pageview', '/roadster/appt_click');
        });

        // Roadster experience video
        $('#page-roadster #experience .overlay a').click(function() {
            debug.log("Track pageview for /video/roadster/experience_v1");
            ga('send', 'pageview', '/video/roadster/experience_v1');
        });

        // Roadster interior video
        $('#page-roadster #vision .overlay a').click(function() {
            debug.log("Track pageview for /video/roadster/interior_v1");
            ga('send', 'pageview', '/video/roadster/interior_v1');
        });

    }

    if ($('body#page-models').length) {
        // Reserve button in Model S page slider
        $('#page-models #reserve .button a').click(function() {
            debug.log("Track pageview for /models/reserve_click");
            ga('send', 'pageview', '/models/reserve_click');
        });

        // Discuss button in Model S page slider
        $('#page-models #discuss .button a').click(function() {
            debug.log("Track pageview for /models/discuss_click");
            ga('send', 'pageview', '/models/discuss_click');
        });

        // Model S video
        $('#page-models #experience .overlay a').click(function() {
            debug.log("Track pageview for /video/models/thefuture_v1");
            ga('send', 'pageview', '/video/models/thefuture_v1');
        });
    }

    // Buy Flow
    // Report model code
    if ($('body#page-own').length && !$('body').hasClass('i18n-zh_CN')) {
        var modelcode = $('input:radio[name=modelcode]:checked').val();
        debug.log("Track pageview for /own/" + modelcode);
        ga('send', 'pageview', '/own/' + modelcode);
    }

    // Mytesla Profile page
    if ($('body#page-mytesla-profile').length && !$('body').hasClass('i18n-zh_CN')) {
        $('#accept_delivery').find(".confirm-button").on("click", function() {
            debug.log('Track Event for Accept Delivery Button');
            ga('send', 'event', 'AcceptDeliveryButton', 'Click - Mytesla Profile Page');
        });

        $('.accept-terms', '#hero').find(".modal-confirm").on("click", function() {
            debug.log('Track Event for Accept Terms Button');
            ga('send', 'event', 'AcceptTermsButton', 'Click - Mytesla Profile Page');
        });
    }

}

/*
 * attach analytics events for webform submits
 */
function attachWebformAnalytics(form_id) {
    var _region = Drupal.settings.tesla.locale;

    switch (form_id) {
        case 'webform-client-form-119':
            // own/store/incentives call me back
            // Same form id is used on both store, own and incentives callback forms
            // need to figure out which one it is
            if ($('body').hasClass('node-type-teslastore')) {
                debug.log('Track pageview for store/callback_submit');
                ga('send', 'pageview', '/store/callback_submit');
            } else if ($('body').attr('id')=='page-goelectric-incentives') {
                debug.log('Track pageview for incentives/callback_submit');
                ga('send', 'pageview', '/incentives/callback_submit');
            } else {
                debug.log('Track pageview for own/callback_submit');
                ga('send', 'pageview', '/own/callback_submit');
            }
            break;
        case 'webform-client-form-3836':
            // test drive
            debug.log('Track pageview for testdrive_submit');
            ga('send', 'pageview', 'testdrive_submit');
            break;
        case 'webform-client-form-120':
            // store appt form
            debug.log('Track pageview for /store/appointment_submit');
            ga('send', 'pageview', '/store/appointment_submit');
            break;
        case 'webform-client-form-121':
            // store appt form
            debug.log('Track pageview for /event_submit');
            ga('send', 'pageview', '/event_submit');
            break;
        case 'webform-client-form-3974':
            // Newsletter signup
            debug.log('Track pageview for /newsletter_submit');
            ga('send', 'pageview', '/newsletter_submit');
            break;
        case 'webform-client-form-122':
            // Newsletter signup (US)
            debug.log('Track pageview for /newsletter_us_submit');
            ga('send', 'pageview', '/newsletter_us_submit');
            break;
        case 'webform-client-form-19198':
            var _testDriveThankyouUrl = '/' + _region + '/models/drive/thank-you';
            if (_region == 'en_US') {
                _testDriveThankyouUrl = '/models/drive/thank-you';
            }
            debug.log('Track pageview for ' + _testDriveThankyouUrl);
            ga('send', 'pageview', _testDriveThankyouUrl);
            break;
        case 'webform-client-form-60471':
            if ($('#' + form_id).attr('action').indexOf('features') !== -1) {
                debug.log('Track RequestTestDriveButton event "Submit - Model S Features Page" action');
                ga('send', 'event', 'RequestTestDriveButton', 'Submit - Model S Features Page');
            } else {
                debug.log('Track RequestTestDriveButton event "Submit - Model S Landing Page" action');
                ga('send', 'event', 'RequestTestDriveButton', 'Submit - Model S Landing Page');
            }
            break;
    }
}

/*
 * Make an anchor open in a new window
 */
function openLinkNewWindow(link) {
    if (link.length) {
        link.click(function() {
            openWin(link.attr('href'));
            return false;
        });
    }
}

/*
 * Perform any locale-specific tasks
 */
function attachLocaleHandlers() {
    // look for country/language code in body class. It will look something like 'i18n-ja_JP'
    var body_classes = $('body').attr('class').split(' ');
    var code = '';
    for (var i=0, l=body_classes.length; i<l; i++) {
        if (body_classes[i].indexOf('i18n') > -1) {
            code = body_classes[i].substr(5);
        }
    }
    // D7-TODO: Make sure JP links denoted below open in a new window
    // switch(code) {
    //     case 'ja_JP':
    //         // for Japan, open IR and careers links in a new window
    //         openLinkNewWindow($('.menu-17808 a'));
    //         openLinkNewWindow($('.menu-17807 a'));
    //         openLinkNewWindow($('ul.quicklinks li:first-child a'));
    //         break;
    // }

    // localize_events_rsvp();
}

/*
 * Localize "Join our email newsletter list".
 * D7-TODO: Remove when this form is refactored
 */
// function localize_events_rsvp() {

//   // Get localized label contents and strip colons.
//   var LocalLabel = $('form#webform-client-form-121 #webform-component-subscriptions__c label:first').html();
//   if (LocalLabel != null) {
//       LocalLabelNoColon = LocalLabel.replace(":", "");

//       // Get non-localized label contents and insert localized text.
//       var NonLocalLabel = $('form#webform-client-form-121 #edit-submitted-subscriptions--c-Tesla-Newsletter-wrapper label').html();
//       NewLocalLabel = NonLocalLabel.replace("Join our email newsletter list", LocalLabelNoColon);
//       $('form#webform-client-form-121 #edit-submitted-subscriptions--c-Tesla-Newsletter-wrapper label').html(NewLocalLabel);
//   }
// }


/**
 * Logic for checking and working with the desired-locale cookie
 */
function checkCookie() {
        var cookie_locale = readCookie('desired-locale');
        var show_blip_count = readCookie('show_blip_count');
        var tesla_locale = 'en_US'; //default to US
        var path = window.location.pathname;
        // debug.log("path = " + path);
        var parsed_url = parseURL(window.location.href);
        var path_array = parsed_url.segments;
        var path_length = path_array.length;
        var locale_path_index = -1;
        var locale_in_path = false;
        var locales = ['cn',
                       'da_DK', 'de_AT', 'de_CH', 'de_DE',
                       'en_AU', 'en_CA', 'en_EU', 'en_GB', 'en_HK', 'en_US', 'en_MO',
                       'fr_BE', 'fr_CA', 'fr_CH', 'fr_FR',
                       'it_CH', 'it_IT',
                       'nl_BE', 'nl_NL', 'no_NO',
                       'sv_SE',
                       'jp',
                       'zh_HK', 'zh_MO'];
        // see if we are on a locale path
        $.each(locales, function(index, value) {
            locale_path_index = $.inArray(value, path_array);
            if (locale_path_index != -1) {
                if (value == 'jp') {
                    value = 'ja_JP';
                }
                else if (value == 'cn') {
                    value = 'zh_CN';
                }
                tesla_locale = value;
                locale_in_path = true;
            }
        });
        // debug.log('tesla_locale = ' + tesla_locale);
        cookie_locale = (cookie_locale == null || cookie_locale == 'null') ? false : cookie_locale;
        // Only do the js redirect on the static homepage.
        if ((path_length == 1) && (locale_in_path || path == '/')) {
            // debug.log("Path in redirect section: " + path);
            if (cookie_locale && (cookie_locale != tesla_locale)) {
                // debug.log('Redirecting to cookie_locale...');
                var path_base = '';
                switch (cookie_locale) {
                    case 'en_US':
                        path_base = path_length > 1 ? path_base:'/';
                        break;
                    case 'ja_JP':
                        path_base = '/jp';
                        break;
                    case 'zh_CN':
                        path_base = '';
                        break;
                    default:
                        path_base = '/' + cookie_locale;
                }
                path_array = (locale_in_path != -1) ? path_array.slice(locale_in_path) : path_array;
                path_array.unshift(path_base);
                var cookie_redirect_url = path_array.join('/');
                var has_query_string = (cookie_redirect_url.indexOf('?') !== -1);
                // var has_trailing_slash = (cookie_redirect_url.slice(-1) == '/');
                // Ensure url has trailing slash to prevent locale prefix redirection loops
                if (!has_query_string && (cookie_redirect_url.slice(-1) !== '/')) {
                    cookie_redirect_url += '/';
                }
                // Inject no redirect flag for tesla.module / tesla.locale.inc php redirect to prevent loops
                cookie_redirect_url += (has_query_string ? '&' : '?') + 'redirect_from_js=1';
                debug.log("Should Redirect to: " + cookie_redirect_url);
                // window.location.href = cookie_redirect_url;
            }
        }

        // only do the ajax call if we don't have a cookie
        if (!cookie_locale) {
            cookie_locale = 'null';
            var get_data = {cookie:cookie_locale, page:path, t_locale:tesla_locale};
            var query_country_string = parsed_url.query != '' ? parsed_url.query.split('='):false;
            var query_country = query_country_string ? (query_country_string.slice(0,1) == '?country' ? query_country_string.slice(-1):false):false;
            if (query_country) {
                get_data.query_country = query_country;
            }
            // $.ajax({
            //     url:'/check_locale',
            //     data:get_data,
            //     cache: false,
            //     dataType: "json",
            //     success: function(data) {
            //                 var ip_locale = data.locale;
            //                 var market = data.market;
            //                 var new_locale_link = $('#locale_pop #locale_link');
            //                 if (data.show_blip && show_blip_count < 3) {
            //                     setTimeout(function() {
            //                         $('#locale_msg').text(data.locale_msg);
            //                         $('#locale_welcome').text(data.locale_welcome);
            //                         new_locale_link[0].href = data.new_path;
            //                         new_locale_link.text(data.locale_link);
            //                         new_locale_link.attr('rel', data.locale);
            //                         if (!new_locale_link.hasClass(data.locale)) {
            //                             new_locale_link.addClass(data.locale);
            //                         }
            //                         $('#locale_pop').slideDown('slow', function() {
            //                             var hide_blip = setTimeout(function() {
            //                                 $('#locale_pop').slideUp('slow', function() {
            //                                             var show_blip_count = readCookie('show_blip_count');
            //                                             if (!show_blip_count) {
            //                                                 createCookie('show_blip_count',1,360);
            //                                             }
            //                                             else if (show_blip_count < 3 ) {
            //                                                 var b_count = show_blip_count;
            //                                                 b_count ++;
            //                                                 eraseCookie('show_blip_count');
            //                                                 createCookie('show_blip_count',b_count,360);
            //                                             }
            //                                     });
            //                                 },10000);
            //                             $('#locale_pop').hover(function() {
            //                                 clearTimeout(hide_blip);
            //                                 },function() {
            //                                     setTimeout(function() {$('#locale_pop').slideUp();},10000);
            //                                 });
            //                         });
            //                     },1000);
            //                 }
            //             }
            // });
    }
}

/**
 * Pass in an array of image urls to pre-load
 */
Drupal.settings.imagecache = [];
function preLoadImages() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      Drupal.settings.imagecache.push(cacheImage);
    }
}

/**
 * Live Update elements to reflect a user's logged-in state.
 *
 * @Note ~
 *
 *     This method should be removed entirely if it's deprecated.
 *
 *     From the audit lens, it's only being called in the customer-facing
 *     Configurator and is not needed in that application.
 *
 *     Also, as a general rule of thumb or something to keep in mind,
 *     when setting `cache` to `false` on an XHR request, jQuery, in this case,
 *     will add a cache-buster to the URL. It's fine to apply this setting, but
 *     know why or the implications of it, specifically with performance.
 *
 *     - Manny, July 2015
 */
Tesla.updateLoggedInState = function() {
    $.ajax({
        url:window.location.pathname,
        cache:false,
        success:function(page) {
            $("#utils-menu").html($(page).find("#utils-menu").children());
        }
    });
}

// D7-TODO: Check for dashboard dependencies, if not remove
function showWebFormOverlay(webFormID, webFormWidth, webFormHeight) {
    var webFormOverlay = $('#'+ webFormID);
    var webFormOverlayCloseButton = $('#webform-close-button-'+ webFormID);

    if (!webFormModal) {
        $('#page').parent().prepend('<div id="webform-modal"></div>');
        webFormModal = $('#webform-modal');
    }

    webFormOverlay.find('.pane-content').css('max-height', webFormHeight - 20);
    webFormOverlay.find('.pane-content').css('padding-left', 14);
    webFormOverlay.find('.pane-content').css('margin-right', "18px");

    // Set the height of the webform modal to the document height and fade it in.
    webFormModal.stop().css({
        'display':      'block',
        'height':       $(document).height()
    }).animate({
        'opacity':      .6
    }, 500);

    // Show the webform overlay.
    webFormOverlay.stop().css({
        'display':      'block',
        'width':        webFormWidth,
        'max-height':       webFormHeight,
        'margin-left':  (980 - webFormWidth) / 2
    }).animate({
        'opacity':      1
    }, 1000);

    // Check for an existing close button, if there isnt one, create one.
    var webFormOverlayCloseButton = $('#webform-close-button-'+ webFormID);
    if (webFormOverlayCloseButton.length == 0) {
        var formIDString = "'"+ webFormID +"'";
        /*webFormOverlay.prepend('<a class="webform-overlay-close-button" id="webform-close-button-'+ webFormID +'" href="javascript:hideWebFormOverlay('+ formIDString +');">&nbsp;</a>');*/
         webFormOverlay.prepend('<a class="webform-overlay-close-button" id="webform-close-button-'+ webFormID +'" href="">&nbsp;</a>');

    }
}

function hideWebFormOverlay(webFormID) {
    var webFormOverlay = $('#'+ webFormID);
    var webFormOverlayCloseButton = $('#webform-close-button-'+ webFormID);
    resetForm(webFormOverlay);
    resetForm(webFormModal);

    webFormOverlay.stop().animate({
        'opacity':      0
    }, 500, function() {
        webFormOverlay.css('display', 'none');
    });

    webFormModal.stop().animate({
        'opacity':      0
    }, 500, function() {
        webFormModal.css('display', 'none');
    });
}

function resetForm($form) {
    $form.find('input:text, input:password, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox')
     .removeAttr('checked').removeAttr('selected');
}

// to call, use:
resetForm($('#myform')); // by id, recommended

// D7-TODO: Fix dependency issues
// Drupal.Ajax.plugins.shadowbox = function(hook, args) {
//     if (hook === 'init') {
//         $('form.webform-client-form').after('<div class="submit-progress"><img src="/sites/all/themes/tesla/images/ajax-loader-bar-transparent.gif" alt="Sending, please wait" /></div>');
//         //unbind ajax form handlers from original
//         function ajaxUnbindOriginal(sbInline) {
//             var f;
//             if (f = $('.ajax-form', sbInline.content)) {
//                 $("#"+f.attr('id'), document).each(function() {
//                     $(this).unbind('submit')
//                     .find('input[type=submit]').unbind('click');
//                 });
//             }
//         }
//         // and re-bind in SB context
//         function ajaxShadowbox(sbInline) {
//             Drupal.attachBehaviors($('#sb-player'));
//         }

//         Shadowbox.options['onFinish'] = ajaxShadowbox;
//         Shadowbox.options['onOpen'] = ajaxUnbindOriginal;

//         //disable keyboard overrides
//         Shadowbox.options['enableKeys'] = false;

//         return false;
//     }
//     else if (hook === 'submit') {
//         debug.log('shadowbox hook submit');
//         var thisForm = args.submitter.parents('form.webform-client-form');
//         args.submitter.hide();
//         thisForm.next('.submit-progress').show();
//     }
//     else if (hook === 'afterMessage') {
//         if (args.status == false) {
//             $('.submit-progress').hide();
//             args.local.submitter.show();
//         }
//         else {
//             // attach analytics after message is being displayed
//             var thisForm = args.local.submitter.parents('form.webform-client-form');
//             attachWebformAnalytics(thisForm.attr('id'));
//         }
//     }
//     else if (hook === 'redirect') {
//         if (args.status === true) {
//             // work around possible same origin policy issues introduced by CDN
//             var redirectPath = parseURL(args.redirect).path;
//             $.get(redirectPath, function (data) {

//         //disable keyboard overrides
//         Shadowbox.options['enableKeys'] = false;

//     return false;
//     }
//     else if (hook === 'submit') {
//         debug.log('shadowbox hook submit');
//         var thisForm = args.submitter.parents('form.webform-client-form');
//         args.submitter.hide();
//         thisForm.next('.submit-progress').show();
//         attachWebformAnalytics(thisForm.attr('id'));
//     }
//     else if (hook === 'afterMessage') {
//         if (args.status == false) {
//             $('.submit-progress').hide();
//             args.local.submitter.show();
//         }


//     }
//     else if (hook === 'redirect') {
//         if (args.status === true) {
//             // work around possible same origin policy issues introduced by CDN
//             var redirectPath = parseURL(args.redirect).path;
//             $.get(redirectPath, function (data) {

//                 var confMsg = $(data).find('.webform-confirmation');
//                 //  Localizing the confirmation message
//                 if (confMsg.length == 0) {
//                     return;
//                 }
//                 $( confMsg ).html( $( confMsg ).html()
//                     .replace( "Contact the Tesla Financing Team", Drupal.t( "Contact the Tesla Financing Team" ) )
//                     .replace( "Thanks!", Drupal.t( "Thanks!" ) )
//                     .replace( "We will get in touch with you shortly.", Drupal.t( "We will get in touch with you shortly." ) ) );

//                 $('.submit-progress').hide();

//                 args.local.form.parents('.node-webform').html(confMsg);
//             });
//         }
//     return false; //do not redirect
//     }
//     // there is no 'error' hook... condition logged to console, and the form seems to hang
//     else if (hook === 'error') {
//         $('.submit-progress').hide();
//         thisForm.replaceWith('<div class="webform-confirmation error">Sorry, there was an internal server error while submitting this form. Please try again later.</div>');

//     }
//     return true;
// };



/*
 * Do this stuff as soon as DOM is ready.
 */
$(document).ready(function() {

    if (typeof Drupal.settings.tesla == 'undefined') {
        Drupal.settings.tesla = new Object();
    }

    // set a deafult cookie for the buy flow based on locale
    var buy_flow_cookie = readCookie('buy_flow_locale');
    if (!buy_flow_cookie) {
        createCookie('buy_flow_locale',Drupal.settings.tesla.locale, 360);
    }

    //WEB-7462: set cookie if query string in the form '?advocate=menlopark' exists
    var qs = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    if (qs["advocate"]) {
        createCookie('advocate',qs["advocate"], 1, Drupal.settings.SharingCookies.AcrossDomain);
        cache_buster_set_cookie(1); //set cache buster cookie to equal length period to allow anonymous(not logged in) orders to be placed
    }
    if (qs['ip']) {
        createCookie('fake_ip', qs['ip'], 1, Drupal.settings.SharingCookies.AcrossDomain);
        cache_buster_set_cookie(1);
    }

    /**
     * main menu: secondary nav hovers
     */

    // Shop subnav link -- open in new window
    // $('.menu-16276 a').attr('target','_new');

    // Press page styling
    // $('#page-about-press #left-col .pane-title').addClass('style-header');

    // $('.typekit-badge').hide();

    // Helper function to get the language code.
    function getLangCode() {
        var body_classes = $('body').attr('class').split(' ');
        var code = '';
        for (var i=0, l=body_classes.length; i<l; i++) {
            if (body_classes[i].indexOf('i18n') > -1) {
                code = body_classes[i].substr(5);
            }
        }
        return code;
    }

    // hook google analytics events
    initAnalyticsEvents();

    // D7-TODO: Check comments to see if needed, if not please remove
    // Forms
    // $('form#comment-form input[type=submit]')
    // .after('<div class="submit-progress"><img src="/tesla_theme/assets/img/ajax-loader-bar.gif" alt="Loading, please wait" /></div>')
    // .click(function() {
    //         $(this).hide()
    //         .next('.submit-progress').show();
    // });

    // Country Selector
    $('#tesla-country-selector .form-submit').hide();
    $('#tesla-country-selector #edit-country').change(function() {
        if ($(this).val() !== '') {
            $('#tesla-country-selector').submit();
        }
    });

    // Phone number popup for en_GB
    if (Drupal.settings.tesla.locale === 'en_GB') {
        $("#edit-submitted-phone").after("<span id='submitted-phone-popup'>Please provide a number we can reach you on during office hours</span>");

        $("#edit-submitted-phone")
            .focus(function() {
                $(this).next('#submitted-phone-popup').fadeIn(300);
            })
            .blur(function() {
                $(this).next('#submitted-phone-popup').fadeOut(300);
            });
    }

    // Locale specific
    attachLocaleHandlers();

    // Fade alerts
    messagesBye = setTimeout(fadeAlerts, 4000);

    // D7-TODO: Move to go electric specific page
    // We don't want margins on all p tags. Sometimes the WYSIWYG adds p tags you don't need.
    $('#page-goelectric-charging #page_bottom .row-3-col div p:has(a img)').css('margin', '0');

    // Set cookies on based on locale-modal hrefs
    $('#locale-selector-d7').find('a').click(function () {
        if (window.location.hostname === $(this).get(0).hostname) {
            var desired_locale = $(this).attr('rel');
            createCookie('desired-locale', desired_locale, 360);
            createCookie('buy_flow_locale', desired_locale, 360);
        }
    });


    $('#locale_pop a.close').click(function() {
        var show_blip_count = readCookie('show_blip_count');
        if (!show_blip_count) {
            createCookie('show_blip_count',3,360);
        }
        else if (show_blip_count < 3 ) {
            eraseCookie('show_blip_count');
            createCookie('show_blip_count',3,360);
        }
        $('#locale_pop').slideUp();
        return false;
    });

    // start mytesla profile
    if ($('#page-user-me-edit').length || $('#page-user-edit').length) {

        var profile_error_msg = '';
        var profile_existing_msg = '';
        if ($('#email-match-error').length) {
            profile_existing_msg = $('#email-match-error').val();
        }
        // if there's an error on the page (default drupal) then grab it and show it elsewhere
        if ($('#messages-wrapper').length) {

            if ($('.messages.error').length) {
                profile_error_msg = $('.messages.error').html();
            }
            else if ($('.messages.status').length) {
                profile_error_msg = $('.messages.status').html();
            }
            else {
                profile_error_msg = Drupal.t('Your profile has been updated successfully.');
            }
            if (profile_error_msg != '') {
                if (profile_error_msg.indexOf('The changes have been saved') > 0) {
                    profile_error_msg = Drupal.t('Your profile has been updated successfully.');
                }
                if (profile_error_msg != '' && profile_existing_msg != '') {
                    profile_existing_msg = profile_error_msg + '<br/>' + profile_existing_msg;
                }
                else {
                    profile_existing_msg = profile_error_msg;
                }

            }
            $('#profile-msg-content-div').html(profile_existing_msg);
            if ($('#profile-msg-content-div').css('display') == 'none') {
                if ($('#profile-msg-content-div ul').length) {
                    $('#profile-msg-content-div ul').css('margin-bottom','0px');
                }
                $('#profile-msg-div').css('display','block');
                $('#profile-msg-content-div').fadeIn('slow');
            }
        // show save success message div
        }
        else if ($('#edit-profile-savesuccess').length) {
            $('#profile-msg-content-div').html($('#edit-profile-savesuccess').val());
            $('#profile-msg-div').css('display','block');
            $('#profile-msg-content-div').fadeIn('slow');
        }

        if ($('#browser').length) {
            if (!$.browser.msie) {
                $('#browser').val($.browser.version);
            }
        }

        /*if ($('#edit-mail').length) {
            $('#edit-mail').val($('#edit-email').val());
        }*/

        if ($('#edit-mail-wrapper').length) {
            $('#edit-mail-wrapper').removeClass('form-item');
        }

        if ($('#edit-name-wrapper').length) {
            $('#edit-name-wrapper').removeClass('form-item');
        }

        if ($('#edit-picture-upload-wrapper').length) {
            $('#edit-picture-upload-wrapper').removeClass('form-item');
        }

        if ($('.picture').length) {
            $('.picture').css('display','none');
        }

        if ($('#edit-picture-delete-wrapper').length) {
            $('#edit-picture-delete-wrapper').removeClass('form-item');
        }

        $('.mytesla-photo-chg-link').click(function() {
            openChangePhotoDiv();
        });

        if ($('#edit-picture-upload').length) {

            $('.description').css('display','none');
            $('label[for="edit-picture-upload"]').css('display','none');

            if ($.browser.msie) {
                $('#profile-form-div').css('display','block');
                $('.mytesla-photo-chg-link').unbind('click');
                $('.mytesla-photo-chg-link').click(function() {
                    $("html, body").animate({ scrollTop: ($("#profile-form-div").offset().top)-20 }, "slow");
                });
                $('#edit-picture-upload-wrapper').css('display','block');
                $('#edit-picture-upload-wrapper').before('<div class="profile-subhdr">'+Drupal.t('Change Your Profile Image')+'</div>');
                $('#edit-picture-upload-wrapper').css('background','none');
                $('#edit-picture-upload').css('opacity','1');
                // $('#edit-picture-upload').remove('form-file');
            }
            else {
                $('#edit-picture-upload-wrapper').append('<div id="edit-picture-btn-txt">'+Drupal.t('choose file')+'</div>');
                $('#edit-picture-upload').css({'opacity':'0','-khtml-appearance':'none','cursor':'pointer'});
                $('#edit-picture-upload').change(function() {
                    if (!$.browser.msie) {
                        $('#edit-picture-upload-wrapper').append('<div id="edit-picture-displayfile"></div>');
                        var msg = Drupal.t('Selected file: ') + $('#edit-picture-upload').val();
                        $('#edit-picture-displayfile').text(msg);
                        $('#edit-picture-displayfile').fadeIn('slow');
                    }
                });
            }
        }

        var multiplier = 6.3;
        if (Drupal.settings.tesla.locale == 'ja_JP') {
            multiplier = 9.5;
        }
        var notePositionW = $('label[for="edit-mail"]').html().length * multiplier;
        var notePosition = $('#edit-mail').position();
        var notePositionX = notePosition.left + notePositionW;
        var notePositionY = notePosition.top - 18;
        var locale = '';
        if (Drupal.settings.tesla.country != 'US') {
            locale = '/'+Drupal.settings.tesla.locale;
        }
        if (locale == '/ja_JP') {
            locale = '/jp';
        }
        if (locale == '/zh_CN') {
            locale = '/cn';
        }
        $('#profile-email-note').css('top',notePositionY);
        $('#profile-email-note').css('left',notePositionX);

        if ($('#profile-contact-div').length) {

            if ($('#edit-mail').length) {
                $('#edit-mail').val($('#edit-email').val());
            }

            if ($('#edit-mail-wrapper').length) {
                $('#edit-mail-wrapper').removeClass('form-item');
            }

            var multiplier = 6.3;
            if (Drupal.settings.tesla.locale == 'ja_JP') {
                multiplier = 9.5;
            }
            var notePositionW = $('label[for="edit-email"]').html().length * multiplier;
            var notePosition = $('#edit-email').position();
            var notePositionX = notePosition.left + notePositionW;
            var notePositionY = notePosition.top - 18;
            var locale = '';
            if (Drupal.settings.tesla.country != 'US') {
                locale = '/'+Drupal.settings.tesla.locale;
            }
            if (locale == '/ja_JP') {
                locale = '/jp';
            }
            if (locale == '/zh_CN') {
                locale = '';
            }
            $('#profile-email-note').css('top',notePositionY);
            $('#profile-email-note').css('left',notePositionX);

            $('#profile-addr2-note').css('top',notePositionY);
            $('#profile-addr2-note').css('left',notePositionX+50);

            $('#profile-navbar-title').click(function() {
                window.location.href=locale+'/mytesla';
            });

            $('#profile-navbar-two').click(function() {
                window.location.href=locale+'/own/financing';
            });

            $('#profile-navbar-three').click(function() {
                window.location.href=locale+'/own/service';
            });

            // set the overlay for main contact country select box
            setMailingCountryOverlay();
        }

        $('#changepwd-btn-cancel').click(function() {
            $('#changepwd-error-div').html('');
            $('#changepwd-error-div').css('display','none');
            $('#profile-popup-closex').css('display','none');
            $('#edit-changepwd-current').val('');
            $('#edit-pass-pass1').val('');
            $('#edit-pass-pass2').val('');
            $('#profile-changepwd-div').css('display','none');
            $('#page-disable').fadeOut('slow',function() {
                $(this).remove();
            });
        });

        $('#changephoto-btn-cancel').click(function() {
            $('#changephoto-error-div').html('');
            $('#changephoto-error-div').css('display','none');
            $('#profile-popup-closex').css('display','none');
            $('#edit-picture-upload').val('');
            $('#profile-changephoto-div').css('display','none');
            $('#changephoto-processing-img').css('display','none');
            $('#page-disable').fadeOut('slow',function() {
                $(this).remove();
            });
        });

        $('#changepwd-btn-save').click(function() {
            submitChangePassword();
        });

        $('#changephoto-btn-save').click(function() {
            submitChangePhoto();
        });

        // cancel button functionality on profile page
        $('#btnSelectDOBack').click(function() {

            var back_destination = $('#edit-profile-destination').val();
            if (back_destination.indexOf('?')) {
                back_destination = back_destination.substring(0,back_destination.indexOf('?'));
            }

            window.location.href = back_destination;
        });

        // submit button functionality on profile page
        if ($('#btnSelectDO').length) {
            $('#btnSelectDO').click(function() {
                submitUserEditForm();
            });
        }

        // open the alternate contact div if user has one
        if ($('#edit-profile-hasalt-contact').length && $('#edit-profile-hasalt-contact').val() == 'true') {
            changeProfileCountry('profile-alt-mailing-addr','altmailing','onready');
            // set the overlay for alternate contact country select box
            if ($.browser.msie && $.browser.version < 9) {
                // do nothing, this will get handled later
            }
            else {
                setAltMailingCountryOverlay();
            }
        }

        // set alt contact open/close links only if altcontact container is available
        if ($('#profile-altcontact-container').length && $('#profile-altcontact-container').css('display') == 'block') {
            $('#profile-addremove-icon').unbind('click');
            $('#profile-addremove-icon').click(function() {
                openAltContactDiv();
            });
            $('#profile-addremove-title').unbind('click');
            $('#profile-addremove-title').click(function() {
                openAltContactDiv();
            });
        }

        // set contact preference to 1st option by default
        // if ($('#profile-contactprefs-radio1').length) {
        //     setProfileAltContactRadio(0);
        // }
        if ($('#contact_prefs').length && $('#contact_prefs').val() == '1') {
            setProfileAltContactRadio($('#contact_prefs').val());
        }
        else {
            setProfileAltContactRadio(0);
        }


        if ($('#removeprompt-btn-confirm-cancel').length) {
            $('#removeprompt-btn-confirm-cancel').click(function() {
                $('#profile-popup-closex').css('display','none');
                $('#profile-removeprompt-div').css('display','none');
                $('#page-disable').fadeOut('slow');
            });
        }

        if ($('#removeprompt-btn-confirm').length) {
            $('#removeprompt-btn-confirm').click(function() {
                var window_height = $(window).height();
                var window_width = $(window).width();
                var x_position = window_width/2;
                var y_position = window_height/2;
                var pdiv_width = $('#processing-div').width();
                var pdiv_height = $('#processing-div').height();
                x_position = x_position - (pdiv_width/2);
                y_position = y_position - (pdiv_height/2);
                $('#processing-div').css('left',x_position);
                $('#processing-div').css('top',y_position);
                $('#processing-div').css('position','fixed');
                $('#profile-popup-closex').css('display','none');
                $('#profile-removeprompt-div').fadeOut('slow',function() {
                    $('#processing-div').fadeIn('slow',function() {
                        removeAltContact();
                    });
                });
            });
        }

        if ($('#profile-form-div').length && $.browser.msie) {
            if ($('#profile-form-div fieldset:first-child legend').html() == 'Account validation') {
                $('#profile-form-div fieldset:first-child').css('display','none');
            }
        }

    }
    // end mytesla profile


    /**
     * D7-TODO: Move to China specific js file
     * WEB-13981 - changes to the WeChat icon interaction in Chinese footer
     * Interactions captured:
     *     - open popover when icon is clicked
     *     - close popover when icon is clicked
     *     - close popover is anything on the page is clicked
     *     - close popover is user hits the escape key (keycode === 27)
     */
    $( document ).click( function( e ) {
        var icon = $( '.social-icon .icon-wechat.is-active' );
        togglePopover( icon );
    });

    $( document ).keyup( function( e ) {
        var icon = $( '.social-icon .icon-wechat.is-active' );
        if ( e.keyCode === 27 ) {
            togglePopover( icon );
        }
    });

    $( '.social-icon' ).bind( 'click', '.icon-wechat', function( e ) {
        e.stopPropagation( e );
        togglePopover( $(this) );
    });

    //bind profile submit

    $('#user-profile-form').submit(function(e) {
        submitUserEditForm();
        return false;
    });

    function togglePopover( e ) {
        e.toggleClass( 'is-active' );
    }

    $(".tesla-updates").on("click", function(e) {
        e.stopPropagation();
        // window.open("/about/legal#tesla-updates", "_newtab");
    })
});
/////////////////////////// end onready

function setMailingCountryOverlay(origin) {
    // select element styling
    if ($('#edit-mailing-country').length && !$('#mailing-country-overlay').length) {
        $('#edit-mailing-country').each(function() {
            var title = $(this).attr('title');
            if ( $('option:selected', this).val() != ''  ) title = $('option:selected',this).text().substring(0,24);
            $(this)
                .css({'z-index':1,'opacity':0,'-khtml-appearance':'none'})
                .after('<span id="mailing-country-overlay" class="select-mailing">' + title + '</span>')
                .change(function() {
                    ctry_code = $('option:selected',this).val().toLowerCase();
                    val = $('option:selected',this).text().substring(0,24);
                    if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
                      val = $('option:selected',this).text().substring(0,19);
                      val = '<img src="/tesla_theme/assets/img/icn_'+ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;' + val;
                    }
                    $('#mailing-country-overlay').html(val);
                })
                .keyup(function() {
                    ctry_code = $('option:selected',this).val().toLowerCase();
                    val = $('option:selected',this).text().substring(0,24);
                    if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
                      val = $('option:selected',this).text().substring(0,19);
                    }
                    $('#mailing-country-overlay').html(val);
                })
        });

        if (!$('#no_mytesla_account').length) {
            if (!origin) {
                changeProfileCountry('profile-owner-mailing-addr','mailing','onready');
            } else {
                changeProfileCountry('profile-owner-mailing-addr','mailing');
            }
        }

        // set position of country dropdown overlay
        var countryPosition = $('#edit-mailing-country').position();
        var countryPositionX = countryPosition.left-3;
        var countryPositionY = countryPosition.top;
        if ($.browser.safari) {
            countryPositionY = countryPosition.top-2;
        }
        var ctry_code = $('#edit-mailing-country').val().toLowerCase();
        var ctry_label = $('#edit-mailing-country option:selected').text().substring(0,24);
        $('#mailing-country-overlay').css('left',countryPositionX);
        $('#mailing-country-overlay').css('top',countryPositionY);
        // if locale supported country, show flag in dropdown
        if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
            ctry_label = $('#edit-mailing-country option:selected').text().substring(0,19);
            $('#mailing-country-overlay').html('<img src="/tesla_theme/assets/img/icn_'+ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;'+ctry_label);
        }

        $('#mailing-country-overlay').fadeIn('slow');

    }
}

function setAltMailingCountryOverlay(origin) {

    if ($('#edit-altmailing-country').length && !$('#altmailing-country-overlay').length) {
        $('#edit-altmailing-country').each(function() {
            var title = $(this).attr('title');
            if ( $('option:selected', this).val() != ''  ) title = $('option:selected',this).text().substring(0,24);
            $(this)
                .css({'z-index':1,'opacity':0,'-khtml-appearance':'none'})
                .after('<span id="altmailing-country-overlay" class="select-mailing">' + title + '</span>')
                .change(function() {
                    ctry_code = $('option:selected',this).val().toLowerCase();
                    val = $('option:selected',this).text().substring(0,24);
                    if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
                      val = $('option:selected',this).text().substring(0,19);
                      val = '<img src="/tesla_theme/assets/img/icn_'+ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;' + val;
                    }
                    $('#altmailing-country-overlay').html(val);
                })
                .keyup(function() {
                    ctry_code = $('option:selected',this).val().toLowerCase();
                    val = $('option:selected',this).text().substring(0,24);
                    if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
                      val = $('option:selected',this).text().substring(0,19);
                      val = '<img src="/tesla_theme/assets/img/icn_'+ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;' + val;
                    }
                    $('#altmailing-country-overlay').html(val);
                })
        });

        if (origin) {
            // set position of country dropdown overlay
            var countryPosition = $('#edit-altmailing-country').position();
            var countryPositionX = countryPosition.left-3;
            var countryPositionY = countryPosition.top;
            var ctry_code = $('#edit-altmailing-country').val().toLowerCase();
            var ctry_label = $('#edit-altmailing-country option:selected').text().substring(0,24);
            $('#altmailing-country-overlay').css('left',countryPositionX);
            $('#altmailing-country-overlay').css('top',countryPositionY);
            // if locale supported country, show flag in dropdown
            if (ctry_code == 'us' || ctry_code == 'ca' || ctry_code == 'au' || ctry_code == 'at' || ctry_code == 'be' || ctry_code == 'dk' || ctry_code == 'de' || ctry_code == 'fr' || ctry_code == 'gb' || ctry_code == 'it' || ctry_code == 'nl' || ctry_code == 'ch' || ctry_code == 'hk' || ctry_code == 'jp' || ctry_code == 'cn') {
                var ctry_label = $('#edit-altmailing-country option:selected').text().substring(0,19);
                $('#altmailing-country-overlay').html('<img src="/tesla_theme/assets/img/icn_'+ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;'+ctry_label);
            }
            $('#altmailing-country-overlay').fadeIn('slow');
        }
    }
}

function setProfileCloseX(origin,action) {
    if ($('#profile-'+origin+'-div').length) {
        if (action == 'open') {
            var popLocation = $('#profile-'+origin+'-div').position();
            alert(popLocation.top);
            popLocationX = popLocation.left;
            popLocationY = popLocation.top;
            $('#profile-popup-closex').css('left',popLocationX);
            $('#profile-popup-closex').css('top',popLocationY);
            $('#profile-popup-closex').css('display','block');
        } else {
            $('#profile-popup-closex').css('display','none');
        }
    }
}

function checkProfileRequiredFields(origin) {

    // $('#btnSelectDO').css('opacity','0.6');
    var no_main_contact = false;
    var aContactReqd = new Array();
    var aReqd = new Array();
    aReqd.push('username');
    aReqd.push('first-name');
    aReqd.push('last-name');
    aReqd.push('email');

    if ($('#edit-profile-contactid').length && $('#edit-profile-contactid').val() != '') {
        aReqd.push('phone');
        aReqd.push('mailing-address-1');
        if ($('#edit-mailing-country').val() != 'JP') {
            aReqd.push('mailing-city');
        }
        if ($('#edit-mailing-country').val() != 'CN') {
            aReqd.push('mailing-zip');
        }
        if ($('#mailing-province-istextbox').length) {
            aReqd.push('mailing-state');
        }
    } else {
        no_main_contact = true;
        aContactReqd.push('phone');
        aContactReqd.push('mailing-address-1');
        if ($('#edit-mailing-country').val() != 'JP') {
            aContactReqd.push('mailing-city');
        }
        if ($('#edit-mailing-country').val() != 'CN') {
            aReqd.push('mailing-zip');
        }
        if ($('#mailing-province-istextbox').length) {
            aContactReqd.push('mailing-state');
        }
    }
    if (($('#edit-profile-hasalt-contact').length && $('#edit-profile-hasalt-contact').val() == 'true') || ($('#edit-profile-addingalt-contact').length && $('#edit-profile-addingalt-contact').val() == '1')) {
        aReqd.push('altcontact-firstname');
        aReqd.push('altcontact-lastname');
        aReqd.push('altcontact-mail');
        aReqd.push('altcontact-phone');
        aReqd.push('altmailing-address-1');
        if ($('#edit-altmailing-country').val() != 'JP') {
            aReqd.push('altmailing-city');
        }
        if ($('#altmailing-province-istextbox').length) {
            aReqd.push('altmailing-state');
        }
        if ($('#edit-altmailing-country').val() != 'CN') {
            aReqd.push('altmailing-zip');
        }
    }

    for(var i=0;i<aReqd.length;i++) {

        $('#edit-'+aReqd[i]).unbind('keyup');
        $('#edit-'+aReqd[i]).keyup(function() {
            var incomplete = 0;
            for(var ii=0;ii<aReqd.length;ii++) {
                if ($('#edit-'+aReqd[ii]).val() == '') {
                    incomplete = 1;
                }
            }
            if (incomplete == 0) {
                $('#btnSelectDO').css('opacity','1');
            } else {
                $('#btnSelectDO').css('opacity','0.6');
            }
        });
    }
    // new condition for users with no main mailing address and start to add one
    if (no_main_contact === true) {
        for(var i=0;i<aContactReqd.length;i++) {

            $('#edit-'+aContactReqd[i]).unbind('keyup');
            $('#edit-'+aContactReqd[i]).keyup(function() {
                var incomplete = 0;
                var adding_contact = 0;
                for(var ii=0;ii<aContactReqd.length;ii++) {
                    if ($('#edit-'+aContactReqd[ii]).val() != '') {
                        adding_contact = 1;
                    }
                }
                if (adding_contact == 1) {
                    if (!$('#edit-profile-addmaincontact').length) {
                        $('#user-profile-form').append('<input type="hidden" name="edit-profile-addmaincontact" id="edit-profile-addmaincontact" value="1" />');
                    }
                    for(var ii=0;ii<aContactReqd.length;ii++) {
                        if ($('#edit-'+aContactReqd[ii]).val() == '') {
                            incomplete = 1;
                        }
                    }
                } else {
                    if ($('#edit-profile-addmaincontact').length) {
                        $('#edit-profile-addmaincontact').remove();
                    }
                }
                if (incomplete == 0) {
                    $('#btnSelectDO').css('opacity','1');
                } else {
                    $('#btnSelectDO').css('opacity','0.6');
                }
            });
        }
    }

    if (origin) {
        var incomplete = 0;
        for(var j=0;j<aReqd.length;j++) {
            if ($('#edit-'+aReqd[j]).val() == '') {
                incomplete = 1;
            }
        }
        if (no_main_contact === true) {
            incomplete = 0;
        }
        if (incomplete == 0) {
            // $('#btnSelectDO').unbind('click');
            $('#btnSelectDO').css('opacity','1');
            // $('#btnSelectDO').click(function() {
            //     submitUserEditForm();
            // });
        } else {
            $('#btnSelectDO').css('opacity','0.6');
        }
    }
    // $('#btnSelectDO').click(function() {
    //     submitUserEditForm();
    // });
}


/*
 * Do this stuff when the page is loaded -- any visible transistions
 */
$(window).load(function() {

    // fade in any tooltips
    $('.hover_tooltip').fadeIn(1500);
    // check to see if we need to show the locale blip
    checkCookie();

});

function makeCursor(obj) {
    document.getElementById(obj.id).style.cursor = 'pointer';
}

// onclick function for removing/deleting alternate contact
// calls submit user edit form which will submit the entire form
// and refresh the page
function removeAltContact() {

    var destination = $('#edit-profile-destination').val();
    //$('#edit-profile-removealt-contact').val(1);
    $('input[name=remove_contact_hit]').val(1);
    submitUserEditForm('removeAltContact');

}

// updated function to change the mailing countries on the profile page.
// new ajax call to post new state/province values or empty text box if
// no related provinces/states.
// removed page refresh call which loses user input information
function changeProfileCountry(whichblock,fieldsegment,origin) {
    debug.error('****** changeProfileCountry invoked', whichblock, fieldsegment, origin);
    var container            = $('#'+whichblock);
    var selectedCountryIndex = document.getElementById('edit-'+fieldsegment+'-country').selectedIndex;
    var selectedCountry      = document.getElementById('edit-'+fieldsegment+'-country').options[selectedCountryIndex].value;
    var buyFlowCountry       = $('#edit-'+fieldsegment+'-country').val();
    var ln_container         = 'localname-container'; // china reservation

    //WEB-8685 for China, we must rely on saved values(hidden fields), will break if coming from other county
    var savedCountry = $('#edit-'+fieldsegment+'-country-h').val();
    if (origin || savedCountry == 'CN') {
        var mailing_addr1   = $('#edit-'+fieldsegment+'-address-1-h').val();
        var mailing_addr2   = $('#edit-'+fieldsegment+'-address-2-h').val();
        var mailing_city    = $('#edit-'+fieldsegment+'-city-h').val();
        var mailing_county  = $('#edit-'+fieldsegment+'-county-h').val();
        var mailing_state   = $('#edit-'+fieldsegment+'-state-h').val();
        var mailing_zip     = $('#edit-'+fieldsegment+'-zip-h').val();
        var mailing_country = $('#edit-'+fieldsegment+'-country-h').val();
    } else {
        var mailing_addr1 = $('#edit-'+fieldsegment+'-address-1').val();
        var mailing_addr2 = $('#edit-'+fieldsegment+'-address-2').val();
        var mailing_city  = $('#edit-'+fieldsegment+'-city').val();
        var mailing_county  = $('#edit-'+fieldsegment+'-county').val();
        var mailing_state = $('#edit-'+fieldsegment+'-state').val();
        var mailing_zip   = $('#edit-'+fieldsegment+'-zip').val();
    }

    var mailing_addr1_label      = $('#edit-mailing-addr1-label').val();
    var mailing_addr2_label      = $('#edit-mailing-addr2-label').val();
    var mailing_city_label       = $('#edit-mailing-city-label').val();
    var mailing_state_label      = $('#edit-mailing-state-label').val();
    var mailing_zip_label        = $('#edit-mailing-zip-label').val();
    var mailing_province_label   = $('#edit-mailing-province-label').val();
    var mailing_postalcode_label = $('#edit-mailing-postalcode-label').val();

    var mailing_addr1_css = '';
    var mailing_city_css  = '';
    var mailing_state_css = '';
    var mailing_zip_css   = '';

    if ($('label[for="edit-'+fieldsegment+'-address-1"]').length && $('label[for="edit-'+fieldsegment+'-address-1"]').css('color') == 'rgb(204, 0, 0)') {
        mailing_addr1_css = 'error';
    }
    if ($('label[for="edit-'+fieldsegment+'-city"]').length && $('label[for="edit-'+fieldsegment+'-city"]').css('color') == 'rgb(204, 0, 0)') {
        mailing_city_css = 'error';
    }
    if ($('label[for="edit-'+fieldsegment+'-state"]').length && $('label[for="edit-'+fieldsegment+'-state"]').css('color') == 'rgb(204, 0, 0)') {
        mailing_state_css = 'error';
    }
    if ($('label[for="edit-'+fieldsegment+'-zip"]').length && $('label[for="edit-'+fieldsegment+'-zip"]').css('color') == 'rgb(204, 0, 0)') {
        mailing_zip_css = 'error';
    } else if ($('#'+fieldsegment+'-zip-error').length) {
        mailing_zip_css = 'error';
    }

    if (!mailing_addr1) {mailing_addr1 = '';}
    if (!mailing_addr2) {mailing_addr2 = '';}
    if (!mailing_city) {mailing_city = '';}
    if (!mailing_state) {mailing_state = '';}
    if (!mailing_zip) {mailing_zip = '';}
    if (!mailing_country) {mailing_country = '';}

    if (fieldsegment == 'altmailing') {
        ln_container = 'alt-localname-container';
    }
    var user_selected = ( typeof(origin) != 'undefined' || origin == 'onready' ) ? false : true;

    // Swith places for first and last name fields for China
    var $lNameWrapper = $("#edit-last-name-wrapper").parent(),
        $fNameWrapper = $("#col-left #edit-first-name-wrapper").parent();

    if (selectedCountry == "CN") {
        $fNameWrapper.before($lNameWrapper);
        $lNameWrapper.parent().addClass("CN");
    }
    else {
        $fNameWrapper.after($lNameWrapper);
        $lNameWrapper.parent().removeClass("CN");
    }

    var data_mail_country = {countryTo: selectedCountry, address1: mailing_addr1, address2: mailing_addr2, city: mailing_city, county: mailing_county, state: mailing_state, zip: mailing_zip, country: mailing_country, mailing_addr1_lbl: mailing_addr1_label, mailing_addr2_lbl:mailing_addr2_label, mailing_city_lbl:mailing_city_label, mailing_state_lbl:mailing_state_label,mailing_zip_lbl:mailing_zip_label,mailing_province_lbl:mailing_province_label,mailing_postalcode_lbl:mailing_postalcode_label,segment:fieldsegment,addr1_css:mailing_addr1_css,city_css:mailing_city_css,state_css:mailing_state_css,zip_css:mailing_zip_css,user_selected:user_selected};
    debug.error('***** data_mail_country', data_mail_country);

    $.post("/mytesla/mailing-country", data_mail_country,
        function(data) {
        if (origin) {
            container.html(data);
            container.css('display','block');
            showMailingState();
            if (fieldsegment == 'altmailing') {
                openAltContactDiv('noscroll');
            }
        } else {
            container.fadeOut(function() {
                container.html(data);
                container.fadeIn(function() {
                    showMailingState();
                });
            });
        }

        if ($.inArray(selectedCountry, ['JP', 'CN', 'HK', 'MO']) >= 0) {
            $('#'+ln_container).fadeIn('slow');
        }
        else {
            $('#'+ln_container).fadeOut('slow');
        }
    });

    var $phone_element = ((fieldsegment == 'altmailing') ? ($('#edit-altcontact-phone')) : ($('#edit-phone')));
    if (($phone_element.val() == '') || (($phone_element.val() != '') && ($phone_element.val().length <= 4))) {
        updatePhoneCode(selectedCountry, $phone_element);
    }

    function updatePhoneCode(country, element) {
        var tesla_country_mapping = getTeslaCountryMapping(country);
        var phone_code = (((typeof tesla_country_mapping != 'undefined') && (tesla_country_mapping != '')) ? ('+' + tesla_country_mapping.phone_code) : (''));
        element.val(phone_code);
    }

    function showMailingState() {
        var selectedCountry = document.getElementById('edit-'+fieldsegment+'-country').options[selectedCountryIndex].value;
        if (selectedCountry != 'CN') {
            //WEB-11244
            if (!$('#province-selectbox-hidden').length) {
                // select element styling
                if (!$('#'+fieldsegment+'-province-istextbox').length) {
                    $('#edit-'+fieldsegment+'-state').each(function() {
                        var title = $(this).attr('title');
                        if ( $('option:selected', this).val() != ''  ) title = $('option:selected',this).text();
                        $(this)
                            .css({'z-index':13,'opacity':0,'-khtml-appearance':'none'})
                            // .after('<span id="mailing-state-overlay" class="select-mailing">' + title.substring(0,38) + '</span>')
                            .unbind('change')
                            .unbind('keyup')
                            .change(function() {
                                val = $('option:selected',this).text();
                                $('#'+fieldsegment+'-state-overlay').html(val.substring(0,22));
                            })
                            .keyup(function() {
                                val = $('option:selected',this).text();
                                $('#'+fieldsegment+'-state-overlay').html(val.substring(0,22));
                            })
                    });

                    var provPosition = $('#edit-'+fieldsegment+'-state').position();
                    var provPositionX = provPosition.left - 2;
                    var provPositionY = provPosition.top + 2;
                    if (selectedCountry == 'JP') {
                        provPositionX = provPositionX - 2;
                    }
                    $('#'+fieldsegment+'-state-overlay').css('left',provPositionX);
                    $('#'+fieldsegment+'-state-overlay').css('top',provPositionY);
                    if (origin) {
                        $('#mailing-state-overlay').fadeIn('fast');
                    } else {
                        // if ($('#edit-'+fieldsegment+'-state').css('display') == 'none') {
                            $('#'+fieldsegment+'-state-overlay').fadeIn('fast');
                        // }
                    }
                }
            }
            checkProfileRequiredFields('onready');
        } else {
            loadChinaRegions(fieldsegment);
            ////////////////////////////////
            // start province overlay
            if ($('#edit-'+fieldsegment+'-99-province').length && !$('#edit-'+fieldsegment+'-99-province-overlay').length) {
                $('#edit-'+fieldsegment+'-99-province').each(function() {
                    var title = $(this).attr('title');
                    if ( $('option:selected', this).val() !== '' ) title = $('option:selected',this).text().substring(0,8);
                    $(this)
                        .css({'z-index':13,'opacity':0,'-khtml-appearance':'none','height':'40px'})
                        .after('<span id="edit-'+fieldsegment+'-99-province-overlay" class="select-short" style="display:none;" tabindex="0">' + title + '</span>')
                        .change(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-province-overlay').html(val.substring(0,8));
                        })
                        .keyup(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-province-overlay').html(val.substring(0,8));
                        })
                });

                setTimeout(function() {
                    var provPosition = $('#edit-'+fieldsegment+'-99-province').position();
                    var provPositionX = provPosition.left-2;
                    var provPositionY = provPosition.top+2; // -4
                    $('#edit-'+fieldsegment+'-99-province-overlay').css('left',provPositionX);
                    $('#edit-'+fieldsegment+'-99-province-overlay').css('top',provPositionY);
                    $('#edit-'+fieldsegment+'-99-province-overlay').fadeIn('slow');
                },1000);
            }
            else {
                // reposition just in case...
                setTimeout(function() {
                    var provPosition = $('#edit-'+fieldsegment+'99-province').position();
                    var provPositionX = provPosition.left-2;
                    var provPositionY = provPosition.top+2; // -4
                    $('#edit-'+fieldsegment+'-99-province-overlay').css('left',provPositionX);
                    $('#edit-'+fieldsegment+'-99-province-overlay').css('top',provPositionY);
                    $('#edit-'+fieldsegment+'-99-province-overlay').fadeIn('slow');
                },1000);
            }

            ////////////////////////////////
            // start city overlay
            if ($('#edit-'+fieldsegment+'-99-city').length && !$('#edit-'+fieldsegment+'-99-city-overlay').length) {
                $('#edit-'+fieldsegment+'-99-city').each(function() {
                    var title = $(this).attr('title');
                    if ( $('option:selected', this).val() !== '' ) title = $('option:selected',this).text().substring(0,8);
                    $(this)
                        .css({'z-index':13,'opacity':0,'-khtml-appearance':'none','height':'40px'})
                        .after('<span id="edit-'+fieldsegment+'-99-city-overlay" class="select-short" style="display:none;" tabindex="0">' + title + '</span>')
                        .change(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-city-overlay').html(val.substring(0,8));
                        })
                        .keyup(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-city-overlay').html(val.substring(0,8));
                        })
                });

                setTimeout(function() {
                    var cityPosition = $('#edit-'+fieldsegment+'-99-city').position();
                    var cityPositionX = cityPosition.left-2;
                    var cityPositionY = cityPosition.top; // -4
                    $('#edit-'+fieldsegment+'-99-city-overlay').css('left',cityPositionX);
                    $('#edit-'+fieldsegment+'-99-city-overlay').css('top',cityPositionY);
                    $('#edit-'+fieldsegment+'-99-city-overlay').fadeIn('slow');
                },1000);
            }
            else {
                // reposition just in case...
                setTimeout(function() {
                    var cityPosition = $('#edit-'+fieldsegment+'-99-city').position();
                    var cityPositionX = cityPosition.left-2;
                    var cityPositionY = cityPosition.top; // -4
                    $('#edit-'+fieldsegment+'-99-city-overlay').css('left',cityPositionX);
                    $('#edit-'+fieldsegment+'-99-city-overlay').css('top',cityPositionY);
                    $('#edit-'+fieldsegment+'-99-city-overlay').fadeIn('slow');
                },1000);
            }

            ////////////////////////////////
            // start district overlay
            if ($('#edit-'+fieldsegment+'-99-district').length && !$('#edit-'+fieldsegment+'-99-district-overlay').length) {
                $('#edit-'+fieldsegment+'-99-district').each(function() {
                    var title = $(this).attr('title');
                    if ( $('option:selected', this).val() !== '' ) title = $('option:selected',this).text().substring(0,8);
                    $(this)
                        .css({'z-index':13,'opacity':0,'-khtml-appearance':'none','height':'40px'})
                        .after('<span id="edit-'+fieldsegment+'-99-district-overlay" class="select-short" style="display:none;" tabindex="0">' + title + '</span>')
                        .change(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-district-overlay').html(val.substring(0,8));
                        })
                        .keyup(function() {
                            val = $('option:selected',this).text();
                            $('#edit-'+fieldsegment+'-99-district-overlay').html(val.substring(0,8));
                        })
                });

                setTimeout(function() {
                    var distPosition = $('#edit-'+fieldsegment+'-99-district').position();
                    var distPositionX = distPosition.left-2;
                    var distPositionY = distPosition.top+2; // -4
                    $('#edit-'+fieldsegment+'-99-district-overlay').css('left',distPositionX);
                    $('#edit-'+fieldsegment+'-99-district-overlay').css('top',distPositionY);
                    $('#edit-'+fieldsegment+'-99-district-overlay').fadeIn('slow');
                },1000);
            }
            else {
                // reposition just in case...
                setTimeout(function() {
                    var distPosition = $('#edit-'+fieldsegment+'-99-district').position();
                    var distPositionX = distPosition.left-2;
                    var distPositionY = distPosition.top+2; // -4
                    $('#edit-'+fieldsegment+'-99-district-overlay').css('left',distPositionX);
                    $('#edit-'+fieldsegment+'-99-district-overlay').css('top',distPositionY);
                    $('#edit-'+fieldsegment+'-99-district-overlay').fadeIn('slow');
                },1000);
            }
            //china dropdowns
            //change handler for province dropdown(updates city dropdown)
            $( "#edit-"+fieldsegment+"-99-province" ).change(function() {
                $('#edit-'+fieldsegment+'-99-city-overlay').hide();
                $( "#edit-"+fieldsegment+"-99-city" ).html('');
                    $.each( chinaPCDMap[this.value], function( i, object ) {
                        $( "<option>" ).attr( "value", i ).html(i).appendTo("#edit-"+fieldsegment+"-99-city");
                    });
                $( "#edit-"+fieldsegment+"-99-city" ).change(); //trigger city change event
                $('#edit-'+fieldsegment+'-99-city-overlay').fadeIn('slow');
            });

            //change handler for city dropdown(updates district dropdown)
            $( "#edit-"+fieldsegment+"-99-city" ).change(function() {
                $('#edit-'+fieldsegment+'-99-district-overlay').hide();
                $( "#edit-"+fieldsegment+"-99-district" ).html('');
                    var province = $("#edit-"+fieldsegment+"-99-province").val();
                    $.each( chinaPCDMap[province][this.value], function( k, v ) {
                        $( "<option>" ).attr( "value", v ).html(v).appendTo("#edit-"+fieldsegment+"-99-district");
                    });
                $( "#edit-"+fieldsegment+"-99-district" ).change();
                $('#edit-'+fieldsegment+'-99-district-overlay').fadeIn('slow');
            });
            checkProfileRequiredFields('onready');
        }
    }
}

//used both in user profile page , car profile page(registration block) and test drive page
var chinaPCDMap = ''; //holds mapping of china regions for dropdowns in china order flow ie. province[city][n][districts]
function loadChinaRegions(fieldsegment, populate) {
    populate = populate || false;
    if (chinaPCDMap == '') {
        $.getJSON( Drupal.settings.basePath + 'sites/all/modules/99bill/province_city_district_map.json', {
            format: "json"
        }).done(function( data ) {
            chinaPCDMap = data;
            if (!populate) {
                populateChinaDropdowns(fieldsegment,chinaPCDMap);
            }
        });
    } else {
        if (!populate) {
            populateChinaDropdowns(fieldsegment,chinaPCDMap);
        }
    }
}

function loadChinaCities(selectedProvince, citySelector, placeHolder) {
    var cityDropDownContent = '<option value="0">' + placeHolder + '</option>';

    var specialCity = ['北京', '天津', '上海', '重庆'];
    var cities = []
    if (chinaPCDMap[selectedProvince]) {
        if (_.indexOf(specialCity, selectedProvince) === -1) {
            cities = _.keys(chinaPCDMap[selectedProvince]);
        }
        else {
            cities = chinaPCDMap[selectedProvince][selectedProvince];
        }
        for(var i = 0, l = cities.length; i < l; i++) {
            cityDropDownContent += '<option value="' + (i + 1) + '">' + cities[i] + '</option>';
        }
    }
    citySelector.html(cityDropDownContent);
}

/**
  * China Order Flow function that gives value to the province/city/district dropdowns unique
  * to the country in the payment block. Only populates province dropdown and then triggers
  * change event to have the others be updated based on the value selected.
*/
function populateChinaDropdowns(fieldsegment, map) {
    var country = $('#edit-'+fieldsegment+'-99-hidden-country').val();
    //only use account values if account country is china since we need to match values with json map
    if (country == 'CN') {
        var p = ($('#edit-'+fieldsegment+'-99-hidden-province').val() != '' ? $('#edit-'+fieldsegment+'-99-hidden-province').val() : "北京");
        var c = ($('#edit-'+fieldsegment+'-99-hidden-city').val() != '' ? $('#edit-'+fieldsegment+'-99-hidden-city').val() : "北京");
        var d = ($('#edit-'+fieldsegment+'-99-hidden-district').val() != '' ? $('#edit-'+fieldsegment+'-99-hidden-district').val() : "东城区");
    } else {
        var p = "北京";
        var c = "北京";
        var d = "东城区";
    }

    //reset province dropdown before loading its values
    var _regIsPopulated = $("#reg-person-address1").val() != "";
    $( "#edit-"+fieldsegment+"-99-province" ).html('');
    if (!_regIsPopulated) {
        $( "<option selected>" ).attr( "value", " " ).html("选择省").appendTo("#edit-"+fieldsegment+"-99-province"); //default value
    }
    _.each( map, function(object, i) {
        if (p == i && _regIsPopulated) {
            $( "<option selected>" ).attr( "value", i ).html(i).appendTo("#edit-"+fieldsegment+"-99-province");
        } else {
            $( "<option>" ).attr( "value", i ).html(i).appendTo("#edit-"+fieldsegment+"-99-province");
        }
    });
    $("#edit-"+fieldsegment+"-99-province").trigger('keyup');

    //city
    $( "#edit-"+fieldsegment+"-99-city" ).html('');
    if (!_regIsPopulated) {
        $( "<option selected>" ).attr( "value", " " ).html("选择城市").appendTo("#edit-"+fieldsegment+"-99-city"); //default value
    }
    if (p != 0) {
        _.each( _.keys(map[p]), function( object, i, list) {
            if (c == object && _regIsPopulated) {
                $( "<option selected>" ).attr( "value", object ).html(object).appendTo("#edit-"+fieldsegment+"-99-city");
            } else {
                $( "<option>" ).attr( "value", object ).html(object).appendTo("#edit-"+fieldsegment+"-99-city");
            }
        });
    }
    $("#edit-"+fieldsegment+"-99-city").trigger('keyup');

    //district
    $( "#edit-"+fieldsegment+"-99-district" ).html('');
    if (!_regIsPopulated) {
        $( "<option selected>" ).attr( "value", " " ).html("选择区").appendTo("#edit-"+fieldsegment+"-99-district"); //default value
    }
    if (p != 0 && c != 0) {
        _.each( map[p][c], function( value, i, list) {
            if (d == value && _regIsPopulated) {
                $( "<option selected>" ).attr( "value", value ).html(value).appendTo("#edit-"+fieldsegment+"-99-district");
            } else {
                $( "<option>" ).attr( "value", value ).html(value).appendTo("#edit-"+fieldsegment+"-99-district");
            }
        });
    }
    $("#edit-"+fieldsegment+"-99-district").trigger('keyup');
}

function selectPhotoFile() {
    if ($('#edit-picture-upload').length) {
        $('#edit-picture-upload').click();
    }
}

function submitChangePhoto() {
    // files[0]
    // .size, .type,
    // image/jpeg, image/png, image/gif, image/jpeg
    var file_error_msg = 'Sorry, there was an error saving your image.  Please try again.';
    var is_valid_filetype = false;
    var is_oversized_file = false;
    var aFileTypes = new Array();
    aFileTypes.push('image/jpeg');
    aFileTypes.push('image/jpg');
    aFileTypes.push('image/png');
    aFileTypes.push('image/gif');

    if ($('#edit-picture-upload').length) {
        var photo_file = document.getElementById('edit-picture-upload');
        for(var i=0;i<aFileTypes.length;i++) {
            if (!$.browser.msie) {
                if (photo_file.files[0].type == aFileTypes[i]) {
                    is_valid_filetype = true;
                }
                if (photo_file.files[0].size > 2097152) {
                    is_oversized_file = true;
                }
            } else {
                if (photo_file.value.toLowerCase().indexOf(aFileTypes[i].toLowerCase())) {
                    is_valid_filetype = true;
                }
                if (photo_file.size > 2097152) {
                    is_oversized_file = true;
                }
            }
        }

        if (is_valid_filetype == true && is_oversized_file == false) {
            $('#changephoto-processing-img').fadeIn('fast');
            // save the rest of the form
            document.forms['user-profile-form'].submit();
        } else {
            if (is_valid_filetype == false) {
                file_error_msg = 'Your selected image is not one of the accepted file types.  Please select an image in either JPEG/JPG, PNG, or GIF file format.';
            } else if (is_oversized_file == true) {
                file_error_msg = 'Your selected image exceeds the file size limitations.  Please select a different image or resize your image.';
            }
            $('#changephoto-error-div').html('<p>'+file_error_msg+'</p>');
            $('#changephoto-error-div').slideDown('slow');
            $('#changephoto-processing-img').css('display','none');
        }
    }
}

function profileFillEmail(obj) {
    if ($('#edit-mail').length) {
        $('#edit-mail').val(obj.value);
    }
}

function profileFillUsername(obj) {
    if ($('#edit-name').length) {
        $('#edit-name').val(obj.value);
    }
    $(obj).blur(function () {
         $(obj).val(trim(obj.value));
         $('#edit-name').val(trim(obj.value));
    });
}

function submitChangePassword() {

    if ($('#changepwd-error-div').css('display') == 'block') {
        $('#changepwd-error-div').css('display','none');
    }

    var form_error = 0;
    var form_error_msg = '';
    var container = $('#changepwd-content-body');
    var current_pwd = $('#edit-changepwd-current').val();
    var new_pwd = $('#edit-pass-pass1').val();
    var confirm_pwd = $('#edit-pass-pass2').val();
    var uid = $('#edit-profile-uid').val();
    var user_email = $('#edit-email').val();
    var user_name = $('#edit-username').val();

    var hasLetters = new_pwd.match(/[a-zA-Z]+/);
    var hasNumbers = new_pwd.match(/[0-9]+/);
    var hasPunctuation = new_pwd.match(/[^a-zA-Z0-9]+/);
    var hasCasing = new_pwd.match(/[a-z]+.*[A-Z]+|[A-Z]+.*[a-z]+/);

    // start validate
    if (current_pwd == null || current_pwd == '') {
        form_error = 1;
        form_error_msg = $('#edit-profile-cpwd-error').val() + '<br>';
    }
    if (new_pwd == null || new_pwd == '') {
        form_error = 1;
        form_error_msg = form_error_msg + $('#edit-profile-npwd-error').val() + '<br>';
    }
    if (confirm_pwd == null || confirm_pwd == '') {
        form_error = 1;
        form_error_msg = form_error_msg + $('#edit-profile-cfpwd-error').val() + '<br>';
    }
    if (form_error == 0 && new_pwd != confirm_pwd) {
        form_error = 1;
        form_error_msg = $('#edit-profile-pwdmatch-error').val();
    }
    if (form_error == 0 && new_pwd.length < 8) {
        form_error = 1;
        form_error_msg = $('#edit-profile-pwdlen-error').val();
    }
    else{
        var count = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0);
        strength_pass = count > 1 ? "pass" : "fail";
            if (strength_pass == "fail") {
                form_error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
                form_error = 1;
            }
    }

    if (form_error != 0) {
        $('#changepwd-error-div').html(form_error_msg);
        $('#changepwd-error-div').slideDown('slow');
    } else {
        var destination = $('#edit-profile-destination').val(),
            finalDestination = destination.replace('?success=true', '');
        $('#changepwd-processing-img').fadeIn('fast');
        $.post("/mytesla/change-password", {current_pass: current_pwd, new_pass: new_pwd, uid:uid, email:user_email, username:user_name}, function(data) {
            if (data.success == 'true') {
                window.location.href = finalDestination + '?success=true';
            } else {
                $('#changepwd-error-div').html(Drupal.t('Sorry, there was an error in saving your new password, please try again.'));
                $('#changepwd-error-div').slideDown('slow');
                $('#changepwd-processing-img').css('display','none');
            }
        }, 'json');
    }

}

function submitUserEditForm(origin) {
    // validate the form fields
    var form_error = 0;
    var junk_data  = 0;
    var form_error_msg = '';
    var junk_data_msg  = '';
    var username      = $('#edit-username').val();
    var fname         = $('#edit-first-name').val();
    var lname         = $('#edit-last-name').val();
    var email         = $('#edit-mail').val();
    var phone         = $('#edit-phone').val();
    var mailing_addr1 = $('#edit-mailing-address-1').val();
    var mailing_city  = $('#edit-mailing-city').val();
    var mailing_zip   = $('#edit-mailing-zip').val();
    if ($('#istextbox-mailing').length) {
        var state = $('#edit-mailing-state').val();
    }

    var contact_error        = 0;
    var altcontact_error     = 0;
    var mail_error           = 0;
    var altmail_error        = 0;
    var aFields              = new Array();
    var aErrorFields         = new Array();
    var has_alt_contact      = 'false';
    var isowner              = 'false';
    var is_adding_altcontact = 'false';
    // alternate contact fields
    var ac_fname             = $('#edit-altcontact-firstname').val();
    var ac_lname             = $('#edit-altcontact-lastname').val();
    var ac_email             = $('#edit-altcontact-mail').val();
    var ac_phone             = $('#edit-altcontact-phone').val();
    var ac_addr1             = $('#edit-altmailing-address-1').val();
    var ac_city              = $('#edit-altmailing-city').val();
    var ac_zip               = $('#edit-altmailing-zip').val();
    if ($('#istextbox-altmailing').length) {
        var ac_state = $('#edit-altmailing-state').val();
    }

    $('#profile-msg-div').css('display','none');
    $('#profile-alt-msg-div').css('display','none');

    if ($('#edit-profile-hasalt-contact').length && $('#edit-profile-hasalt-contact').val() == 'true') {
        has_alt_contact = 'true';
    }

    if ($('#edit-profile-addingalt-contact').length && $('#edit-profile-addingalt-contact').val() == '1') {
        is_adding_altcontact = 'true';
    }

    if ($('#edit-profile-teslaAccountId').length && $('#edit-profile-teslaAccountId').val() != '') {
        isowner = 'true';
    }

    aFields.push('username');
    aFields.push('first-name');
    aFields.push('last-name');
    aFields.push('mail');
    aFields.push('phone');
    aFields.push('mailing-address-1');
    aFields.push('mailing-city');
    if (state) {
        aFields.push('mailing-state');
    }
    aFields.push('mailing-zip');

    if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
        aFields.push('altcontact-firstname');
        aFields.push('altcontact-lastname');
        aFields.push('altcontact-mail');
        aFields.push('altcontact-phone');
        aFields.push('altmailing-address-1');
        aFields.push('altmailing-city');
        if ($('#istextbox-altmailing').length) {
            aFields.push('altmailing-state');
        }
        aFields.push('altmailing-zip');
    }

    for(var i=0;i<aFields.length;i++) {
        if ($('label[for="edit-'+aFields[i]+'"]').length && $('label[for="edit-'+aFields[i]+'"]').attr('style')) {
            $('label[for="edit-'+aFields[i]+'"]').removeAttr('style');
        }
    }

    if (username == '') {
        form_error = 1;
        contact_error++;
        form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-username-error').val() + '<br>';
        aErrorFields.push('username');
    }

    if (fname == '') {
        form_error = 1;
        contact_error++;
        form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-fname-error').val() + '<br>';
        aErrorFields.push('first-name');
    }

    if (lname == '') {
        form_error = 1;
        contact_error++;
        form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-lname-error').val() + '<br>';
        aErrorFields.push('last-name');
    }

    if (email == '') {
        form_error = 1;
        contact_error++;
        form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-email-error').val() + '<br>';
        aErrorFields.push('email');
    } else if (email != '' && checkEmail(email) == false) {
        form_error = 1;
        contact_error++;
        form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-email-error').val() + '<br>';
        aErrorFields.push('email');
    }

    // validate if is owner, then validate mailing address
    if (isowner == 'true' || has_alt_contact == 'true') {

        if (phone == '') {
            form_error = 1;
            contact_error++;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-phone-error').val() + '<br>';
            aErrorFields.push('phone');
        }
        if (mailing_addr1 == '') {
            form_error = 1;
            contact_error++;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-mailingaddr1-error').val() + '<br>';
            aErrorFields.push('mailing-address-1');
        }
        if (mailing_city == '') {
            form_error = 1;
            contact_error++;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-city-error').val() + '<br>';
            aErrorFields.push('mailing-city');
        }
        if (/[\+\-\!\@\#\$\%\^\&\*\(\)\;\\\/\<\>\{\}\[\]\?\¿\=]+/.test(mailing_city)) {
            form_error = 1;
            junk_data = 1;
            junk_data_msg = Drupal.t('City contains invalid characters.');
            aErrorFields.push('mailing-city');
        }
        if (state) {
            if (mailing_state == '') {
                form_error = 1;
                contact_error++;
                form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-state-error').val() + '<br>';
                aErrorFields.push('mailing-state');
            }
        }
        mailing_country = $('#edit-mailing-country').val();
        if (mailing_country != 'CN') {
            if (!isValidPostalCode(mailing_zip, mailing_country)) {
                postal_code_formatting = getPostalCodeRegexMatrix(mailing_country);
                mail_error_message_label = 'Format: ';
                form_error = 1;
                mail_error = 1;
                var mail_error_message_sample = (postal_code_formatting.sample != undefined) ? (Drupal.t(mail_error_message_label) + postal_code_formatting.sample) : ('');
                form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-zip-error').val() + '<br>';
                aErrorFields.push('mailing-zip');
            }
        }
    }

    // start validation of alternate contact fields only if any one field has been filled in
    // validate only if at least one text field is filled out at the time of submit
    // if ((ac_fname != undefined && ac_fname != '') || (ac_lname != undefined && ac_lname != '') || (ac_email != undefined && ac_email != '') || (ac_phone != undefined && ac_phone != '') || (ac_addr1 != undefined && ac_addr1 != '') || (ac_city != undefined && ac_city != '') || (ac_zip != undefined && ac_zip != '')) {
    if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
        if (ac_fname == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-fname-error').val() + '<br>';
            aErrorFields.push('altcontact-firstname');
            altcontact_error++;
        }
        if (ac_lname == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-lname-error').val() + '<br>';
            aErrorFields.push('altcontact-lastname');
            altcontact_error++;
        }
        if (ac_email == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-email-error').val() + '<br>';
            aErrorFields.push('altcontact-mail');
            altcontact_error++;
        } else if (ac_email != '' && ac_email != undefined && checkEmail(ac_email) == false) {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-email-error').val() + '<br>';
            aErrorFields.push('altcontact-mail');
            altcontact_error++;
        }
        if (ac_phone == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-phone-error').val() + '<br>';
            aErrorFields.push('altcontact-phone');
            altcontact_error++;
        }
        if (ac_addr1 == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-mailingaddr1-error').val() + '<br>';
            aErrorFields.push('altmailing-address-1');
            altcontact_error++;
        }
        if (ac_city == '') {
            form_error = 1;
            form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-city-error').val() + '<br>';
            aErrorFields.push('altmailing-city');
            altcontact_error++;
        }
        if (/[\+\-\!\@\#\$\%\^\&\*\(\)\;\\\/\<\>\{\}\[\]\?\¿\=]+/.test(ac_city)) {
            form_error = 1;
            junk_data = 2;
            junk_data_msg = Drupal.t('City contains invalid characters.');
            aErrorFields.push('altmailing-city');
        }
        if ($('#istextbox-altmailing').length) {
            if (ac_state == '') {
                form_error = 1;
                form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-state-error').val() + '<br>';
                aErrorFields.push('altmailing-state');
                altcontact_error++;
            }
        }
        altmailing_country = $('#edit-altmailing-country').val();
        if (altmailing_country != 'CN') {
            if (!isValidPostalCode(ac_zip, altmailing_country)) {
                postal_code_formatting = getPostalCodeRegexMatrix(altmailing_country);
                altmail_error_message_label = 'Format: ';
                form_error = 1;
                altmail_error = 1;
                var altmail_error_message_sample = (postal_code_formatting.sample != undefined) ? (Drupal.t(altmail_error_message_label) + postal_code_formatting.sample) : ('')
                form_error_msg = form_error_msg + '&nbsp;' + $('#edit-profile-zip-error').val() + '<br>';
                aErrorFields.push('altmailing-zip');
            }
        }
    }

    _.each(["contantprefernce", "atthesetimes"], function(el) {
        $("." + el + "-container", "#content-body").each(function() {
            var _contactPref = [];

            $(this).find("label").each(function() {
                var _that = $(this);

                if (_that.hasClass("on")) {
                    _contactPref.push(_that.data("section"));
                }

                if (_contactPref.length) {
                    _that.closest(".preferences").find("input").val(
                        _contactPref.join("_").replace(Tesla.user.contactPrefTime.join("_"), "ANYTIME")
                    );
                }
            })
        })

    })

    if (form_error != 0) {
        // remove existing divs
        if ($('#page-disable').length && !$('#profile-changepwd-div').is(':visible')) {
            $('#page-disable').remove();
        }
        if ($('#error-popup').length) {
            $('#error-popup').remove();
        }
        if ($('#processing-div').length && $('#processing-div').css('display') == 'block') {
            $('#processing-div').css('display','none');
        }

        var error_message = Drupal.t('A required field has been left blank. It is highlighted below in red.');
        var alt_error_message = Drupal.t('A required field has been left blank. It is highlighted below in red.');

        if (contact_error > 1) {
            error_message = Drupal.t('Some required fields have been left blank. They are highlighted below in red.');
        }
        if (altcontact_error > 1) {
            alt_error_message = Drupal.t('Some required fields have been left blank. They are highlighted below in red.');
        }
        if ((mail_error != 0) && (mailing_zip.trim())) {
            error_message = ((contact_error > 0) ? (error_message + '<br/>') : ('')) + Drupal.t('Postal Code is not valid. ') + mail_error_message_sample;
        }
        if ((altmail_error != 0) && (ac_zip.trim())) {
            alt_error_message = ((altcontact_error > 0) ? (alt_error_message + '<br/>') : ('')) + Drupal.t('Postal Code is not valid. ') + altmail_error_message_sample;
        }

        // weigh which section has more errors and scroll to it.
        if ((contact_error != 0) || (mail_error != 0)) {
            var scrollto_div = 'profile-msg-div';
            $('#profile-msg-div').css('display','block');
            $('#profile-msg-content-div').html(error_message);
            $('#profile-msg-content-div').fadeIn('slow');
            // $('#mailing-country-overlay').fadeOut('slow',function() {
                $('#mailing-country-overlay').remove();
            // });
        } else {
            if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
                var scrollto_div = 'profile-alt-msg-content-div';
                $('#profile-alt-msg-div').css('display','block');
                $('#profile-alt-msg-content-div').html(alt_error_message);
                $('#profile-alt-msg-content-div').fadeIn('slow');
            }
        }

        if (junk_data != 0) {
            if (junk_data == 2) {
                var scrollto_div = 'profile-alt-msg-content-div';
                $('#profile-alt-msg-div').css('display','block');
                $('#profile-alt-msg-content-div').html(junk_data_msg);
                $('#profile-alt-msg-content-div').fadeIn('slow');

            } else {
                var scrollto_div = 'profile-msg-div';
                $('#profile-msg-div').css('display','block');
                $('#profile-msg-content-div').html(junk_data_msg);
                $('#profile-msg-content-div').fadeIn('slow');
                $('#mailing-country-overlay').remove();
            }
        }

        if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
            $('#altmailing-country-overlay').remove();
        }

        $("html, body").animate({ scrollTop: ($("#"+scrollto_div).offset().top)-20 }, "slow",function() {
            if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
                changeProfileCountry('profile-alt-mailing-addr','altmailing');
            }
            if (!$('#mailing-country-overlay').length) {
                setTimeout(function() {
                    setMailingCountryOverlay('submitUserEditForm');
                },1000);
            }
            if (has_alt_contact == 'true' || is_adding_altcontact == 'true') {
                setTimeout(function() {
                    setAltMailingCountryOverlay('error');
                },1000);
            }
        });

        // $('#page').append('<div id="page-disable"></div>');
        // $('#page').append('<div id="profile-error"></div>');
        // var page_height = $(document).height();
        // var page_width = $(window).width();
        // var window_height = $(window).height();
        // var y_position = ((window_height/2));
        // var x_position = (page_width/2);
        // var div_width = $('#profile-error').width();
        // var div_height = $('#profile-error').height();
        // div_width = div_width/2;
        // div_height = div_height/2;
        // y_position = y_position - div_height;
        // x_position = x_position - div_width;
        // $('#profile-error').css('top',y_position);
        // $('#profile-error').css('left',x_position);

        // var error_msg_hdr = '<p><strong>'+$('#edit-profile-error-hdr').val()+'</strong></p>';
        // form_error_msg = error_msg_hdr + form_error_msg;
        // form_error_msg = form_error_msg + '<br><input type="button" name="closePopup" id="closePopup" value=" '+$('#edit-profile-error-showme').val()+' " />';
        // $('#profile-error').html(form_error_msg);

        if (aErrorFields.length > 0) {
            for(var i=0;i<aErrorFields.length;i++) {
                $('label[for="edit-'+aErrorFields[i]+'"]').attr('style','font-weight:bold;color:#cc0000;');
            }
        }

        // $('#page-disable').css('height',page_height);
        // $('#page-disable').fadeIn('slow', function() {
        //     $('#profile-error').css('display','block');
        // });

        // $('#closePopup').click(function() {
        //     $('#profile-error').css('display','none');
        //     $('#page-disable').fadeOut('slow',function() {
        //         $(this).remove();
        //         $('#profile-error').remove();
        //     });
        // });

        // $('#page-disable').click(function() {
        //     $('#profile-error').css('display','none');
        //     $('#page-disable').fadeOut('slow',function() {
        //         $(this).remove();
        //         $('#profile-error').remove();
        //     });
        // });

    } else {
        // show the "doing something" graphic overlay
        if (!origin) {
            showProcessingDiv('');
        }

        // remove the state/country overlays
        if ($('#mailing-country-overlay').length) {
            $('#mailing-country-overlay').css('display','none');
            $('#mailing-state-overlay').css('display','none');
        }
        if ($('#altmailing-country-overlay').length) {
            $('#altmailing-country-overlay').css('display','none');
            $('#altmailing-state-overlay').css('display','none');
        }

        // submit the form
        debug.error( $('#user-profile-form').serialize() );
        document.getElementById('user-profile-form').submit();

    }
}

// function submitSignInForm(mode,destination) {
//     if (mode == 'join') {
//         window.location.href=destination;
//     } else {
//         document.forms['user-login'].submit();
//     }
// }

function submitLoginForm(mode,destination) { // D7-TODO check if this is used

    var form_error = 0;
    var username_error = 0;
    var username_error_msg = '';
    var pass_error = 0;
    var pass_error_msg = '';
    var display_msg = '';
    var top_offset = -30;

    if (mode == 'join') {
        window.location.href=destination;
    } else {

        if ($('#edit-name')) {
            if ($('#edit-name').val() == '') {
                form_error = 1;
                username_error = 1;
                username_error_msg = 'Please enter a username';
                if (Drupal.settings.tesla.country == 'DE') {
                    username_error_msg = 'Benutzername eingeben.';
                } else if (Drupal.settings.tesla.country == 'FR') {
                    username_error_msg = 'Veuillez entrer un username.';
                } else if (Drupal.settings.tesla.country == 'IT') {
                    username_error_msg = 'Per favore inserisci uno username.';
                } else if (Drupal.settings.tesla.country == 'NL') {
                    username_error_msg = 'Geef een gebruikersnaam in.';
                } else if (Drupal.settings.tesla.country == 'JP') {
                    username_error_msg = 'ユーザー名を入力してください。';
                }
            }
        }

        if ($('#edit-pass')) {
            if ($('#edit-pass').val() == '') {
                form_error = 1;
                pass_error = 1;
                pass_error_msg = 'Please enter a password';
                if (Drupal.settings.tesla.country == 'DE') {
                    pass_error_msg = 'Bitte geben Sie ein gültiges Passwort ein.';
                } else if (Drupal.settings.tesla.country == 'FR') {
                    pass_error_msg = 'Veuiller entrer un mot de passe valide.';
                } else if (Drupal.settings.tesla.country == 'IT') {
                    pass_error_msg = 'Per favore inserisci una password valida.';
                } else if (Drupal.settings.tesla.country == 'NL') {
                    pass_error_msg = 'Geef een wachtwoord in.';
                } else if (Drupal.settings.tesla.country == 'JP') {
                    pass_error_msg = '有効なパスワードを入力してください。';
                }
            }
        }

        if (form_error > 0) {

            if ($('#messages-wrapper').length) {
                if ($('#messages-wrapper').css('display') == 'block') {
                    $('#messages-wrapper').remove();
                }
            }

            if (username_error == 1) {
                $('label.edit-name').attr('class','label-error');
                display_msg = username_error_msg;
            }

            if (pass_error == 1) {
                $('label.edit-pass').attr('class','label-error');
                display_msg = pass_error_msg;
                top_offset = 55;
            }

            if (username_error == 1 && pass_error == 1) {
                display_msg = username_error_msg + '<br>' + pass_error_msg;
                top_offset = -26;
            }

            display_msg = Drupal.t('We could not sign you in using the information you provided. Please try again.');
            top_offset = 55;

            $('#content-body').append('<div id="form-error-popup-rt"></div>');
            var pop_position = $('#edit-name').position();
            var x_position = pop_position.left-270;
            var y_position = pop_position.top+top_offset;
            $('#form-error-popup-rt').css('left',x_position);
            $('#form-error-popup-rt').css('top',y_position);
            $('#form-error-popup-rt').css('width','225px');
            $('#form-error-popup-rt').css('padding-left','15px');
            $('#form-error-popup-rt').css('padding-right','30px');
            $('#form-error-popup-rt').css('padding-top','20px');
            $('#form-error-popup-rt').css('font-size','11px');
            $('#form-error-popup-rt').css('line-height','15px');
            $('#form-error-popup-rt').html(display_msg);
            $('#form-error-popup-rt').fadeIn('fast');
        } else {
            // create login and username cookies
            var tesla_username_cookie = readCookie('tesla_username');
            // create username save cookie
            // create username for all cases
            var tmp_cookie_val = $('#edit-name').val();
            tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
            createCookie('tesla_username',tmp_cookie_val,360);

            var login_email_username = $('#edit-name').val();
            var login_register_url = $('#register-url').val();
            $.post("/user/check-shell", { email_username:login_email_username },
                function(data) {
                    if (data == 'shell') {
                        location.href=login_register_url+'?email='+login_email_username+'&shell=true';
                    } else {
                        document.forms['user-login'].submit();
                    }
            });

        }
    }

}

// check fields on each key input & only activate continue button when fields are filled D7-TODO check if this is used
function checkCreateAcctFields(origin) {
    var form_error = 0;

    // WEB-8822 / TFM
    // --------------
    // var uname = $('#edit-name').val();
    // --------------

    var email = $('#edit-mail').val();

    // trim and re-assign email + username only on blur
    $('#edit-mail').blur(function () {
         $('#edit-mail').val( trim($('#edit-mail').val()));
    });


    // WEB-8822 / TFM
    // --------------
    // $('#edit-name').blur(function () {
    //      $('#edit-name').val( trimWS($('#edit-name').val()));
    // });
    // --------------

    if (origin) {
        var fname = $('#edit-first-name').val();
        var lname = $('#edit-last-name').val();
        var password = $('#edit-pass-pass1').val();
        var password_confirm = $('#edit-pass-pass2').val();

        // WEB-8822 / TFM
        // --------------
        if ($("#edit-mollom-captcha-wrapper").length) {
            var captcha = $('#edit-mollom-captcha').val();
        }
        // --------------

        if (fname === '') {
            form_error = 1;
        }
        else if (lname === '') {
            form_error = 1;
        }
        else if (password === '') {
            form_error = 1;
        }
        else if (password_confirm === '') {
            form_error = 1;
        }
        // WEB-8822 / TFM
        // --------------
        else if (captcha === '') {
            form_error = 1;
        }
        // --------------

        if (
            $('.password-description').length &&
            $('.password-description').css('display') == 'block' &&
            $('#edit-pass-pass2').length &&
            $('#edit-pass-pass2').val() != '')
        {
            $('.password-description').css('display','none');
        }

    }

    // WEB-8822 / TFM
    // --------------
    // if (uname == '') {
    //     form_error = 1;
    // }
    // --------------

    if (checkEmail(email) == false) {
        form_error = 1;
    }

    // if ($('#useremail-check-message').css('display') == 'block') {
    //     form_error = 7;
    // }

    // WEB-9309 / TFM
    // ------------------------
    // if (form_error == 1) {
    //     // if ($('#messages-wrapper').length) {
    //     //     $('#messages-wrapper').fadeOut('slow');
    //     // }
    //     $('#btnCreateAccount').css('opacity','0.5');
    //     $('#btnCreateAccount').unbind('click');
    //     $('#btnCreateAccount').unbind('keyup');
    // } else {
    if (form_error === 0) {
    // ------------------------
        $('#edit-submit').unbind('click')
        .unbind('keyup')
        .css('opacity','1')
        .click(function() {
            submitCreateAcctForm(origin);
        })
        .keyup(function(event) {
            checkKeyPressed(event);
        });
    }
    else{
        $('#btnCreateAccount').unbind('click').unbind('keyup').css('opacity','0.5');
    }

}

// submit create account form D7-TODO check if this is used
function submitCreateAcctForm(origin) {
    var form_error = 0;

    // WEB-8822 / TFM
    // --------------
    var uname_error = 0;
    // --------------

    var email_error = 0;

    // WEB-8822 / TFM
    // --------------
    var uname = $('#edit-name').val();
    // --------------

    var email = $('#edit-mail').val();
    var is_shell = $('#edit-is-shell').val();
    if (origin) {
        var fname = $('#edit-first-name').val();
        var lname = $('#edit-last-name').val();
        var password = $('#edit-pass-pass1').val();
        var password_confirm = $('#edit-pass-pass2').val();

        var hasLetters = password.match(/[a-zA-Z]+/);
        var hasNumbers = password.match(/[0-9]+/);
        var hasPunctuation = password.match(/[^a-zA-Z0-9]+/);
        var hasCasing = password.match(/[a-z]+.*[A-Z]+|[A-Z]+.*[a-z]+/);

        if (fname == '') {
            form_error = 1;
        }
        if (lname == '') {
            form_error = 1;
        }
        if (password == '') {
            form_error = 1;
        }
        if (password_confirm == '') {
            form_error = 1;
        }
    }

    // WEB-8822 / TFM
    // --------------
    // if (uname == '') {
    //     form_error = 1;
    //     uname_error = 'This is not a valid username format. Please try again.';
    // }
    // --------------

    if (checkEmail(email) == false) {
        form_error = 1;
        email_error = Drupal.t('This is not a valid email address format. Please try again.');
    }
    if (password != password_confirm) {
        form_error = 1;
    }
    if (form_error == 0) {
        if (password.length < 8) {
            error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
            form_error = 1;
        } else if (password == uname) {
            error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
            form_error = 1;
        }
        else{
            var count = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0);
            strength_pass = count > 1 ? "pass" : "fail";
                if (strength_pass == "fail") {
                    error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
                    form_error = 1;
                }
        }
    }

    if (form_error == 1) {

        if ($('#pass-error').length) {
            $('#pass-error').remove();
        }
        if ($('#messages-wrapper').length) {
            $('#messages-wrapper').css('display','none');
        }
        // if ($('.password-description').length) {
        //     $('.password-description').css('display','none');
        // }

        $('#btnCreateAccount').unbind('click');

        if (!$('.password-description').length) {
            var position = $('#edit-pass-pass1').position();
            var x_offset = 0;
            var y_offset = 0;
            $('label[for="edit-pass-pass1"]').css('color','#cc0000');
            $('label[for="edit-pass-pass2"]').css('color','#cc0000');

            var pos_x = position.left + x_offset;
            var pos_y = position.top + y_offset;

            if ($('#pass-error').length) {
                $('#pass-error').remove();
            }
            // start fade in error popup

            $('#main-content').append('<div id="pass-error"></div>');
            $('#pass-error').html(error_msg);
            $('#pass-error').css('top',pos_y);
            $('#pass-error').css('left',pos_x);
            $('#pass-error').fadeIn('slow');
        }


    } else {
        // create username cookie
        var tesla_username_cookie = readCookie('tesla_username');
        var tesla_email_cookie = readCookie('tesla_email');

        // create username save cookie
        // in all cases
        if (tesla_username_cookie) {
            eraseCookie('tesla_username');
        }
        var tmp_cookie_val = $('#edit-name').val();
        tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
        createCookie('tesla_username',tmp_cookie_val);

        // create email save cookie
        // in all cases
        if (tesla_email_cookie) {
            eraseCookie('tesla_email');
        }
        var tmp_cookie_val = $('#edit-mail').val();
        tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
        createCookie('tesla_email',tmp_cookie_val);

        if (is_shell && is_shell == 'true') {
            debug.log('set the form action');
            var form_action = $('#edit-shell-url').val();
            $('#user-register').attr('action',form_action);
        }

        document.forms['user-register-form'].submit();

    }
}

// check email regex, includes "+" symbol for gmail D7-TODO check if this is used
function checkEmail(email) {
    //if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    if (/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) {
        return true;
    } else {
        return false;
    }
}

// trim white-space ie8 compatible
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}
function trim(string) {
    return string.trim();
}
// filter ie8 compatible - http://stackoverflow.com/questions/7153470/why-wont-filter-work-in-interent-explorer-8
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
        "use strict";

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }
        return res;
    };
}

// generic js back
function backBtnSubmit(trigger) {
    var destination;
    if (typeof trigger == 'object') {
        destination = $(trigger).data('destination');
        if (destination) {
            location.href = Drupal.settings.tesla.localePrefix + destination;
        }
    }
    else if (typeof trigger == 'string' && trigger) {
        if (trigger == 'drive_orientation') {
            destination=$('#edit-drive-back-url').val();
        }
        else if (trigger == 'basic_info') {
            destination=$('#edit-basic-back-url').val();
        }
        else {
            destination = Drupal.settings.tesla.localePrefix + '/own';
        }
        location.href = destination;
    } else {
        history.back();
    }
}

// submit login form if enter btn is pressed
function checkKeyPressed(e,method) {
    var unicode=e.keyCode? e.keyCode : e.charCode;
    if (unicode == 13) {
        if (document.getElementById('change-reservation-form')) {
            submitChangeReservationForm(method);
            //document.forms['change-reservation-form'].submit();
        }
        else if (document.getElementById('tesla-buy-paymethod-form')) {
            submitPaymentForm();
            //document.forms['tesla-buy-paymethod-form'].submit();
        }
        else if (document.getElementById('tesla-buy-basic-form')) {
            submitBasicForm(method);
            //document.forms['tesla-buy-basic-form'].submit();
        }
        else if (document.getElementById('buy-form-complete-account')) {
            submitCompleteAcctForm();
        }
        else if ($('#page-user-edit').length || $('#page-user-me-edit').length) {
            submitUserEditForm();
        }
        else if ($('#page-booking-payment').length && (method == 'billing-btnnext-cont' || method == 'billing-btnnext-nocc' || method == 'billing-btnnext-achcont' || method == 'billing-terms-checkbox-div')) {
            submitBookingPaymentForm();
        }
    }
    else if (unicode == 32) {
        if ($('#res_agreement_div').length && !method) {
            setTermsCheckBox();
        }
        if ($('#get_teslaupdates_div').length && method == 'get_teslaupdates_div') {
            setGTUCheckBox();
        }
        if ($('#get_teslaupdates_div').length && method == 'get_teslaupdates_alt_div') {
            setGTUCheckBox('altmailing');
        }
        if ($('#billing-terms-checkbox-div').length && method == 'billing-terms-checkbox-div') {
            setACHPaymentCheckBox();
        }
        if ($('#billing-ach-checkbox-div').length && method == 'billing-ach-checkbox-div') {
            setACHPaymentCheckBox();
        }
    }
}

// display processing overlay
function showProcessingDiv(method) {

    // start fade in error popup
    var processing_img = '<img src="/tesla_theme/assets/img/processing-graphic.gif" />';
    var processing_msg = '';
    var $page = $('#page');
    $page.append('<div id="page-disable"></div>');
    var page_height = $(document).height();
    var window_height = $(window).height();
    var scrollLen = $(window).scrollTop();
    var y_position = (window_height/2)-150;
    y_position = y_position + scrollLen;
    $('#page-disable').css('height',page_height);
    var page_width = $(window).width();
    var x_position = (page_width/2)-250;
    $('#page-disable').css('z-index','9998');
    $('#page-disable').css('filter','alpha(opacity=60)');

    $page.append($('#processing-div'));
    $('#processing-div').css('top',y_position);
    $('#processing-div').css('left',x_position);
    // show custom message based on method var
    if (method == 'pp') {
        $('#processing-img').hide();
        processing_msg = 'Please wait, you are being sent to PayPal<br>to complete your reservation.';
    }

    if (processing_msg != '') {
        $('#processing-text-p').html(processing_msg);
    }
    $('#page-disable').fadeIn('slow', function() {
        $('#processing-div').show();
    });

}
// remove processing div
function killProcessingDiv() {
    $('#page-disable').remove();
    $('#processing-div').remove();
}

function checkTextAreaLength(textAreaObj,maxLen) {
    var currentLength = textAreaObj.value.length;
    var currentValue = textAreaObj.value;
    var newValue = '';
    var charsRemaining = maxLen - currentLength;
    if (currentLength > maxLen) {
        newValue = currentValue.substring(0,maxLen);
        document.getElementById(textAreaObj.id).value=newValue;
    }
    if (charsRemaining < 0) {
        charsRemaining = 0;
    }
    document.getElementById(textAreaObj.id+'_chars').value = charsRemaining;
}

// D7-TODO: Change to use native Drupal js functions
function gotoDesignStudio(model,locale,params) {
    var destination = '';
    var subdest = 'design/';
    if (model == 'mx' || model == 'mxs') {
        subdest = '';
    }
    if (locale && locale != '' && locale != 'en_US') {
        if (locale == 'ja_JP') {
            locale = 'jp';
        }
        if (locale == 'zh_CN') {
            locale = 'cn';
        }
    }
    if (locale != '') {
        destination = '/'+model+'/'+subdest;
    } else {
        destination = '/'+locale+'/'+model+'/'+subdest;
    }
    if (params != '') {
        destination += '?' + params;
    }
    window.location.href=destination;
}

function gotoURL(destination,locale) {

    if (locale && locale != '' && locale != 'en_US') {
        if (locale == 'ja_JP') {
            locale = 'jp';
        }
        if (locale == 'zh_CN') {
            locale = 'cn';
        }
        window.location.href='/'+locale+'/'+destination;
    } else {
        window.location.href='/'+destination;
    }

}

// mytesla profile js
function setGTUCheckBox(id) {
    var checkbox = 'edit-get-teslaupdates-check';
    var image = 'get-teslaupdates-checkbox';
    if (id) {
        if (id == 'gtu_div') {
            checkbox = 'newsletter';
            image = 'get-teslaupdates-checkbox';
        } else {
            checkbox = 'edit-get-teslaupdates-alt-check';
            image = 'get-teslaupdates-alt-checkbox';
        }
    }
    if ($('#'+checkbox).length) {
        if ($('#'+checkbox).val() == '0') {
            $('#'+checkbox).val('1');
            $('#'+image).attr('src','/tesla_theme/assets/img/own/own-terms-checkbox-on.png');
        } else {
            $('#'+checkbox).val('0');
            $('#'+image).attr('src','/tesla_theme/assets/img/own/own-terms-checkbox-off.png');
        }
    }
}

function openAltContactDiv(scroll) {
    changeProfileCountry('profile-alt-mailing-addr','altmailing');
    if ($('#edit-profile-hasalt-contact').val() == 'false') {
        $('#edit-profile-addingalt-contact').val(1);
        // $('#btnSelectDO').unbind('click');
    }
    $('#edit-profile-hasalt-contact').val('true');
    // checkProfileRequiredFields('open');
    if ($('#profile-alternate-contact').length) {
        if ($('#profile-alternate-contact').css('display') == 'none') {
            var altcontactlabel1 = $('#altcontact_label_1').val();
            var altcontactlabeltmp = $('#edit-profile-addcontact-tmp').val();
            $('#profile-addremove-icon').css('background-image','url(/tesla_theme/assets/img/icn_removecontact_32x32.png)');
            $('#profile-addremove-icon').css('float','right');
            $('#profile-addremove-icon').css('backgroundPosition','0px -2px');
            // $('#profile-addremove-icon').css('right','-20');
            $('#profile-addremove-title').css('float','right');
            $('#profile-addremove-title').html(altcontactlabel1);
            $('#profile-addremove-icon').before('<div id="profile-addremove-title-tmp"></div>');
            $('#profile-addremove-title-tmp').html(altcontactlabeltmp);
            $('#profile-alternate-contact').slideDown('slow',function() {
                // set position of country dropdown overlay
                var altCountryPosition = $('#edit-altmailing-country').position();
                var altCountryPositionX = altCountryPosition.left-3;
                var altCountryPositionY = altCountryPosition.top;
                var alt_ctry_code = $('#edit-altmailing-country').val().toLowerCase();
                var alt_ctry_label = $('#edit-altmailing-country option:selected').text().substring(0,24);
                $('#altmailing-country-overlay').css('left',altCountryPositionX);
                $('#altmailing-country-overlay').css('top',altCountryPositionY);
                // if locale supported country, show flag in dropdown
                if (alt_ctry_code == 'us' || alt_ctry_code == 'ca' || alt_ctry_code == 'au' || alt_ctry_code == 'at' || alt_ctry_code == 'be' || alt_ctry_code == 'dk' || alt_ctry_code == 'de' || alt_ctry_code == 'fr' || alt_ctry_code == 'gb' || alt_ctry_code == 'it' || alt_ctry_code == 'nl' || alt_ctry_code == 'ch' || alt_ctry_code == 'hk' || alt_ctry_code == 'jp' || alt_ctry_code == 'cn') {
                    $('#altmailing-country-overlay').html('<img src="/tesla_theme/assets/img/icn_'+alt_ctry_code+'_flag_no_shadow.png" width="16" height="11" class="basic-flag" />&nbsp;'+alt_ctry_label);
                }
                // set position of state/province dropdown overlay
                if (!$('#altmailing-province-istextbox').length && $('#edit-altmailing-state').length) {
                    var provPosition = $('#edit-altmailing-state').position();
                    var provPositionX = provPosition.left - 2;
                    var provPositionY = provPosition.top + 2;
                    $('#altmailing-state-overlay').css('left',provPositionX);
                    $('#altmailing-state-overlay').css('top',provPositionY);
                }

                if (!scroll) {
                    $("html, body").animate({ scrollTop: ($("#profile-addremove-div").offset().top)-30 }, "slow");
                }

                $('#get_teslaupdates_alt_div').fadeIn('fast');
                // $('#altmailing-country-overlay').fadeIn('slow');
                setAltMailingCountryOverlay('origin');
                if ($('#edit-profile-hasalt-contact').length && $('#edit-profile-hasalt-contact').val() == 'true') {
                    $('#altmailing-country-overlay').fadeIn('slow');
                }
                // if ($('#edit-profile-addingalt-contact').length && $('#edit-profile-addingalt-contact').val() == '1') {
                //     $('#edit-altcontact-firstname').focus();
                // }
                // $('#altmailing-state-overlay').fadeIn('slow');
            });
            $('#profile-addremove-icon').unbind('click');
            $('#profile-addremove-icon').click(function() {
                removeAltContactDiv();
            });
            $('#profile-addremove-title').unbind('click');
            $('#profile-addremove-title').click(function() {
                removeAltContactDiv();
            });
        }
    }
}

function removeAltContactDiv() {
    if ($('#profile-alternate-contact').length) {
        if ($('#profile-alternate-contact').css('display') == 'block') {
            if ($('#edit-profile-addingalt-contact').val() == '1') {
                $('#edit-profile-addingalt-contact').val(0);
            }
            if ($('#edit-profile-altcontactid').length && $('#edit-profile-altcontactid').val() != '') {
                // start fade in error popup
                $('#page').append('<div id="page-disable"></div>');
                var page_height = $(document).height();
                var page_width = $(window).width();
                var window_height = $(window).height();
                var y_position = ((window_height/2));
                var x_position = (page_width/2);
                var div_width = $('#profile-removeprompt-div').width();
                var div_height = $('#profile-removeprompt-div').height();
                div_width = div_width/2;
                div_height = div_height/2;
                y_position = y_position - div_height;
                x_position = x_position - div_width;

                $('#page-disable').css('height',page_height);

                $('#profile-removeprompt-div').css('left',x_position);
                $('#profile-removeprompt-div').css('top',y_position);
                $('#profile-popup-closex').css('left',x_position-23);
                $('#profile-popup-closex').css('top',y_position-23);

                $('#page-disable').fadeIn('slow', function() {
                    $('#profile-removeprompt-div').css('display','block');
                    $('#profile-popup-closex').css('display','block');
                    $('#profile-popup-closex').unbind('click');
                    $('#profile-popup-closex').click(function() {
                        $('#removeprompt-btn-confirm-cancel').trigger('click');
                    });
                });
            } else {
                clearProfileAltContactFields();
                $('#profile-alt-msg-div').fadeOut('fast');
                $('#edit-profile-hasalt-contact').val('false');
                $('#profile-alt-mailing-addr').fadeOut('fast');
                $('#get_teslaupdates_alt_div').fadeOut('fast');
                $('#altmailing-state-overlay').remove();
                $('#altmailing-country-overlay').fadeOut('fast',function() {
                    $('#profile-alternate-contact').slideUp('slow',function() {
                        $('#profile-addremove-title-tmp').remove();
                        $('#profile-addremove-icon').css('background-image','url(/tesla_theme/assets/img/icn_addcontact_32x32.png)');
                        $('#profile-addremove-icon').css('background-position','-10px 0px');
                        $('#profile-addremove-icon').css('float','left');
                        $('#profile-addremove-title').css('float','left');
                        $('#profile-addremove-title').html($('#altcontact_label_2').val());
                        $("html, body").animate({ scrollTop: ($("#content-body").offset().top) }, "slow");
                        checkProfileRequiredFields('close');
                        // set the click function for re-opening altcontact div
                        $('#profile-addremove-icon').unbind('click');
                        $('#profile-addremove-icon').click(function() {
                            openAltContactDiv();
                        });
                        $('#profile-addremove-title').unbind('click');
                        $('#profile-addremove-title').click(function() {
                            openAltContactDiv();
                        });
                    });
                });
                $('#altmailing-country-overlay').remove();
            }
        }
    }
}

function clearProfileAltContactFields() {
    var aReqd = new Array();
    aReqd.push('altcontact-firstname');
    aReqd.push('altcontact-lastname');
    aReqd.push('altcontact-mail');
    aReqd.push('altcontact-phone');
    aReqd.push('altcontact-firstname');
    aReqd.push('altmailing-address-1');
    aReqd.push('altmailing-address-2');
    if ($('#altmailing-country').val() != 'JP') {
        aReqd.push('altmailing-city');
    }
    if ($('#altmailing-province-istextbox').length) {
        aReqd.push('altmailing-state');
    }
    aReqd.push('altmailing-zip');

    for(var i=0;i<aReqd.length;i++) {
        $('#edit-'+aReqd[i]).val('');
    }

}

function openChangePwdDiv() {
    if ($('#page-disable')) {
        $('#page-disable').remove();
    }
    // start fade in error popup
    $('#page').append('<div id="page-disable"></div>');
    var page_height = $(document).height();
    var page_width = $(window).width();
    var window_height = $(window).height();
    var y_position = ((window_height/2));
    var x_position = (page_width/2);
    var div_width = $('#profile-changepwd-div').width();
    var div_height = $('#profile-changepwd-div').height();
    div_width = div_width/2;
    div_height = div_height/2;
    y_position = y_position - div_height;
    x_position = x_position - div_width;

    $('#page-disable').css('height',page_height);

    $('#profile-changepwd-div').css('left',x_position);
    $('#profile-changepwd-div').css('top',y_position);
    $('#profile-popup-closex').css('left',x_position-23);
    $('#profile-popup-closex').css('top',y_position-23);

    $('#page-disable').fadeIn('slow', function() {
        $('#profile-changepwd-div').css('display','block');
        $('#edit-changepwd-current').focus();
        $('#profile-popup-closex').css('display','block');
        $('#profile-popup-closex').unbind('click');
        $('#profile-popup-closex').click(function() {
            $('#changepwd-btn-cancel').trigger('click');
        });
    });

}

function openChangePhotoDiv() {
    if ($('#page-disable')) {
        $('#page-disable').remove();
    }
    // start fade in error popup
    $('#page').append('<div id="page-disable"></div>');
    var page_height = $(document).height();
    var page_width = $(window).width();
    var window_height = $(window).height();
    var y_position = ((window_height/2));
    var x_position = (page_width/2);
    var div_width = $('#profile-changephoto-div').width();
    var div_height = $('#profile-changephoto-div').height();
    div_width = div_width/2;
    div_height = div_height/2;
    y_position = y_position - div_height;
    x_position = x_position - div_width;
    // if ($.browser.msie) {
    //     $('#page-disable').css('opacity','0.6');
    //     $('#page-disable').css('z-index','9999');
    //     $('#page').append($('#profile-changephoto-div'));
    //     $('#profile-changephoto-div').css('z-index','10000');
    // }

    $('#page-disable').css('height',page_height);

    $('#profile-changephoto-div').css('left',x_position);
    $('#profile-changephoto-div').css('top',y_position);
    $('#profile-popup-closex').css('left',x_position-23);
    $('#profile-popup-closex').css('top',y_position-23);

    $('#page-disable').fadeIn('slow', function() {
        $('#profile-changephoto-div').css('display','block');
        $('#profile-popup-closex').css('display','block');
        $('#profile-popup-closex').unbind('click');
        $('#profile-popup-closex').click(function() {
            $('#changephoto-btn-cancel').trigger('click');
        });
    });

}

function setProfileAltContactRadio(value) {
    if (value == 0) {
        $('#profile-contactprefs-radio1').css('background','url(/tesla_theme/assets/img/bg_radio_on.png)');
        $('#profile-contactprefs-radio2').css('background','url(/tesla_theme/assets/img/bg_radio_off.png)');
    } else {
        $('#profile-contactprefs-radio1').css('background','url(/tesla_theme/assets/img/bg_radio_off.png)');
        $('#profile-contactprefs-radio2').css('background','url(/tesla_theme/assets/img/bg_radio_on.png)');
    }
    if ($('#contact_prefs').length) {
        $('#contact_prefs').val(value);
    }
}

// D7-TODO: Do we still need this?
function checkPassEmailField(origin) {
    var email = $('#edit-name').val();
    var form_error = 0;

    if ($('#edit-name').length) {

        if (!email) {
            form_error = 1;
        }
        else if (email == '') {
            form_error = 1;
        }
        else if (!origin && checkEmail(email) == false) {
            form_error = 1;
        }
        if ($('#edit-pass').length) {
            var password = $('#edit-pass').val();
            if (!password) {
                form_error = 1;
            } else if (password == '') {
                form_error = 1;
            }
        }

        if (form_error == 0) {
            $('#btnSelectDO').css('opacity','1');
            $('#btnSelectDO').unbind('click');
            $('#btnSelectDO').click(function(e) {
                if (origin && origin == 'login') {
                    submitLoginForm('login', null, e);
                }
                else {
                    submitPassForm();
                }
            });
        }
        else {
            $('#btnSelectDO').css('opacity','0.5');
            $('#btnSelectDO').unbind('click');
        }
    }
}

function checkChinaResetPasswordFields() {
    var inputEmail = $('#edit-name').val().trim();
    var inputReCaptcha = $('#china_recpatcha').val().trim();
    var submitButton = $('#btnSelectDO');
    if (inputEmail && checkEmail(inputEmail) && inputReCaptcha.length == 5) {
        submitButton.css('opacity','1')
            .unbind('click')
            .click(function() {
                submitPassForm();
            });
    }
    else {
        submitButton.css('opacity','0.5').unbind('click');
    }
}

function checkChangePasswordFields(action) {

    var form_error = 0;
    var password = $('#edit-pwd').val();
    var password_confirm = $('#edit-pwd-confirm').val();
    var username = $('#edit-username').val();
    var error_msg = Drupal.t('Your passwords don\’t match. Please try again.');

    $('label[for="edit-pwd"]').css('color','#666666');
    $('label[for="edit-pwd-confirm"]').css('color','#666666');

    if (password == '' || password == null) {
        form_error = 1;
    }
    if (password_confirm == '' || password_confirm == null) {
        form_error = 1;
    }

    if (action == 'submit') {
        if (password != password_confirm) {
            form_error = 1;
        }
        if (form_error == 0) {
            if (password.match(/[a-z]+/) == null) {
                error_msg = Drupal.t('Your password should contain a lowercase letter, an uppercase letter, and one number.');
                form_error = 1;
            } else if (password.match(/[A-Z]+/) == null) {
                error_msg = Drupal.t('Your password should contain a lowercase letter, an uppercase letter, and one number.');
                form_error = 1;
            } else if (password.match(/[0-9]+/) == null) {
                error_msg = Drupal.t('Your password should contain a lowercase letter, an uppercase letter, and one number.');
                form_error = 1;
            } else if (password.length < 6) {
                error_msg = Drupal.t('Your password must be longer than 6 characters.');
                form_error = 1;
            } else if (password == username) {
                error_msg = Drupal.t('Your password cannot be the same as your username.');
                form_error = 1;
            }
        }
    }

    if (form_error == 0) {
        if (action != 'submit') {
            // submit form
            $('#btnSelectDO').css('opacity','1');
            $('#btnSelectDO').unbind('click');
            $('#btnSelectDO').click(function() {
                checkChangePasswordFields('submit');
            });
        } else {
            if ($('#pass-error').length) {
                $('#pass-error').remove();
            }
            // document.forms['user-pass-reset'].submit();
            var userid = $('#edit-uid').val();
            var container = $('#pass-reset-form-container');
            var page_origin = 'change';

            $.post("/user/reset-password", {uid: userid, pass: password, origin: page_origin},
            function(data) {
                if (data === 'error') {
                    error_msg = '<strong>'+Drupal.t('Reset Failed')+'</strong><br/>'+Drupal.t('There seems to have been an error saving your password. Please try again.');
                    setPassResetError('submit',error_msg);
                } else {
                    container.fadeOut(function() {
                        container.html(data);
                        container.fadeIn(function() {});
                    });
                }
            });
        }
    } else {
        setPassResetError(action,error_msg);
    }
}

function changeChinaRecaptcha() {
    var img = new Image();
    img.src = '/get_recaptcha?t=' + new Date().getTime();
    img.onload = function() {
        $('#china-recaptcha-image').attr('src', img.src);
    }
}

function setPassResetError(action,error_msg) {
    if ($('#password-description warning').length) {
        $('#password-description warning').css('display','none');
    }
    if (action == 'submit' && !$('.password-description.error').length) {
        if ($('#page-user-change-pass').length) {
            var position = $('#edit-pass-pass1').position();
            var x_offset = -270;
            var y_offset = 55;
            $('label[for="edit-pass-pass1"]').css('color','#cc0000');
            $('label[for="edit-pass-pass2"]').css('color','#cc0000');
        } else {
            var position = $('#edit-pass-pass1').position();
            var x_offset = 520;
            var y_offset = 203;
            $('label[for="edit-pass-pass1"]').css('color','#cc0000');
            $('label[for="edit-pass-pass2"]').css('color','#cc0000');
        }

        var pos_x = position.left + x_offset;
        var pos_y = position.top + y_offset;

        if ($('#pass-error').length) {
            $('#pass-error').remove();
        }
        // start fade in error popup

        $('#main-content').append('<div id="pass-error"></div>');
        $('#pass-error').html(error_msg);
        $('#pass-error').css('top',pos_y);
        $('#pass-error').css('left',pos_x);
        $('#pass-error').fadeIn('slow');
    }
    else {
        $('#btnSelectDO').css('opacity','0.5');
        $('#btnSelectDO').unbind('click');
    }
}

// D7-TODO: Do we still need this?
function submitPassForm(method) {

    if (method && method == 'cancel') {
        var dest = $('#destination').val();
        var locale_prefix = '';
        if (Drupal.settings.tesla.locale != 'en_US') {
            locale_prefix = Drupal.settings.tesla.locale;
            if (locale_prefix == 'ja_JP') {
                locale_prefix = 'jp';
            }
            if (locale_prefix == 'zh_CN') {
                locale_prefix = 'cn';
            }
            locale_prefix = '/' + locale_prefix;
        }

        dest = locale_prefix + '/user/login';
        window.location.href=dest;
    }
    else {
        document.forms['user-pass'].submit();
    }

}

function checkRefundMethod(obj) {
    var refund_type = obj.value;
    if ($('#tracking_number_p').length) {
        if (refund_type != 'ck') {
            if ($('#tracking_number_p').css('display') == 'block') {
                $('#tracking_number_p').fadeOut('slow');
            }
        }
        else {
            if ($('#tracking_number_p').css('display') == 'none') {
                $('#tracking_number_p').fadeIn('slow');
            }
        }
    }
}

function setAchAcctType(elemId) {
    if ($('#page-servicesignup-payment').length) {
        $('#billing-ach-accttype').val($('#'+elemId).attr('rel'));
        $('#paymethod_ach_checking').css('background-image','url(/tesla_theme/images/btn_radio_off.png?20150108)');
        $('#paymethod_ach_checking').css('background-size','24px 24px');
        $('#paymethod_ach_savings').css('background-image','url(/tesla_theme/images/btn_radio_off.png?20150108)');
        $('#paymethod_ach_savings').css('background-size','24px 24px');
        $('#paymethod_ach_corpchecking').css('background-image','url(/tesla_theme/images/btn_radio_off.png?20150108)');
        $('#paymethod_ach_corpchecking').css('background-size','24px 24px');
        $('#'+elemId).css('background-image','url(/tesla_theme/images/btn_radio_on.png?20150108)');
        $('#'+elemId).css('background-size','24px 24px');
    }

}

function toggleSubCheckBox() {
    if ($('input[id=edit-submitted-subscriptions--c-1]').is(":checked")) {
        $('input[id=edit-submitted-subscriptions--c-1]').attr('checked', false);
        // $("[name*='is_get_tesla_update_checkbox_present']").val('false');
        $('#subsCheckbox').css('background-position', '0px 0px');
    }
    else {
        $('input[id=edit-submitted-subscriptions--c-1]').attr('checked', true);
        // $("[name*='is_get_tesla_update_checkbox_present']").val('true');
        $('#subsCheckbox').css('background-position', '0px -21px');
    }
}

// D7-TODO: Do we still need this?
Tesla.modal = function(obj, params) {

    if (obj !== null && typeof(obj) != "undefined" ) {
        obj.colorbox(params);
    }
    else {
        return $.colorbox(params);
    }
};

function getLocalePrefix() {
    var localePrefix = ""; // en_US

    if (_.indexOf(["zh_CN","en_US"], Drupal.settings.tesla.locale) === -1) {
        localePrefix = Drupal.settings.tesla.locale;

        if (localePrefix == "ja_JP") {
            localePrefix = "jp";
        }

        localePrefix = "/" + localePrefix;
    }

    return localePrefix;
}

function use12HourClockForLocale() {
    var use12HourClock;
    var locale = Drupal.settings.tesla.locale;
    switch (locale) {
        case "":
        case "en_CA":
        case "en_US":
        case "fr_CA":
        case "en_AU":
        case "en_HK":
        case "zh_HK":
        case "en_MO":
        case "zh_MO":
            use12HourClock = true;
            break;
        default:
            use12HourClock = false;
            break;
    }
    return use12HourClock;
}

// D7-TODO: Move to a localize js file
function isEuCountryCode(twoCharCountryCode) {
    var twoCharCountryCode = twoCharCountryCode || Drupal.settings.tesla.country;
    twoCharCountryCode = twoCharCountryCode.toUpperCase();

    var regions_by_country = {
        "AD": "OT",
        "AE": "OT",
        "AF": "OT",
        "AG": "OT",
        "AI": "OT",
        "AL": "OT",
        "AM": "OT",
        "AN": "OT",
        "AO": "OT",
        "AQ": "OT",
        "AR": "OT",
        "AS": "OT",
        "AT": "EU",
        "AU": "AU",
        "AW": "OT",
        "AZ": "OT",
        "BA": "OT",
        "BB": "OT",
        "BD": "OT",
        "BE": "EU",
        "BF": "OT",
        "BG": "EU",
        "BH": "OT",
        "BI": "OT",
        "BJ": "OT",
        "BM": "OT",
        "BN": "OT",
        "BO": "OT",
        "BR": "OT",
        "BS": "OT",
        "BT": "OT",
        "BV": "OT",
        "BW": "OT",
        "BY": "OT",
        "BZ": "OT",
        "CA": "CA",
        "CC": "OT",
        "CD": "OT",
        "CF": "OT",
        "CG": "OT",
        "CH": "EU",
        "CI": "OT",
        "CK": "OT",
        "CL": "OT",
        "CM": "OT",
        "CN": "OT",
        "CO": "OT",
        "CR": "OT",
        "CU": "OT",
        "CV": "OT",
        "CX": "OT",
        "CY": "EU",
        "CZ": "EU",
        "DE": "EU",
        "DJ": "OT",
        "DK": "EU",
        "DM": "OT",
        "DO": "OT",
        "DZ": "OT",
        "EC": "OT",
        "EE": "OT",
        "EG": "OT",
        "EH": "OT",
        "ER": "OT",
        "ES": "EU",
        "EU": "EU",
        "ET": "OT",
        "FI": "EU",
        "FJ": "OT",
        "FK": "OT",
        "FM": "OT",
        "FO": "OT",
        "FR": "EU",
        "GA": "OT",
        "GB": "GB",
        "GD": "OT",
        "GE": "OT",
        "GF": "OT",
        "GH": "OT",
        "GI": "OT",
        "GL": "OT",
        "GM": "OT",
        "GN": "OT",
        "GP": "OT",
        "GQ": "OT",
        "GR": "EU",
        "GS": "OT",
        "GT": "OT",
        "GU": "OT",
        "GW": "OT",
        "GY": "OT",
        "HK": "HK",
        "HM": "OT",
        "HN": "OT",
        "HR": "EU",
        "HT": "OT",
        "HU": "EU",
        "ID": "OT",
        "IE": "EU",
        "IL": "OT",
        "IN": "OT",
        "IO": "OT",
        "IQ": "OT",
        "IR": "OT",
        "IS": "EU",
        "IT": "EU",
        "JM": "OT",
        "JO": "OT",
        "JP": "JP",
        "KE": "OT",
        "KG": "OT",
        "KH": "OT",
        "KI": "OT",
        "KM": "OT",
        "KN": "OT",
        "KP": "OT",
        "KR": "OT",
        "KW": "OT",
        "KY": "OT",
        "KZ": "OT",
        "LA": "OT",
        "LB": "OT",
        "LC": "OT",
        "LI": "EU",
        "LK": "OT",
        "LR": "OT",
        "LS": "OT",
        "LT": "OT",
        "LU": "EU",
        "LV": "OT",
        "LY": "OT",
        "MA": "OT",
        "MC": "EU",
        "MD": "OT",
        "ME": "OT",
        "MG": "OT",
        "MH": "OT",
        "MK": "OT",
        "ML": "OT",
        "MM": "OT",
        "MN": "OT",
        "MO": "MO",
        "MP": "OT",
        "MQ": "OT",
        "MR": "OT",
        "MS": "OT",
        "MT": "EU",
        "MU": "OT",
        "MV": "OT",
        "MW": "OT",
        "MX": "OT",
        "MY": "OT",
        "MZ": "OT",
        "NA": "OT",
        "NC": "OT",
        "NE": "OT",
        "NF": "OT",
        "NG": "OT",
        "NI": "OT",
        "NL": "EU",
        "NO": "EU",
        "NP": "OT",
        "NR": "OT",
        "NU": "OT",
        "NZ": "OT",
        "OM": "OT",
        "PA": "OT",
        "PE": "OT",
        "PF": "OT",
        "PG": "OT",
        "PH": "OT",
        "PK": "OT",
        "PL": "OT",
        "PM": "OT",
        "PN": "OT",
        "PR": "OT",
        "PS": "OT",
        "PT": "OT",
        "PW": "OT",
        "PY": "OT",
        "QA": "OT",
        "RE": "OT",
        "RO": "OT",
        "RS": "OT",
        "RU": "OT",
        "RW": "OT",
        "SA": "OT",
        "SB": "OT",
        "SC": "OT",
        "SD": "OT",
        "SE": "EU",
        "SG": "OT",
        "SH": "OT",
        "SI": "OT",
        "SJ": "OT",
        "SK": "OT",
        "SL": "OT",
        "SM": "OT",
        "SN": "OT",
        "SO": "OT",
        "SR": "OT",
        "ST": "OT",
        "SV": "OT",
        "SY": "OT",
        "SZ": "OT",
        "TC": "OT",
        "TD": "OT",
        "TF": "OT",
        "TG": "OT",
        "TH": "OT",
        "TJ": "OT",
        "TK": "OT",
        "TL": "OT",
        "TM": "OT",
        "TN": "OT",
        "TO": "OT",
        "TR": "OT",
        "TT": "OT",
        "TV": "OT",
        "TW": "OT",
        "TZ": "OT",
        "UA": "OT",
        "UG": "OT",
        "UM": "OT",
        "US": "US",
        "UY": "OT",
        "UZ": "OT",
        "VA": "OT",
        "VC": "OT",
        "VE": "OT",
        "VG": "OT",
        "VI": "OT",
        "VN": "OT",
        "VU": "OT",
        "WF": "OT",
        "WS": "OT",
        "YE": "OT",
        "YT": "OT",
        "ZA": "OT",
        "ZM": "OT",
        "ZW": "OT"
    };

    return regions_by_country[twoCharCountryCode] === "EU";
}

// Enable social sharing widget
function initSocialSharingWidget() {
    var widget = $('#tesla-social-widget');
    var type = null;
    var url = null;
    var message = null;
    var page = document.URL;
    var width = 550
    var height = 450;
    if (widget.length !== 0) {
        widget.find('a').each(function() {
            type = $(this).attr('class');
            switch (type) {
                case 'facebook':
                    url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(page);
                    break;
                case 'twitter':
                    message = $(this).find('span').text();
                    url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(message) + '&url=' + encodeURIComponent(page) + '&via=' + encodeURIComponent('TeslaMotors') + '&related=' + encodeURIComponent('TeslaMotors,elonmusk');
                    break;
                case 'google':
                    url = 'https://plus.google.com/share?url=' + encodeURIComponent(page);
                    break;
            }
            if (url !== null) {
                $(this).attr('href', url);
            }
        });
        widget.on('click', 'a', function(e) {
            e.preventDefault();
            window.open($(this).attr('href'), '_blank', 'width=' + width + ', height=' + height);
        });
    }
}

////////////////////////////////////////////////////
// return postalcode formatting for each country
function getPostalCodeRegexMatrix(country_code) {
    //debug.info( 'getPostalCodeRegexMatrix', country_code );

    var postal_code_matrix = {
        "US": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "94304"
              },
        "CA": {
            "regex": "^[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[ ]?[0-9]{1}[a-zA-Z]{1}[0-9]{1}",
            "separator": " ",
            "separator_count": "3",
            "maxlen": "7",
            "minlen": "6",
            "sample": "V3H 1Z7"
              },
        "AD": "",
        "AE": "",
        "AT": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "AU": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "BE": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "BG": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "CH": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "CY": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "CN": {
            "regex": "^([0-9]{6})?$", //WEB-8715 - is optional
            "maxlen": "6",
            "minlen": "0",
            "sample": "123456"
              },
        "CZ": {
            "regex": "^[0-9]{3}[ ]?[0-9]{2}",
            "separator": " ",
            "separator_count": "3",
            "maxlen": "6",
            "minlen": "5",
            "sample": "123 12"
              },
        "DE": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "4",
            "sample": "12345"
              },
        "DK": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "EE": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "ES": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "EU": "",
        "FI": {
            "regex": "^[0-9]{3,5}",
            "maxlen": "5",
            "minlen": "3",
            "sample": "12345"
              },
        "FR": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "GB": "", // WEB-30281
        "GI": {
            "regex": "^[A-Z]{1,2}[0-9]{1,2}[A-Z]?[ ][0-9][A-Z]{2}$",
            "maxlen": "9",
            "minlen": "5",
            "sample": "A9 9AA"
              },
        "GR": {
            "regex": "^[0-9]{3}[ ]?[0-9]{2}",
            "separator": " ",
            "separator_count": "3",
            "maxlen": "6",
            "minlen": "5",
            "sample": "123 12"
              },
        "HK": "",
        "HR": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "HU": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "IE": "",
        "IS": {
            "regex": "^[0-9]{3}",
            "maxlen": "3",
            "minlen": "3",
            "sample": "123"
              },
        "IT": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "JP": {
            "regex": "^[0-9]{3}-[0-9]{4}",
            "maxlen": "8",
            "minlen": "8",
            "sample": "123-4567"
              },
        "KR": {
            "regex": "^[0-9]{3}[-]?[0-9]{3}",
            "separator": "-",
            "separator_count": "3",
            "maxlen": "7",
            "minlen": "6",
            "sample": "123-123"
              },
        "LI": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "LU": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "LT": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "LV": {
            "regex": "^(LV-)[0-9]{4}",
            "maxlen": "7",
            "minlen": "7",
            "sample": "LV-1234"
              },
        "MC": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "MO": "",
        "MT": "",
        "MX": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "06500"
              },
        "NL": {
            "regex": "^[0-9]{4}[ ]?[A-Za-z]{2}",
            "separator": " ",
            "separator_count": "4",
            "maxlen": "7",
            "minlen": "6",
            "sample": "1234 AB"
              },
        "NO": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "PL": {
            "regex": "^[0-9]{2}[-]?[0-9]{3}",
            "separator": "-",
            "separator_count": "2",
            "maxlen": "6",
            "minlen": "5",
            "sample": "12-123"
              },
        "PT": {
            "regex": "^[0-9]{4}[-]?[0-9]{3}?",
            "separator": "-",
            "separator_count": "4",
            "maxlen": "8",
            "minlen": "4",
            "sample": "1234-123"
              },
        "RO": {
            "regex": "^[0-9]{6}",
            "maxlen": "6",
            "minlen": "6",
            "sample": "123456"
              },
        "RS": "",
        "RU": {
            "regex": "^[0-9]{6}",
            "maxlen": "6",
            "minlen": "6",
            "sample": "123456"
              },
        "SE": {
            "regex": "^[0-9]{3}[ ]?[0-9]{2}",
            "separator": " ",
            "separator_count": "3",
            "maxlen": "6",
            "minlen": "5",
            "sample": "123 12"
              },
        "SI": {
            "regex": "^[0-9]{4}",
            "maxlen": "4",
            "minlen": "4",
            "sample": "1234"
              },
        "SM": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "SK": {
            "regex": "^[0-9]{3}[ ]?[0-9]{2}",
            "separator": " ",
            "separator_count": "3",
            "maxlen": "6",
            "minlen": "5",
            "sample": "123 12"
              },
        "TH": {
            "regex": "^[0-9]{5}",
            "maxlen": "5",
            "minlen": "5",
            "sample": "12345"
              },
        "TR": {
            "regex": "^[0-9]{4,5}",
            "maxlen": "5",
            "minlen": "4",
            "sample": "12345"
              }
    }

    return postal_code_matrix[country_code];

}

////////////////////////////////////////////////////
// return formatting data for each country
function getTeslaCountryMapping(country_code) {
    // debug.info( 'getTeslaCountryMapping', country_code );

    var tesla_country_mapping = {
        "US": "",
        "AT": {
            "phone_code": "43"
              },
        "AU": {
            "phone_code": "61"
              },
        "BE": {
            "phone_code": "32"
              },
        "BG": {
            "phone_code": "359"
              },
        "CA": {
            "phone_code": "1"
              },
        "CH": {
            "phone_code": "41"
              },
        "CN": {
            "phone_code": "86"
              },
        "CZ": {
            "phone_code": "420"
              },
        "DE": {
            "phone_code": "49"
              },
        "DK": {
            "phone_code": "45"
              },
        "EE": {
            "phone_code": "372"
              },
        "ES": {
            "phone_code": "34"
              },
        "FI": {
            "phone_code": "358"
              },
        "FR": {
            "phone_code": "33"
              },
        "GB": {
            "phone_code": "44"
              },
        "GI": {
            "phone_code": "350"
              },
        "GR": {
            "phone_code": "30"
              },
        "HK": {
            "phone_code": "852"
              },
        "HU": {
            "phone_code": "36"
              },
        "IT": {
            "phone_code": "39"
              },
        "JP": {
            "phone_code": "81"
              },
        "LI": {
            "phone_code": "423"
              },
        "LT": {
            "phone_code": "370"
              },
        "LU": {
            "phone_code": "352"
              },
        "LV": {
            "phone_code": "371"
              },
        "MC": {
            "phone_code": "377"
              },
        "MO": {
            "phone_code": "853"
              },
        "MX": {
            "phone_code": "52"
              },
        "NL": {
            "phone_code": "31"
              },
        "NO": {
            "phone_code": "47"
              },
        "PL": {
            "phone_code": "48"
              },
        "PT": {
            "phone_code": "351"
              },
        "RO": {
            "phone_code": "40"
              },
        "SE": {
            "phone_code": "46"
              },
        "SI": {
            "phone_code": "386"
              },
        "SK": {
            "phone_code": "421"
              },
        "SM": {
            "phone_code": "378"
              }
    }
    return tesla_country_mapping[country_code];
}

// WEB-28932 add sample message
// Registration Block
function checkPostalCodeError() {
    $radioType = $( '.registration-type input[type="radio"]:checked' );
    if ($radioType.length) {
        $regType = $radioType.val().toLowerCase();
        $div = $( "#reg-" + $regType + "-postalcode" );
        $spanHelp = $( "#reg-" + $regType + "-postalcode-help" );
        if (($div.val() == "") || ($div.hasClass('error')) || ($div.parent().hasClass('error'))) {
            $spanHelp.show();
        } else {
            $spanHelp.hide();
        }
    }
}

// WEB-28932 add sample message
// Delivery Block
function checkDeliveryPostalCodeError() {
    $radioType = $('.delivery-pickup-type input[type="radio"]:checked');
    if ($radioType.length) {
        $regType = $radioType.val().toLowerCase();
        if ($regType == "delivery") {
            $div = $( "#" + $regType + "-pickup-postal-code" );
            $spanHelp = $( "#reg-" + $regType + "-postalcode-help" );
            if (($div.val() == "") || ($div.hasClass('error')) || ($div.parent().hasClass('error'))) {
                $spanHelp.show();
            } else {
                $spanHelp.hide();
            }
        }
    }
}

// WEB-28932 add sample message
// Accessory Block
function checkAccessoryPostalCodeError() {
    $regType = "accessory";
    $div = $( "#accesssory-shipping-address #postalCode" );
    $spanHelp = $( "#reg-" + $regType + "-postalcode-help" );
    if (($div.val() == "") || ($div.hasClass('error')) || ($div.parent().hasClass('error'))) {
        $spanHelp.show();
    } else {
        $spanHelp.hide();
    }
}

/*
 * Validate a zipcode given a country
 * @param code - the postal code to validate
 * @param country - the country to validate against
 */
function isValidPostalCode(code, country) {
    // debug.info( 'isValidPostalCode', code, country );
    code = $.trim(code);
    var format = getPostalCodeRegexMatrix(country);
    if (format) {
        if (code.length < parseInt(format.minlen)) {
            return false;
        }
        if (code.length > parseInt(format.maxlen)) {
            return false;
        }
        var re = new RegExp(format.regex);
        return re.test(code);
    }
    //getPostalCodeRegexMatrix will check the country as a key in the map postal_code_matrix, so for these countries which doesn't have postal code, we need to return true
    else if (format == '') {
        return true;
    }
    else {
        debug.log('No country found')
        return true;
    }
}

// TO-DO: this is too entagled and not-unit testable
// Should be refactored to use the isValidPostalCode function above
function validatePostalCode(e,whichField,flow) {

    var fieldVal = $('#'+whichField).val();
    var fieldLen = $('#'+whichField).val().length;
    var helpDiv = 'postal-code-help';
    var country = 'US';
    var mode = 'mailing';
    fieldVal = $.trim(fieldVal);

    // set vars if no key/mouse event is passed
    if (typeof e == 'undefined' || e == null) {
        var keyCode = '99';
        var eventType = 'onready';
    } else {
        var keyCode = e.keyCode;
        var eventType = e.type;
    }

    // buy flow: get country from reservation country field.
    if (flow == 'buy' && $('#basic-country').length) {
        country = $('#basic-country').val();
    }
    // buy flow: get country on payment page for cc or ach
    else if (flow == 'buy' && ($('#edit-cc-country').length || $('#edit-ach-country').length)) {
        var payment_method = $('#payment_type_hidden').val();
        if (payment_method == 'cr') {
            country = $('#edit-cc-country').val();
        }
        else if (payment_method == 'ach') {
            country = $('#edit-ach-country').val();
            helpDiv = 'postal-code-help-ach';
        }
    }
    // booking flow: get country on registration and payment page(s)
    else if (flow == 'booking' && $('#country').length) {
        country = $('#country').val();
    }
    // delivery flow:
    else if (flow == 'delivery' && $('#country').length) {
        country = $('#country').val();
    }

    // buy flow: set mode based on field to validate
    if (flow == 'buy' && (whichField == 'edit-PostalCode' || whichField == 'edit-cc-postalcode' || whichField == 'edit-ach-postalcode')) {
        mode = 'delivery';
    }

    // buy flow: update the reservation agreement based on zip code for US.
    if (flow == 'buy' && fieldLen == 5 && $('#page-own-basic').length) {
        updateResAgreement(mode);
    }

    // postal code format validation for countries configured in common.js
    // pulled using getPostalCodeRegexMatrix() function
    var this_country = country;
    if (flow == 'buy' && mode == 'mailing') {
        this_country = $('#edit-mailing-country').val();
        helpDiv = 'postal-code-help-mailing';
    }

    var postal_code_formatting = getPostalCodeRegexMatrix(this_country);
    if (postal_code_formatting) {
        if (postal_code_formatting.separator && postal_code_formatting.separator_count && keyCode != '8') {
            if (fieldLen >= parseInt(postal_code_formatting.separator_count)) { // && fieldLen <= parseInt(postal_code_formatting.separator_count)
                if (!~fieldVal.indexOf(postal_code_formatting.separator)) {
                    var seg1 = fieldVal.substr(0,postal_code_formatting.separator_count);
                    var seg2 = fieldVal.substr(postal_code_formatting.separator_count);
                    fieldVal = seg1 + postal_code_formatting.separator;
                    if (seg2) {
                        fieldVal = fieldVal + seg2;
                    }
                }
                $('#'+whichField).val(fieldVal);
            }
            else if (!~fieldVal.indexOf(postal_code_formatting.separator)) {
                // debug.log('add in the separator after separator_count has been surpassed');
                fieldValFirst = fieldVal.substring(0,parseInt(postal_code_formatting.separator_count));
                fieldValLast = fieldVal.substring(parseInt(postal_code_formatting.separator_count));
                fieldVal = fieldValFirst + postal_code_formatting.separator + fieldValLast;
                fieldLen = fieldVal.length;
            }
        }
        // limit input length
        if (fieldLen > parseInt(postal_code_formatting.maxlen)) {
            // debug.log('limit character input to: '+postal_code_formatting.maxlen);
            fieldVal = fieldVal.substring(0,parseInt(postal_code_formatting.maxlen));
            $('#'+whichField).val(fieldVal);
        }

        fieldLen = $('#'+whichField).val().length;
        if (fieldLen == parseInt(postal_code_formatting.maxlen) || (eventType == 'onready' && fieldLen < parseInt(postal_code_formatting.maxlen))) {
            // debug.log('check the format against the regex: '+postal_code_formatting.regex);
            if (postal_code_formatting.regex && fieldVal.match(postal_code_formatting.regex) == null) {
                $('#'+whichField).addClass('error');
                $('#'+helpDiv).html(Drupal.t('example: ')+postal_code_formatting.sample);
                $('#'+helpDiv).fadeIn('swing');
            }
            else {
                if ($('#'+whichField).hasClass('error')) {
                    $('#'+whichField).removeClass('error');
                    $('#'+helpDiv).hide();
                }
            }
        }
        else if (eventType == 'blur') {
            if (fieldLen < parseInt(postal_code_formatting.minlen)) {
                $('#'+whichField).addClass('error');
                postalCodeMessage = 'format: ';
                $('#'+helpDiv).html(Drupal.t(postalCodeMessage)+postal_code_formatting.sample);
                $('#'+helpDiv).fadeIn('swing');
            }
        }
    }
}

/*
 * Meets Minimum Age
 * meetsMinimumAge(new Date(year, month, date), 18)
 */
function meetsMinimumAge(birthDate, minAge) {
    var tempDate = new Date(birthDate.getFullYear() + minAge, birthDate.getMonth(), birthDate.getDate());
    if (tempDate <= new Date()) {
        return true;
    }
    else {
        return false;
    }
}

/*
 * Get the Age
 * getAge(new Date(year, month, date));
 */
function getAge(birthDate) {
    var birthdate   = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    var today_date  = new Date();
    var today_year  = today_date.getFullYear();
    var today_month = today_date.getMonth();
    var today_day   = today_date.getDate();
    var age         = today_year - birthDate.getFullYear();

    if ( today_month < (birthDate.getMonth() - 1)) {
        age--;
    }
    if (((birthDate.getMonth() - 1) == today_month) && (today_day < birthDate.getDate())) {
        age--;
    }
    return age;

}

/**
 * Generate url with path prefix
 *
 * @param string Url with beginning slash
 * @return string Url with path prefix
 */
function generateUrlWithPathPrefix(url_with_beginning_slash) {
    var url_with_path_prefix = '';
    if (typeof Drupal !== 'undefined' && typeof Drupal.settings !== 'undefined' && typeof Drupal.settings.tesla.locale !== 'undefined' && Drupal.settings.tesla.locale !== '') {
        url_with_path_prefix += '/' + Drupal.settings.tesla.locale;
        if (Drupal.settings.tesla.locale == 'ja_JP') {
            url_with_path_prefix = '/jp';
        }
        if (Drupal.settings.tesla.locale == 'zh_CN') {
            url_with_path_prefix = '/cn';
        }
    }
    url_with_path_prefix += url_with_beginning_slash;
    return url_with_path_prefix;
}

/**
 * change default select input
 *
 * @param {object} config selector configuration
 *
 * example:
 *
 * customSelectInput({
 *     context: '#edit-expDateMonth',
 *     placeholder: 'span.exp-month-select',
 *     attrs: 'class="exp-month-select"',
 *     css: {'z-index': 11},
 *     options: { substrSize: 20 }
 * })
 */
function customSelectInput(config) {
    var $context = $(config.context);
    var cssDefaults = {
        'z-index': 11,
        'opacity': 0,
        '-khtml-appearance':'none'
    };
    var defaults = {
        substr: true,
        substrSize: 30
    };
    var settings = $.extend(defaults, config.options);
    var css = $.extend(cssDefaults, config.css);

    debug.info('select' + config.context + ' using customSelectInput function');
    $context.each(function() {
        var $this = $(this);
        var title = ( $('option:selected', $this).val() !== '' ) ? $('option:selected', $this).text() : $this.attr('title');

        $this.css(css)
            .after('<span ' + config.attrs + '">' + title + '</span>')
            .change(function() {
                val = $('option:selected', this).text();
                var label = (settings.substr) ? val.substring(0, settings.substrSize) : val;
                $(config.placeholder).html(label);
            })
            .keyup(function() {
                val = $('option:selected', this).text();
                var label = (settings.substr) ? val.substring(0, settings.substrSize) : val;
                $(config.placeholder).html(label);
            });
    });
}

//http://stackoverflow.com/questions/18123501/replacing-accented-characters-with-plain-ascii-ones
function removeDiacritics (str) {
    var defaultDiacriticsRemovalMap = [
        {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
        {'base':'AA','letters':/[\uA732]/g},
        {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
        {'base':'AO','letters':/[\uA734]/g},
        {'base':'AU','letters':/[\uA736]/g},
        {'base':'AV','letters':/[\uA738\uA73A]/g},
        {'base':'AY','letters':/[\uA73C]/g},
        {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
        {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
        {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
        {'base':'DZ','letters':/[\u01F1\u01C4]/g},
        {'base':'Dz','letters':/[\u01F2\u01C5]/g},
        {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
        {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
        {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
        {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
        {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
        {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
        {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
        {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
        {'base':'LJ','letters':/[\u01C7]/g},
        {'base':'Lj','letters':/[\u01C8]/g},
        {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
        {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
        {'base':'NJ','letters':/[\u01CA]/g},
        {'base':'Nj','letters':/[\u01CB]/g},
        {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
        {'base':'OI','letters':/[\u01A2]/g},
        {'base':'OO','letters':/[\uA74E]/g},
        {'base':'OU','letters':/[\u0222]/g},
        {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
        {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
        {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
        {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
        {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
        {'base':'TZ','letters':/[\uA728]/g},
        {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
        {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
        {'base':'VY','letters':/[\uA760]/g},
        {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
        {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
        {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
        {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
        {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
        {'base':'aa','letters':/[\uA733]/g},
        {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
        {'base':'ao','letters':/[\uA735]/g},
        {'base':'au','letters':/[\uA737]/g},
        {'base':'av','letters':/[\uA739\uA73B]/g},
        {'base':'ay','letters':/[\uA73D]/g},
        {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
        {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
        {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
        {'base':'dz','letters':/[\u01F3\u01C6]/g},
        {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
        {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
        {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
        {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
        {'base':'hv','letters':/[\u0195]/g},
        {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
        {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
        {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
        {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
        {'base':'lj','letters':/[\u01C9]/g},
        {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
        {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
        {'base':'nj','letters':/[\u01CC]/g},
        {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
        {'base':'oi','letters':/[\u01A3]/g},
        {'base':'ou','letters':/[\u0223]/g},
        {'base':'oo','letters':/[\uA74F]/g},
        {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
        {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
        {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
        {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
        {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
        {'base':'tz','letters':/[\uA729]/g},
        {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
        {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
        {'base':'vy','letters':/[\uA761]/g},
        {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
        {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
        {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
        {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
    ];
    for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
        str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
    }

    return str;
}

function recaptchaSwitch(type) {
    if (type == 'audio') {
        this.Recaptcha.switch_type(type);
        $('#recaptcha_image').addClass('hide');
    }
    else {
        this.Recaptcha.switch_type(type);
        $('#recaptcha_image').removeClass('hide');
    }
}

/*
 * GridSum Tracking code for tracking reservation creation for CN Marketing
 * @param: reservation.  the reservation object we get in order confirmation page
 */
function sendGridSumOrderTracking(reservation) {
    if (window._gsTracker && reservation && reservation.config) {
        var orderid = reservation.rn;
        var price = reservation.config.vat_amount;
        var battery = reservation.config.manufacturing_string.match(/(P|BT)[0-9]{2}D?/)[0];
        var number = 1;
        var leasing = reservation.config.leasing;
        if (leasing && leasing.tab !== 'cash' && leasing.total) {
            price = leasing.total.monthly_effective_pmt;
            number = leasing.term;
        }
        _gsTracker.addOrder(orderid, price ,'');
        _gsTracker.addProduct(orderid,reservation.modelname,'', price, number, battery);
        _gsTracker.trackECom();
    }
}

/*
 * Add custom tracking for GridSum
 * @param  tracking_obj  this object has page, event_name and model_type for tracking
 */
function sendGridSumCustomTracking(tracking_obj) {
    if (window.GridsumWebDissector && tracking_obj) {
        var _gsTracker =GridsumWebDissector.getTracker('GWD-002511');
        _gsTracker.track(tracking_obj.page);
        _gsTracker.trackEvent(tracking_obj.event_name, tracking_obj.model_type);
    }
}
