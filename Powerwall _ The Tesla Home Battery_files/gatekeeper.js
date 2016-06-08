/**
 * Gatekeeper namespace
 */
var Gatekeeper = window.Gatekeeper || {};

/**
 * Gatekeeper settings
 *
 * @todo find a better way to define this settings
 * @example Gatekeeper.settings = Drupal.settings.Gatekeeper
 * @type {Object}
 */
Gatekeeper.settings = {};

/**
 * Gatekeeper debug messages
 *
 * @type {Boolean}
 */
Gatekeeper.debug = false;

/**
 * Gatekeeper Api
 */
Gatekeeper.Api = (function (window, document) {
    'use strict';

    /**
     * Ajax helper
     *
     * @param  {string} url  request url
     * @param  {object} data request data
     * @param  {string} verb http verb
     * @return {object}
     */
    function _request(url, data, verb) {
        return $.ajax({
            type: verb || 'GET',
            url: Gatekeeper.settings.host + url,
            data: data || {},
        });
    }

    /**
     * Gatekeeper server status
     *
     * @param  {Object} callbacks callback functions
     */
    return {
        getStatus: function (callbacks) {
            var request = _request('/status/app');

            request.complete(function (response) {
                var status = (response.status === 200);

                if (status && typeof callbacks.success === 'function') {
                    return callbacks.success();
                }

                if (typeof callbacks.fail === 'function') {
                    return callbacks.fail();
                }

            }).always(function (response) {
                if (Gatekeeper.debug) {
                    Gatekeeper.Helpers.log(response, 'Gatekeeper.Api.getStatus');
                }
            });
        },

        /**
         * Performs authentication request
         *
         * @param {string} user user name
         * @param {string} pass user password
         * @param  {Function} callback functions
         */
        auth: function (user, pass, callbacks) {
            var that = this;

            that.getStatus({
                success: function () {
                    var request = _request('/auth', {
                        email: user,
                        password: pass
                    }, 'POST');

                    request.success(function (response) {
                        var json = (typeof response === 'string') ? $.parseJSON(response) : response;
                        if (json.status === true && json.code === '200') {
                            if (typeof callbacks.success === 'function') {
                                return callbacks.success(json);
                            }
                        }

                    }).error(function (response) {

                        /* CN gatekeeper response*/
                        if (response.status === 302) {
                            var json = $.parseJSON(response.responseText);
                            if (json.status === true && json.code === 302) {
                                if (typeof callbacks.success === 'function') {
                                    return callbacks.success(json);
                                }
                            }
                        }

                        // blocked out after 5 mistakes
                        if (response.status === 403 && typeof callbacks.blockedOut === 'function') {
                            return callbacks.blockedOut();
                        }

                        // wrong credentials
                        if (response.status === 401 && typeof callbacks.invalid === 'function') {
                            return callbacks.invalid();
                        }

                        // failback
                        if (response.status === 0 && typeof callbacks.fail === 'function') {
                            return callbacks.fail();
                        }

                    }).always(function (response) {
                        if (Gatekeeper.Helpers.debug) {
                            Gatekeeper.Helpers.log(response, 'Gatekeeper.Api.auth');
                        }
                    });
                },
                fail: function () {
                    // failback
                    if (typeof callbacks.fail === 'function') {
                        return callbacks.fail();
                    }
                }
            });
        }
    };

}(window, document));

/**
 * Gatekeeper Helpers
 */
Gatekeeper.Helpers = (function (window, document) {
    'use strict';

    return {

        /**
         * Debug helper
         *
         * @param  {mixed} data
         * @param  {string} msg description message
         */
        log: function (data, msg) {
            debug.log(msg + ': ' + JSON.stringify(data));
        },

        /**
         * Redirects to specific user hosts
         *
         * @param  {string} token authentication token
         * @param  {string} userRegion user region
         * @param  {string} prefix user locale prefix
         * @param  {string} destination redirect destination
         */
        startSession: function (token, userRegion, prefix, destination) {
            var that   = this,
                region = $.trim(userRegion) || Gatekeeper.settings.region,
                locale = $.trim(prefix) || Gatekeeper.settings.locale,
                dest   = destination || decodeURI(window.location.search.slice(1)) + window.location.hash,
                href   = Gatekeeper.settings.regions[region] +
                    Gatekeeper.settings.redirect_url +
                    '?key=' + token +
                    '&locale=' + locale;
            if (dest) {
                href += '&' + $.trim(dest);
            }
            if (Gatekeeper.debug) {
                that.log(href, 'Gatekeeper.Helpers.redirect');
            }
            window.location.href = href;
        },

        /**
         * Set user cookies
         *
         * @param {string} user user name
         * @param {string} persistent persistent login
         */
        setCookies: function (user, persistent) {
            var that           = this,
                keep_signed_in = persistent || 0,
                tesla_cookie   = readCookie('tesla_login'),
                tesla_username = readCookie('tesla_username');

            createCookie('tesla_username', encodeURIComponent($.trim(user)), 360);

            if (keep_signed_in === '1') {
                if (!tesla_cookie) {
                    createCookie('tesla_login', 'true', 360);
                }
            } else {
                if (tesla_cookie) {
                    eraseCookie('tesla_login');
                }
            }
            if (Gatekeeper.debug) {
                that.log({
                    persistent: keep_signed_in,
                    login: tesla_cookie,
                    username: tesla_username
                }, 'Gatekeeper.Helpers.setCookies');
            }
        }
    };

}(window, document));
