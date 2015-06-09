if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

dnnModule.digitalAssets = dnnModule.digitalAssets || {};
dnnModule.digitalAssets.statistics = dnnModule.digitalAssets.statistics || {};


(function ($, window, document, undefined, ko, dnn) {
    "use strict";

    var GraphViewModel = function (options) {
        var self = this;
        this.options = options;
        this.servicesFramework = $.ServicesFramework(self.options.moduleId);

        this.totalDownloads = ko.observable();

        this.lastUpdatedDate = ko.observable();
        this.lastUpdatedTime = ko.observable();
        this.lastUpdatedByUserName = ko.observable();
        this.lastUpdatedByUserId = ko.observable();

        this.selectedEndDate = ko.observable(new Date());
        this.selectedStartDate = ko.observable(this._subtractDays(this.selectedEndDate(), 30)); // TODO: get value from combobox
        this.periodAggregation = ko.observable('Day');
        
        this.isDayScale = ko.computed(this._isDayScale, this);
        this.isWeekScale = ko.computed(this._isWeekScale, this);
        this.isMonthScale = ko.computed(this._isMonthScale, this);
        this.isYearScale = ko.computed(this._isYearScale, this);

        var graphOptions = {
            showTooltip: function (x, y, datum) {
                var tooltipText = options.tooltipText
                    .replace("[KEY]", datum.key.format("dd-MMM-yyyy"))  // TODO: Use current users format
                    .replace("[VALUE]", datum.value);

                var $graphContainer = $("#" + options.graphContainerId);

                var $tooltip = $(".dam-stats-tooltip", $graphContainer);
                var offset = 72;
                var maxX = $graphContainer.width() - $tooltip.outerWidth();
                var tooltipX = Math.min(Math.max(Math.floor(x) - offset, 0), maxX);
                $tooltip.find("span").text(tooltipText);
                $tooltip.css({ left: tooltipX, top: Math.floor(y) - 20 }).show();

                var dx = Math.floor(x) - tooltipX - offset;
                $tooltip.find(".dam-stats-tooltip-anchor").css({ left: $tooltip.width() / 2 + dx });
            },
            
            hideTooltip: function() {
                $(".dam-stats-tooltip").hide();
            }

        };
        this._graph = new dnn.TimeLineGraph($("#" + this.options.graphContainerId)[0], graphOptions);

        ko.computed(function () {
            var params = {
                fileId: self.options.fileId,
                periodAggregation: self.periodAggregation(),
                startDate: self.selectedStartDate().format('yyyy-MM-dd'),
                endDate: self.selectedEndDate().format('yyyy-MM-dd')
            };

            if (!params.periodAggregation || !params.startDate || !params.endDate) {
                return;
            }

            $.ajax({
                url: self.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/GetAggregatedFileStatistics',
                data: params,
                type: "GET",
                async: true,
                beforeSend: self.servicesFramework.setModuleHeaders,
                success: $.proxy(self._onGraphDataReceived, self),
                error: $.onAjaxError
            });
        }).extend({ throttle: 1 });

    };
    
    GraphViewModel.prototype = {
        constructor: GraphViewModel,

        _isDayScale: function () {
            return this.periodAggregation() === "Day";
        },

        _isWeekScale: function () {
            return this.periodAggregation() === "Week";
        },

        _isMonthScale: function () {
            return this.periodAggregation() === "Month";
        },

        _isYearScale: function () {
            return this.periodAggregation() === "Year";
        },
        
        changePeriodAggregation: function (data, event) {
            var value = $(event.target).data('value');
            this.periodAggregation(value);
        },
       
        _subtractDays: function (date, days) {
            var d = new Date();
            d.setDate(date.getDate() - days);
            return d;
        },
        
        setDefaultPeriod: function (days) {
            var date = new Date();
            this.selectedEndDate(date);
            this.selectedStartDate(this._subtractDays(date, days));
        },

        _onGraphDataReceived: function (data) {
            this.totalDownloads(data.totalDownloads);
            this.lastUpdatedDate(data.lastUpdatedDate);
            this.lastUpdatedTime(data.lastUpdatedTime);
            this.lastUpdatedByUserName(data.lastUpdatedByUserName);
            this.lastUpdatedByUserId(data.lastUpdatedByUserId);
            
            var points  = data.values;
            for (var i = 0, size = points.length; i < size; i++) {                
                var parts = points[i].key.split('-');
                points[i].key = new Date(parts[0], parts[1] - 1, parts[2]);
            }

            this._graph.draw(data.values);
        }

    };

    this.initialize = function(selector, options) {
        $(document).ready(function() {
            var element = $(selector)[0];
            var viewModel = new GraphViewModel(options);
            dnnModule.digitalAssets[element.id] = viewModel;
            ko.applyBindings(viewModel, element);
        });
    };
    
}).apply(dnnModule.digitalAssets.statistics, [jQuery, window, document, undefined, ko, dnn]);

ko.bindingHandlers.dnnComboBox = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        Sys.Application.add_load(function() {
            var combo = $find(element.id);
            var value = valueAccessor();
            combo.add_selectedIndexChanged(function (sender, e) {
                $.proxy(value, viewModel, e.get_item().get_value())();                
            });
        });
    }
};