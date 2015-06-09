; if (typeof dnn === "undefined" || dnn === null) { dnn = {}; };

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

(function ($, window, document, d3, undefined) {
    "use strict";

    //
    // TimeLineGraph
    //
    var TimeLineGraph = this.TimeLineGraph = function (element, options) {
        this.element = element;
        this._options = options;
        this.init();
    };

    TimeLineGraph.prototype = {

        constructor: TimeLineGraph,

        init: function () {
            this._options = $.extend({}, TimeLineGraph.defaults(), this._options);
            this.$this = $(this);
            this.$element = $(this.element);

            this._margins = this._options.margins;

            var containerWidth = this._options.size ? this._options.size.width : this.$element.width();
            var containerHeight = this._options.size ? this._options.size.height : this.$element.height() || containerWidth;

            this._size = { height: containerHeight, width: containerWidth };
        },

        _removeOverlappingPoints: function (data, maxNumberOfPoints) {
            var numberOfPointsToRemove = data.length - maxNumberOfPoints;
            if (numberOfPointsToRemove > 0) {
                var intervalSize = Math.floor(maxNumberOfPoints / numberOfPointsToRemove) || 1;
                var numberOfPointsToRemoveInInterval = Math.floor(numberOfPointsToRemove / maxNumberOfPoints) || 1;
                for (var i = 0, size = data.length; i < size; i += intervalSize) {
                    data.splice(i, numberOfPointsToRemoveInInterval);
                    size -= numberOfPointsToRemoveInInterval;
                }
            }
            return data;
        },

        draw: function (keyValuePairs, scale) {

            // define dimensions of graph
            var chartWidth = this._size.width - this._margins.right - this._margins.left; // width
            var chartHeight = this._size.height - this._margins.top - this._margins.bottom; // height

            if (chartWidth < 0 || chartHeight < 0) {
                throw new Error("wrong dimension");
            }

            var data = keyValuePairs || [];

            var maxNumberOfPoints = Math.floor(chartWidth / 20);
            data = this._removeOverlappingPoints(data, maxNumberOfPoints);

            var keyFunction = function (datum) { return datum.key; };
            var valueFunction = function (datum) { return datum.value; };

            var xScale = d3.time.scale().domain(d3.extent(data, keyFunction)).range([0, chartWidth]);
            //var xScale = d3.scale.ordinal().domain(data.map(keyFunction)).rangeRoundBands([0, chartWidth], 1);
            var yMax = Math.max(1, d3.max(data, valueFunction) * 1.2);
            var yScale = d3.scale.linear().domain([0, yMax]).range([chartHeight, 0]);

            // create a line function that can convert data[] into x and y points
            var lineFunction = d3.svg.line()
                .interpolate("linear") //("monotone") //  //.interpolate('interpolation');
                .x(function (datum, i) { return xScale(datum.key); })
                .y(function (datum) { return yScale(datum.value); });

            var graph = d3.select(this.element).selectAll("svg").data([data]);

            var container = graph.enter()
                .append("svg")
                .classed(this._options.graphClass, true)
                .attr("viewBox", "0 0 " + this._size.width + " " + this._size.height)
                .attr("preserveAspectRatio", "xMidYMid")
                .append("g").classed("container-group", true);

            container.append("g").classed("x axis", true);
            container.append("g").classed("y axis", true);
            container.append("g").classed("chart-group", true);

            container.select(".chart-group").append("g").classed("line-group", true);
            container.select(".chart-group").append("g").classed("point-group", true);

            //graph.transition().attr({ width: this._size.width, height: this._size.height });
            graph.select(".container-group").attr({ transform: "translate(" + this._margins.left + "," + this._margins.top + ")" });

            //var xAxis = d3.svg.axis().scale(xScale).ticks(d3.time.month, 1).tickFormat(d3.time.format('%a %d')).tickSize(-chartHeight).tickSubdivide(true);
            var xAxis = d3.svg.axis().scale(xScale).ticks(this._options.xTicks || 5);
            var xScaleLabelFormat = "";
            switch (scale) {
                case "day":
                    xScaleLabelFormat = "%b %e, %Y";
                    break;
                case "week":
                    xScaleLabelFormat = "%a, %b %e, %Y";
                    break;
                case "month":
                    xScaleLabelFormat = "%B %Y";
                    break;
                case "year":
                    xScaleLabelFormat = "%b %Y";
                    break;
                default:
                    xScaleLabelFormat = "";
                    break;
            }
            if (xScaleLabelFormat) {
                xAxis.tickFormat(d3.time.format(xScaleLabelFormat));
            }
            
            // Add the x-axis.
            graph.select(".x.axis")
                .transition()
                .ease(this._options.ease)
                .attr({ transform: "translate(0," + (chartHeight) + ")" })
                .call(xAxis);

            // create left yAxis
            var yAxis = d3.svg.axis().scale(yScale)
                .ticks(Math.min(5, yMax))
                .tickFormat(function (y) { return y == 0 ? "" : y;  })
                .tickSize(-chartWidth).tickSubdivide(false).orient("left");
                    
            // Add the y-axis to the left
            var axis = graph.select(".y.axis")
                .transition()
                .ease(this._options.ease)
                .attr("transform", "translate(0, 0)")
                .call(yAxis);
            
            axis.selectAll("text").attr("dy", "-.5em");
            var textOffset = -10 + 5 * (Math.floor(Math.log(yMax) / Math.LN10));
            axis.selectAll("text").attr("x", textOffset.toString());
            axis.selectAll("line").attr("x1", "-16");

            var lines = graph.select(".chart-group").select(".line-group").selectAll(".line").data(data);

            lines.enter().append("svg:path").classed("line", true);

            lines.transition().attr("d", lineFunction(data));

            lines.exit().remove();

            // Add the line by appending an svg:path element with the data line we created above
            // do this AFTER the axes above so that the line is above the tick-lines
            //graph.append("path").attr("d", line(data)).attr("class", "data_line");

            var showTooltip = this._options.showTooltip;
            var points = graph.select(".chart-group").select(".point-group").selectAll(".point").data(data);
            points.enter().append("svg:circle").classed("point", true)
                .attr("r", function (d, i) { return 4; })
                .on("mouseover", function (d) { showTooltip(d3.select(this).attr("cx"), d3.select(this).attr("cy"), d); })
                .on("mouseout", this._options.hideTooltip)
                .append("svg:title").classed("tooltip", true);

            points.transition() // .attr("r", 0).transition().attr("r", 2.5);
                .attr("cx", function (d, i) { return xScale(d.key); })
                .attr("cy", function (d, i) { return yScale(d.value); });

            points.exit().transition().attr("r", 0).remove();

            graph.exit().remove();

        }

    };

    TimeLineGraph._defaults = {
        ease: "bounce",
        graphClass: "time-line-graph",
        margins: { top: 30, right: 20, bottom: 30, left: 20 }
    };

    TimeLineGraph.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(TimeLineGraph._defaults, settings);
        }
        return TimeLineGraph._defaults;
    };

}).apply(dnn, [jQuery, window, document, d3, undefined]);
