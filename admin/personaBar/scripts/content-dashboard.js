define(['jquery', '../scripts/analytics'], function ($, analytics) {
    'use strict';
    var analyticsModuleInstance = new analytics();

    var init = function(wrapper, util, params, callback){
        params = $.extend({}, params, {
            mode: "site",
            pageId: -1
        });
        analyticsModuleInstance.init(wrapper, util, params, callback);
    };

    var initMobile = function(wrapper, util, params, callback){
        params = $.extend({}, params, {
            mode: "site",
            pageId: -1
        });
        analyticsModuleInstance.initMobile(wrapper, util, params, callback);
    };

    var load = function(params, callback) {
        params = $.extend({}, params, {
            mode: "site",
            pageId: -1
        });
        analyticsModuleInstance.load(params, callback);
    };

    var loadMobile = function(params, callback){
        params = $.extend({}, params, {
            mode: "site",
            pageId: -1
        });
        analyticsModuleInstance.loadMobile(params, callback);
    };

    return {
        init: init,
        initMobile: initMobile,
        load: load,
        loadMobile: loadMobile
    };
});
