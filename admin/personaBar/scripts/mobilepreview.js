'use strict';
define(['jquery', 'knockout'], function ($, ko) {
    
    var viewModel = {
        iframeUrl: ko.observable(''),
        imgUrl: ko.observable('')
    };
    return {
        init: function (wrapper, util, params, callback) {

            var bsize = $('div#mobilepreviewpanel');
            var myUrl = null;
            var myImg = null;
            var prevIframe = $('iframe#prevMobile');
            var prevCont = $('div#prevMobileCont');
            

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
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-portrait.png';
                    
                    prevIframe.css('width', '265px');
                    prevIframe.css('height', '463px');
                    prevIframe.css('left', '33px');
                    prevIframe.css('top', '82px');

                    prevCont.css('left', (bsize.width() - 342) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 657) / 2 + 'px');
                }
                if (params.preview == 'landscape') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-landscape.png';
                    
                    prevIframe.css('width', '463px');
                    prevIframe.css('height', '265px');
                    prevIframe.css('left', '80px');
                    prevIframe.css('top', '38px');

                    prevCont.css('left', (bsize.width() - 649) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 343) / 2 + 'px');
                }
            } else {    //default portrait
                if (index > 0)
                    myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-portrait.png';
                prevIframe.css('width', '265px');
                prevIframe.css('height', '463px');
                prevIframe.css('left', '33px');
                prevIframe.css('top', '82px');

                prevCont.css('left', (bsize.width() - 342) / 2 + 'px');
                prevCont.css('top', (bsize.height() - 657) / 2 + 'px');
            }

            viewModel.iframeUrl(myUrl);
            viewModel.imgUrl(myImg);

            ko.applyBindings(viewModel, wrapper[0]);

            if (typeof callback === 'function') callback();
        },

        load: function (params, callback) {
            //alert('load' + params.preview);
            var bsize = $('div#mobilepreviewpanel');
            var prevIframe = $('iframe#prevMobile');
            var prevCont = $('div#prevMobileCont');

            var myImg = null;

            var index = window.location.href.indexOf('admin/');
            if (typeof (params.preview) === 'string') {

                if (params.preview == 'portrait') {

                    if (index > 0)
                        myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-portrait.png';
                    prevIframe.css('width', '265px');
                    prevIframe.css('height', '463px');
                    prevIframe.css('left', '33px');
                    prevIframe.css('top', '82px');

                    prevCont.css('left', (bsize.width() - 342) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 657) / 2 + 'px');
                }
                if (params.preview == 'landscape') {
                    
                    if (index > 0)
                            myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-landscape.png';
                    prevIframe.css('width', '463px');
                    prevIframe.css('height', '265px');
                    prevIframe.css('left', '80px');
                    prevIframe.css('top', '38px');

                    prevCont.css('left', (bsize.width() - 649) / 2 + 'px');
                    prevCont.css('top', (bsize.height() - 343) / 2 + 'px');
                }
            } else {    //default portrait
                if (index > 0)
                    myImg = window.location.href.substring(0, index) + 'admin/personabar/images/phone-portrait.png';
                prevIframe.css('width', '265px');
                prevIframe.css('height', '463px');
                prevIframe.css('left', '33px');
                prevIframe.css('top', '82px');

                prevCont.css('left', (bsize.width() - 342) / 2 + 'px');
                prevCont.css('top', (bsize.height() - 657) / 2 + 'px');
            }

            viewModel.imgUrl(myImg);

            if (typeof callback === 'function') callback();

        }
    };
});