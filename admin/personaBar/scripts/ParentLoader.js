/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

/*
 * @class ParentLoader
 *
 * Loads libraries from parent from iframe
 */
define([], function () {
    var ParentLoaderClass;

    ParentLoaderClass = (function IIFE() {
        'use strict';

        var getParentJs, getParentCss;

        /* Class properties */
        ParentLoader.class = 'ParentLoader';
        ParentLoader.type  = 'Static Class';

        /* Constructor */
        function ParentLoader () {}

        /* Private Methods */
        getParentJs = function(name) {
            return (function($) {
                var src = $('script[src*="' + name + '"]:eq(0)').attr('src');
                if (src && src.length > 0 && src.indexOf('?') > -1) {
                    src = src.substr(0, src.indexOf('?'));
                }

                return src;
            })(window.top.jQuery);
        };

        getParentCss = function(name) {
            return (function($) {
                var src;

                src = $('link[href*="' + name + '"]:eq(0)').attr('href');
                if (!src || src.length === 0) return src;
                if (src.indexOf('?') > -1) src = src.substr(0, src.indexOf('?'));
                if (src.substr(0, 1) == '/') src = 'rootPath' + src;

                src = "css!" + src;

                return src;
            })(window.top.jQuery);
        };

        /* Class Methods */
        ParentLoader.load = function (jsFiles, cssFiles, check, callback) {
            var files, i;

            check = check || true;

            jsFiles = jsFiles || [];
            jsFiles.get = jsFiles.get || [];
            jsFiles.url = jsFiles.url || [];

            cssFiles = cssFiles || [];
            cssFiles.get = cssFiles.get || [];
            cssFiles.url = cssFiles.url || [];

            if (typeof dnn === 'undefined' || check) {
                window.Sys = !window.Sys ? window.top.Sys : window.Sys;
                window.dnn = !window.dnn ? window.top.dnn : window.dnn;

                files = [];

                for (i in jsFiles.get) files.push(getParentJs(jsFiles.get[i]));
                files = files.concat(jsFiles.url);

                for (i in cssFiles.get) files.push(getParentCss(cssFiles.get[i]));
                files = files.concat(cssFiles.url);

                window.require(files, function() {
                    if (typeof callback === 'function') callback();
                });
            }
        };

        /* test-code */
        // TODO: Puts functions when class is finished
        /* end-test-code */

        return ParentLoader;
    })();

    return ParentLoaderClass;
});
