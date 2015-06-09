/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

/***
 * @class UtilAdapter
 *
 * @depends dnn.jquery.js
 *
 * @param {int} moduleId
 *
 * Apapter for dnnSF to use like personaBar util
 */

// Namespace
window.dnn = window.dnn || {};
window.dnn.utils = window.dnn.utils || {};

(function() {
    var UtilAdapter;

    UtilAdapter = (function() {
        'use strict';

        var _dnnSF, _serviceSettings, _sf, _baseURL;

        var updateServiceSettings, get, post, ajaxCall, getServiceRoot;

        /* Private vars */
        _baseURL = 'DesktopModules';

        /* Public vars */
        UtilAdapter.prototype.sf = null;
        UtilAdapter.prototype.resx = null;

        /* Class properties */
        UtilAdapter.class = 'UtilAdapter';
        UtilAdapter.type  = 'Class';

        /* Constructor */
        function UtilAdapter(moduleId) {
            //console.log('~UtilAdapter');

            _dnnSF = $.dnnSF().ServicesFramework(moduleId);
            _serviceSettings = {
                beforeSend:  _dnnSF.setModuleHeaders,
                dataType:    'json',
                contentType: 'application/json'
            };

            this.sf = {
                moduleRoot: null,
                controller: null,
                url: null,
                get: get,
                post: post,
                getServiceRoot: getServiceRoot
            };

            this.resx = {};

            _sf = this.sf;
        }

        /* Private Methods */
        updateServiceSettings = function (action) {
            _serviceSettings.url = '/'+_baseURL+'/'+_sf.moduleRoot+'/API/'+_sf.controller+'/'+action;
        };

        get = function (action, data, get200Callback, getErrorCallback) {
            updateServiceSettings(action);
            _serviceSettings.method = 'get';
            ajaxCall(data, get200Callback, getErrorCallback);
        };

        post = function (action, data, post200Callback, postErrorCallback) {
            updateServiceSettings(action);
            _serviceSettings.method = _serviceSettings.type = 'post';
            ajaxCall(JSON.stringify(data), post200Callback, postErrorCallback);
        };

        ajaxCall = function (data, response200Callback, responseErrorCallback) {
            _serviceSettings.data = data;
            $.ajax(_serviceSettings)
                .done(response200Callback)
                .fail(responseErrorCallback);
                //.always(onAlwaysHandler); ¿?
        };

        getServiceRoot = function () {
            return '/'+_baseURL+'/'+_sf.moduleRoot+'/API/';
        };

        /* Public Methods */
        UtilAdapter.prototype.setAdaptedResx = function (value) {
            this.resx.ContentPB = value;
        };

        UtilAdapter.prototype.get  = get;
        UtilAdapter.prototype.post = post;

        return UtilAdapter;
    })();

    window.dnn.utils.UtilAdapter = UtilAdapter;

}).call(this);
