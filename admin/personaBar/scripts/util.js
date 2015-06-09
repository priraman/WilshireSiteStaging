'use strict';
define(['jquery'], function($) {
    var initializedModules = {};
    return {
        init: function (config) {
            var loadTempl;

            loadTempl = function (template, wrapper, params, self, cb, isMobile) {
                var callbackInit, templateSuffix, cssSuffix, initMethod, moduleJs, loadMethod;

                if (!initializedModules[template]) {
                    templateSuffix = isMobile ? '.mobi.html' : '.html';
                    cssSuffix = isMobile ? '.mobi.css' : '.css';
                    initMethod = isMobile ? 'initMobile' : 'init';
					var requiredArray = ['../' + template, 'text!../../' + template + templateSuffix];
					requiredArray.push('css!../../css/' + template + cssSuffix);
					
                    window.require(requiredArray, function(module, html) {
                        if (module === undefined) return;

                        wrapper.css('visibility', 'hidden').html(html);

                        callbackInit = function (wrapper, cb) {
                            wrapper.css('visibility', 'visible');
                            if (typeof cb === 'function') cb();
                        };

                        // Create objects or Initicialize objects and store
                        if (module.type === 'Class') {
                            initializedModules[template] = new module(wrapper, self, params, isMobile, callbackInit(wrapper));
                        } else {
                            module[initMethod].call(module, wrapper, self, params, callbackInit(wrapper, cb));
                            initializedModules[template] = module;
                        }
                    });
                } else {
                    moduleJs = initializedModules[template];
                    if (typeof moduleJs.load !== 'function') return;

                    loadMethod = isMobile ? 'loadMobile' : 'load';

                    if (moduleJs.type === 'Class') {
                        moduleJs.load(moduleJs, params, isMobile, cb);
                    } else {
                        moduleJs[loadMethod].call(moduleJs, params, cb);
                    }
                }
            };

            return {
                loadTemplate: function(template, wrapper, params, cb) {
                    var self = this;
                    loadTempl(template, wrapper, params, self, cb, false);
                },

                loadMobileTemplate: function(template, wrapper, params, cb) {
                    var self = this;
                    loadTempl(template, wrapper, params, self, cb, true);
                },

                loadInContextAnalytics: function(template, wrapper, cb) {
                    var self = this;
                    var params = { moduleName: config.socialModule };
                    loadTempl(template, wrapper, params, self, cb, false);
                },

                loadResx: function(cb) {
                    var self = this;
                    var timeStampKey = "PersonaBarResxTimeStamp." + config.culture;
                    var resxKey = "PersonaBarResx." + config.culture;
                    var localStorageAllowed = (function() {
                        var mod = 'DNN_localStorageTEST';
                        try {
                            window.localStorage.setItem(mod, mod);
                            window.localStorage.removeItem(mod);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    })();
                    if (localStorageAllowed) {
                        if (config.resxTimeStamp) {
                            if (window.localStorage[timeStampKey] === config.resxTimeStamp) {
                                var t = window.localStorage[resxKey];
                                if (t) {
                                    self.resx = JSON.parse(t);
                                    if (typeof cb === 'function') cb();
                                    return;
                                }
                            } else {
                                window.localStorage.removeItem(timeStampKey);
                                window.localStorage.removeItem(resxKey);
                            }
                        }
                    }
					self.sf.moduleRoot = 'dnncorp/personaBar';
                    self.sf.controller = 'localization';
                    self.sf.getsilence('gettable', { culture: config.culture }, function(d) {
                        if (localStorageAllowed) {
                            window.localStorage[timeStampKey] = config.resxTimeStamp;
                            window.localStorage[resxKey] = JSON.stringify(d);
                        }
                        self.resx = d;
                        if (typeof cb === 'function') cb();
                    });
                },

                getModuleNameByParams: function(params) {
                    return params ? (params.moduleName || '') : '';
                },

                asyncParallel: function(deferreds, callback) {
                    var i = deferreds.length;
                    if (i === 0) callback();
                    var call = function() {
                        i--;
                        if (i === 0) {
                            callback();
                        }
                    };

                    $.each(deferreds, function(ii, d) {
                        d(call);
                    });
                },

                asyncWaterfall: function(deferreds, callback) {
                    var call = function() {
                        var deferred = deferreds.shift();
                        if (!deferred) {
                            callback();
                            return;
                        }
                        deferred(call);
                    };
                    call();
                },

                confirm: function(text, confirmBtn, cancelBtn, confirmHandler, cancelHandler) {
                    $('#confirmation-dialog > p').html(text);
                    $('#confirmation-dialog a#confirmbtn').html(confirmBtn).unbind('click').bind('click', function() {
                        if (typeof confirmHandler === 'function') confirmHandler.apply();
                        $('#confirmation-dialog').fadeOut(200, 'linear', function() { $('#mask').hide(); });
                    });
                    $('#confirmation-dialog a#cancelbtn').html(cancelBtn).unbind('click').bind('click', function() {
                        if (typeof cancelHandler === 'function') cancelHandler.apply();
                        $('#confirmation-dialog').fadeOut(200, 'linear', function() { $('#mask').hide(); });
                    });
                    $('#mask').show();
                    $('#confirmation-dialog').fadeIn(200, 'linear');

                    $(window).off('keydown.confirmDialog').on('keydown.confirmDialog', function(evt) {

                        if (evt.keyCode === 27) {
                            $(window).off('keydown.confirmDialog');
                            $('#confirmation-dialog a#cancelbtn').trigger('click');
                        }
                    });
                },

                notify: function(text) {
                    $('#notification-dialog > p').html(text);
                    $('#notification-dialog').fadeIn(200, 'linear', function() {
                        setTimeout(function() {
                            $('#notification-dialog').fadeOut(200, 'linear');
                        }, 2000);
                    });
                },

                localizeErrMessages: function(validator) {
                    var self = this;
                    validator.errorMessages = {
                        'required': self.resx.PersonaBar.err_Required,
                        'minLength': self.resx.PersonaBar.err_Minimum,
                        'number': self.resx.PersonaBar.err_Number,
                        'nonNegativeNumber': self.resx.PersonaBar.err_NonNegativeNumber,
                        'positiveNumber': self.resx.PersonaBar.err_PositiveNumber,
                        'nonDecimalNumber': self.resx.PersonaBar.err_NonDecimalNumber,
                        'email': self.resx.PersonaBar.err_Email
                    };
                },

                trimContentToFit: function(content, width) {
                    if (!content || !width) return '';
                    var charWidth = 8.5;
                    var max = Math.floor(width / charWidth);

                    var arr = content.split(' ');
                    var trimmed = '', count = 0;
                    $.each(arr, function(i, v) {
                        count += v.length;
                        if (count < max) {
                            if (trimmed) trimmed += ' ';
                            trimmed += v;
                            count++;
                        } else {
                            trimmed += '...';
                            return false;
                        }
                    });
                    return trimmed;
                },

                deserializeCustomDate: function (str) {
                    if (this.moment) {
                        return this.moment(str, 'D MMM YYYY').toDate();
                    }
                },
                
                serializeCustomDate: function (dateObj) {
                    if (this.moment) {
                        return this.moment(dateObj).format('D MMM YYYY');
                    }
                }
            };
        }
    };
});

define('css',{
    load: function (name, require, load, config) {
		function inject(filename)
		{
			var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.href = filename;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			head.appendChild(link);
		}

		var path = name;
        for (var i in config.paths) {
            if (path.indexOf(i) == 0) {
                path = path.replace(i, config.paths[i]);
                break;
            }
        }

        if (path.indexOf('://') == -1) {
            path = config.baseUrl + path;
        }

		inject(path + '?' + config.urlArgs);
		load(true);
	},
	pluginBuilder: './css-build'
});;