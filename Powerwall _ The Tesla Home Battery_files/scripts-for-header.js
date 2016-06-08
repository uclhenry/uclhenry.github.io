/**
 * @file
 * Anything that needs to be included in the <head>
 * of the page instead of before </body> goes here
 *
 */
(function (window, document, $, Drupal) {
    "use strict";

    Drupal.behaviors.change_media_query_content = {
        attach: function (context) {
            /*
             * If Desktop or Mobile, always add correct meta tag for scaling
             * If Tablet, always display at full width
             */

            // Find matches
            var mql = window.matchMedia("(orientation: landscape)");

            if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
                BrowserDetect.init();
            }

            updateMeta(mql);

            // Add a media query change listener
            if(mql.addListener){
                mql.addListener(function(m) {
                    updateMeta(m);
                });
            }

            function updateMeta(mediaQueryVar) {
                var androidKeyboardActive = false;

                // Identify if Android mobile keyboard is actively shown. Mobile
                // keyboard will be active if an input / text field has focus.
                if($('html').hasClass('touch') && $('input,textarea').is(":focus") && BrowserDetect.OS === 'Android') {
                    androidKeyboardActive = true;
                }

                if(($('html').hasClass('touch') && mediaQueryVar.matches && !androidKeyboardActive) || BrowserDetect.OS === 'iOS Tablet Device' || $('html').hasClass('unresponsive')) {
                    $('#viewport-tag').attr('content','width=1080');
                }
                else {
                    $('#viewport-tag').attr('content','width=device-width, initial-scale=1');
                }
            }
        }
    };

    Drupal.behaviors.detect_browser_and_platform_and_add_appropriate_classes_to_body_tag = {
        attach: function (context) {

            var userAgent = navigator.userAgent.toLowerCase(),
                carBrowser = (userAgent.indexOf('qtcarbrowser') != -1);

            // If this is the in-car browser, we need to add a class so we can target it specifically
            if (carBrowser) {
                $('body').addClass('browser-incar');

                // remove custom typography from in-car browser because it can't render all the glyphs necessary.
                $('.fontstack-asset').remove();
            } else {
                $('body').addClass('browser-notcar');
            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));
