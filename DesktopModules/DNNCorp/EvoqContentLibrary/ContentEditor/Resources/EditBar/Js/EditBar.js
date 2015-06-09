if (typeof dnn === "undefined" || dnn === null) { dnn = {}; }

dnn.EditBar = (function ($) {
    "use strict";

    var _service;

    var resx = {};
    var resxSettings = {};

    var loadResx = function (cb) {
        var timeStampKey = "EditBarResxTimeStamp." + resxSettings.culture;
        var resxKey = "EditBarResx." + resxSettings.culture;
        var localStorageAllowed = (function () {
            var mod = 'DNN_localStorageTEST';
            try {
                window.localStorage.setItem(mod, mod);
                window.localStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        })();
        if (localStorageAllowed) {
            if (resxSettings.resxTimeStamp) {
                if (window.localStorage[timeStampKey] === resxSettings.resxTimeStamp) {
                    var t = window.localStorage[resxKey];
                    if (t) {
                        resx = JSON.parse(t);
                        if (typeof cb === 'function') cb();
                        return;
                    }
                } else {
                    window.localStorage.removeItem(timeStampKey);
                    window.localStorage.removeItem(resxKey);
                }
            }
        }
        request('EvoqContentLibrary', 'Localization', 'GetTable', 'get', { culture: resxSettings.culture }, function (d) {
            if (localStorageAllowed) {
                window.localStorage[timeStampKey] = resxSettings.resxTimeStamp;
                window.localStorage[resxKey] = JSON.stringify(d);
            }
            resx = d;
            if (typeof cb === 'function') cb();
        });
    };

    var initResx = function (cb) {
        request('EvoqContentLibrary', 'Localization', 'GetResourcesSettings', 'get', null, cb);
    };

    var request = function (service, controller, method, type, params, callback, errorCallBack, sync) {

        $.ajax({
            url: getServiceUrl(service, controller) + method,
            type: type,
            data: params,
            async: !sync,
            beforeSend: $.proxy(onBeforeSend, this),
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

    var getService = function () {
        if (!_service) {
            _service = $.dnnSF();
        }
        return _service;
    };

    var onBeforeSend = function (xhr) {
        getService().setModuleHeaders(xhr);
    };

    var getServiceUrl = function (service, controller) {
        return getService().getServiceRoot(service) + controller + '/';
    };

    var initAuthCheck = function () {
        $('#edit-bar .left-button').click(function (e) {
            var authenticateUrl = getServiceUrl('EvoqContentLibrary', 'Common') + 'CheckAuthorized';
            $.ajax({
                url: authenticateUrl,
                type: "GET",
                data: null,
                async: false,
                beforeSend: $.proxy(onBeforeSend, this),
                success: function (data) {
                },
                error: function (xhr) {
                    if (xhr && xhr.status == '401') {
                        var loginUrl = dnn.getVar('cem_loginurl');
                        if (typeof window.dnnModal != "undefined") {
                            window.dnnModal.show(loginUrl + (loginUrl.indexOf('?') == -1 ? '?' : '&') + 'popUp=true', true, 300, 650, true, '');
                        } else {
                            location.href = loginUrl;
                        }

                        e.stopImmediatePropagation();
                        return;
                    }
                }
            });
        });
    };

    var initAddModuleButton = function () {
        var $button = $('#edit-bar .AddModule');
        $button.click(function () {
            var dialog = dnn.ContentEditorManager.getModuleDialog();
            var contentPane = dialog.getDefaultPane();
            var moduleManager = contentPane.data('dnnModuleManager');
            if (moduleManager) {
                moduleManager.getHandler().click();
            }
        });
    };

    var initPageSettingsButton = function () {
        var $button = $('#edit-bar .Settings');
        if (dnn.getVar('cem_pagetype') == 'template') {
            $button.hide();
        } else {
            $button.click(function() {
                openPageSetting('edit');
            });
        }
    };

    var initPrivatePageButton = function() {
        var $button = $('#edit-bar .private-page');
        
        if (dnn.getVar('cem_pagetype') == 'template') {
            $button.hide();
        } else {
            $button.css("cursor", "pointer");
            $button.click(function () {
                // Load page in edit mode
                // params: null - will force to load the page setting for the current page
                //         1 - will load permissions tab
                openPageSetting('edit', [null, 1]);
            });
        }
    };

    var openPageSetting = function (view, params) {
        var personaBar = $('#personaBar-iframe');
        var $$ = personaBar[0].contentWindow.jQuery;
        (function($) { //context set to in persona bar iframe
            var pagesPanel = $('#pages-panel');
            var btnPages = $('li[data-panel-id="#pages-panel"]');
            pagesPanel.data('init-view', view);
            if (params) {
                pagesPanel.data('init-view-params', params);
            }
            var pageSettingsContainer = pagesPanel.find('.pageSettingsContainer');
            pageSettingsContainer.hide();
            btnPages.click();

            //when view site button clicked, refresh workflow state.
            $('body').on('click', '.btn_showsite', pageEditComplete);
        })($$);
    };

    var pageEditComplete = function () {
        var personaBar = $('#personaBar-iframe');
        var $$ = personaBar[0].contentWindow.jQuery;
        (function ($) { //context set to in persona bar iframe
            $('body').off('click', '.btn_showsite', pageEditComplete);
        })($$);

        if (window['CEM_EditBar']._workflowManager != null) {
        	window['CEM_EditBar']._workflowManager.getPublishingState();
	        window['CEM_EditBar']._workflowManager.isPrivatePage();
        }
    }

    var EditBar = function (options) {
        var self = this;
        this._previewModeManager = PreviewModeManager.getInstance();

        this._pageHistoryManager = new PageHistoryVersionModel();
        this._pageHistoryManager.request = request;
        this._pageHistoryManager.previewModeTypes = ViewMode.PreviewModeTypes;
        this._pageHistoryManager.previewModeManager = self._previewModeManager;
        this._workflowManager = null;

        this.koScopes = {};

        this._showPublishingControls = function (visible) {
            if (this._workflowManager != null) {
                this._workflowManager.hasPendingChanges(visible);
            } else {
                this._hasPendingChanges = visible;
            }
        };

        this._getPageVersions = function (cb) {
            request('EvoqContentLibrary', 'Versions', 'GetPageVersions', 'get', { tabId: _service.getTabId() },
                function (data) {
                    if (!self.koScopes.history) {
                        self.koScopes.history = self._pageHistoryManager;
                    }
                    self.koScopes.history.clearVersions();
                    for (var i = 0; i < data.length; i++) {
                        var version = data[i];
                        var state;
                        if (!version.State) {
                            state = version.IsPublished ? "Published" : "Draft";
                        }
                        if (version.IsCurrentVersion) {
                            self._pageHistoryManager.currentVersion = version.VersionNumber;
                        }
                        self.koScopes.history.addVersion(version.VersionNumber, version.Date, version.User, state, version.IsPublished, version.IsCurrentVersion);
                    }

                    if (data[0]) {
                        // Preview mode will work with the last version.
                        self._previewModeManager.version = data[0].VersionNumber;

                        // Update the history with the current state of the workflow.
                        if (self._workflowManager != null) {
                            self._workflowManager.updateHistoryList();
                        } else {
                            self._updateHistoryList = true;
                        }
                    }

                    if (cb && typeof cb == 'function') {
                        cb();
                    }
                },
                function () {

                });
        };

        this._pageContentChanged = function () {
            var params = { 'tabId': _service.getTabId() };
            request('EvoqContentLibrary', 'PageManagement', 'DeleteThumbnails', 'GET', params, function (data) {
            }, function () {
            }, true);
        };

        this._pageHistoryManager.getPageVersions = this._getPageVersions;

        this._revomeUnusefulButtonsForAdmins = function () {
            $('.notForPageEditors').remove();
        };

        this._revomeUnusefulButtonsWhenVersioningDisabled = function () {
            $('.notIfVersionsDisabled').remove();
        };

        this.applyChangeTriggerToEditBar = function () {
            $("*", "#edit-bar").not('.noChangeTrigger').each(function (i, element) {
                var $element = $(element);

                var events = $._data($element[0], 'events');
                if (typeof events != "undefined" && events['click'] !== null) {
                    $element.click(function () {
                        $(document).trigger("dnnActionOnEditBar", element);
                    });
                }
            });
        };

        this.initUI = function () {
            self._previewModeManager.initViewMode();
            //add handler on authentication check
            initAuthCheck();

            var isPageEditor = dnn.getVar('cem_isPageEditor').toLowerCase();
            // if page editor, the user already has access to this functionalities.
            if (isPageEditor != "true") {
                $('#editBarContainer').addClass('personaBarShown');
                initAddModuleButton();
                initPageSettingsButton();
                initPrivatePageButton();
            } else {
                self._revomeUnusefulButtonsForAdmins();
            }

            var isModuleEditor = dnn.getVar('cem_isModuleEditor').toLowerCase();
            if (isModuleEditor == "true") {
                $('.notForModuleEditors').remove();
            }


            var versionsEnabled = dnn_tabVersioningEnabled;
            if (!versionsEnabled) {
                self._revomeUnusefulButtonsWhenVersioningDisabled();
            }

            initResx(function (data) {
                resxSettings = data;
                loadResx(function () {
                    var imageInfo = {
                        folder: dnn.getVar('dnn_workflow_user_folder'),
                        filter: dnn.getVar('dnn_workflow_image_filter'),
                    };
                    self._workflowManager = new window.dnn.pageWorkflow.PageWorkflowManager(request, self._pageHistoryManager, resx, getService(), (dnn.getVar('dnn_history_hasPendingChanges') === 'true'), imageInfo);
                    if (typeof self._hasPendingChanges != "undefined") {
                        self._workflowManager.hasPendingChanges(self._hasPendingChanges);
                        self._hasPendingChanges = undefined;
                    }

                    if (typeof self._updateHistoryList != "undefined") {
                        self._workflowManager.updateHistoryList();
                        self._updateHistoryList = undefined;
                    }
                    //TODO Set an appropriate callback function to bind the data
                    self.koScopes.resx = resx;
                    self.koScopes.history = self._pageHistoryManager;
                    self.koScopes.workflow = self._workflowManager.getViewModel();
                    ko.applyBindings(self.koScopes, document.getElementById('editBarContainer'));
                    self._pageHistoryManager.resx = resx;
                    self._getPageVersions();


                    self.applyChangeTriggerToEditBar();

                    // event used to notify to editBar's extensions that it is already available.
                    $(document).trigger("dnnEditBarActive");
                });
            });
        };

        $(document).on("changeOnPageContent", function () {
            if (dnn_tabVersioningEnabled || dnn_tabWorkflowEnabled) {
                self._showPublishingControls(true);
                self._getPageVersions();
            } else {
                self._pageContentChanged();
            }
        });
    };

    return EditBar;
}(jQuery || $));

$(window).load(function () {
    $.get(dnn.getVar('cem_resourceroot') + '/EditBar/Html/edit-bar.html', function (data) {
        $("#Body").append(data);

        var editBar = window['CEM_EditBar'] = new dnn.EditBar();
        editBar.initUI();

        $(".editbar").animate({ bottom: 0 }, 100, 'linear');
    });
});
