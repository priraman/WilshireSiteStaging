define(['jquery', 'knockout', 'pikaday', 'd3', '../scripts/d3charts', '../scripts/pager', '../scripts/scroller'], function ($, ko, pikaday, d3, d3Charts, pager, scroller) {
    'use strict';

    var analytics = function() {
        var koBinded = false;
        var isMobile = false;
        var analyticsMode;
        var pageId = -1;
        var legendSettings = [];
        var triggerComparativeTerm = true;
        var utility = null;
        var comparativeTerms = {
            'Year': '1 y',
            'Month': '1 m',
            'Week': '1 w',
            'Day': '1 d'
        };
        var resx;
        var contentResx;
        var graphColors = ["#004b7a", "#0996d8", "#b5958a", "#f26b5e", "#9d8edb", "#a13c57", "#799e61"];

        var sequence = -1, lastCallStatus = null;

        var periodLabel = ko.observable("");

        var pikerStart = null, pikerEnd = null, pikerContainer = null;

        var viewModel = {};

        var wrapper;

        var conversionsViewModel = {
            results: ko.observableArray([]),
            max: -1,
            totalResults: ko.observable(0)
        };

        var operatingSystemsViewModel = {
            results: ko.observableArray([]),
            max: -1,
            totalResults: ko.observable(0)
        };

        var pagesViewModel = {
            results: ko.observableArray([]),
            max: -1,
            totalResults: ko.observable(0)
        };

        var referrersViewModel = {
            totalResults: ko.observable(0),
            max: -1,
            results: ko.observableArray([])
        };

        var summaryViewModel = {
            averageTimeOnPage: ko.observable(""),
            bounceRate: ko.observable(""),
            totalPageViews: ko.observable(0),
            totalSessions: ko.observable(0),
            totalVisits: ko.observable(0),

            load: function(data) {
                this.averageTimeOnPage(data.averageTimeOnPage);
                this.bounceRate(data.bounceRate);
                this.totalPageViews(data.totalPageViews);
                this.totalSessions(data.totalSessions);
                this.totalVisits(data.totalVisits);
            }
        };

        var applyCustomDates = function() {
            viewModel.period('Custom');
            viewModel.startDate(utility.serializeCustomDate(pikerStart.getDate()));
            viewModel.endDate(utility.serializeCustomDate(pikerEnd.getDate()));
            getGraphDataStart(function() {
                bindScrollbar();
            });
            utility.persistent.save({
                period: viewModel.period(),
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                comparativeOptions: viewModel.comparativeOptions(),
                comparativeTerm: viewModel.comparativeTerm()
            });
            pikerContainer.hide();

            if (typeof viewModel.originModel !== "undefined") {
                viewModel.originModel.applyCustomDates();
            }
        };

        var bindScrollbar = function() {
            setTimeout(function() {
                var holder = wrapper.find('div.site-performance-card-holder');
                var cards = wrapper.find('div.site-performance-card', holder);
                var left = wrapper.find('a.site-performance-scroll-left');
                var right = wrapper.find('a.site-performance-scroll-right');
                var initialOffset = 45;
                var scrollOffset = 243;
                scroller.init(holder, cards, left, right, initialOffset, scrollOffset);
            }, 100);
        };

        var drawDonutChart = function(container, labels, values, colors, tooltipSelector, legendSelector, ratioSelector, animation) {
            var $legend = wrapper.find(legendSelector);
            var $container = wrapper.find(container);
            $legend.empty();
            $container.find('svg').remove();
            $container.append('<svg class="donut-chart"></svg>');

            var data = [{ values: values, labels: labels, colors: colors }];

            var chart = d3Charts.donutChart(animation, 150, 150, 30)
                .tooltipSelector(tooltipSelector)
                .legendSelector(legendSelector)
                .ratioSelector(ratioSelector);
            d3.select(container + " svg")
                .datum(data)
                .call(chart);

            var containerWidth = $container.width();
            var padding = (containerWidth - 150) / 2;
            wrapper.find(container + " svg").css("padding-left", padding + "px");

            var legendWidth = $legend.width();
            if (isMobile) {
                $legend.css("margin-left", (containerWidth - legendWidth) / 2 + "px");
            }
        };

        var drawNavigationSummaryChart = function(width, height, margins, direction, personalizedPagesCallback) {
            var m = margins;
            var w = width - m[1] - m[3],
                h = height - m[0] - m[2];
            var tree,
                root,
                svg,
                i = 0,
                diagonal;

            function my(selection) {
                selection.each(function(data, index) {
                    if (!data) return;
                    tree = d3.layout.tree().size([h, w]);
                    diagonal = d3.svg.diagonal()
                        .projection(function(d) { return [d.y, d.x]; });

                    root = data;
                    root.x0 = h / 2;
                    root.y0 = 0;
                    root.y = w / 2;

                    // Initialize the display to show a few nodes.
                    root.children.forEach(toggleAll);

                    var y0 = (direction > 0) ? m[3] : width - m[1];
                    var x0 = m[0];
                    svg = d3.select(this)
                        .attr('width', width)
                        .attr('height', height)
                        .append("svg:g")
                        .attr("transform", "translate(" + y0 + "," + x0 + ")");

                    update(root);

                });
            }

            // Toggle children.
            var toggle = function toggle(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
            };

            var toggleAll = function toggleAll(d) {
                if (d.children) {
                    d.children.forEach(toggleAll);
                    toggle(d);
                }
            };

            var togglePersonalized = function(node, d) {
                if (personalizedPagesCallback != null) {
                    personalizedPagesCallback(node, d);
                }
            };

            var update = function update(source) {
                var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function(d) {
                    d.y = d.depth * 180 * direction;
                });

                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    });

                nodeEnter.append("svg:rect")
                    .attr("class", function(d) {
                        return "navigation-summary-count " + d.category.toLowerCase();
                    })
                    .attr("width", "40")
                    .attr("height", "30")
                    .attr("x", function(d) {
                        return (direction > 0) ? -5 : -35;
                    })
                    .attr("y", function(d) {
                        return -15;
                    });

                nodeEnter.append("svg:text")
                    .attr("class", "navigation-summary-count")
                    .attr("x", function(d) {
                        return (d.children || d._children) ? (direction < 0) ? 5 : -5 : (direction < 0) ? -5 : 15;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) {
                        return (d.children || d._children) ? (direction < 0) ? "start" : "end" : (direction < 0) ? "end" : "start";
                    })
                    .text(function(d) {
                        return d.count;
                    });

                nodeEnter.append("svg:rect")
                    .attr("class", function(d) {
                        return "navigation-summary-label " + d.category.toLowerCase();
                    })
                    .attr("width", "130")
                    .attr("height", "30")
                    .attr("x", function(d) {
                        return (direction > 0) ? 35 : -155;
                    })
                    .attr("y", function(d) {
                        return -15;
                    });

                nodeEnter.append("svg:text")
                    .attr("class", "navigation-summary-count")
                    .attr("x", function(d) {
                        return (d.children || d._children) ? -40 * direction : 40 * direction;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) {
                        return (d.children || d._children) ? (direction < 0) ? "start" : "end" : (direction < 0) ? "end" : "start";
                    })
                    .text(function(d) {
                        var text = d.label;
                        if (text.length > 14) {
                            text = text.substring(0, 14) + "..";
                        }
                        return text;
                    }).append('svg:title').text(function(d) {
                        return d.label;
                    });

                nodeEnter.append("svg:circle")
                    .attr("class", function(d) {
                        return (d.personalized) ? "personalized inner" : "hidden";
                    })
                    .attr("cx", function(d) {
                        return -165;
                    })
                    .attr("cy", function(d) {
                        return 0;
                    })
                    .attr("r", 3)
                    .on("click", function(d) {
                        togglePersonalized(d3.select(this.parentNode), d);
                    });

                nodeEnter.append("svg:circle")
                    .attr("class", function(d) {
                        return (d.personalized) ? "personalized outer" : "hidden";
                    })
                    .attr("cx", function(d) {
                        return -165;
                    })
                    .attr("cy", function(d) {
                        return 0;
                    })
                    .attr("r", 6)
                    .on("click", function(d) {
                        togglePersonalized(d3.select(this.parentNode), d);
                    });

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                // Update the links…
                var link = svg.selectAll("path.link")
                    .data(tree.links(nodes), function(d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("class", "link")
                    .attr("class", function(d) {
                        return "link " + d.target.category.toLowerCase();
                    })
                    .attr("d", function(d) {
                        var o = { x: source.x0, y: source.y0 };
                        return diagonal({ source: o, target: o });
                    })
                    .transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = { x: source.x, y: source.y };
                        return diagonal({ source: o, target: o });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            };

            return my;
        };

        var getComparativeOptions = function(period) {
            var options = [];
            $.each(comparativeTerms, function(i, v) {
                if (i === period) {
                    options.push(v);
                    return false;
                }
                options.push(v);
            });

            return options;
        };

        var getComparativeTerm = function(period) {
            return comparativeTerms[period];
        };

        var getConversions = function() {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = (analyticsMode == "page") ? 'GetTopConversionsByPage' : 'GetTopConversions';

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                pageIndex: viewModel.conversions.pageIndex(),
                pageSize: viewModel.conversions.pageSize
            };
            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;

                    updateConversions(data.data);
                },
                function() {
                    // failed...
                });
        };

        var getGraphData = function(cb) {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = (analyticsMode == "page") ? 'GetPageAnalytics' : 'GetSiteAnalytics';
            sequence++;

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                sequence: sequence
            };

            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;
                    if (data.sequence !== sequence) return;

                    viewModel.pageName(data.data.pageName);
                    viewModel.summary.load(data.data.summary);

                    updateGraphs(data.data, function() {
                        if (data.data.isPending) {
                            // analytic data incomplete, we need to try it again...
                            lastCallStatus = data.data;
                            setTimeout(function() {
                                getGraphData(cb);
                            }, 5000);
                        }

                        if (typeof cb === 'function') cb();
                    });
                }, function() {
                    // failed...
                });
        };

        var getGraphDataStart = function(cb) {
            lastCallStatus = null;
            getGraphData(cb);
        };

        var getPersonalizedReferrers = function(node, d) {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = 'GetPersonalizedReferrers';

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                pageId: d.referrerPageId,
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate()
            };
            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;

                    updatePersonalizedReferrers(node, data.data);
                },
                function() {
                    // failed...
                });
        };

        var getTopOperatingSystems = function() {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = 'GetTopOperatingSystems';

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                pageIndex: viewModel.topOperatingSystems.pageIndex(),
                pageSize: viewModel.topOperatingSystems.pageSize
            };
            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;

                    updateTopOperatingSystems(data.data);
                },
                function() {
                    // failed...
                });
        };

        var getTopPages = function() {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = 'GetTopPages';

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                pageIndex: viewModel.topPages.pageIndex(),
                pageSize: viewModel.topPages.pageSize
            };
            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;

                    updateTopPages(data.data);
                },
                function() {
                    // failed...
                });
        };

        var getTopReferrers = function() {
            utility.sf.moduleRoot = 'evoqcontentlibrary';
            utility.sf.controller = 'analyticsservice';
            var method = (analyticsMode == "page") ? 'GetTopReferrersByPage' : 'GetTopReferrers';

            var comparativeTerm = viewModel.period() == 'Custom' ? 'c' : viewModel.comparativeTerm();

            var params = {
                period: viewModel.period(),
                comparativeTerm: comparativeTerm,
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                pageIndex: viewModel.topReferrers.pageIndex(),
                pageSize: viewModel.topReferrers.pageSize
            };
            utility.sf.get(method, params,
                function(data) {
                    if (!data) return;
                    if (!data.data) return;

                    updateTopReferrers(data.data);
                },
                function() {
                    // failed...
                });
        };

        var init = function(wrap, util, params, callback, viewModelParam) {
            wrapper = wrap;
            pageId = params.pageId;
            analyticsMode = params.mode;

            utility = util;
            resx = utility.resx.PersonaBar;
            contentResx = utility.resx.ContentPB;

            if (!isMobile) {
                pager.init(pagesViewModel, 5, getTopPages, resx);
                pager.init(referrersViewModel, 5, getTopReferrers, resx);
                pager.init(operatingSystemsViewModel, 5, getTopOperatingSystems, resx);
                pager.init(conversionsViewModel, 5, getConversions, resx);
            }

            var userSettings = utility.persistent.load();
            legendSettings = userSettings['legends'] || [];

            var userSettingsPeriod = isMobile && userSettings.period == 'Custom' ? 'Week' : userSettings.period;
            var defaultDate = utility.serializeCustomDate(new Date(new Date().toUTCString()));

            var periods = [
                { value: 'Year', label: resx.opt_Year },
                { value: 'Month', label: resx.opt_Month },
                { value: 'Week', label: resx.opt_Week },
                { value: 'Day', label: resx.opt_Day }
            ];

            if (typeof viewModelParam === "undefined") {
                viewModel = {
                    resx: resx,
                    periods: periods,
                    periodLabel: periodLabel,
                    period: ko.observable(userSettingsPeriod),

                    startDate: ko.observable(userSettings.startDate || defaultDate),
                    endDate: ko.observable(userSettings.endDate || defaultDate),
                    startDateLabel: ko.observable(),
                    endDateLabel: ko.observable(),

                    applyCustomDates: applyCustomDates,
                    comparativeTerm: ko.observable(userSettings.comparativeTerm),
                    comparativeOptions: ko.observableArray(getComparativeOptions(userSettingsPeriod))
                };
            } else {
                viewModel = {};
                for (var prop in viewModelParam) {
                    viewModel[prop] = viewModelParam[prop];
                }

                viewModel.originalModel = viewModelParam;

                viewModel.periodLabel = periodLabel;
                viewModel.applyCustomDates = applyCustomDates;
                viewModel.pikerStart = pikerStart;
                viewModel.pikerEnd = pikerEnd;
                viewModel.pikerContainer = pikerContainer;

                viewModel.periodLabel.subscribe(function(newValue) {
                    if (typeof viewModel.originModel !== "undefined") {
                        viewModel.originalModel.periodLabel(newValue);
                    }
                });
                viewModel.periodLabel.extend({ notify: 'always' });
            }
            viewModel.contentResx = contentResx;
            viewModel.pageName = ko.observable('');
            viewModel.summary = summaryViewModel;
            viewModel.topPages = pagesViewModel;
            viewModel.topOperatingSystems = operatingSystemsViewModel;
            viewModel.topReferrers = referrersViewModel;
            viewModel.conversions = conversionsViewModel;

            viewModel.changePeriod = function(data, event) {
                var newPeriod = $(event.target).data('value');
                var oldPeriod = this.period();
                var oldComparativeTerm = this.comparativeTerm();
                this.period(newPeriod);
                triggerComparativeTerm = false;
                this.comparativeOptions(getComparativeOptions(newPeriod));
                var newComparativeTerm = getComparativeTerm(newPeriod);
                this.comparativeTerm(newComparativeTerm);
                triggerComparativeTerm = true;

                // we manually trigger it
                if (newPeriod !== oldPeriod || newComparativeTerm !== oldComparativeTerm) {
                    refresh();
                }
            };

            viewModel.showCustomCalendar = function() {
                var startDate = pikerStart.getDate();
                var endDate = pikerEnd.getDate();
                var period = this.period();
                if (!startDate || !endDate) {
                    if (period == 'Custom' && viewModel.startDate() && viewModel.endDate()) {
                        pikerStart.setDate(utility.deserializeCustomDate(viewModel.startDate()));
                        pikerEnd.setDate(utility.deserializeCustomDate(viewModel.endDate()));
                    } else {
                        var now = new Date(new Date().toUTCString());
                        pikerEnd.setDate(now);
                        switch (period) {
                        case "Week":
                            now.setDate(now.getDate() - 7);
                            break;
                        case "Month":
                            now.setMonth(now.getMonth() - 1);
                            break;
                        case "Year":
                            now.setYear(now.getFullYear() - 1);
                            break;
                        }
                        pikerStart.setDate(now);
                    }
                }

                pikerContainer.show();
                var hidePikerHandler = function() {
                    pikerContainer.hide();
                };
                $(window).on('click', function() {
                    hidePikerHandler();
                    $(window).off('click', hidePikerHandler);
                });
            };

            utility.asyncParallel([
                function(cb1) {
                    getGraphDataStart(cb1);
                }
            ], function() {
                viewModel.comparativeTerm.subscribe(refresh);

                if (isMobile) {
                    viewModel.period.subscribe(function(value) {
                        this.comparativeOptions(getComparativeOptions(value));
                        this.comparativeTerm(getComparativeTerm(value));
                    }, viewModel);
                }

                ko.applyBindings(viewModel, wrapper[0]);
                koBinded = true;

                if (!isMobile) {
                    bindScrollbar();
                    var pikerStartField = wrapper.find('#dashboard-period-custom-calendar-start-field');
                    var pikerEndField = wrapper.find('#dashboard-period-custom-calendar-end-field');
                    pikerContainer = wrapper.find('#dashboard-period-custom-calendar-container');
                    pikerStart = pikerStartField ? new pikaday({
                        field: pikerStartField[0],
                        bound: false,
                        container: wrapper.find('#dashboard-period-custom-calendar-container-left')[0],
                        maxDate: new Date(new Date().toUTCString()),
                        onSelect: function(date) {
                            var label = viewModel.contentResx.analytics_From + ':&nbsp;&nbsp;&nbsp;' + utility.serializeCustomDate(date);
                            viewModel.startDateLabel(label);
                            pikerEnd.setMinDate(date);
                            pikerEnd.draw();
                        }
                    }) : null;
                    pikerEnd = pikerEndField ? new pikaday({
                        field: pikerEndField[0],
                        bound: false,
                        container: wrapper.find('#dashboard-period-custom-calendar-container-right')[0],
                        maxDate: new Date(new Date().toUTCString()),
                        onSelect: function(date) {
                            var label = viewModel.contentResx.analytics_To + ':&nbsp;&nbsp;&nbsp;' + utility.serializeCustomDate(date);
                            viewModel.endDateLabel(label);
                            pikerStart.setMaxDate(date);
                            pikerStart.draw();
                        }
                    }) : null;
                    if (pikerContainer) {
                        pikerContainer.on('click', function(e) {
                            if (e.stopPropation) e.stopPropation();
                            else e.cancelBubble = true;
                            return false;
                        });
                    }
                } else {
                    refreshCarousel();
                    //rebindOnResize();
                }

                if (typeof callback === 'function') callback();
            });
        };

        var initMobile = function(wrapper, util, params, callback) {
            isMobile = true;
            this.init(wrapper, util, params, callback);
        };

        var load = function (params, callback) {
            pageId = params.pageId;
            analyticsMode = params.mode;

            var userSettings = utility.persistent.load();
            legendSettings = userSettings['legends'] || [];

            var userSettingsPeriod = isMobile && userSettings.period == 'Custom' ? 'Week' : userSettings.period;
            var defaultDate = utility.serializeCustomDate(new Date(new Date().toUTCString()));

            triggerComparativeTerm = false;
            viewModel.periodLabel("");
            viewModel.period(userSettingsPeriod);
            viewModel.startDate(userSettings.startDate || defaultDate);
            viewModel.endDate(userSettings.endDate || defaultDate);
            viewModel.comparativeOptions(getComparativeOptions(userSettingsPeriod));
            viewModel.comparativeTerm(userSettings.comparativeTerm);
            triggerComparativeTerm = true;

            if (userSettingsPeriod == 'Custom' && viewModel.startDate() && viewModel.endDate()) {
                pikerStart.setDate(utility.deserializeCustomDate(viewModel.startDate()));
                pikerEnd.setDate(utility.deserializeCustomDate(viewModel.endDate()));
            }

            getGraphDataStart(function() {
                if (!isMobile) bindScrollbar();
                else refreshCarousel();
                if (typeof callback === 'function') callback();
            });
        };

        var loadMobile = function(params, callback) {
            isMobile = true;
            this.load(params, callback);
        };

        var refresh = function() {
            if (!triggerComparativeTerm) return;

            getGraphDataStart(function() {
                if (!isMobile) bindScrollbar();
                else refreshCarousel();
            });
            utility.persistent.save({
                period: viewModel.period(),
                startDate: viewModel.startDate(),
                endDate: viewModel.endDate(),
                comparativeOptions: viewModel.comparativeOptions(),
                comparativeTerm: viewModel.comparativeTerm()
            });
        };

        var refreshCarousel = function() {
            setTimeout(function() {
                var holder = wrapper.find(".site-performance-card-holder");
                if (holder.data('owlCarousel')) {
                    holder.data('owlCarousel').reinit();
                    return;
                }

                holder.owlCarousel({
                    itemsCustom: [[0, 1], [490, 2], [730, 3]],
                    navigation: false
                });
            }, 100);
        };

        var updateChannelsGraph = function(labels, channels, animation) {
            var root = (analyticsMode == "page") ? "#page-traffic-panel" : "#site-traffic-panel";
            var container = root + " #channels-svg";
            var legendSelector = root + " #channels-legend";
            var tooltipSelector = root + " #channels .donut-chart-tooltip";
            var ratioSelector = root + " #channels-ratio";
            var colors = getColorsArray(channels.length);

            drawDonutChart(container,
                labels,
                channels,
                colors,
                tooltipSelector, legendSelector, null, animation);
        };

        var getColorsArray = function(arraySize) {
            var colors = new Array(arraySize);

            for (var i = 0; i < arraySize; i++) {
                colors[i] = graphColors[i % arraySize];
            }

            return colors;
        };

        var updateConversions = function(data) {
            var results = [];
            var width = 195;
            var totalResults = 0;
            if (data) {
                $.each(data.results || [], function(i, v) {
                    var title = v.title;
                    title = utility.trimContentToFit(title, width);
                    v.title = title;
                    results.push(v);
                });
                totalResults = data.totalResults || 0;
            }

            viewModel.conversions.results(results);
            viewModel.conversions.totalResults(totalResults);
        };

        var updateDevicesGraph = function(labels, devices, animation) {
            var root = (analyticsMode == "page") ? "#page-traffic-panel" : "#site-traffic-panel";
            var container = root + " #devices-svg";
            var legendSelector = root + " #devices-legend";
            var tooltipSelector = root + " #devices .donut-chart-tooltip";
            var ratioSelector = root + " #devices-ratio";
            var colors = getColorsArray(devices.length);

            drawDonutChart(container,
                labels,
                devices,
                colors,
                tooltipSelector, legendSelector, null, animation);
        };

        var updateGraphs = function(data, cb) {
            // common parts -
            periodLabel(data.periodLabel || '');

            var labels = [];
            if (!isMobile) {
                labels = data.labels;
            }

            updatePageViewsGraph(labels || [], data.pageViews || [], data.sessions || [], data.visitors || [],
            (lastCallStatus == null || lastCallStatus.isPendingAdoption) && (!data.isPendingAdoption));

            updateChannelsGraph(data.channels.labels || [], data.channels.values || [],
            (lastCallStatus == null || lastCallStatus.isPendingAdoption) && (!data.isPendingAdoption));

            updateDevicesGraph(data.devices.labels || [], data.devices.values || [],
            (lastCallStatus == null || lastCallStatus.isPendingAdoption) && (!data.isPendingAdoption));

            updateTopReferrers(data.referrers);
            updateConversions(data.conversions);

            if (analyticsMode == "page") {
                updateTimeOnPageGraph(labels || [], data.timeOnPage || [],
                (lastCallStatus == null || lastCallStatus.isPendingAdoption) && (!data.isPendingAdoption));

                updateTopOperatingSystems(data.operatingSystems);

                updateNavigationSummary(data.navigationSummary || [],
                (lastCallStatus == null || lastCallStatus.isPendingAdoption) && (!data.isPendingAdoption));
            } else {
                updateTopPages(data.pages);
            }

            if (typeof cb === 'function') cb();
        };

        var updateLegendSettings = function(update) {
            utility.persistent.save({ legends: update });
        };

        var updateNavigationSummary = function(navigationSummary) {
            var root = (analyticsMode == "page") ? "#page-traffic-panel" : "#site-traffic-panel";
            var container = root + " #navigation-summary .chart-container > div";
            var legend = root + " #navigation-summary-legend";
            wrapper.find(legend).empty();
            var $container = wrapper.find(container);
            $container.find('svg.referrers-svg').remove();
            $container.append('<svg class="referrers-svg"></svg>');
            $container.find('svg.exitPages-svg').remove();
            $container.append('<svg class="exitPages-svg"></svg>');

            $container.css("left", "-300px");

            var referrersChart = drawNavigationSummaryChart(700, 340, [20, 0, 20, 0], -1, getPersonalizedReferrers);

            var data = {
                label: "",
                category: ""
            };
            data.children = navigationSummary.referrers;

            d3.select(container + " svg.referrers-svg")
                .datum(data)
                .call(referrersChart);

            var exitPagesChart = drawNavigationSummaryChart(400, 340, [20, 0, 20, 0], 1, null);

            data = {
                label: "",
                category: ""
            };
            data.children = navigationSummary.exitPages;

            d3.select(container + " svg.exitPages-svg")
                .datum(data)
                .call(exitPagesChart);

            //update legend
            var categories = [];
            for (var i = 0; i < navigationSummary.referrers.length; i++) {
                if (categories.indexOf(navigationSummary.referrers[i].category) < 0) {
                    categories.push(navigationSummary.referrers[i].category);
                }
                if (navigationSummary.referrers[i].personalized === true) {
                    if (categories.indexOf("Personalized") < 0) {
                        categories.push("Personalized");
                    }
                }
            }
            if (navigationSummary.exitPages.length > 0) {
                categories.push(navigationSummary.exitPages[0].category);
            }
            updateNavigationSummaryLegend(legend, categories);

        };

        var updateNavigationSummaryLegend = function(legend, categories) {

            for (var i = 0; i < categories.length; i++) {
                var $check = $("<li></li>");
                $check.append($("<div></div>").addClass(categories[i].toLowerCase()));
                var label;
                switch (categories[i]) {
                case "Direct":
                    label = contentResx.analytics_direct;
                    break;
                case "Internal":
                    label = contentResx.analytics_internal;
                    break;
                case "External":
                    label = contentResx.analytics_external;
                    break;
                case "Social":
                    label = contentResx.analytics_social;
                    break;
                case "Search":
                    label = contentResx.analytics_search;
                    break;
                case "ExitPages":
                    label = contentResx.analytics_exitpages;
                    break;
                case "Personalized":
                    label = contentResx.analytics_personalized;
                    break;
                default:
                    break;
                }
                $check.append($("<span></span>").text(label.toUpperCase()));
                wrapper.find(legend).append($check);
            }

        };

        var updatePageViewsGraph = function(labels, pageViews, sessions, visitors, animation) {
            var root = (analyticsMode == "page") ? "#page-traffic-panel" : "#site-traffic-panel";
            var legend = wrapper.find(root + " #page-views-legend");
            var container = root + " #page-views";
            var $legend = wrapper.find(legend).empty();
            var $container = wrapper.find(container);
            $container.find('svg').remove();
            $container.append('<svg class="line-chart"></svg>');

            var data = [
                { values: visitors, key: viewModel.contentResx.analytics_Visitors.toUpperCase(), color: graphColors[0] },
                { values: pageViews, key: viewModel.contentResx.analytics_PageViews.toUpperCase(), color: graphColors[1] }
            ];
            var width = $container[0].clientWidth - 10;
            var height = width / 2.5;
            var chart = d3Charts.lineChart(animation, width, height)
                .labels(labels)
                .legendSelector(legend)
                .legendSettings(legendSettings)
                .updateLegendSettings(updateLegendSettings)
                .tooltipSelector(container + " > div.line-chart-tooltip");
            d3.select(container + " svg")
                .datum(data)
                .call(chart);

            var containerWidth = $container.width();
            var legendWidth = $legend.width();
            $legend.css("margin-left", (containerWidth - legendWidth) / 2 + "px");
        };

        var updatePersonalizedReferrers = function(node, data) {
            var $node = wrapper.find(node[0]);
            $node.find("circle.personalized").hide();

            node.append("svg:line")
                .attr("class", "personalized")
                .attr("stroke-dasharray", "5,5")
                .attr("x1", -160)
                .attr("x2", -280)
                .attr("y1", 0)
                .attr("y2", 0);

            node.append("svg:rect")
                .attr("class", "personalized")
                .attr("width", "200")
                .attr("height", function(d) {
                    return 40 + 25 * data.length;
                })
                .attr("x", "-480")
                .attr("y", "-15")
                .attr("rx", "10")
                .attr("ry", "10")
                .on("click", function(d) {
                    var $parent = $(this.parentNode);
                    $parent.find("line.personalized").remove();
                    $parent.find("text.personalized").remove();
                    $parent.find("rect.personalized").remove();
                    $parent.find("circle.personalized").show();

                    var container = "#page-traffic-panel #navigation-summary .chart-container > div";
                    wrapper.find(container).animate({ left: '-300px' }, "slow");
                });


            node.append("svg:text")
                .attr("class", "personalized")
                .attr("x", "-470")
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .text(viewModel.contentResx.analytics_personalizedVersions.toUpperCase());

            for (var i = 0; i < data.length; i++) {
                node.append("svg:text")
                    .attr("class", "personalized")
                    .attr("x", "-460")
                    .attr("dy", ".35em")
                    .attr("y", function(d) {
                        return 20 + i * 25;
                    })
                    .attr("text-anchor", "start")
                    .text(function(d) {
                        var item = data[i];
                        return "(" + item.count + ") - " + item.label;
                    });
            }

            var container = "#page-traffic-panel #navigation-summary .chart-container > div";
            wrapper.find(container).animate({ left: '0px' }, "slow");
        };

        var updateTimeOnPageGraph = function(labels, timeOnPage, animation) {
            var root = "#page-traffic-panel";
            var container = root + " #time-on-page";
            var $container = wrapper.find(container);
            $container.find('svg').remove();
            $container.append('<svg class="line-chart"></svg>');

            var data = [
                { values: timeOnPage, key: viewModel.contentResx.analytics_TimeOnPage.toUpperCase(), color: graphColors[0] },
            ];

            var width = $container[0].clientWidth - 10;
            var height = width / 2.5;

            var chart = d3Charts.lineChart(animation, width, height)
                .labels(labels)
                .tooltipSelector(container + " > div.line-chart-tooltip")
                .tooltipLabel("[COUNT] " + viewModel.contentResx.seconds.toUpperCase());
            d3.select(container + " svg")
                .datum(data)
                .call(chart);
        };

        var updateTopOperatingSystems = function(data) {
            var results = [];
            var width = 195;
            var totalResults = 0;
            if (data) {
                $.each(data.results || [], function(i, v) {
                    var title = v.title;
                    title = utility.trimContentToFit(title, width);
                    v.title = title;
                    results.push(v);
                });
                totalResults = data.totalResults || 0;
            }

            viewModel.topOperatingSystems.results(results);
            viewModel.topOperatingSystems.totalResults(totalResults);
        };

        var updateTopPages = function(data) {
            var results = [];
            var width = 195;
            var totalResults = 0;
            if (data) {
                $.each(data.results || [], function(i, v) {
                    var title = v.title;
                    title = utility.trimContentToFit(title, width);
                    v.title = title;
                    results.push(v);
                });
                totalResults = data.totalResults || 0;
            }

            viewModel.topPages.results(results);
            viewModel.topPages.totalResults(totalResults);
        };

        var updateTopReferrers = function(data) {
            var results = [];
            var width = 195;
            var totalResults = 0;
            if (data) {
                $.each(data.results || [], function(i, v) {
                    var title = v.title;
                    title = utility.trimContentToFit(title, width);
                    v.title = title;
                    results.push(v);
                });
                totalResults = data.totalResults || 0;
            }

            viewModel.topReferrers.results(results);
            viewModel.topReferrers.totalResults(totalResults);
        };

        return {
            init: init,
            initMobile: initMobile,
            load: load,
            loadMobile: loadMobile
        };
    }
    return analytics;
});
