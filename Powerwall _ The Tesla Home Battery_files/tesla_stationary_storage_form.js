(function (window, document, $, Drupal) {

    "use strict";
    Drupal.behaviors.stationary_storage_form = {
        rebuildUI: function(topic) {
            $('.reserve_battery, .inquire_business, .become_partner').addClass('hidden');
            var $required = $('input[name="company"]').attr('data-parsley-required-message');
            $('#edit-company').removeAttr('placeholder');

            // make sure delivery preference field displays, in case they were hidden previously
            $('.form-item-delivery').show();

            switch(topic){
                case 'SS_HOME':
                    $('#stationary-storage-modal').removeClass('powerwall-modal-business powerwall-modal-partner').addClass('powerwall-modal-home');
                    $('.reserve_battery').removeClass('hidden');
                    $('#edit-submit-ajax').val(Drupal.t('Reserve'));
                    $('input[name="company"],select[name="employeesnumber"]').attr('data-parsley-required',false);
                    $('select[name="solar_install_options"]').attr('data-parsley-required',true);
                    //  ITE-479 hide delivery options for Powerwall
                    $('.form-item-delivery').hide();
                    // --
                    $('.powerwall-modal-home').addClass('fade-in');
                    break;
                case 'SS_BUSINESS':
                case 'SS_BUSINESS_CALLBACK':
                    $('#edit-submit').val(Drupal.t('Submit'));
                    $('#edit-submit-ajax').val(Drupal.t('Submit'));
                    $('#stationary-storage-modal').removeClass('powerwall-modal-home powerwall-modal-partner').addClass('powerwall-modal-business');
                    $('.inquire_business').removeClass('hidden');
                    $('input[name="company"]').attr('data-parsley-required',true);
                    $('select[name="employeesnumber"]').attr('data-parsley-required',false);
                    $('select[name="delivery"]').attr('data-parsley-required',true);
                    $('select[name="solar_install_options"]').attr('data-parsley-required',false);
                    $('.powerwall-modal-business').addClass('fade-in');
                    break;
                case 'SS_PARTNER':
                    $('#edit-submit').val(Drupal.t('Submit'));
                    $('#edit-submit-ajax').val(Drupal.t('Submit'));
                    $('#stationary-storage-modal').removeClass('powerwall-modal-home powerwall-modal-business').addClass('powerwall-modal-partner');
                    $('.become_partner').removeClass('hidden');
                    $('input[name="company"],select[name="employeesnumber"]').attr('data-parsley-required',true);
                    $('select[name="delivery"]').attr('data-parsley-required',false);
                    $('select[name="solar_install_options"]').attr('data-parsley-required',false);
                    $('.powerwall-modal-partner').addClass('fade-in');
                    break;
            }
        },

        attach: function (context, settings) {
            var $form = $('#stationary-storage-form');
            var $zip_code = $('#edit-postalcode');
            var $phone = $('#edit-phone');
            var $ajax_country = true;
            var self = this;
            // var inputs = $(':input');
            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                $form.submit(function(event){
                    event.preventDefault(); //prevent default form submit
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#stationary-storage-modal .modal-throbber').removeClass('hidden');
                        $('.btn-ajax', $form).trigger('submit_form');
                    }
                });
                $('.btn-ajax', $form).click(function (event) {
                    event.preventDefault(); //prevent default form submit
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#stationary-storage-modal .modal-throbber').removeClass('hidden');
                        $(this).trigger('submit_form');
                    }
                });

                $('.stationary-modal:not(.ajax-processed)').addClass('ajax-processed').once(function(){
                    $(this).on('click', function(){
                        var $thistopic = $(this).data('formtype');
                        var $modaltitle = '';
                        var $options_product = '';
                        var $options_type = '';

                        switch($thistopic){
                            case 'SS_HOME':
                                $modaltitle = Drupal.t('Reserve your Powerwall');
                                $options_product = 'Home';
                                $options_type = 'Consumer';
                                break;
                            case 'SS_BUSINESS':
                            case 'SS_BUSINESS_CALLBACK':
                                $modaltitle = Drupal.t('Inquire about Powerpack for your Business or Utility');
                                $options_product = 'Commercial';
                                $options_type = 'Consumer';
                                break;
                            case 'SS_PARTNER':
                                $modaltitle = Drupal.t('Become a Certified Powerwall Installer');
                                $options_product = null;
                                $options_type = 'Partner';
                                break;
                        }

                        self.rebuildUI($thistopic);

                        $('.modal-title').text($modaltitle);
                        $('input[name="topic"]').val($thistopic);
                        $('input[name="product"]').val($options_product);
                        $('input[name="type"]').val($options_type);

                        $form.parsley().destroy();
                        $form.parsley();

                        $('#stationary-storage-modal').modal('show');

                        return false;
                    });
                });

                //check whenever the dropdown menu change and ask the backend for the new regex and message to display
                // $('#edit-country').change(function (event) {
                //     //disable the submit button meanwhile the ajax is begin processed
                //     $ajax_country = false;
                //     //get the actual url with Drupal settings
                //     var url = (Drupal.settings.tesla.locale != 'en_US') ? "/" + Drupal.settings.tesla.locale : '';
                //     var country = $('#edit-country').val();
                //     $.ajax({
                //         url: url + '/regex/' + country,
                //         dataType: "json"
                //     }).success(function (data, textStatus, jqXHR) {
                //         //Little hack to change the regex and message that parsley will do
                //         $zip_code.attr('data-parsley-pattern', data.regex);
                //         $zip_code.attr('data-parsley-pattern-message', data.message);
                //         if ($zip_code.val()) {
                //             $zip_code.focusout();
                //         }
                //         //$phone.val(data.phone_code);
                //     }).done(function (data, textStatus, jqXHR) {
                //         //enable the submit button
                //         $ajax_country = true;
                //     })
                // });

                // load this on document load only for specified pages
                if ($('[id=page-powerwall-reserve]').length || $('[id=page-powerwall-distribution]').length || $('[id=page-powerwall-business]').length) {
                    var topic = $('input[name=topic]').val();
                    self.rebuildUI(topic);
                }

                $('#stationary-storage-modal').once().on('hide.bs.modal', function (event) {
                    if ($('#tesla_stationary_storage_form .thanks').length) {
                        var $topic = $('input[name="topic"]').val();
                        var locale = ((Drupal.settings.tesla.locale != 'ja_JP') ? (Drupal.settings.tesla.locale) : ('jp'));
                        var country = (_.indexOf(['en_US', 'zh_CN'], locale) === -1) ? "/" + locale : '';
                        $('.modal-body', '#stationary-storage-modal').load(country + "/stationary/storage/form/"+$topic, function () {
                            Drupal.attachBehaviors();
                        });
                    }
                });
            }
        }
    };
}(this, this.document, this.jQuery, this.Drupal));
