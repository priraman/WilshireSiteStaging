'use strict';
define(['jquery', 'knockout'], function ($, ko) {

    var viewModel = {
        iframeUrl: ko.observable(''),
        imgUrl: ko.observable('')
    };
    return {
        init: function (wrapper, util, params, callback) {

            var bsize = $('div#tabletpreviewpanel');
            var prevIframe = $('iframe#prevTablet');
            var prevCont = $('div#prevTabletCont');

            var myUrl = null;
            var myImg = null;

            if (typeof (window.top) === "object") {
                myUrl = window.top.location.href;
                if (myUrl.indexOf('?') > 0) {
                    myUrl += '&dnnprintmode=true';
                }
                else {
                    myUrl += '?dnnprintmode=true';
                }
            }

            var index = window.location.href.indexOf('admin/');
            if (typeof (params.preview) === 'string') {

                if (params.preview == 'portrait') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-portrait.png';

                    prevIframe.css('width', '593px');
                    prevIframe.css('height', '793px');
                    prevIframe.css('left', '94px');
                    prevIframe.css('top', '88px');

                    prevCont.css('left', (bsize.width() - 782) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 969) / 2 + 'px');
                }
                if (params.preview == 'landscape') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-landscape.png';

                    prevIframe.css('width', '793px');
                    prevIframe.css('height', '593px');
                    prevIframe.css('left', '112px');
                    prevIframe.css('top', '68px');

                    prevCont.css('left', (bsize.width() - 1005) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 736) / 2 + 'px');
                }
            } else {    //default portrait
                if (index > 0)
                    myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-portrait.png';
                prevIframe.css('width', '593px');
                prevIframe.css('height', '793px');
                prevIframe.css('left', '94px');
                prevIframe.css('top', '88px');

                prevCont.css('left', (bsize.width() - 782) / 2 + 'px');
                prevCont.css('top', (bsize.height() - 969) / 2 + 'px');
            }

            viewModel.iframeUrl(myUrl);
            viewModel.imgUrl(myImg);

            ko.applyBindings(viewModel, wrapper[0]);

            if (typeof callback === 'function') callback();
        },

        load: function (params, callback) {
            //alert('tablet load');
            var bsize = $('div#tabletpreviewpanel');
            var prevIframe = $('iframe#prevTablet');
            var prevCont = $('div#prevTabletCont');

            var myImg = null;

            var index = window.location.href.indexOf('admin/');
            if (typeof (params.preview) === 'string') {

                if (params.preview == 'portrait') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-portrait.png';
                    prevIframe.css('width', '593px');
                    prevIframe.css('height', '793px');
                    prevIframe.css('left', '94px');
                    prevIframe.css('top', '88px');

                    prevCont.css('left', (bsize.width() - 782) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 969) / 2 + 'px');
                }
                if (params.preview == 'landscape') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-landscape.png';
                    prevIframe.css('width', '793px');
                    prevIframe.css('height', '593px');
                    prevIframe.css('left', '112px');
                    prevIframe.css('top', '68px');

                    prevCont.css('left', (bsize.width() - 1005) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 736) / 2 + 'px');
                }
            } else {    //default portrait
                if (index > 0)
                    myImg = window.location.href.substring(0, index) + 'admin/personabar/images/tablet-portrait.png';
                prevIframe.css('width', '593px');
                prevIframe.css('height', '793px');
                prevIframe.css('left', '94px');
                prevIframe.css('top', '88px');

                prevCont.css('left', (bsize.width() - 782) / 2 + 'px');
                prevCont.css('top', (bsize.height() - 969) / 2 + 'px');
            }

            viewModel.imgUrl(myImg);

            if (typeof callback === 'function') callback();
        },
    };
});