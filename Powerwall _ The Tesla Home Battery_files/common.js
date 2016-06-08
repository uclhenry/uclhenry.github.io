/**
 * @file
 * Common javascript functions.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */


(function (window, document, $, Drupal) {
    "use strict";

    /**
     * WEB-30786 baidu adword set cookie
     */
    var reg = new RegExp("(^|&)bd=([^&]*)(&|$)", "i");
    var param = window.location.search.substr(1).match(reg);
    var $adword;
    if (param != null) {
        $adword = unescape(param[2]);
        var date = new Date();
        date.setTime(date.getTime()+(30*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
        document.cookie = "bd="+$adword+";path=/;"+expires+"; ";
    }

    Drupal.behaviors.common = {
        'submitLoginForm': function (mode,destination) {

                var form_error = 0;
                var username_error = 0;
                var username_error_msg = '';
                var pass_error = 0;
                var pass_error_msg = '';
                var display_msg = '';
                var top_offset = -30;

                if(mode == 'join') {
                    window.location.href=destination;
                } else {

                    if($('#edit-name')) {
                        if($('#edit-name').val() == '') {
                            form_error = 1;
                            username_error = 1;
                            username_error_msg = 'Please enter a username';
                            if(Drupal.settings.tesla.country == 'DE') {
                                username_error_msg = 'Benutzername eingeben.';
                            } else if(Drupal.settings.tesla.country == 'FR') {
                                username_error_msg = 'Veuillez entrer un username.';
                            } else if(Drupal.settings.tesla.country == 'IT') {
                                username_error_msg = 'Per favore inserisci uno username.';
                            } else if(Drupal.settings.tesla.country == 'NL') {
                                username_error_msg = 'Geef een gebruikersnaam in.';
                            } else if(Drupal.settings.tesla.country == 'JP') {
                                username_error_msg = 'ユーザー名を入力してください。';
                            }
                        }
                    }

                    if($('#edit-pass')) {
                        if($('#edit-pass').val() == '') {
                            form_error = 1;
                            pass_error = 1;
                            pass_error_msg = 'Please enter a password';
                            if(Drupal.settings.tesla.country == 'DE') {
                                pass_error_msg = 'Bitte geben Sie ein gültiges Passwort ein.';
                            } else if(Drupal.settings.tesla.country == 'FR') {
                                pass_error_msg = 'Veuiller entrer un mot de passe valide.';
                            } else if(Drupal.settings.tesla.country == 'IT') {
                                pass_error_msg = 'Per favore inserisci una password valida.';
                            } else if(Drupal.settings.tesla.country == 'NL') {
                                pass_error_msg = 'Geef een wachtwoord in.';
                            } else if(Drupal.settings.tesla.country == 'JP') {
                                pass_error_msg = '有効なパスワードを入力してください。';
                            }
                        }
                    }

                    if(form_error > 0) {

                        if($('#messages-wrapper').length) {
                            if($('#messages-wrapper').css('display') == 'block') {
                                $('#messages-wrapper').remove();
                            }
                        }

                        if(username_error == 1) {
                            $('label.edit-name').attr('class','label-error');
                            display_msg = username_error_msg;
                        }

                        if(pass_error == 1) {
                            $('label.edit-pass').attr('class','label-error');
                            display_msg = pass_error_msg;
                            top_offset = 55;
                        }

                        if(username_error == 1 && pass_error == 1) {
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
                        // create username cookie
                        var tesla_username_cookie = Drupal.behaviors.common.readCookie('tesla_username');
                        // create username save cookie
                        // create username for all cases
                        var tmp_cookie_val = $('#edit-name').val();
                        tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
                        Drupal.behaviors.common.createCookie('tesla_username',tmp_cookie_val,360);
                        document.forms['user-login'].submit();
                    }
                }

        },
        'parseURL': function (url) {
            var a =  document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':',''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function(){
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
        },
        'createCookie' :function (name,value,days,crossdomain) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }
            else var expires = "";
            if (crossdomain) {
                var domain = "; domain=" + Drupal.settings.tesla.parentDomain;
            }
            else var domain = "";
            document.cookie = name+"="+value+expires+"; path=/"+domain;
        },
        'readCookie': function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },
        'eraseCookie' : function (name) {
            Drupal.behaviors.common.createCookie(name,"",-1);
        },
        'checkCookie' : function (){
            var cookie_locale = Drupal.behaviors.common.readCookie('desired-locale');
            var show_blip_count = Drupal.behaviors.common.readCookie('show_blip_count');
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
                           'en_AU', 'en_CA', 'en_EU', 'en_GB', 'en_HK', 'en_MO', 'en_US',
                           'fr_BE', 'fr_CA', 'fr_CH', 'fr_FR',
                           'it_CH', 'it_IT',
                           'nl_BE', 'nl_NL', 'no_NO',
                           'sv_SE',
                           'jp',
                           'zh_HK', 'zh_MO'];
            // see if we are on a locale path
            $.each(locales, function(index, value){
                locale_path_index = $.inArray(value, path_array);
                if (locale_path_index != -1) {
                    if (value == 'jp'){
                        value = 'ja_JP';
                    }
                    else if (value == 'cn'){
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
                    switch (cookie_locale){
                        case 'en_US':
                            path_base = path_length > 1 ? path_base:'/';
                            break;
                        case 'ja_JP':
                            path_base = '/jp';
                            break;
                        case 'zh_CN':
                            path_base = '/cn';
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
            }
        },
        'checkPassEmailField':function (origin) {

            var email = $('#edit-name').val();
            var form_error = 0;

            if ($('#edit-name').length) {

                if (!email) {
                    form_error = 1;
                }
                else if (email == '') {
                    form_error = 1;
                }
                else if (!origin && Drupal.behaviors.common.checkEmail(email) == false) {
                    form_error = 1;
                }
                if ((origin && origin == 'login') && $('#edit-pass').length) {
                    var password = $('#edit-pass').val();
                    if(!password) {
                        form_error = 1;
                    } else if(password == '') {
                        form_error = 1;
                    }
                }
                if (form_error == 0) {
                    $('#btnSelectDO').css('opacity','1');
                    $('#btnSelectDO').unbind('click');
                    $('#btnSelectDO').click(function() {
                        if (origin && origin == 'login') {
                            Drupal.behaviors.common.submitLoginForm('login');
                        }
                        else {
                            Drupal.behaviors.common.submitPassForm();
                        }
                    });
                }
                else {
                    $('#btnSelectDO').css('opacity','0.5');
                    $('#btnSelectDO').unbind('click');
                }
            }
        },
        'checkChinaResetPasswordFields' : function () {
            var inputEmail = $('#edit-name').val().trim();
            var inputReCaptcha = $('#china_recpatcha').val().trim();
            var submitButton = $('#btnSelectDO');
            if (inputEmail && Drupal.behaviors.common.checkEmail(inputEmail) && inputReCaptcha.length == 5) {
                submitButton.css('opacity','1')
                    .unbind('click')
                    .click(function() {
                        Drupal.behaviors.common.submitPassForm();
                    });
            }
            else {
                submitButton.css('opacity','0.5').unbind('click');
            }
        },
        'changeChinaRecaptcha' : function () {
            var img = new Image();
            var $recaptchaImage = $('#china-recaptcha-image');
            img.src = '/get_recaptcha?t=' + new Date().getTime() + '&code=' + $recaptchaImage.data('sess');
            img.onload = function() {
                $recaptchaImage.attr('src', img.src);
            }
        },
        'trim': function (string) {
            return string.trim();
        },
        'log' : function (str) {
            debug.log( str );
        },
        'makeCursor': function (obj) {
            document.getElementById(obj.id).style.cursor = 'pointer';
        },
        'checkEmail' : function (email) {
            if(/^([a-zA-Z0-9_\.\-\'\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) {
                return true;
            } else {
                return false;
            }
        },
        'checkKeyPressed' : function (e,method) {
            var unicode=e.keyCode? e.keyCode : e.charCode;
            if (unicode == 13) {
                if (document.getElementById('page-user-login')) {
                    Drupal.behaviors.common.submitLoginForm('login');
                }
                else if (document.getElementById('change-reservation-form')) {
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
                // else if (document.getElementById('user-pass-reset')) {
                //     Drupal.behaviors.common.checkResetPasswordFields('submit');
                // }
                // else if ($('*[id*=page-user-reset-]').length) {
                //     Drupal.behaviors.common.checkResetPasswordFields();
                // }
                // else if ($('#page-user-register').length) {
                //     Drupal.behaviors.common.submitCreateAcctForm('create_account');
                // }
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
        },
        'submitPassForm' : function (method) {
            if(method && method == 'cancel') {
                var dest = $('#destination').val();
                var locale_prefix = '';
                if(Drupal.settings.tesla.locale != 'en_US') {
                    locale_prefix = Drupal.settings.tesla.locale;
                    if(locale_prefix == 'ja_JP') {
                        locale_prefix = 'jp';
                    }
                    if(locale_prefix == 'zh_CN') {
                        locale_prefix = 'cn';
                    }
                    locale_prefix = '/' + locale_prefix;
                }

                dest = locale_prefix + '/user/login';
                window.location.href=dest;
            } else {
                document.forms['user-pass'].submit();
            }
        },
        'getLocalePrefix' : function () {
            var localePrefix = ""; // en_US

            if (!(Drupal.settings.tesla.locale === "en_US")) {
            localePrefix = Drupal.settings.tesla.locale;
                if (localePrefix == "ja_JP") {
                    localePrefix = "jp";
                }
                if (localePrefix == "zh_CN") {
                    localePrefix = "cn";
                }
                localePrefix = "/" + localePrefix;
            }
            return localePrefix;
        },

        // check fields on each key input & only activate continue button when fields are filled
        'checkCreateAcctFields' : function (origin) {

            var form_error = 0;

            var email = $('#edit-mail').val();

            // trim and re-assign email + username only on blur
            $('#edit-mail').blur(function () {
                 $('#edit-mail').val($('#edit-mail').val().trim());
            });

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

            if (form_error === 0) {
            // ------------------------

                $('#btnCreateAccount').unbind('click');
                $('#btnCreateAccount').unbind('keyup');
                $('#btnCreateAccount').css('opacity','1');
                $('#btnCreateAccount').click(function() {
                    Drupal.behaviors.common.submitCreateAcctForm(origin);
                });
                $('#btnCreateAccount').keyup(function(event) {
                    Drupal.behaviors.common.checkKeyPressed(event);
                });
            }

        },
        'submitCreateAcctForm' : function (origin) {
            var form_error = 0;
            var error_msg = '';
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
            if(origin) {
                var fname = $('#edit-first-name').val();
                var lname = $('#edit-last-name').val();
                var password = $('#edit-pass-pass1').val();
                var password_confirm = $('#edit-pass-pass2').val();

                var hasLetters = password.match(/[a-zA-Z]+/);
                var hasNumbers = password.match(/[0-9]+/);
                var hasPunctuation = password.match(/[^a-zA-Z0-9]+/);
                var hasCasing = password.match(/[a-z]+.*[A-Z]+|[A-Z]+.*[a-z]+/);

                if(fname == '') {
                    form_error = 1;
                }
                if(lname == '') {
                    form_error = 1;
                }
                if(password == '') {
                    form_error = 1;
                }
                if(password_confirm == '') {
                    form_error = 1;
                }
            }

            if(Drupal.behaviors.common.checkEmail(email) == false) {
                form_error = 1;
                email_error = 'This is not a valid email address format. Please try again.';
            }
            if(password != password_confirm) {
                form_error = 1;
            }
            if(form_error == 0) {
                if(password.length < 8) {
                    error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
                    form_error = 1;
                } else if(password == uname) {
                    error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
                    form_error = 1;
                }
                else{
                    var count = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0);
                    var strength_pass = count > 1 ? "pass" : "fail";
                        if(strength_pass == "fail"){
                            error_msg = Drupal.t('For your security, please provide a password at least eight characters long that contains at least one number and one letter.');
                            form_error = 1;
                        }
                }
            }

            if(form_error == 1) {

                if($('#pass-error').length) {
                    $('#pass-error').remove();
                }
                if($('#messages-wrapper').length) {
                    $('#messages-wrapper').css('display','none');
                }

                $('#btnCreateAccount').unbind('click');

                if(!$('.password-description').length) {
                    var position = $('#edit-pass-pass1').position();
                    var x_offset = 0;
                    var y_offset = 0;
                    $('label[for="edit-pass-pass1"]').css('color','#cc0000');
                    $('label[for="edit-pass-pass2"]').css('color','#cc0000');

                    var pos_x = position.left + x_offset;
                    var pos_y = position.top + y_offset;

                    if($('#pass-error').length) {
                        $('#pass-error').remove();
                    }
                    // start fade in error popup

                    $('main').append('<div id="pass-error"></div>');
                    $('#pass-error').html(error_msg);
                    $('#pass-error').css('top',pos_y);
                    $('#pass-error').css('left',pos_x);
                    $('#pass-error').fadeIn('slow');
                }


            } else {
                // create login and username cookies
                var tesla_username_cookie = Drupal.behaviors.common.readCookie('tesla_username');
                var tesla_email_cookie = Drupal.behaviors.common.readCookie('tesla_email');

                // create username save cookie
                // in all cases
                if(tesla_username_cookie) {
                    Drupal.behaviors.common.eraseCookie('tesla_username');
                }
                var tmp_cookie_val = $('#edit-name').val();
                tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
                Drupal.behaviors.common.createCookie('tesla_username',tmp_cookie_val);

                // create email save cookie
                // in all cases
                if(tesla_email_cookie) {
                    Drupal.behaviors.common.eraseCookie('tesla_email');
                }
                var tmp_cookie_val = $('#edit-mail').val();
                tmp_cookie_val = encodeURIComponent(tmp_cookie_val);
                Drupal.behaviors.common.createCookie('tesla_email',tmp_cookie_val);

                if(is_shell && is_shell == 'true') {
                    debug.log('set the form action');
                    var form_action = $('#edit-shell-url').val();
                    $('#user-register').attr('action',form_action);
                }

                document.forms['user-register-form'].submit();

            }
        },
        // generic js back
        'backBtnSubmit' : function (trigger) {
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
    };
 }(this, this.document, this.jQuery, this.Drupal));
