(function (window, document, $, Drupal) {
    "use strict";

    Drupal.behaviors.local_scroll = {
        attach: function () {
            if($('body').hasClass('browser-notcar')) {
                $.localScroll({
                    queue: true,
                    hash: true
                });
            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));