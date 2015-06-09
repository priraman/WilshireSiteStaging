'use strict';
define(['jquery', '../scripts/config', '../scripts/analytics'], function ($, cfg, analytics) {
    var config = cfg.init(),
        analyticModuleInstance = new analytics();

    var init = function(wrapper, util, params, callback){
        params = $.extend({}, params, {
            mode: "page",
            pageId: config.tabId
        });
        analyticModuleInstance.init(wrapper, util, params, callback);
    };

    var initMobile = function(wrapper, util, params, callback){
        params = $.extend({}, params, {
            mode: "page",
            pageId: config.tabId
        });
        analyticModuleInstance.initMobile(wrapper, util, params, callback);
    };

    var load = function(params, callback) {
        params = $.extend({}, params, {
            mode: "page",
            pageId: config.tabId
        });
        analyticModuleInstance.load(params, callback);
    }

    var loadMobile = function(params, callback){
        params = $.extend({}, params, {
            mode: "page",
            pageId: config.tabId
        });
        analyticModuleInstance.loadMobile(params, callback);
    }

    return {
        init: init,
        initMobile: initMobile,
        load: load,
        loadMobile: loadMobile
    };
});