; if (typeof dnn === "undefined" || dnn === null) { dnn = {}; }; //var dnn = dnn || {};

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

dnn.PageSettings = dnn.PageSettings || {};

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
(function ($, window, document, undefined) {
    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than globals
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).


    //
    // UrlView Model
    //
    var Helper = this.Helper = function () {
    };

    Helper.getKeyValuePairByKey = function (pairs, key) {
        if (!pairs) {
            return null;
        }
        for (var i = 0, size = pairs.length; i < size; i++) {
            if (pairs[i].key === key) {
                return pairs[i];
            }
        }
        return null;
    };


    //
    // UrlView Model
    //
    var UrlViewModel = this.UrlViewModel = function (properties) {
        this.$this = $(this);
        this.path = ko.observable("");
        this.queryString = ko.observable("");
        this.siteAlias = ko.observable(null);
        this.locale = ko.observable(null);
        this.statusCode = ko.observable(null);
        this.editing = ko.observable(false);
        this.id = ko.observable(-1);
        this.siteAliasUsage = ko.observable(null);
        this.isSystem = ko.observable(false);

        this.aliasAndPath = ko.computed(this._aliasAndPath, this);
        this.is200 = ko.computed(this._is200, this);

        this.statusCode.subscribe($.proxy(this._onStatusCodeChanged, this));

        if (typeof properties !== "undefined") {
            this.values(properties);
        }
    };

    UrlViewModel.prototype = {
        constructor: UrlViewModel,

        _onStatusCodeChanged: function(status) {
            if (status && status.key === 200) {
                this.queryString("");
            }
        },

        _aliasAndPath: function () {
            var alias = this.siteAlias();
            return alias ? alias.value.append(this.path(), "").append(this.queryString(), "?") : "";
        },

        _is200: function () {
            var status = this.statusCode();
            return status && status.key === 200;
        },

        editUrl: function (viewModel, evt) {
            this.$this.trigger("onEdit", [this]);
        },

        values: function (properties) {
            if (typeof properties === "undefined") {
                return {
                    path: this.path(),
                    queryString: this.queryString(),
                    siteAlias: this.siteAlias(),
                    locale: this.locale(),
                    statusCode: this.statusCode(),
                    id: this.id(),
                    siteAliasUsage: this.siteAliasUsage(),
                    isSystem: this.isSystem()
                };
            }
            var prop = properties || {};
            if (typeof prop.path !== "undefined") this.path(prop.path);
            if (typeof prop.queryString !== "undefined") this.queryString(prop.queryString);
            if (typeof prop.siteAlias !== "undefined") this.siteAlias(prop.siteAlias);
            if (typeof prop.locale !== "undefined") this.locale(prop.locale);
            if (typeof prop.statusCode !== "undefined") this.statusCode(prop.statusCode);
            if (typeof prop.id !== "undefined") this.id(prop.id);
            if (typeof prop.siteAliasUsage !== "undefined") this.siteAliasUsage(prop.siteAliasUsage);
            if (typeof prop.isSystem !== "undefined") this.isSystem(prop.isSystem);
            if (typeof prop.onEdit === "function") this.$this.bind('onEdit', prop.onEdit);
        }
    };


    //
    // View Model
    //
    var UrlListViewModel = this.UrlListViewModel = function (options) {
        this.options = options;
        this.urls = ko.observableArray([]);
        this.sortingFields = ko.observable({});
        this._sortingField = 0;
        this._sortingOrder = true;
        this.init();
    };

    UrlListViewModel.prototype = {
        constructor: UrlListViewModel,

        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and the options via the instance, 
            // e.g., this.element and this.options

            this.options = $.extend({}, UrlListViewModel.defaults(), this.options);

            this._getUrlListServiceSettings = {
                url: this.options.services.listUrls,
                beforeSend: $.dnnSF().setModuleHeaders,
                type: "GET",
                async: true,
                success: $.proxy(this._onLoadUrls, this),
                error: $.onAjaxError
            };

            this.list();
        },

        clear: function () {
            this.urls = this.urls([]);
        },

        _onLoadUrls: function (data, textStatus, jqXhr) {
            this.loadFromModel(data);
        },

        selectUrl: function (caller, evt) {
            return true;
        },

        sort: function (caller, evt) {
            var clickedColumn = evt.currentTarget;
            var $clickedColumn = $(clickedColumn);
            $(this._currentColumn).removeClass(this._getColumnClass(this._sortingOrder));
            if (this._currentColumn === clickedColumn) {
                // swap sort order
                this._sortingOrder = !this._sortingOrder;
            }
            else {
                this._sortingOrder = true;
            }
            $clickedColumn.addClass(this._getColumnClass(this._sortingOrder));
            this._currentColumn = clickedColumn;
            this._sortingField = $clickedColumn.attr("data");
            this.list();
        },

        list: function() {
            this._getUrlListServiceSettings.data = {
                sortField: this._sortingField,
                sortOrder: this._sortingOrder
            };
            $.ajax(this._getUrlListServiceSettings);
        },

        _getColumnClass: function (sortingOrder) {
            return (typeof (sortingOrder) === "undefined" || sortingOrder) ? "asc" : "desc";
        },

        loadFromModel: function (model) {
            var items = [];
            var self = this;
            $.each(model.Urls,
                function (index, urlModel) {
                    var values = Object.ToCamel(urlModel);
                    values.onEdit = self.options.onEditUrlProxy;
                    items.push(new UrlViewModel(values));
                    
                    if (values.statusCode.key == 200) {
                        var pageUrlField = $("input[id$=ManageTabs_urlTextBox]");
                        var oldValue = pageUrlField.val();
                        var urlTextBox = $("input[id$=ManageTabs_urlTextBox]");
                        if (!urlTextBox.hasClass('um-page-url-modified')) {
                            urlTextBox.val(values.path);
                        } else {
                            urlTextBox.removeClass('um-page-url-modified');
                        }
                        if (oldValue.length > 0) {
                            $("form[id=Form]").attr("action", $("form[id=Form]").attr("action").replace(oldValue, values.path));
                        }
                    }
                }
            );
            this.urls(items);
        }

    };

    UrlListViewModel._defaults = {};

    UrlListViewModel.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(UrlListViewModel._defaults, settings);
        }
        return UrlListViewModel._defaults;
    };


    //
    // EditUrlView Model
    //
    var EditUrlViewModel = this.EditUrlViewModel = function (options) {
        this.$this = $(this);
        this.options = options;
        this.locales = ko.observableArray([]);
        this.statusCodes = ko.observableArray([]);
        this.siteAliases = ko.observableArray([]);
        this.isPrimaryAliasUpdate = ko.observable();
        this.isPrimaryAlias = ko.computed(this._isPrimaryAlias, this);
        this.primaryAliasId = ko.observable(null);
        this.siteAliasUsages = ko.observable(null);
        this.hasParent = ko.observable(false);
        this.url = ko.observable(null);
        this.url.subscribe($.proxy(this._onUrlChanged, this));
        this.ready = ko.observable(false);
        this.saving = ko.observable(false);
        this.isEdit = ko.computed(this._isEdit, this);
        this.init();
    };

    EditUrlViewModel.prototype = {
        constructor: EditUrlViewModel,

        init: function () {

            var serviceSettings = {
                beforeSend: $.dnnSF().setModuleHeaders,
                url: this.options.services.getOptions,
                type: "GET",
                async: true,
                success: $.proxy(this._onLoadOptions, this),
                error: $.onAjaxError
            };
            $.ajax(serviceSettings);
        },

        _isEdit: function () {
            return !!this._url;
        },

        _onUrlChanged: function(url) {
            if (url) {
                url.siteAlias.subscribe($.proxy(this._onSiteAliasChanged, this));
            }
            this._invalidatePrimaryAlias();
        },

        _onSiteAliasChanged: function (alias) {
            this._invalidatePrimaryAlias();
            if (!(this.url && alias)) {
                return;
            }
            if (alias.key === this.primaryAliasId()) {
                this.url().siteAliasUsage(this.siteAliasUsages().Default);
            }
            else {
                this.url().siteAliasUsage(this.siteAliasUsages().ChildPagesDoNotInherit);
            }
        },

        _invalidatePrimaryAlias: function () {
            this.isPrimaryAliasUpdate.notifySubscribers();
        },

        _isPrimaryAlias: function () {
            this.isPrimaryAliasUpdate();
            var url = this.url ? this.url() : null;
            if (url) {
                var siteAlias = url.siteAlias();
                return siteAlias && siteAlias.key === this.primaryAliasId();
            }
            return false;
        },

        _onLoadOptions: function (model, textStatus, jqXhr) {
            this.locales(Object.ToCamel(model.Locales));
            this.statusCodes(Object.ToCamel(model.StatusCodes));
            this.siteAliases(Object.ToCamel(model.SiteAliases));
            this.primaryAliasId(model.PrimaryAliasId);

            var usages = new dnn.Enum(Object.ToCamel(model.SiteAliasUsages));
            this.siteAliasUsages(usages);

            this.hasParent(model.HasParent);

            this.ready(true);
            this._bindUrl();
        },

        _openDialog: function (isEdit) {
            var title = isEdit ? this.options.editUrlDialogTitle : this.options.createUrlDialogTitle;
        },

        edit: function (urlViewModel) {
            this._openDialog(typeof urlViewModel !== "undefined");
            this._url = urlViewModel;
            if (this.ready()) {
                this._bindUrl();
            }
        },

        _bindUrl: function () {
            var editingUrl = new UrlViewModel();
            if (this._isEdit()) {
                var queryString = this._url.queryString();
                if (queryString && !queryString.startsWith("/")) {
                    queryString = "?" + queryString;
                }
                var path = this._url.path();
                if (path && !path.startsWith("/")) {
                    path = "/" + path;
                }
                editingUrl.values({
                    path: path,
                    queryString: queryString,
                    siteAlias: Helper.getKeyValuePairByKey(this.siteAliases(), this._url.siteAlias().key),
                    locale: Helper.getKeyValuePairByKey(this.locales(), this._url.locale().key),
                    statusCode: Helper.getKeyValuePairByKey(this.statusCodes(), this._url.statusCode().key),
                    siteAliasUsage: this._url.siteAliasUsage(),
                    id: this._url.id(),
                    isSystem: this._url.isSystem()
                });
            }
            this.url(editingUrl);
        },

        save: function () {

            var properties = this.url().values();
            properties.path = properties.path.trim();
            properties.queryString = properties.queryString.trim();
            if (properties.queryString.startsWith("?")) {
                properties.queryString = properties.queryString.substring(1) || "";
            }

            var postData = {
                Id: properties.id,
                SiteAliasKey: properties.siteAlias.key,
                Path: properties.path,
                QueryString: properties.queryString,
                LocaleKey: properties.locale.key,
                StatusCodeKey: properties.statusCode.key,
                SiteAliasUsage: properties.siteAliasUsage,
                IsSystem: properties.isSystem
            };

            var serviceSettings;
            if (this._isEdit()) {
                // edit mode
                this._url.values(properties);

                if (!this._updateCustomUrlServiceSettings) {
                    this._updateCustomUrlServiceSettings = {
                        beforeSend: $.dnnSF().setModuleHeaders,
                        url: this.options.services.updateUrl,
                        type: "POST",
                        async: true,
                        success: $.proxy(this._onUpdateUrl, this),
                        error: $.onAjaxError,
                        complete: $.proxy(this._onComplete, this)
                    };
                }
                serviceSettings = this._updateCustomUrlServiceSettings;
            }
            else {
                if (!this._createCustomUrlServiceSettings) {
                    this._createCustomUrlServiceSettings = {
                        beforeSend: $.dnnSF().setModuleHeaders,
                        url: this.options.services.createUrl,
                        type: "POST",
                        async: true,
                        success: $.proxy(this._onCreateUrl, this),
                        error: $.onAjaxError,
                        complete: $.proxy(this._onComplete, this)
                    };
                }
                serviceSettings = this._createCustomUrlServiceSettings;
            }
            serviceSettings.data = postData;
            $.ajax(serviceSettings);
            this.saving(true);
        },

        cancel: function () {
            this._isEdit() ? this.$this.trigger("onCancelEditUrl", [this._url]) : this.$this.trigger("onCancelCreateUrl");
        },

        _onCreateUrl: function (data, textStatus, jqXhr) {
            if (data.Success) {
                this.$this.trigger("onCreateUrl", [data.Id]);
            }
            else {
                $.dnnAlert({ title: this.options.errorTitle || "Error", text: data.ErrorMessage || "Unknown error" });
                if (data.SuggestedUrlPath) {
                    this.url().path(data.SuggestedUrlPath);
                }
            }
        },

        _onUpdateUrl: function (data, textStatus, jqXhr) {
            if (data.Success) {
                this.$this.trigger("onUpdateUrl", [this._url]);
            }
            else {
                $.dnnAlert({ title: this.options.errorTitle || "Error", text: data.ErrorMessage || "Unknown error" });
                if (data.SuggestedUrlPath) {
                    this.url().path(data.SuggestedUrlPath);
                }
            }
        },

        _onComplete: function(jqXHR, textStatus) {
            this.saving(false);
        }

    };


    //
    // View Model
    //
    var ViewModel = this.ViewModel = function (options) {
        this.options = options;
        this.singleLocale = ko.observable(false);
        this.creating = ko.observable(false);
        this.init();
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        init: function () {

            this.options = $.extend({}, ViewModel.defaults(), this.options);

            this._serviceUrl = $.dnnSF().getServiceRoot(this.options.serviceRoot);

            var onEditUrlProxy = $.proxy(this._onEditUrl, this);
            var customUrlsOptions = $.extend({
                services: {
                    listUrls: this._serviceUrl + this.options.methods.getCustomUrls
                },
                onEditUrlProxy: onEditUrlProxy
            }, this.options);
            this.customUrls = new UrlListViewModel(customUrlsOptions);

            var editUrlOptions = $.extend({
                services: {
                    getOptions: this._serviceUrl + this.options.methods.getUrlOptions,
                    createUrl: this._serviceUrl + this.options.methods.createUrl,
                    updateUrl: this._serviceUrl + this.options.methods.updateUrl
                }
            }, this.options);
            this.editViewModel = new EditUrlViewModel(editUrlOptions);
            this.$editViewModel = $(this.editViewModel);
            this.$editViewModel.bind("onUpdateUrl", $.proxy(this._onUpdateUrl, this));
            this.$editViewModel.bind("onCreateUrl", $.proxy(this._onCreateUrl, this));
            this.$editViewModel.bind("onCancelEditUrl", $.proxy(this._onCancelEditUrl, this));
            this.$editViewModel.bind("onCancelCreateUrl", $.proxy(this._onCancelCreateUrl, this));

            var systemGeneratedUrlsOptions = $.extend({
                services: {
                    listUrls: this._serviceUrl + this.options.methods.getSystemGeneratedUrls
                }
            }, this.options);
            this.systemGeneratedUrls = new UrlListViewModel(systemGeneratedUrlsOptions);

            var configurationServiceSettings = {
                beforeSend: $.dnnSF().setModuleHeaders,
                url: this._serviceUrl + this.options.methods.getConfiguration,
                type: "GET",
                async: true,
                success: $.proxy(this._onLoadSettings, this),
                error: $.onAjaxError
            };

            $.ajax(configurationServiceSettings);

            ko.bindingHandlers.initViewRow = {
                update: $.proxy(this._initViewRow, this)
            };

            ko.bindingHandlers.initEditRow = {
                update: $.proxy(this._initEditRow, this)
            };

        },

        _initViewRow: function(element, valueAccessor, allBindingsAccessor, elementViewModel, bindingContext) {
            if (typeof this._highlightUrlId === "undefined") {
                return;
            }
            var id = elementViewModel.id();
            if (id === this._highlightUrlId) {
                $(element).quickHighlight();
                delete(this._highlightUrlId);
            }
        },

        _initEditRow: function (element, valueAccessor, allBindingsAccessor, elementViewModel, bindingContext) {
            setTimeout(function() {
                var $editRow = $(element);
                $editRow.find(".um-edit-url-dialog-path").prefixInput({ prefix: "/" }).focus();
                $editRow.find(".um-edit-url-dialog-querystring").prefixInput({ prefix: "?" });
            }, 0);
        },

        _onLoadSettings: function (model, textStatus, jqXhr) {
            this.singleLocale(model.SingleLocale);
            var sortingFields = new dnn.Enum(Object.ToCamel(model.SortingFields));
            this.customUrls.sortingFields(sortingFields);
            this.systemGeneratedUrls.sortingFields(sortingFields);
        },

        createCustomUrl: function (eventObject) {
            this.creating(true);
            this._clearEditing(this.customUrls);
            this.editViewModel.edit();
        },

        _onEditUrl: function (eventObject, urlViewModel) {
            this.creating(false);
            this._clearEditing(this.customUrls);
            urlViewModel.editing(true);
            this.editViewModel.edit(urlViewModel);
        },

        _clearEditing: function (urlList) {
            var urls = urlList.urls();
            for (var i = 0, size = urls.length; i < size; i++) {
                urls[i].editing(false);
            }
        },

        _onCancelEditUrl: function (eventObject, urlViewModel) {
            urlViewModel.editing(false);
            this.editViewModel.edit(urlViewModel);
        },

        _onCancelCreateUrl: function (eventObject, urlViewModel) {
            this.creating(false);
        },

        _onUpdateUrl: function (eventObject, urlViewModel) {
            urlViewModel.editing(false);
            this._highlightUrlId = urlViewModel.id();
            this.reload();
        },

        _onCreateUrl: function (eventObject, urlId) {
            this.creating(false);
            this._highlightUrlId = urlId;
            this.reload();
        },

        deleteUrl: function (id) {
            var deleteUrlServiceSettings = {
                beforeSend: $.dnnSF().setModuleHeaders,
                url: this._serviceUrl + this.options.methods.deleteUrl,
                type: "POST",
                data: { Id: id },
                async: true,
                success: $.proxy(this._onDeleteUrl, this),
                error: $.onAjaxError
            };
            $.ajax(deleteUrlServiceSettings);
        },

        _onDeleteUrl: function (data, textStatus, jqXhr) {
            this.reload();
        },

        reload: function() {
            this.customUrls.list();
            this.systemGeneratedUrls.list();
        }

    };

    ViewModel._defaults = {
        serviceRoot: "UrlManagement",
        methods: {
            createUrl: "UrlManagementService/CreateCustomUrl",
            updateUrl: "UrlManagementService/UpdateCustomUrl",
            deleteUrl: "UrlManagementService/DeleteCustomUrl",
            getCustomUrls: "UrlManagementService/GetCustomUrls",
            getSystemGeneratedUrls: "UrlManagementService/GetSystemGeneratedUrls",
            getUrlOptions: "UrlManagementService/GetUrlOptions",
            getConfiguration: "UrlManagementService/GetConfiguration"
        }
    };

    ViewModel.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(ViewModel._defaults, settings);
        }
        return ViewModel._defaults;
    };


    //
    // View
    //
    var View = this.View = function (element, options) {
        this.element = element;
        this.options = options;

        this.init();
    };

    View.prototype = {

        constructor: View,

        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and the options via the instance, 
            // e.g., this.element and this.options
            this.options = $.extend({}, View.defaults(), this.options);

            this.$this = $(this);
            this.$element = $(this.element);

            var deleteConfirmationSettings = {
                title: this.options.removeUrlPromptTitle,
                text: this.options.removeUrlPromptMessage,
                yesText: this.options.yesButtonCaption,
                noText: this.options.noButtonCaption,
                isButton: true
            };

            this.viewModel = new ViewModel(this.options);
            ko.bindingHandlers.attachDeleteConfirmation = {
                init: function (element, valueAccessor, allBindingsAccessor, elementViewModel, bindingContext) {
                    // This will be called when the binding is first applied to an element
                    // Set up any initial state, event handlers, etc. here
                    var id = elementViewModel.id();
                    var confirmationSettings = $.extend({}, deleteConfirmationSettings, { callbackTrue: function () { bindingContext.$root.deleteUrl(id); } });
                    $(element).dnnConfirm(confirmationSettings);
                }
            };

            ko.applyBindings(this.viewModel, this.element);
        },

        refreshView: function() {
            this.viewModel.reload();
        }

    };

    View._defaults = {};

    View.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(View._defaults, settings);
        }
        return View._defaults;
    };


}).apply(dnn.PageSettings, [jQuery, window, document]);


dnn.initializePageSettingsView = function (selector, options) {
    $(document).ready(function() {
        var instance = new dnn.PageSettings.View($(selector)[0], options);
        dnn.PageUrlSynchronizer.getInstance().setUrlManagement(instance);
    });
};

ko.bindingHandlers.dnnTooltip = {
    init: function (element) {
        $(element).find(".dnnTooltip").dnnTooltip();
    }
};