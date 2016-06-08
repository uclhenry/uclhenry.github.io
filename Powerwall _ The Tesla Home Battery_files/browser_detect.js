/**
 * Browser detect - based on (with TESLA MODIFICATIONS / ADDITIONS)
 * http://www.quirksmode.org/js/detect.html
 *
 * Usage:
 * The following are available immediately upon invoking this script:
 * BrowserDetect.browser; // Browser name
 * BrowserDetect.version; // Browser version
 * BrowserDetect.OS       // OS name
 * BrowserDetect.summary  // Summary object with the above items concatted together
 *
 * Example:
 * // Initialize BrowserDetect object if it hasn't already been done
 * if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
 *    BrowserDetect.init();
 * }
 * // +
 * // Set the BrowserDetect propery as input value
 * if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.setValueToInput) !== "undefined") {
 *     var browserDetectInput = $('#browser_detect_summary');
 *     if (browserDetectInput.length && browserDetectInput.val() === '') {
 *         BrowserDetect.setValueToInput(browserDetectInput, 'summary');
 *     }
 * }
 */
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
        // TESLA ADDITION: Get the summary in one call
        this.summary = { "browser": this.browser,
                         "version": this.version,
                         "OS": this.OS
                       };
    },
    // TESLA ADDITION: Function to set value to input
    setValueToInput: function(obj, prop) {
        if (typeof(this.prop) === "undefined") {
            prop = 'summary';
        }
        var propValue = this[prop];
        if (obj.length && typeof(propValue) !== "undefined") {
            propValue = (typeof propValue === 'object') ? JSON.stringify(propValue) : propValue;
            obj.val(propValue);
        }
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        {   string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {       // for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        {       // for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
           string: navigator.userAgent,
           subString: "iPhone",
           identity: "iPhone/iPod"
        },
        {
           string: navigator.userAgent,
           subString: "iPad",
           identity: "iOS Tablet Device"
        },
        {
           string: navigator.userAgent,
           subString: "Android",
           identity: "Android"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};
// TESLA MODIFICATION: DON'T auto-init this script on every page
// if (typeof(BrowserDetect) === "undefined") {
//      BrowserDetect.init();
// }
