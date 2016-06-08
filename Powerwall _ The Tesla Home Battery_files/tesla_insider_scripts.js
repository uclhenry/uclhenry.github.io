// Hack to make localizeDate() work.
if (typeof curCarInfo == 'undefined') {
    curCarInfo = {};
}

$(function() {
    // Initialize BrowserDetect object if it hasn't already been done.
    if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
        BrowserDetect.init();
    }
    // WEB-24227:
    if (BrowserDetect.summary.browser == 'Explorer' && BrowserDetect.summary.version == 8) {
        $('input[name="post-submit"]').removeClass('hide-on-desk').addClass('hide-on-mobile');
        $('input[name="ajax-submit"]').removeClass('hide-on-mobile').addClass('hide-on-desk');
    }
});

(function (window, document, $, Drupal) {
    "use strict";
    Drupal.behaviors.tesla_insider_form = {
        attach: function () {

            var $form = $('#tesla-insider-form');

            $('#edit-submit-td-ajax').on('click', function(e) {
                var reg = new RegExp("(^|&)bd=([^&]*)(&|$)", "i");
                var param = window.location.search.substr(1).match(reg);
                var $adword;
                if (param != null) $adword = unescape(param[2]);
                var cookie = $.cookie('bd');

                if ($adword != null) {
                    $.cookie('bd', $adword, {expires : 30});
                    $('input[name=ad_word_td]').val($adword);
                } else {
                    if (cookie != null && cookie != '') {
                        $('input[name=ad_word_td]').val(cookie);
                    }
                }
            });

            var $zip_code = $('#edit-zipcode-td');
            var $ajax_country = true;
            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                $('#tesla-insider-modal').on('show.bs.modal', function (event) {
                    debug.log('on show | GTM: form-interaction, view-open, Newsletter Signup (Tesla Insider), Optimizely');
                    window.dataLayer.push({
                        'event': 'form-interaction',
                        'interaction': 'view-open',
                        'formType': 'Newsletter Signup',
                        'engagementType': 'Optimizely',
                    });
                });

                $('#tesla-insider-modal').on('hide.bs.modal', function (event) {

                    // var mymodal = $(this);
                    if ($('#tesla-insider-modal .thanks').length) {

                        // e.preventDefault();
                        var country = (_.indexOf(['en_US', 'zh_CN'], Drupal.settings.tesla.locale) === -1) ? "/" + Drupal.settings.tesla.locale : '';
                        $('.modal-body', '#tesla-insider-modal').load(country + "/models/drive/ajax", function () {
                            Drupal.attachBehaviors();
                        });
                        $('#tesla-insider-modal .modal-title').html(Drupal.t('Tesla Insider'));

                    }

                });

                $('.btn-ajax', '#tesla-insider-form').click(function (event) {
                    event.preventDefault(); // Prevent default form submit.
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#tesla-insider-modal .modal-throbber').removeClass('hidden');
                        $(this).trigger('submit_form');
                    }
                });

                // Add browser values to form.
                if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
                    BrowserDetect.init();
                }
                $('#tesla-insider-form').append('<input type="hidden" name="browser_type" value="' + BrowserDetect.summary.browser + '">').
                    append('<input type="hidden" name="browser_version" value="' + BrowserDetect.summary.version + '">').
                    append('<input type="hidden" name="browser_os" value="' + BrowserDetect.summary.OS + '">');
                $('#tesla-insider-form input[type="text"]').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.stopPropagation();
                        var btn1 = $('#edit-submit-td-ajax');
                        var btn2 = $('#edit-submit-td-ajax--2');
                        if (btn1) {
                            btn1.click();
                        }
                        else if (btn2) {
                            btn2.click();
                        }
                        return false;
                    }
                });
                $('#edit-location').change();

            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));
