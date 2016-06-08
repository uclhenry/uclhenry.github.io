/*=============================================
=            Tesla Retina Functions          =
=                       2014                 =
=                      @manny                =
=============================================*/

/**
*
* Simply function to detect if end-user is on a Retina-friendly device.
* @returns boolean
*
**/
function isRetina() {
    var is_retina = window.devicePixelRatio > 1 ||
    ( window.matchMedia && window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)").matches );
    return is_retina;
}

/**
*
* For any image/asset that has the 'retina' class, use retina version, if it exists
*
**/
function updateImagesToRetina() {
    if ( isRetina() ) {
        debug.log("User is on a retina device. Update certain images to use Retina version");

        var retina_images       = $("img.retina");
        var retina_image_length = retina_images.length;
        debug.log("We have the following number of images to get the retina version for", retina_image_length);

        if ( retina_image_length ) {
            var retina_file_format = "@2x";
            for(var i = 0; i < retina_image_length; i++) {
                var imageType = retina_images[i].src.substr(-4);
                var imageName = retina_images[i].src.substr(0, retina_images[i].src.length - 4);
                imageName    += retina_file_format + imageType;

                // re-assign image
                retina_images[i].src = imageName;
            }
        }
    }
}

$(document).ready(function() {
    updateImagesToRetina();
});
