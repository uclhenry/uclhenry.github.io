//let's not polute global space
var footerNS = footerNS || {};
$(document).ready(localeSelectInit);

function localeSelectInit(){
	footerNS.locale_wrapper=$("#locale-select-wrapper");
	footerNS.locale_overlay=$("#select-locale-overlay");
	footerNS.locale_overlay.hide().css("opacity", "0");
	footerNS.locale_wrapper.hide();
	$("#locale-close-button").click(function(){
		toggleLocaleSelector();
		return false;
    });
	footerNS.locale_overlay.click(toggleLocaleSelector);
	$("#locale-select").bind("click", function(e){
        e.stopPropagation();
	});
	var chooseRegionLink=$("#choose-locale");
	chooseRegionLink.attr("href", "#").click(function() {
		toggleLocaleSelector();
		return false;
	});
	chooseRegionLink.attr("class", Drupal.settings.tesla.locale || "en_US");
}

function toggleLocaleSelector(e){
	if(footerNS.locale_overlay.css("opacity") == "0"){
		footerNS.locale_overlay.css("display", "block");
		var topCss= Math.max($(window).scrollTop()+40,($(window).scrollTop())+($(window).height() -  footerNS.locale_wrapper.outerHeight()) / 2)+"px";
		footerNS.locale_wrapper.css("top", topCss);
		footerNS.locale_wrapper.css("left", Math.max(0,($(window).width()-footerNS.locale_wrapper.outerWidth())/2)+$(window).scrollLeft()+"px");
		footerNS.locale_overlay.animate({opacity:0.7});
		footerNS.locale_wrapper.fadeIn(810);
	}else{
		footerNS.locale_overlay.animate({opacity:0}, function(){
			$(this).css("display", "none");
		});
		footerNS.locale_wrapper.fadeOut(490);
	}
	return false;
}

(function (window, document, $, Drupal) {
    "use strict";

    Drupal.behaviors.wechat_button_popover = {
        attach: function (context) {
            var $wechatPopover;

            $('.social-icons').on('click', '.icon-wechat', function(e) {
                e.preventDefault();
                $wechatPopover = $(this).find('.popover');

                $wechatPopover.toggle();

            });

            $('.social-icons').on('mouseleave', '.icon-wechat', function(e) {
                e.preventDefault();
                $wechatPopover = $(this).find('.popover');

                $wechatPopover.hide();

            });

        }
    };
}(this, this.document, this.jQuery, this.Drupal));
