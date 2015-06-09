/*
DotNetNuke® - http://www.dotnetnuke.com
Copyright (c) 2002-2014
by DotNetNuke Corporation
All Rights Reserved
*/

/*
* TODO: Document
*/
define(['jquery', 'knockout', 'knockout.mapping', 'jquery-ui.min'], function ($, ko, koMapping) {
    'use strict';

    var viewModel, koBinded, isMobile, utility, container, resx;

    var init, initMobile, load, loadMobile, addEventListeners, onHidePanelClick, onAddPageClick,
        onAddTemplateClick, changeView, initializeView, showPagesList, callPageSettings,
        pageAddComplete, templateAddComplete, pageEditComplete, pageSettingsCancel,
        viewRecycleBin, viewPageTemplates, viewPageHierarchy, getParentJs, getParentCss;

    viewModel = {};
    koBinded  = false;
    isMobile  = false;
    utility   = null;
    container = null;
    resx      = null;

    ko.mapping = koMapping;

    init = function(wrapper, util, params, callback) {
        utility = util;
        viewModel = {
            viewRecycleBin: viewRecycleBin,
            viewPageTemplates: viewPageTemplates,
            viewPageHierarchy: viewPageHierarchy
        };

        container = wrapper;

        addEventListeners();

        if (typeof dnn === 'undefined' || typeof dnn.dnnPageHierarchy === 'undefined') {
            var jQueryDnnPlugin, dnnExtension, jQueryDnnExtension, tokenInput, scrollBar,
                scrollBarCss, settingsCss, hierarchyCss, recyclebinCss, tagsCss;

            window.Sys = !window.Sys ? window.top.Sys : window.Sys;
            window.dnn = !window.dnn ? window.top.dnn : window.dnn;

            jQueryDnnPlugin = getParentJs('dnn.jquery.js');
            dnnExtension = getParentJs('dnn.extensions');
            jQueryDnnExtension = getParentJs('dnn.jquery.extensions');
            tokenInput = getParentJs('jquery.tokeninput');
            scrollBar = getParentJs('dnn.jScrollBar');

            scrollBarCss = getParentCss('jScrollBar');

            settingsCss = 'css!../../css/pages-settings.css';
            hierarchyCss = 'css!../../css/pages-hierarchy.css';
            recyclebinCss = 'css!../../css/pages-recyclebin.css';
            tagsCss = 'css!../../css/tags-input.css';

            window.require([
                jQueryDnnPlugin,
                dnnExtension,
                jQueryDnnExtension,
                tokenInput,
                scrollBar,
                settingsCss,
                hierarchyCss,
                recyclebinCss,
                scrollBarCss,
                tagsCss
            ], function() {
                changeView();
            });
        } else {
           changeView();
        }

        if (typeof callback === 'function') callback();
    };

    initMobile = function(wrapper, util, params, callback) {
        isMobile = true;
        this.init(wrapper, util, params, callback);
    };

    load = function (params, callback) {
        changeView();

        if (dnn && dnn.dnnPageHierarchy) {
            dnn.dnnPageHierarchy.load();
        }
    };

    loadMobile = function(params, callback) {
        isMobile = true;
        this.load(params, callback);
    };

    onHidePanelClick = function (e) {
        if (typeof dnn.dnnPageSettings != "undefined" && dnn.dnnPageSettings.hasPendingChanges()) {
            dnn.dnnPageSettings.handlePendingChanges(e);
        }else if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            dnn.dnnPageHierarchy.handlePendingChanges(e);
        }
    }

    addEventListeners = function() {
        container.find('a.btn-addpage').click(onAddPageClick);
        container.find('a.btn-addtemplate').click(onAddTemplateClick);

        $("#topLevelMenu .personabarnav li, #topLevelMenu .hovermenu ul li").click(onHidePanelClick).each(function() {
            var events = $._data(this, 'events')['click'];
            var first = events.pop();
            events.splice(0, 0, first);
        });
    };

    onAddPageClick = function () {
        if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            return dnn.dnnPageHierarchy.handlePendingChanges();
        }

        changeView('addpage');
        return false;
    };

    onAddTemplateClick = function () {
        if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            return dnn.dnnPageHierarchy.handlePendingChanges();
        }
        changeView('addtpl');
        return false;
    };

    changeView = function (action) {
        var initView, params;

        if (typeof action === "undefined") {
            initView = container.data('init-view');
            if (!initView) {
                initializeView();
                return;
            }
            container.data('init-view', null);
            changeView(initView);
            return;
        }

        params = container.data('init-view-params');
        container.data('init-view-params', null);

        initializeView(function() {
            switch (action) {
                case "edit":
                    this._closePersonaBarOnUpdate = true;
                    callPageSettings('edit', params);
                    break;
                case "addpage":
                    callPageSettings('addpage', params);
                    break;
                case "addtpl":
                    callPageSettings('addtpl', params);
                    break;
            }
        });
    };

    initializeView = function (callback) {
        setTimeout(function() {
            showPagesList(callback);
        }, 100); // Why 100?
    };

    showPagesList = function(callback) {
        if (typeof dnn.dnnPageHierarchy === 'undefined') {
            window.require(['../pages.pageHierarchy'], function() {
                dnn.dnnPageHierarchy = dnn.dnnPageHierarchy || {};
                dnn.dnnPageHierarchy.resx = utility.resx.ContentPB;
                dnn.dnnPageHierarchy.utility = utility;
                dnn.dnnPageHierarchy._viewModel = viewModel;
                dnn.dnnPageHierarchy.callPageSettings = callPageSettings;
                dnn.dnnPageHierarchy.init(callback);

                $(window).trigger('resize');
            });
        } else {
            if (typeof callback === "function") {
                callback.call(dnn.dnnPageHierarchy);
            }

            $(window).trigger('resize');
        }
    };

    callPageSettings = function (action, params) {
        if (typeof dnn === 'undefined' || typeof dnn.dnnPageSettings === 'undefined') {
            dnn.permissionGridManager = null;

            window.require(['../pages.pageSettings',
                            '../permissionGridManager',
                            '../permissionGrid'], function () {
                                dnn.dnnPageSettings.resx = utility.resx.ContentPB;
                                dnn.dnnPageSettings.serviceController = utility.sf;
                                dnn.dnnPageSettings.utility = utility;
                                dnn.dnnPageSettings.getElement().on('pageAdded', pageAddComplete);
                                dnn.dnnPageSettings.getElement().on('templateAdded', templateAddComplete);
                                dnn.dnnPageSettings.getElement().on('pageEdit', pageEditComplete);
                                dnn.dnnPageSettings.getElement().on('pageSettingsCancel', pageSettingsCancel);

                                dnn.dnnPageSettings[action].apply(dnn.dnnPageSettings, params);
            });
        } else {
            dnn.dnnPageSettings[action].apply(dnn.dnnPageSettings, params);
        }
    };

    pageAddComplete = function(e, data) {
        if (dnn.dnnPageHierarchy) {
            dnn.dnnPageHierarchy.addPage(data);
        }
    };

    templateAddComplete = function(e, data) {
        if (dnn.dnnPageHierarchy) {
            dnn.dnnPageHierarchy.addTemplate(data);
        }
    };

    pageEditComplete = function(e, data) {
        if (dnn.dnnPageHierarchy) {
            dnn.dnnPageHierarchy.editPage(data);

            if (dnn.dnnPageHierarchy._closePersonaBarOnUpdate) {
                dnn.dnnPageHierarchy._closePersonaBarOnUpdate = false;
                $('.btn_showsite').click();
            }
        }
    };

    pageSettingsCancel = function() {
        if (dnn.dnnPageHierarchy) {
            if (dnn.dnnPageHierarchy._closePersonaBarOnUpdate) {
                dnn.dnnPageHierarchy._closePersonaBarOnUpdate = false;
                $('.btn_showsite').click();
            }
        }
    };

    viewRecycleBin = function () {
        if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            return dnn.dnnPageHierarchy.handlePendingChanges();
        }

        if (typeof dnn === 'undefined' || typeof dnn.dnnPageRecycleBin === "undefined") {
            window.require(['../pages.recyclebin'], function () {
                                dnn.dnnPageRecycleBin.resx = utility.resx.ContentPB;
                                dnn.dnnPageRecycleBin.serviceController = utility.sf;
                                dnn.dnnPageRecycleBin.utility = utility;
                                dnn.dnnPageRecycleBin.init();
                                dnn.dnnPageRecycleBin.show();
            });
        } else {
            dnn.dnnPageRecycleBin.init();
            dnn.dnnPageRecycleBin.show();
        }
    };

    viewPageTemplates = function () {
        if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            return dnn.dnnPageHierarchy.handlePendingChanges();
        }

        viewModel.viewType('templates');
    };

    viewPageHierarchy = function () {
        if (typeof dnn.dnnPageHierarchy != "undefined" && dnn.dnnPageHierarchy.hasPendingChanges()) {
            return dnn.dnnPageHierarchy.handlePendingChanges();
        }
        viewModel.viewType('hierarchy');
    };

    getParentJs = function(name) {
        return (function($) {
            var src = $('script[src*="' + name + '"]:eq(0)').attr('src');
            if (src && src.length > 0 && src.indexOf('?') > -1) {
                src = src.substr(0, src.indexOf('?'));
            }

            return src;
        })(window.top.jQuery);
    };

    getParentCss = function(name) {
        return (function($) {
            var src = $('link[href*="' + name + '"]:eq(0)').attr('href');
            if (!src || src.length === 0) {
                return src;
            }

            if (src.indexOf('?') > -1) {
                src = src.substr(0, src.indexOf('?'));
            }

            if (src.substr(0, 1) == '/') {
                src = 'rootPath' + src;
            }

            src = "css!" + src;

            return src;
        })(window.top.jQuery);
    };

    return {
        init: init,
        load: load,
        initMobile: initMobile,
        loadMobile: loadMobile
    };
});
