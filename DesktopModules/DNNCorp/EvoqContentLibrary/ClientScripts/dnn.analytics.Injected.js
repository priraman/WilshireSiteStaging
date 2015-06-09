// DotNetNuke® - http://www.dnnsoftware.com
//
// Copyright (c) 2002-2014, DNN Corp.
// All rights reserved.

if (typeof dnn === 'undefined' || !dnn) dnn = {};
if (typeof dnn.analytics === 'undefined') dnn.analytics = {};

dnn.analytics.bindLinks = function bindLinks() {
    //Bind the click event of links which have a regular href (not javascript etc)
    $("a[href]").click(function (e) {
        e.preventDefault();
        var $this = $(this);
        var link = $this.attr("href");
        
        //sanity test
        if(!link) {
            return;
        }
        if (link !== "#" && link.indexOf("javascript") === -1) {
            //call logEvent to post the event to the server.
            dnn.analytics.logEvent("LinkClicked", "Links", "LinkClicked", link);
        }
        window.location.href = link;
    });
};

dnn.analytics.logEvent = function logEvent(eventName, eventCategory, eventAction, eventValue) {
    var serviceFramework = $.ServicesFramework(-1);
    var baseServicepath = serviceFramework.getServiceRoot('EvoqContentLibrary') + 'AnalyticsService/';

    var errorHandler = function (xhr, status) {
    };

    var successHandler = function () {
    };

    var personalizedTabId = dnn.getVar("dnnContentPersonalization_PersonalizedTabId", "-1");

    var data = {
        personalizedTabId: personalizedTabId,
        eventAction: eventAction,
        eventName: eventName,
        eventCategory: eventCategory,
        eventValue: eventValue
    };

    var options = {
        async: false,
        data: data,
        type: 'POST',
        beforeSend: serviceFramework.setModuleHeaders,
        error: errorHandler,
        success: successHandler
    };

    $.ajax(baseServicepath + 'LogEventData', options);
};

dnn.analytics.clientUnloading = function clientUnloading(e, settings) {
    var serviceFramework = settings.servicesFramework;
    var baseServicepath = serviceFramework.getServiceRoot('EvoqContentLibrary') + 'AnalyticsService/';

    var errorHandler = function (xhr, status) {
    };

    var successHandler = function () {
    };

    var personalizedTabId = dnn.getVar("dnnContentPersonalization_PersonalizedTabId", "-1");

    var data = {
        tabId: dnn.getVar("evoq_TabId", "-1"),
        pageLanguage: dnn.getVar("evoq_PageLanguage", ""),
        personalizedTabId: personalizedTabId,
        contentItemId: dnn.getVar("evoq_ContentItemId", "-1"),
        urlReferrer: dnn.getVar("evoq_UrlReferrer", ""),
        urlPath: dnn.getVar("evoq_UrlPath", ""),
        urlQuery: dnn.getVar("evoq_UrlQuery", ""),
        contentItemReferrer: dnn.getVar("evoq_ContentItemReferrer", "-1"),
        personalizedUrlReferrer: dnn.getVar("evoq_PersonalizedUrlReferrer", "-1"),
        pageStart: settings.pageStart,
        pageUnLoad: (new Date()).getTime()
    };

    var options = {
        async: false,
        data: data,
        type: 'POST',
        beforeSend: serviceFramework.setModuleHeaders,
        error: errorHandler,
        success: successHandler
    };

    $.ajax(baseServicepath + 'LogPageView', options);
};
