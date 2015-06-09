'use strict';
define(['jquery', 'knockout'], function ($, ko) {
    var viewModel = {
        iframeUrl: ko.observable('')
    };

    return {
        init: function (wrapper, util, params, callback) {

            var bsize = $('div#desktoppreviewpanel');
            var prevIframe = $('iframe#prevDesktop');
            var myUrl = null;
            
            if (typeof(window.top) === "object") {
                myUrl = window.top.location.href;
                if (myUrl.indexOf('?') > 0) {
                    myUrl += '&dnnprintmode=true';
                }
                else {
                    myUrl += '?dnnprintmode=true';
                }
            }

            prevIframe.css('width', bsize.width()+'px');
            prevIframe.css('height', bsize.height()+ 'px');

            viewModel.iframeUrl(myUrl);
            ko.applyBindings(viewModel, wrapper[0]);
            
            if (typeof callback === 'function') callback();
        },

        load: function (params, callback) {
            //alert('desktop load');
            if (typeof callback === 'function') callback();
        },
    };
});