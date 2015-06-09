if (typeof dnn === "undefined" || dnn === null) { dnn = {}; };

define(['jquery', 'knockout'], function ($, ko) {

    var pageThumbnails = function(options) {
        this.options = options;

        this.init();
    };

    pageThumbnails.prototype = {
        constructor: pageThumbnails,

        init: function() {
            this.options = $.extend({}, pageThumbnailsDefaultOptions, this.options);

            this.container = $('#pages-panel');
            this.wrapper = $('.thumbnails-loader-wrapper');
            this._abort = false;

            $(document.body).on('thumbnailcreated', $.proxy(this._thumbnailCreated, this));
        },

        updateThumbnails: function () {
            if (!this.container.is(':visible')) {
                return;
            }

            var handler = this;
            var defaultName = this.options.defaultThumbnail;

            //if loading img, then ignore
            if (this.container.find('img[src$="' + defaultName + '"][class~="loading"]').length > 0) {
                return;
            }

            var $defaultImg = this.container.find('img[src$="' + defaultName + '"][class~="list"]').filter(':not([class~="loading"])').filter(':not([class~="failed"])').eq(0);

            if ($defaultImg.length == 0) {
                this.removeThumbnailLoader();
                return;
            }
                
            var checkData = ko.dataFor($defaultImg[0]);
            if (checkData) {
                //ignore skin templates
                if (checkData.id <= 0) {
                    $defaultImg.addClass('failed').parent().addClass('failed');

                    this.updateThumbnails();
                    return;
                }
                //if external url then doesn't create thumbnail.
                var protocol = checkData.url.indexOf('://');
                var checkUrl = checkData.url.substr(protocol > -1 ? protocol + 3 : 0);
                if (checkUrl.toLowerCase().indexOf(location.host) != 0) {
                    $defaultImg.addClass('failed').parent().addClass('failed');

                    this.updateThumbnails();
                    return;
                }

                $defaultImg.addClass('loading');
                $defaultImg.parent().addClass('loading');

                var url = checkData.url
                    + (checkData.url.indexOf('?') == -1 ? '?' : '&')
                    + 'dnnprintmode=true&createthumbnail=true&userid=' + this._getVar('dnn_current_userid');

                this._abort = false;
                $.get(url, function (data) {
                    if (handler._abort) {
                        return;
                    }
                    handler.removeThumbnailLoader();

                    var thumbnailLoader = $('<iframe class="thumbnail-loader"></iframe>');

                    thumbnailLoader.css({
                        width: $(window).width(),
                        height: $(window).height(),
                        zIndex: -1,
                        visibility: 'hidden'
                    });
                    thumbnailLoader.load($.proxy(handler._thumbnailLoaderLoaded, handler));
                    thumbnailLoader.data('listitem', $defaultImg.parents('[data-page-id], [data-template-id]'));
                    thumbnailLoader.attr('data-currentid', checkData.id);

                    handler.wrapper.append(thumbnailLoader);

                    var iframeDoc = thumbnailLoader[0].contentWindow.document;

                    var ie = (function(){

                        var undef,
                            v = 3,
                            div = document.createElement('div'),
                            all = div.getElementsByTagName('i');

                        while (
                            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                            all[0]
                        );

                        return v > 4 ? v : undef;

                    }());

                    if (ie && ie < 10) {
                        var wrapper = $('<div></div>');
                        wrapper.html(data);
                        wrapper.find('script').each(function() {
                            if ($(this).html() != '') {
                                $(this).attr('defer', 'defer');
                            }
                        });

                        data = wrapper.html();
                    }

                    var baseUrl = url;
                    if (baseUrl.indexOf('?') > -1) {
                        baseUrl = baseUrl.substr(0, baseUrl.indexOf('?'));
                    }
                    data = '<base href="' + baseUrl + '" />' + data;

                    iframeDoc.write(data);
                    iframeDoc.close();
                });
            };
        },

        _thumbnailCreated: function (e, data) {
            var $loader = this.wrapper.find('iframe[data-currentid=' + data.pageId + ']');
            var $listItem = $loader.data('listitem');
            if ($listItem) {
                var koData = ko.dataFor($listItem[0]);
                if (koData) {
                    koData.thumbnail = data.thumbnails[2];
                    koData.largeThumbnail = data.thumbnails[3];

                    $listItem.find('.thumbnail img').attr('src', data.thumbnails[2]).removeClass('loading').parent().removeClass('loading');
                }
            }
            else {
                this.wrapper.find('iframe.thumbnail-loader').data('listitem').find('.thumbnail img').attr('src', data.thumbnails[2]).removeClass('loading').parent().removeClass('loading');
            }

            var handler = this;
            setTimeout(function() {
                handler.updateThumbnails();
            }, 0);
        },

        _thumbnailLoaderLoaded: function (e) {
            var loader = e.target;
            if (loader.src == '' || loader.src == 'about:blank') {
                return;
            }

            var dnnPage = true;
            try {
                
                var contentWindow = loader.contentWindow;
                if (typeof contentWindow['dnn'] == "undefined" || typeof contentWindow['WebPageThumbnailGenerator'] == "undefined") {
                    dnnPage = false;
                }
            } catch (e) {
                dnnPage = false;
            }

            if (!dnnPage) {
                var pageId = $(e.target).data('pageid');

                var $listItem = this.container.find('li[data-page-id=' + pageId + ']');
                $listItem.find('.thumbnail img').removeClass('loading').parent().removeClass('loading');
                $listItem.find('.thumbnail img').addClass('failed').parent().addClass('failed');

                this.removeThumbnailLoader();
            }
        },

        removeThumbnailLoader: function () {
            this.wrapper.find('iframe').each(function () {
                var loader = $(this);
                $.removeData(loader);

                try {
                    var iframeDoc = loader[0].contentWindow.document;
                    iframeDoc.write('');
                    iframeDoc.close();
                } catch (ex) {
                    
                }
                
                loader.remove();
                loader = null;
            });

            this._abort = true;
        },

        _getVar: function (name) {
            var dnn = window != window.top ? window.top['dnn'] : window['dnn'];
            return dnn.getVar(name);
        }
    };

    var pageThumbnailsDefaultOptions = {
        delayTime: 500,
        requestDelayTime: 2000,
        requestTimeout: 4000,
        defaultThumbnail: 'fallback-thumbnail.png'
    };

    if (!dnn.dnnPageThumbnails) {
        dnn.dnnPageThumbnails = new pageThumbnails();
    }

    return dnn.dnnPageThumbnails;
});