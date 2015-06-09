var PageHistoryVersionModel = (function ($, ko) {
    "use strict";
    var PageHistoryVersion = function (versionNumber, date, user, state, published, current) {
        var self = this;
        self.compare = ko.observable(false);
        self.versionNumber = versionNumber;
        self.date = date;
        self.user = user;
        self.state = ko.observable(state);
        self.isPublished = published;
        self.isCurrentVersion = current;
    };

    var PageHistoryVersionModel = function () {
        var self = this;
        this.maxNumberOfVersions = dnn_maxNumberOfVersions;
        this.visible = ko.observable(false);
        this.editBarVisible = ko.observable(false);
        this.diff;
        this.previewModeManager;
        this.previewModeTypes;
        this.originalVersion = ko.observable("");
        this.targetVersion = ko.observable("");
        this.previewVersion = ko.observable("");
        this.compareMode = ko.observable(false);
        this.previewModeVisible = ko.observable(false);
        this.compareViewConfigured = false;

        this.versions = ko.observableArray();

        this.tabVersionCompareCss = '<style type="text/css">' +
                'ins {background-color: #c2f3ad; text-decoration: none;} ' +
                'ins > img { opacity: .5; filter: Alpha(Opacity=50);}' +
                'del {background-color: #ffc2c8; text-decoration: none;}' +
                'del > img { opacity: .5; filter: Alpha(Opacity=50);} </style>';

        // Listeners:
        this._iniListeners = function () {
            $(document).on("dnnActionOnEditBar", function (event, data) {
                if (data.id != 'editBarHistoryButton' && self.visible()) {
                    self.visible(false);
                }
            });
        }
        self._iniListeners();

        // Operations:
        self.addVersion = function (versionNumber, date, user, state, published, current) {
            self.versions.push(new PageHistoryVersion(versionNumber, date, user, state, published, current));
        };

        self.modifyLastVersionState = function (newState) {
            if (!newState) {
                return;
            }
            var version = self.versions()[0];
            if (version) {
                version.state(newState);
            }
        };

        self.clearVersions = function () {
            self.versions.removeAll();
        };

        this.toggleView = function () {
            self.visible(!self.visible());
        };

        this.hide = function () {
            self.previewModeManager.hidePreview();
            self._hideCompareContainer();
            self.visible(false);
        };

        this.hideComparationOrPreview = function () {
            self.visible(true);
            self.previewModeVisible(false);
            self._hideCompareContainer();
            self.previewModeManager.hidePreview();
        };

        this.showVersion = function (version) {
            var previousVersion = self.previewModeManager.version;
            self.previewVersion(version.versionNumber);
            self.previewModeVisible(true);
            self.previewModeManager.version = version.versionNumber;
            self.visible(false);
            self.editBarVisible(true);

            self.previewModeManager.showCustomPreview(self.previewModeTypes.Desktop, "");
            self.previewModeManager.version = previousVersion;
        };

        this._isRestoreOrDeleteVersionsAllowed = function (version, callback) {
            if (self.request && typeof self.request == 'function') {
                var versionNumber = self.versions()[0].versionNumber;
                self.request('EvoqContentLibrary', 'Versions', 'IsRestoreOrDeleteVersionsAllowed', 'post', { Version: versionNumber }, function (data) {
                    callback(version);
                }, function (e) {
                    $.dnnAlert({
                        title: "",
                        text: $.parseJSON(e.responseText).Message
                    });
                });
            }
        }

        this.restoreVersion = function (version) {
            self._isRestoreOrDeleteVersionsAllowed(version, self._restoreVersion);
        };

        this._restoreVersion = function (version) {
            var options = {
                dialogText: String.format(self.resx.ConfirmRestore, version.versionNumber, self.currentVersion),
                dialogTitle: self.resx.ConfirmTitle,
                yesText: self.resx.ConfirmYesRestore,
                noText: self.resx.ConfirmCancel
            };

            self.confirmAction(options, function () {
                if (self.request && typeof self.request == 'function') {
                    self.request('EvoqContentLibrary', 'Versions', 'RollBackVersion', 'post', { Version: version.versionNumber }, function (data) {
                        if (self.getPageVersions && typeof self.getPageVersions == 'function') {
                            self.getPageVersions(function () {
                                window.location.reload();
                            });
                        }
                    }, function (e) {
                        $.dnnAlert({
                            title: "",
                            text: e.responseText
                        });
                    });
                }
            }, function () {

            });
        };

        this.deleteVersion = function (version) {
            self._isRestoreOrDeleteVersionsAllowed(version, self._deleteVersion);
        }

        this._deleteVersion = function (version) {
            var options = {
                dialogText: String.format(self.resx.ConfirmDelete, version.versionNumber),
                dialogTitle: self.resx.ConfirmTitle,
                yesText: self.resx.ConfirmYesDelete,
                noText: self.resx.ConfirmCancel
            };

            self.confirmAction(options, function () {
                if (self.request && typeof self.request == 'function') {
                    self.request('EvoqContentLibrary', 'Versions', 'DeleteVersion', 'post', { Version: version.versionNumber }, function (data) {
                        if (self.getPageVersions && typeof self.getPageVersions == 'function') {
                            self.getPageVersions(function () {
                                if (version.isCurrentVersion) {
                                    window.location.reload();
                                }
                            });
                        }
                    }, function (e) {
                        $.dnnAlert({
                            title: "",
                            text: e.responseText
                        });
                    });
                }
            }, function () {

            });
        };

        this.confirmAction = function (options, yesAction, noAction) {
            $("<div class='dnnDialog'></div>").html(options.dialogText).dialog({
                modal: true,
                autoOpen: true,
                dialogClass: "dnnFormPopup",
                width: 400,
                height: 215,
                resizable: false,
                title: options.dialogTitle,
                buttons:
                [
                    {
                        id: "delete_button", text: options.yesText, "class": "dnnPrimaryAction", click: function () {
                            $(this).dialog("close");
                            if (yesAction && typeof yesAction == 'function') {
                                yesAction();
                            }
                        }
                    },
                    {
                        id: "cancel_button", text: options.noText, click: function () {
                            $(this).dialog("close");
                            if (noAction && typeof noAction == 'function') {
                                noAction();
                            }
                        }, "class": "dnnSecondaryAction"
                    }
                ]
            });
        };

        this._getSelectedVersions = function () {
            var results = $.grep(self.versions(), function (e) {
                return e.compare();
            });
            return results;
        };

        this.getNumberOfSelectedVersions = ko.computed(function () {
            return self._getSelectedVersions().length;
        });

        this.isComparing = ko.observable(false);

        this._writeOnIframe = function ($iframe, content) {
            var iframe = $iframe[0];
            var doc = iframe.document;
            if (iframe.contentDocument) {
                doc = iframe.contentDocument;
            }
            else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document;
            }

            doc.open();
            doc.writeln(content);
            doc.close();
        };

        this._activateCompareView = function (container, iframeOriginalContent, iframeDiffContent) {
            // Synchronize tab versions scroll
            var ifr1 = iframeOriginalContent;
            var ifr2 = iframeDiffContent;

            ifr1.unbind('scroll');
            ifr1.scroll(function () {
                ifr2.scrollTop(ifr1.scrollTop());
                ifr2.scrollLeft(ifr1.scrollLeft());
            });

            ifr2.unbind('scroll');
            ifr2.scroll(function () {
                ifr1.scrollTop(ifr2.scrollTop());
                ifr1.scrollLeft(ifr2.scrollLeft());
            });

            container.show();
            self.isComparing(false);

            self.editBarVisible(true);
            self.compareMode(true);
            self.visible(false);
        };

        this._configureCompareViews = function (container, iframeOriginal, iframeDiff) {
            var iframesLoaded = 0;
            iframeOriginal.load(function () {
                self.previewModeManager.applyMaskToPreview(iframeOriginal.contents());

                if (iframesLoaded === 0) {
                    iframesLoaded++;
                    return;
                }
                var iframeOriginalContent = iframeOriginal.contents();
                var iframeDiffContent = iframeDiff.contents();

                self._activateCompareView(container, iframeOriginalContent, iframeDiffContent);
                iframesLoaded = 0;
            });
            iframeDiff.load(function () {
                self.previewModeManager.applyMaskToPreview(iframeDiff.contents());

                if (iframesLoaded === 0) {
                    iframesLoaded++;
                    return;
                }
                var iframeOriginalContent = iframeOriginal.contents();
                var iframeDiffContent = iframeDiff.contents();

                self._activateCompareView(container, iframeOriginalContent, iframeDiffContent);
                iframesLoaded = 0;
            });
        };

        this._showCompareContainer = function (originalContent, newVersion, htmlDiff) {
            self._hideCompareContainer();

            var container = $('.compareVersionsContainer');

            $('html, body').css({
                'overflow': 'hidden',
            });

            var paddingBottom = "85px";
            container.css("padding-bottom", paddingBottom);

            var iframeOriginal = $(".compareOriginalVersion");
            var iframeDiff = $(".compareDiffVersion");

            var originalHead = originalContent.split("<head")[1].split(">").slice(1).join(">").split("</head>")[0];
            var newVersionHead = newVersion.split("<head")[1].split(">").slice(1).join(">").split("</head>")[0];
            newVersionHead += originalHead + self.tabVersionCompareCss;
            var toPutInDiff = "<!doctype html><html><head>" + newVersionHead + "</head><body>" + htmlDiff + "</body></html>";

            if (!self.compareViewConfigured) {
                self._configureCompareViews(container, iframeOriginal, iframeDiff);
                self.compareViewConfigured = true;
            }

            self._writeOnIframe(iframeOriginal, originalContent);
            self._writeOnIframe(iframeDiff, toPutInDiff);
        };

        this._hideCompareContainer = function () {
            var container = $('.compareVersionsContainer');
            $('html, body').css({
                'overflow': '',
            });
            container.hide();
            self.editBarVisible(false);
            self.compareMode(false);
        };

        this._getIFrameUrl = function (version) {
            var url;
            if (typeof (window.top) === "object") {
                url = window.top.location.href;
                if (url.indexOf('?') > 0) {
                    url += '&dnnprintmode=true';
                }
                else {
                    url += '?dnnprintmode=true';
                }

                if (version != -1) {
                    url += '&' + dnn_tabVersionQueryStringParameter + '=' + version;
                }
            }
            return url;
        };

        this._updateVersionsInfo = function (originalVersion, targetVersion) {
            self.originalVersion(originalVersion);
            self.targetVersion(targetVersion);
        };

        this._addNonVersionableModule = function (module, map) {
            var $module = $(module);
            var children = $module.children();
            var id = $module.find('a').first().attr('name');

            map[id] = children;
        };

        this._getAndDeleteNonVersionableModules = function ($content, deletedModulesMap) {
            var nonVersionableModules = $content.find('.DnnModule').not('.DnnVersionableControl');

            nonVersionableModules.each(function () {
                self._addNonVersionableModule(this, deletedModulesMap);
            });

            nonVersionableModules.empty();
            nonVersionableModules.append("####");
            return deletedModulesMap;
        };

        this._markChangeWithMask = function ($element, wasDeleted, height) {
            var $div = $('<div>');

            var children = $element.children();
            var styles = wasDeleted ?
				'background-color: #ffc2c8; opacity: .5; filter: Alpha(Opacity=50);'
				: 'background-color: #c2f3ad; opacity: .5; filter: Alpha(Opacity=50);';

            var $mask = $('<div>').attr('style', styles + 'width: 100%;height: ' + (height || '100') + '%;position: absolute;left: 0px;top: 0px;');
            $div = $('<div>').attr('style', 'position: relative');
            $div.append(children);
            $div.append($mask);
            $element.empty();
            $element.append($div);
        };


        this._restoreDeletedUnversionedModules = function ($html, moduleSet) {
            $.each(moduleSet, function (key, children) {
                var $module = $html.find('.DnnModule-' + key);
                var wasDeleted = false;
                var wasModified = $module.has('del').length ? true : false;

                if (!wasModified) {
                    wasModified = $module.has('ins').length ? true : false;
                } else {
                    wasDeleted = true;
                }

                if (wasModified) {
                    $module.children().first().empty();
                    $module.children().first().append(children);
                    self._markChangeWithMask($module, wasDeleted, 113);
                } else {
                    $module.empty();
                    $module.append(children);
                }
            });
        };

        this._markImageChanges = function ($html) {
            var deletedImages = $html.find('del img');
            $.each(deletedImages, function (key, image) {
                self._markChangeWithMask($(image.parentNode), true);
            });

            var addedImages = $html.find('ins img');
            $.each(addedImages, function (key, image) {
                self._markChangeWithMask($(image.parentNode), false);
            });
        };

        this.compareVersions = function () {
            var content1, content2, previousVersion, newVersion, setCompareProcessAsFailed, hasCompareProcessFailed = false;
            var results = self._getSelectedVersions();
            var urlVersion = self._getIFrameUrl(results[0].versionNumber);
            var urlPreviousVersion = self._getIFrameUrl(results[1].versionNumber);

            self._updateVersionsInfo(results[0].versionNumber, results[1].versionNumber);

            setCompareProcessAsFailed = function () {
                hasCompareProcessFailed = true;
            };

            self.isComparing(true);
            $.when(
                $.get(urlPreviousVersion, function (dataPreviousVersion) {
                    previousVersion = dataPreviousVersion;
                    content2 = dataPreviousVersion.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
                }).fail(setCompareProcessAsFailed),
                $.get(urlVersion, function (dataVersion) {
                    newVersion = dataVersion;
                    content1 = dataVersion.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
                }).fail(setCompareProcessAsFailed)
            ).then(function () {
                if (hasCompareProcessFailed) {
                    self.isComparing(false);
                    $.dnnAlert({
                        title: self.resx.TabCompareFailedTitle,
                        text: self.resx.TabCompareFailedText
                    });
                    return;
                }

                var $content1 = $("<div>").append(content1);
                var $content2 = $("<div>").append(content2);
                var deletedModulesMap = {};
                self._getAndDeleteNonVersionableModules($content1, deletedModulesMap);
                self._getAndDeleteNonVersionableModules($content2, deletedModulesMap);

                self.request('EvoqContentLibrary', 'Versions', 'ComparePage', 'post', { 'content1': $content2.html(), 'content2': $content1.html() }, function (data) {
                    var $htmlDiff = $("<div>").append(data.DiffContent);
                    self._restoreDeletedUnversionedModules($htmlDiff, deletedModulesMap);
                    self._markImageChanges($htmlDiff);

                    self._showCompareContainer(previousVersion, newVersion, $htmlDiff.html());
                }, function () {
                    self.isComparing(false);
                    $.dnnAlert({
                        title: self.resx.TabCompareFailedTitle,
                        text: self.resx.TabCompareFailedText
                    });
                });
            });
        };

        ko.bindingHandlers.inOutVisible = {
            init: function (element, valueAccessor) {
                // Initially set the element to be instantly visible/hidden depending on the value
                var value = valueAccessor();
                $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
            },
            update: function (element, valueAccessor) {
                // Whenever the value subsequently changes, slowly fade the element in or out
                var value = valueAccessor();
                var $element = $(element);
                if (ko.unwrap(value)) {
                    $element.css("bottom", -$element.outerHeight());
                    $element.show();
                    $element.animate({ bottom: 85 }, 300, 'linear');
                } else {
                    $element.animate({ bottom: -$element.outerHeight() }, 300, 'linear', function () {
                        $element.hide();
                    });
                }
            }
        };
    };

    return PageHistoryVersionModel;
}(jQuery || $, ko));
