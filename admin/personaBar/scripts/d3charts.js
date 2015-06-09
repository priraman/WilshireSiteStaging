'use strict';
define(['jquery', 'd3'], function ($, d3) {
    var d3Charts = {};

    d3Charts.areaDonutChart = function () {
        var width = 100,
		    height = 100,
			radius = width / 2;

        function my(selection) {
            selection.each(function (data, index) {
				if(!data || !data.length) return;
                var dd = data[index];
                var pie = d3.layout.pie().value(function (d) { return d; }).sort(null);
                var arc = d3.svg.arc().innerRadius(radius - 5).outerRadius(radius);
                var svg = d3.select(this).attr('width', width).attr('height', height)
						  .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
                svg.selectAll('path').data(pie(dd.values)).enter()
					.append('path')
					.attr('fill', function (d, i) { return dd.colors[i % dd.colors.length]; })
					.attr('d', arc);
            });
        };

        return my;
    };

    d3Charts.donutChart = function(animation, width, height, thickness) {
        var radius = Math.min(width, height) / 2;
        var legendSelector = null;
        var ratioSelector = null;
        var tooltipSelector = null;
        var tooltipLabel = "[COUNT]";
        function my(selection) {
            selection.each(function (data, index) {
                if (!data || !data.length) return;
                var tooltip = tooltipSelector ? d3.select(tooltipSelector) : null;
                var dd = data[index];
                var total = d3.sum(dd.values, function (d) { return d; });
                var svg = d3.select(this).attr('width', width).attr('height', height)
                    .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
                var pie = d3.layout.pie().value(function (d) { return d; }).sort(null);
                var arc = d3.svg.arc().innerRadius(radius - thickness).outerRadius(radius);

                if (total === 0) {
                    svg.selectAll('path').data(pie([1])).enter()
                        .append('path')
                        .attr('fill', function () { return '#ccc'; })
                        .transition()
                        .delay(function (d, i) { return i * 200; })
                        .duration(200)
                        .attrTween('d', function(d) {
                            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                            return function(t) {
                                d.endAngle = i(t);
                                return arc(d);
                            };
                        });

                } else {
                    var labels = dd.labels;
                    svg.selectAll('path').data(pie(dd.values)).enter()
                        .append('path')
                        .attr('fill', function(d, i) { return dd.colors[i % dd.colors.length]; })
                        .on("mouseover", function(d, i) {
                            if (!tooltip) return;
                            var l = d3.event.pageX - parseInt(tooltip.style("width")) / 2 - 10;
                            var t = d3.event.pageY - 80;
                            var offset = $(tooltipSelector).parent().offset();
                            l -= offset.left;
                            t -= offset.top;
                            var label = labels[i];
                            tooltip.select(".title").text(label + ":");
                            tooltip.select(".info.line-1").text(tooltipLabel.replace("[COUNT]", d.value));
                            tooltip.style("left", l + "px")
                                .style("top", t + "px")
                                .style("display", "")
                                .transition().style("opacity", 1);
                        })
                        .on("mouseout", function(d) {
                            if (!tooltip) return;
                            tooltip.transition().style("opacity", 0)
                                .each("end", function() { d3.select(this).style("display", "none"); });
                        })
                        .transition()
                        .delay(function(d, i) { return i * 200; })
                        .duration(200)
                        .attrTween('d', function(d) {
                            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                            return function(t) {
                                d.endAngle = i(t);
                                return arc(d);
                            };
                        });
                }

                if (legendSelector) {
                    for (var i = 0; i < dd.colors.length; i++) {
                        var $check = $("<li></li>");
                        if(i%2 == 0)                        {
                            $check.addClass("item-left")
                        }
                        else{
                            $check.addClass("item-right")
                        }
                        $check.append($("<div></div>").css("background-color", dd.colors[i]));
                        $check.append($("<span></span>").text(dd.labels[i]).addClass("label"));
                        $check.append($("<span></span>").text(dd.values[i]).addClass("value"));
                        $(legendSelector).append($check);
                    }
                }

                if (ratioSelector && dd.values.length == 2 && total > 0) {
                    var ratio = Math.round((dd.values[0] / total) * 100);
                    $(ratioSelector).append(ratio + "<sup>%</sup>");
                }

                if (ratioSelector && total == 0) {
                    $(ratioSelector).append('<span>No Data</span>');
                }
            });
        };
        my.width = function (value) {
            if (!arguments.length) return width;
            width = value;
            return my;
        };
        my.height = function (value) {
            if (!arguments.length) return height;
            height = value;
            return my;
        };
        my.radius = function (value) {
            if (!arguments.length) return radius;
            radius = value;
            return my;
        };
        my.thickness = function (value) {
            if (!arguments.length) return thickness;
            thickness = value;
            return my;
        };
        my.tooltipSelector = function (value) {
            if (!arguments.length) return tooltipSelector;
            tooltipSelector = value;
            return my;
        };
        my.tooltipLabel = function (value) {
            if (!arguments.length) return tooltipLabel;
            tooltipLabel = value;
            return my;
        };
        my.legendSelector = function (value) {
            if (!arguments.length) return legendSelector;
            legendSelector = value;
            return my;
        };
        my.ratioSelector = function (value) {
            if (!arguments.length) return ratioSelector;
            ratioSelector = value;
            return my;
        };
        return my;
    };

    d3Charts.horizontalBarChart = function (maxWidth, animation) {
        var width = 370,
			barHeight = 10,
            itemHeight = 60;

        function my(selection) {
            selection.each(function (data) {
				if(!data || !data.length) return;
                var x = d3.scale.linear()
                            .domain([0, d3.max(data, function (d) { return d.count; })])
                            .range([0, maxWidth]);

                var chart = d3.select(this)
                    .attr("width", width);

                var bar = chart.selectAll("g")
                    .data(data);

                bar.exit().remove();

                var g = bar.enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * itemHeight + ")"; });

                g.append("rect")
                    .attr("y", 24)
                    .attr("class", "background")
                    .attr("width", width)
                    .attr("height", barHeight);

                g.append("rect")
                    .attr("y", 24)
                    .attr("class", "bar")
                    .attr("width", 0)
                    .attr("height", barHeight);

                if (animation) {
                    bar.select("rect.bar").transition()
                        .delay(function(d, i) { return i * 100; })
                        .duration(500).attr("width", function(d) { return x(d.count); });
                } else {
                    bar.select("rect.bar").attr("width", function (d) { return x(d.count); });
                }

                bar.selectAll("text").remove();

                bar.append("text")
                    .attr("class", "label")
                    .attr("x", 0)
                    .attr("y", 8)
                    .attr("dy", ".35em")
                    .text(function (d) { return d.label; });

                bar.append("text")
                    .attr("class", "count")
                    .attr("x", width)
                    .attr("y", 8)
                    .attr("dy", ".35em")
                    .text(function (d) { return d.count; });
            });
        }

        my.width = function (value) {
            if (!arguments.length) return width;
            width = value;
            return my;
        };

        return my;
    };

    d3Charts.lineChart = function (animation, width, height) {
        var margin =  { top: 20, right: 15, bottom: 30, left: 30 };
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        var legendSelector = null;
        var legendSettings = [];
        var updateLegendSettings = null;
        var tooltipSelector = null;
        var tooltipLabel = "[COUNT]";
        var labels = null;

        function my(selection) {
            selection.each(function (data) {
                if (!data || !data.length) return;

                var max = 0;
                for (var i = 0; i < data.length; i++) {
                    max = Math.max(max, getMax(data[i].values));
                }

                if (isNaN(max)) return;

                max = max < 6 ? 6 : max;

                if(max > 9999){
                    margin.left = 40;
                }

                var chart = d3.select(this)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var count = d3.max(data, function (d) { return d.values.length; });
                var labelscount = labels.length;
                var x = d3.scale.linear()
                    .domain([0, count - 1])
                    .range([0, width]);

                var pointsPerlabel = Math.ceil(count / labelscount);

                var gridGap = max / 6, found = false, seed = 0;

                while (!found) {
                    seed = seed == 0 ? 1 : seed * 10;
                    var seedArray = [seed * 1, seed * 2, seed * 5];
                    $.each(seedArray, function (ii, s) {
                        if (gridGap <= s) {
                            gridGap = s;
                            found = true;
                            return false;
                        }
                        return true;
                    });
                }

                var gridMax = 0, gridRange = [0];
                while (gridMax < max) {
                    gridMax += gridGap;
                    gridRange.push(gridMax);
                }

                var y = d3.scale.linear()
                    .domain([0, gridMax])
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .ticks(24)
                    .tickSize(-height, 0, 0)
                    .tickFormat(function (i) {
                        var j = count - 1 - i;
                        if(count == 34){
                            pointsPerlabel = 3;
                            j = count - 4 - i;
                        }
                        var k = j % pointsPerlabel;
                        if (k !== 0) return '';
                        var l = j / pointsPerlabel;
                        return labels[labelscount - l - 1];
                    })
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickSize(-width, 0, 0)
                    .orient("left")
                    .tickValues(gridRange)
                    .tickFormat(function (i, v) {
                        var z = Math.round(i) == i;
                        return z && i > 0 ? i.toString() : '';
                    });


                chart.append("rect")
                    .attr("class", "background")
                    .attr("rx", 3).attr("ry", 3)
                    .attr("width", width).attr("height", height);

                chart.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                chart.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                d3.selectAll('g.x.axis text').attr('y', '8');
                d3.selectAll('g.y.axis text').attr('x', '-8');

                for (var i = 0; i < data.length; i++) {
                    var show = legendSettings.indexOf(data[i].key) < 0;
                    if (legendSelector) addLineToggle(legendSelector, chart, data[i].key, i, data[i].color, show);
                    drawGraphLine(chart, x, y, data[i].values, data[i].key, i, data[i].color, show, data[i].tooltipLabel);
                }
            });
        };
        
        function addLineToggle(selector, graph, label, id, color, checked) {
            var $check = $("<li></li>").attr('data-id', id);
            if (checked) $check.addClass("checked");

            $check.append($("<div></div>").css("background-color", color));
            $check.append($("<span></span>").text(label));
            $check.on("click", function () {
                var group = graph.select("g.graph-line-" + $(this).attr('data-id'));
                if ($(this).is(".checked")) {
                    $(this).removeClass('checked');
                    group.transition().style("opacity", "0")
                        .each("end", function () { d3.select(this).style("visibility", "hidden"); });

                    var index = legendSettings.indexOf(label);
                    if (index < 0) {
                        legendSettings.push(label);
                        if (typeof updateLegendSettings === 'function') updateLegendSettings(legendSettings);
                    }
                    
                } else {
                    $(this).addClass('checked');
                    group.style("visibility", "visible").transition().style("opacity", "1");
                    
                    var index = legendSettings.indexOf(label);
                    if (index > -1) {
                        legendSettings.splice(index, 1);
                        if (typeof updateLegendSettings === 'function') updateLegendSettings(legendSettings);
                    }
                }
            });

            $(selector).append($check);
        };

        function drawGraphLine(chart, x, y, data, label, id, color, show, seriesTooltipLabel) {
            var tooltip = d3.select(tooltipSelector);

            var delay = 100 * id;

            var zeroLine = d3.svg.line()
                .x(function (d, i) { return x(i); })
                .y(function (d, i) { return y(0); });

            var line = d3.svg.line()
                .x(function (d, i) { return x(i); })
                .y(function (d, i) { return y(d.count); });

            var g = chart.append("g")
                        .attr("class", "graph-line-" + id);
						
			var tooltipToUse = tooltipLabel;
			
			if(seriesTooltipLabel) {
				tooltipToUse = seriesTooltipLabel;
			}

            if (show && animation) {
                
                g.append("path")
                    .datum(data)
                    .attr("stroke", color)
                    .attr("class", "line")
                    .attr("d", zeroLine)
                    .transition().delay(delay)
                    .attr("d", line);
                
                g.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("fill", color)
                    .attr("r", 5)
                    .attr("cx", function(d, i) { return x(i); })
                    .attr("cy", function(d, i) { return y(0); })
                    .on("mouseover", function(d) {
                        var l = Math.floor(d3.select(this).attr("cx")) + margin.left - parseInt(tooltip.style("width")) / 2 - 10;
                        var b = height + margin.bottom + 20 - Math.floor(d3.select(this).attr("cy"));
                        tooltip.select(".title").text(label + ":");
                        tooltip.select(".info.line-1").text(tooltipToUse.replace("[COUNT]", d.count));
                        tooltip.select(".info.line-2").html(d.label);
                        tooltip.style("left", l + "px")
                            .style("bottom", b + "px")
                            .style("display", "")
                            .transition().style("opacity", 1);
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition().style("opacity", 0)
                            .each("end", function() { d3.select(this).style("display", "none"); });
                    })
                    .transition().delay(delay).attr("cy", function (d, i) { return y(d.count); });
                
            } else {
                
                g.append("path")
                 .datum(data)
                 .attr("stroke", color)
                 .attr("class", "line")
                 .attr("d", line);

                g.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("fill", color)
                    .attr("r", 5)
                    .attr("cx", function(d, i) { return x(i); })
                    .attr("cy", function(d, i) { return y(d.count); })
                    .on("mouseover", function(d) {
                        var l = Math.floor(d3.select(this).attr("cx")) + margin.left - parseInt(tooltip.style("width")) / 2 - 10;
                        var b = height + margin.bottom + 20 - Math.floor(d3.select(this).attr("cy"));
                        tooltip.select(".title").text(label + ":");
                        tooltip.select(".info.line-1").text(tooltipToUse.replace("[COUNT]", d.count));
                        var ll = d.label.replace('-', '- <br/>'); // add a line break here on purpose...
                        tooltip.select(".info.line-2").html(ll);
                        tooltip.style("left", l + "px")
                            .style("bottom", b + "px")
                            .style("display", "")
                            .transition().style("opacity", 1);
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition().style("opacity", 0)
                            .each("end", function() { d3.select(this).style("display", "none"); });
                    });

                if (!show) g.style("visibility", "hidden");
            }
        };

        my.legendSelector = function (value) {
            if (!arguments.length) return legendSelector;
            legendSelector = value;
            return my;
        };

        my.legendSettings = function(value) {
            if (!arguments.length) return legendSettings;
            legendSettings = value;
            return my;
        };

        my.updateLegendSettings = function (value) {
            if (!arguments.length) return updateLegendSettings;
            updateLegendSettings = value;
            return my;
        };
        
        my.tooltipSelector = function (value) {
            if (!arguments.length) return tooltipSelector;
            tooltipSelector = value;
            return my;
        };

        my.tooltipLabel = function (value) {
            if (!arguments.length) return tooltipLabel;
            tooltipLabel = value;
            return my;
        };

        my.labels = function (value) {
            if (!arguments.length) return labels;
            labels = value;
            return my;
        };
        
        return my;
    };

    var getMax = function (data) {
        return d3.max(data, function (d) { return d.count; });
    };

    return d3Charts;
});