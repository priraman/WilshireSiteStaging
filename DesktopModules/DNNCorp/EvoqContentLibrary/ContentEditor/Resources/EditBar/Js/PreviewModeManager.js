var ViewMode = (function ($) {
    "use strict";

    var ViewMode = function (name, viewId, portraitWidth, portraitHeigth) {
        var self = this;

        this.name = name;
        this.viewId = viewId;
        if (portraitWidth && portraitHeigth) {
            this.mobileDevice = true;
            this.portraitWidth = portraitWidth;
            this.portraitHeigth = portraitHeigth;
            this.landscapeWidth = portraitHeigth;
            this.landscapeHeigth = portraitWidth;
        } else {
            this.mobileDevice = false;
            this.portraitWidth = "100%";
        }
    };

    ViewMode.PreviewModeTypes = {};
    ViewMode.PreviewModeTypes.Desktop = new ViewMode("desktop", ".DesktopModeButton");
    ViewMode.PreviewModeTypes.Phone = new ViewMode("phone", ".PhoneModeButton", 265, 463);
    ViewMode.PreviewModeTypes.Tablet = new ViewMode("tablet", ".TabletModeButton", 605, 808);

    ViewMode.MobileViewTypes = {};
    ViewMode.MobileViewTypes.Portrait = ".Portrait";
    ViewMode.MobileViewTypes.Landscape = ".Landscape";
    return ViewMode;
}(jQuery || $));

