Drupal.behaviors.teslaLoginBehavior = {

    attach: function (context, settings) {
        Drupal.behaviors.tesla_user.submitLoginForm = function () {};

        // Set Gatekeeper Api configuration
        Gatekeeper.settings = settings.Gatekeeper;
        Gatekeeper.debug    = true;

        // common selectors
        var locale   = Drupal.settings.tesla.localePrefix,
            $form    = $('#user-login', context),
            $name    = $('#edit-name', context),
            $pass    = $('#edit-pass', context),
            $errors  = $('.messages', context),
            messages = {
                invalid: Drupal.t('We could not sign you in using the information you provided. Please try again.'),
                blockedOut: Drupal.t('Your account has been locked due to too many failed login attempts. To unlock your account') + ' <a href="' + locale + '/user/password">' + Drupal.t('reset your password') + '</a>.'
            };

        if (!$errors.length) {
            $('.my-form-wrapper').prepend('<div class="messages error"></div>');
        }

        /**
         * Display error messages
         *
         * @param  {string} message error message
         */
        function displayError(message) {
            $('.messages').empty()
                .html(message)
                .fadeIn('slow');
        }

        // form submission
        $form.on('submit', function () {
            var name = $.trim($name.val()),
                pass = $.trim($pass.val());

            if (name !== '' && pass !== '') {
                Gatekeeper.Api.auth(name, pass, {
                    success: function (auth) {
                        Gatekeeper.Helpers.setCookies(name);
                        Gatekeeper.Helpers.startSession(auth.data, auth.region);
                    },
                    invalid: function () {
                        displayError(messages.invalid);
                    },
                    blockedOut: function () {
                        displayError(messages.blockedOut);
                    },
                    fail: function () {
                        $form.off('submit').submit();
                    }
                });

            } else {
                displayError(messages.invalid);

            }
            return false;
        });
    }
};
