; if (typeof dnn === "undefined" || dnn === null) { dnn = {}; }; //var dnn = dnn || {};

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

    // The actual plugin constructor
    var TestUrl = this.TestUrl = function (options) {
        this.options = options;
        this.init();
    };

    TestUrl.prototype = {
        constructor: TestUrl,

        init: function() {

            this.options = $.extend({}, TestUrl.defaults(), this.options);

            this._serviceUrl = $.dnnSF().getServiceRoot("UrlManagement");

            // Select a Page to Test section:
            this._$searchPagesInput = $("#" + this.options.searchPagesInputId);
            this._$searchPagesInput.onEnter($.proxy(this._tryGetSitePages, this));
            this._$searchPagesButton = $("#" + this.options.searchPagesButtonId);
            this._$searchPagesButton.on("click", $.proxy(this._getSitePages, this));

            this._$pageList = $("#" + this.options.pageListId);
            this._$pageList.change($.proxy(this._onPageSelected, this));

            this._$emptyResultingUrls = $.proxy(function() { this._$resultingUrls.empty(); }, this);

            var testUrlHandler = $.proxy(this._tryTestUrl, this);
            this._$queryStringInput = $("#" + this.options.queryStringInputId);
            this._$queryStringInput.onEnter(testUrlHandler);
            this._$queryStringInput.on("change keyup paste input propertychange", this._$emptyResultingUrls);

            this._$pageNameInput = $("#" + this.options.pageNameInputId);
            this._$pageNameInput.onEnter(testUrlHandler);
            this._$pageNameInput.on("change keyup paste input propertychange", this._$emptyResultingUrls);

            this._$testUrlButton = $("#" + this.options.testUrlButtonId);
            this._$testUrlButton.on("click", $.proxy(this._testUrl, this));
            this._$resultingUrls = $("#" + this.options.resultingUrlsId);

            this._$resultingUrls.find("a").on("click", $.proxy(this._selectUrlToRewrite, this));

            this._setTestUrlButtonState();

            var dnnPanelsOptions = {
                onExpand: $.proxy(this._onExpandOptions, this),
                onHide: $.proxy(this._onHideOptions, this)
            };
            $(".left-pane").dnnPanels(dnnPanelsOptions);

            // Test URL Rewriting section:
            this._$urlForRewritingInput = $("#" + this.options.urlForRewritingInputId);
            this._$urlForRewritingInput.onEnter($.proxy(this._tryTestUrlRewriting, this));
            this._$urlForRewritingInput.on("change keyup paste input propertychange", $.proxy(this._onUrlForRewritingInputChanged, this));
            this._$testUrlRewritingButton = $("#" + this.options.testUrlRewritingButtonId);
            this._$testUrlRewritingButton.on("click", $.proxy(this._testUrlRewriting, this));
            this._$urlRewritingResultPanel = $("#" + this.options.urlRewritingResultPanelId);
            this._$setTestUrlRewrtingButtonStateHandler = $.proxy(this._setTestUrlRewrtingButtonState, this);

            this._$rewritingResultDescription = $("#" + this.options.rewritingResultDescriptionId);
            this._$languageDescription = $("#" + this.options.languageDescriptionId);
            this._$identifiedTabDescription = $("#" + this.options.identifiedTabDescriptionId);
            this._$redirectionResultDescription = $("#" + this.options.redirectionResultDescriptionId);
            this._$redirectionResultReason = $("#" + this.options.redirectionResultReasonId);
            this._$operationMessagesDescription = $("#" + this.options.operationMessagesDescriptionId);

            this._setTestUrlRewrtingButtonState();
            this._updateUrlRewritingResultPanel(this.options.rewritingResult);

            this._getSitePages();
        },

        _selectUrlToRewrite: function(e) {
            var url = $(e.currentTarget).text();
            this._$urlForRewritingInput.val(url);
            this._setTestUrlRewrtingButtonState();
            this._updateUrlRewritingResultPanel();
        },

        _testUrl: function() {
            var testUrlServiceSettings = {
                url: this._serviceUrl + "UrlManagementService/TestUrl",
                type: "GET",
                data: {
                    pageId: parseInt($.trim(this._$pageList.val()), 10),
                    queryString: this._$queryStringInput.val(),
                    customPageName: this._$pageNameInput.val()
                },
                async: true,
                success: $.proxy(this._onTestUrlCompleted, this),
                error: $.onAjaxError
            };
            $.ajax(testUrlServiceSettings);
        },

        _onTestUrlCompleted: function (data, textStatus, jqXhr) {
            this._$resultingUrls.empty();
            var self = this;
            $.each(data.Urls,
                function (index, item) {
                    $("<a/>").text(item).prop("title", item).on("click", $.proxy(self._selectUrlToRewrite, self)).
                        appendTo($("<li/>").appendTo(self._$resultingUrls));
                }
            );
            this._$resultingUrls.quickHighlight();
        },

        _tryTestUrl: function(e) {
            if (!this._$testUrlButton.prop("disabled")) {
                this._testUrl();
            }
        },

        _testUrlRewriting: function () {
            var testUrlRewritingServiceSettings = {
                url: this._serviceUrl + "UrlManagementService/TestUrlRewriting",
                type: "GET",
                data: {
                    uriString: this._$urlForRewritingInput.val()
                },
                async: true,
                success: $.proxy(this._onTestUrlRewritingCompleted, this),
                error: $.onAjaxError
            };
            $.ajax(testUrlRewritingServiceSettings);
        },

        _onTestUrlRewritingCompleted: function (data, textStatus, jqXhr) {
            this._updateUrlRewritingResultPanel(data.RewritingResult);
        },

        _tryTestUrlRewriting: function(e) {
            if (!this._$testUrlRewritingButton.prop("disabled")) {
                this._testUrlRewriting();
            }
        },

        _getSitePages: function () {
            var getSitePagesServiceSettings = {
                url: this._serviceUrl + "UrlManagementService/GetSitePages",
                type: "GET",
                data: {
                    searchText: this._$searchPagesInput.val()
                },
                async: true,
                success: $.proxy(this._onGetSitePagesCompleted, this),
                error: $.onAjaxError
            };
            $.ajax(getSitePagesServiceSettings);
        },

        _onGetSitePagesCompleted: function (data, textStatus, jqXhr) {
            var selectedValue = this._$pageList.val();
            this._$pageList.empty();
            var self = this;
            $.each(data.Pages, function (index, pair) {
                self._$pageList.append(
                    $('<option></option>').val(pair["Key"]).html($.htmlEncode(pair["Value"]))
                );
            });
            this._$pageList.val(selectedValue);
            if (selectedValue !== this._$pageList.val()) {
                this._$emptyResultingUrls.apply(this, []);
            }
            this._setTestUrlButtonState();
        },

        _tryGetSitePages: function(e) {
            if (!this._$searchPagesButton.prop("disabled")) {
                this._getSitePages();
            }
        },

        _onHideOptions: function() {
            if (this._$queryStringInput.val() || this._$pageNameInput.val()) {
                this._$emptyResultingUrls.apply(this, []);
            }
            this._$queryStringInput.val("");
            this._$pageNameInput.val("");
            this._optionsInitialized = true;
        },

        _onExpandOptions: function() {
            if (this._optionsInitialized) {
                this._$queryStringInput.focus();
            }
            this._optionsInitialized = true;
        },

        _onPageSelected: function() {
            this._$emptyResultingUrls.apply(this, []);
            this._setTestUrlButtonState();
        },

        _setTestUrlButtonState: function() {
            var selectedValue = $.trim(this._$pageList.val());
            var disabled = (typeof(selectedValue) === "undefined" || selectedValue === null || selectedValue === "");
            this._setButtonState(this._$testUrlButton, disabled);
        },

        _setTestUrlRewrtingButtonState: function() {
            var textValue = $.trim(this._$urlForRewritingInput.val());
            var disabled = (textValue === "");
            this._setButtonState(this._$testUrlRewritingButton, disabled);
        },

        _setButtonState: function($button, disabled) {
            if (disabled) {
                $button.addClass("disabled");
                $button.prop("disabled", true);
            } else {
                $button.removeClass("disabled");
                $button.prop("disabled", false);
            }
        },

        _onUrlForRewritingInputChanged: function(e) {
            // to get the value of an input field during the paste event
            // a decent solution is to wrap the callback in a setTimeout(),
            // with a delay of 0 milliseconds, in order to make it asynchronous.
            setTimeout(this._$setTestUrlRewrtingButtonStateHandler, 0);
            this._updateUrlRewritingResultPanel();
        },

        _updateUrlRewritingResultPanel: function (result) {
            if (this._rewritingResult === result) {
                return;
            }
            this._rewritingResult = result || {};
            this._$rewritingResultDescription.text(this._rewritingResult.rewritingResult || this.options.noneText);
            this._$languageDescription.text(this._rewritingResult.culture || this.options.noneText);
            this._$identifiedTabDescription.text(this._rewritingResult.identifiedPage || this.options.noneText);
            this._$redirectionResultDescription.text(this._rewritingResult.redirectionResult || this.options.noneText);
            this._$redirectionResultReason.text(this._rewritingResult.redirectionReason || this.options.noneText);
            this._$operationMessagesDescription.text(this._rewritingResult.operationMessages || this.options.noneText);
        }

    };

    TestUrl._defaults = {};

    TestUrl.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(TestUrl._defaults, settings);
        }
        return TestUrl._defaults;
    };

}).apply(dnn, [jQuery, window, document]);


dnn.createUrlManagement = function(options) {
    $(document).ready(function () {
        // initialize Tabs (General / RegExp / Test Url)
        $("#dnnUrlManagement").dnnTabs();
    });
};

dnn.createTestUrl = function (options) {
    $(document).ready(function () {
        var instance = new dnn.TestUrl(options);
    });
};