var PreviewModeManager = (function ($) {
    "use strict";
    var PreviewModeManager = function () {
        var self = this;

        this._service = $.dnnSF();

        /* UTILS */
        this._request = function (service, controller, method, type, params, callback, errorCallBack) {
            $.ajax({
                url: self._getServiceUrl(service, controller) + method,
                type: type,
                data: params,
                beforeSend: $.proxy(self._beforeSend, this),
                complete: $.proxy(self._completeRequest, this),
                success: function (data) {
                    if (typeof callback == "function") {
                        callback(data);
                    }
                },
                error: function (xhr) {
                    if (typeof errorCallBack == "function") {
                        errorCallBack(xhr);
                    }
                }
            });
        };

        this._beforeSend = function (xhr) {
            self._service.setModuleHeaders(xhr);
        };

        this._completeRequest = function (xhr, status) {

        };

        this._getServiceUrl = function (service, controller) {
            return self._service.getServiceRoot(service) + controller + '/';
        };

        this._selectedViewMode;
        this._selectedMobileOrientation;
        this.version = -1;
        this.beforeCloseCallback = null;
        this.url = null;

        this.tabVersionQueryStringParameter = dnn_tabVersionQueryStringParameter;

        this._setDefaultMode = function () {
            self._selectedViewMode = ViewMode.PreviewModeTypes.Desktop;
            self._selectedMobileOrientation = ViewMode.MobileViewTypes.Portrait;
        };

        this._getDefaultUserPreviewMode = function () {
            this._request('EvoqContentLibrary', 'Common', 'GetUserSetting', 'get', { key: "Usability:PreviewMode" },
                function (data) {
                    if (!data.Value) {
                        self._setDefaultMode();
                        return;
                    }
                    var mode = $.parseJSON(data.Value);

                    if (mode.mobileOrientationId) {
                        $(mode.mobileOrientationId).addClass("selected");
                        self._selectedMobileOrientation = mode.mobileOrientationId;
                    }
                },
                function () {
                    self._setDefaultMode();
                });
        };

        this._sendDefaultUserPreviewMode = function () {
            var orientationIdAttribute = '';
            if (self._selectedMobileOrientation) {
                orientationIdAttribute = ', "mobileOrientationId": "' + self._selectedMobileOrientation + '"';
            }
            var value = '{ "viewModeId": "' + self._selectedViewMode.viewId + '"' + orientationIdAttribute + ' }';
            this._request('EvoqContentLibrary', 'Common', 'SetUserSetting', 'post',
                {
                    Key: "Usability:PreviewMode",
                    Value: value
                },
                function (data) {

                },
                function () {

                });
        };

        this._isSmallScreen = function () {
            var width = $("#Body").width();
            var height = $("#Body").height();

            return (width < 1024 || height < 600);
        };

        this.initViewMode = function () {
            if (self._isSmallScreen()) {
                $(".TabletModeButton").hide();
            }

            $(".previewModeOptions").hide();

            var mode = ViewMode.PreviewModeTypes.Desktop.viewId;
            $(mode).click(self.openDesktopMode);

            mode = ViewMode.PreviewModeTypes.Phone.viewId;
            $(mode).click(self.openPhoneMode);

            mode = ViewMode.PreviewModeTypes.Tablet.viewId;
            $(mode).click(self.openTabletMode);

            var portraitOption = $(".Portrait");
            $(portraitOption).click(self.showPortait);

            var landscapeOption = $(".Landscape");
            $(landscapeOption).click(self.showLandscape);

            var closeOption = $(".ClosePreviewMode");
            $(closeOption).click(self.hidePreview);

            self._getDefaultUserPreviewMode();
        };

        this.removeViewModeSelected = function () {
            $('.ViewMenuButton.selected').removeClass('selected');
            $('.MobileOptionButton.selected').removeClass('selected');
        };

        this.showMobileOptions = function () {
            $('.editbar .mobileOptions').show();
            $('.editbar .notInPreviewMode').hide();
        };

        this.hideMobileOptions = function () {
            $('.editbar .mobileOptions').hide();
        };

        this.showDesktopOptions = function () {
            $('.editbar .desktopOptions').show();
            $('.editbar .notInPreviewMode').hide();
        };

        this.hideDesktopOptions = function () {
            $('.editbar .desktopOptions').hide();
        };

        this._changeSelectedPreviewMode = function (mode, mobileOrientation) {
            self._selectedViewMode = mode;
            self._selectedMobileOrientation = mobileOrientation;
            self._sendDefaultUserPreviewMode();
        };

        this._previewMustBeRefreshed = function (viewId) {
            var container = $('.previewModeContainer');
            if (!self._isShow(container)) {
                return true;
            }
            return self._selectedViewMode && viewId != self._selectedViewMode.viewId;
        };

        this.openDesktopMode = function () {
            checkAuthenticationPreview(function (output) {
                var mode = ViewMode.PreviewModeTypes.Desktop.viewId;
                if (!self._previewMustBeRefreshed(mode)) {
                    return;
                }
                self._selectedViewMode = ViewMode.PreviewModeTypes.Desktop;

                self.removeViewModeSelected();

                self.hideMobileOptions();
                self.showDesktopOptions();
                self.showPreview();
            });
        };

        this.openPhoneMode = function () {
            checkAuthenticationPreview(function (output) {
                var mode = ViewMode.PreviewModeTypes.Phone.viewId;
                if (!self._previewMustBeRefreshed(mode)) {
                    return;
                }
                self._selectedViewMode = ViewMode.PreviewModeTypes.Phone;
                self.removeViewModeSelected();

                self.hideDesktopOptions();
                self.showMobileOptions();
                self.showPreview();
            });
        };

        this.openTabletMode = function () {
            checkAuthenticationPreview(function (output) {
                var mode = ViewMode.PreviewModeTypes.Tablet.viewId;
                if (!self._previewMustBeRefreshed(mode)) {
                    return;
                }
                self._selectedViewMode = ViewMode.PreviewModeTypes.Tablet;
                self.removeViewModeSelected();

                self.hideDesktopOptions();
                self.showMobileOptions();

                self.showPreview();
            });
        };

        this.showPortait = function (event) {
            $(".Portrait").addClass("selected");
            $(".Landscape").removeClass("selected");
            self._selectedMobileOrientation = ViewMode.MobileViewTypes.Portrait;
            self.showPreview();
        };

        this.showLandscape = function (event) {
            $(".Landscape").addClass("selected");
            $(".Portrait").removeClass("selected");
            self._selectedMobileOrientation = ViewMode.MobileViewTypes.Landscape;
            self.showPreview();
        };

        this._getIFrameUrl = function () {
            var iframeUrl;
            if (!self.url && typeof (window.top) === "object") {
                iframeUrl = window.top.location.href;
            } else {
                iframeUrl = self.url;
            }

            if (iframeUrl) {
                if (iframeUrl.indexOf('?') > 0) {
                    iframeUrl += '&dnnprintmode=true';
                } else {
                    iframeUrl += '?dnnprintmode=true';
                }

                if (self.version != -1) {
                    iframeUrl += '&' + self.tabVersionQueryStringParameter + '=' + self.version;
                }
            }

            return iframeUrl;
        };

        this._isShow = function (element) {
            return element.is(':visible');
        };

        this._updateIframe = function (container, viewModeType, mobileViewType) {
            var iframeUrl = self._getIFrameUrl();

            var iframe = $('#previewModeFrame');
            iframe.attr('src', iframeUrl);

            if (!viewModeType.mobileDevice) {
                viewModeType.portraitHeigth = "100%";
                viewModeType.portraitWidth = "100%";
            }

            var iframeHeigth = viewModeType.portraitHeigth;
            var iframeWidth = viewModeType.portraitWidth;

            if (viewModeType.mobileDevice && mobileViewType == ViewMode.MobileViewTypes.Landscape) {
                iframeHeigth = viewModeType.landscapeHeigth;
                iframeWidth = viewModeType.landscapeWidth;
            }

            iframe.height(iframeHeigth);
            iframe.width(iframeWidth);

            iframe.load(function () {
                self.applyMaskToPreview(iframe.contents());
            });
        };

        this._updatePreviewModeImage = function (container, viewMode, mobileViewType) {
            $('#previewModeImage').removeClass();

            var image = $('#previewModeImage');
            if (viewMode.mobileDevice) {
                var mobileImageSuffix = mobileViewType.toLowerCase().substring(1);
                image.addClass(viewMode.name + '-' + mobileImageSuffix);
                image.css('top', (container.height() - image.height()) / 2 + 'px');
            } else {
                image.addClass(viewMode.name);
                image.css('top', '0px');
            }
        };

        this.applyMaskToPreview = function (iframeContents) {

            this.tabVersionMask = "<div id='dnnTabVersionMask'></div>" +
                "<style type='text/css'>#dnnTabVersionMask " +
                "{ position: absolute; left: 0; top: 0; width: 100%; " +
                "height: 100%; z-index: 9999; background-color: trasparent; }</style>";

            var iframeBody = iframeContents.find("body");
            iframeBody.append(self.tabVersionMask);
            iframeBody.find('#dnnTabVersionMask').height(iframeContents.height());
        };

        this.hidePreview = function () {
            $(".previewModeOptions").hide();
            var container = $('.previewModeContainer');
            container.hide();
            $('html, body').css({
                'overflow': '',
            });

            $('.editbar .notInPreviewMode').show();

            if (self.beforeCloseCallback && typeof self.beforeCloseCallback === 'function') {
                self.beforeCloseCallback();
            }
        };

        this.showPreview = function () {
            var viewModeHighlighted = $('.ViewMenuButton.selected');
            if (!self._selectedViewMode && viewModeHighlighted) {
                $.each(ViewMode.PreviewModeTypes, function (key, type) {
                    if (type.viewId == "." + $('.ViewMenuButton.selected').attr('id')) {
                        self._selectedViewMode = this;
                    }
                });

            }
            if (!self._selectedMobileOrientation) {
                self._selectedMobileOrientation = ViewMode.MobileViewTypes.Portrait;
            }
            var viewModeType = self._selectedViewMode;
            var mobileViewType = self._selectedMobileOrientation;

            if (viewModeType.mobileDevice) {
                $(mobileViewType).addClass("selected");
            }

            self.showCustomPreview(viewModeType, mobileViewType);

            self._changeSelectedPreviewMode(self._selectedViewMode, self._selectedMobileOrientation);
        };

        this.showCustomPreview = function (viewModeType, mobileViewType) {
            self._selectedViewMode = viewModeType;
            
            $(".previewModeOptions").show();
            var container = $('.previewModeContainer');
            if (!self._isShow(container)) {
                // hide the scrolls
                $('html, body').css({
                    'overflow': 'hidden',
                });
            }

            self._updatePreviewModeImage(container, viewModeType, mobileViewType);

            self._updateIframe(container, viewModeType, mobileViewType);

            if (!self._isShow(container)) {
                container.show();
            }

        };
    };

    PreviewModeManager.instance = null;
    PreviewModeManager.getInstance = function () {
        if (!PreviewModeManager.instance) {
            PreviewModeManager.instance = new PreviewModeManager();
        }

        return PreviewModeManager.instance;
    };

    return PreviewModeManager;

    // Check user authentication session
    function checkAuthenticationPreview(handleData) {
        var service = $.dnnSF ? $.dnnSF(-1) : null;
        var url = service.getServiceRoot('EvoqContentLibrary') + 'Common/CheckAuthorized';

        $.ajax({
            url: url,
            type: "GET",
            beforeSend: service.setModuleHeaders,
            success: function (data) {
                handleData(data);
            }
        });
    }
}(jQuery || $));
