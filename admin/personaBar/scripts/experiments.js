'use strict';
define(['jquery', 'knockout'], function ($, ko) {
    var viewModel = {};
    var koBinded = false;
    var isMobile = false;
    
    return {
        init: function (wrapper, util, params, callback) {
            viewModel = {
                title: ko.observable('Experiments')
            };

            ko.applyBindings(viewModel, wrapper[0]);
            koBinded = true;
            
            if (typeof callback === 'function') callback();
        },

        load: function (params, callback) {
        },

        initMobile: function (wrapper, util, params, callback) {
            isMobile = true;
            this.init(wrapper, util, params, callback);
        },

        loadMobile: function (params, callback) {
            isMobile = true;
            this.load(params, callback);
        }
    };
});