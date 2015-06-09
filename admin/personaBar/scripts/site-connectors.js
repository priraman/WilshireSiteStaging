'use strict';
define(['jquery', 'knockout', '../scripts/pager', '../scripts/validator', '../scripts/config', '../scripts/PersonaBarDialog'],
        function ($, ko, pager, validator, cf, personaBarDialog) {
    var utility = null;
    var config = cf.init();
    var viewModel = {
        connections: ko.observableArray([])
    };

    

    ko.protectedObservable = function (initialValue) {
        var actualValue = ko.observable(initialValue),
            tempValue = initialValue;

        var result = ko.computed({
            read: function () {
                return actualValue();
            },
            write: function (newValue) {
                tempValue = newValue;
            }
        }).extend({ notify: "always" });

        result.commit = function () {
            if (tempValue !== actualValue()) {
                actualValue(tempValue.trim());
            }
        };
        result.reset = function () {
            actualValue.valueHasMutated();
            tempValue = actualValue();
        };

        return result;
    };

    var wrapConnection = function (conn) {
        var koConfigurations = [];
        $.each(conn.configurations, function (key, value) {
            var o = {};
            o.name = key;
            o.localizedName = key;
            o.value = ko.protectedObservable(value);
            koConfigurations.push(o);
        });

        var koConnectionObject = {
            name: conn.name,
            displayName: conn.displayName,
            icon: conn.icon,
            connected: ko.observable(conn.connected),
            faviconCss: ko.computed(function () {
                var css = 'socialnetwork-favicon ' + conn.name;
                return css;
            }),
            inEdit: ko.observable(false),
            editLayout: ko.observable(''),
            buttons: ko.observableArray([]),
            edit: function (item, e) {
                e.preventDefault();
                var btn = $(e.target);
                var editRow = btn.parent().parent().next().find('td > div');
                var showEditRow = function() {
                    $.each(viewModel.connections(), function(i, v) {
                        v.inEdit(false);
                    });
                    item.inEdit(true);
                    editRow.slideDown(400, 'linear', function() {
                        $(this).find('input:first').select();
                    });
                };
                var collapsedEditRow = $('#connectionstbl tr.edit-row > td > div:visible');
                if (collapsedEditRow.length > 0) {
                    collapsedEditRow.slideUp(200, 'linear', showEditRow);
                } else {
                    showEditRow();
                }
            },
            cancel: function(item, e) {
                e.preventDefault();
                $.each(item.configurations, function (i, v) { v.value.reset(); });
                $(e.target).parents('div.edit-form').slideUp(200, 'linear');
                item.inEdit(false);
            },
            save: function(item, e, cb) {
                e.preventDefault();
                $.each(item.configurations, function (i, v) {
                    v.value.commit();
                });
                item.connected(false);
                var container = $(e.target).parents('div.edit-form');
                saveConnection(item, function (validated) {
                    container.slideUp(200, 'linear');
                    utility.notify(utility.resx.PersonaBar.txt_Saved, true);
                    item.inEdit(false);
                    item.connected(validated);
                    if (typeof cb == "function") {
                        cb.call(item, true);
                    }
                }, function (xhr, status) {
                    utility.notify(status || 'Failed...');
                    if (typeof cb == "function") {
                        cb.call(item, false);
                    }
                });
            },
            configurations: koConfigurations
        };

        var pluginFolder = conn.pluginFolder;
        var pluginJs = 'rootPath' + pluginFolder + 'scripts/connector';
        var pluginCss = 'css!rootPath' + pluginFolder + 'connector.css';
        var pluginHtml = 'text!rootPath' + pluginFolder + 'connector.htm';
        require([pluginJs, pluginHtml, pluginCss], function (connector, layout) {
            loadLocalizedStrings(conn.name, function (data) {
                for (var i = 0; i < koConfigurations.length; i++) {
                    if (typeof data[koConfigurations[i].name] != "undefined") {
                        koConfigurations[i].localizedName = data[koConfigurations[i].name];
                    }
                }

                koConnectionObject.resx = data;
                koConnectionObject.connector = connector;
                connector.init(koConnectionObject, connectionHelper, pluginFolder, utility);
                koConnectionObject.editLayout(layout);

                //custom buttons
                var buttons = getDefaultButtons();
                if (typeof connector.getActionButtons == "function") {
                    buttons = connector.getActionButtons();
                }
                for(var i = 0; i < buttons.length; i++) {
                    koConnectionObject.buttons.push(buttons[i]);
                }
                
                $('#connector-' + koConnectionObject.name).find('.edit-fields').children().each(function () {
                    ko.applyBindings(koConnectionObject, this);
                });
            });
        });

        return koConnectionObject;
    };

    var getDefaultButtons = function() {
        return [
            {
                className: 'primarybtn',
                text: viewModel.resx.btn_Save,
                action: function(conn, e) {
                    conn.save(conn, e);
                }
            }
        ];
    }

    var onSaveConnection = false;
    var saveConnection = function(conn, success, forceSave) {
        if (onSaveConnection) return;
        onSaveConnection = true;
        viewModel.errorMessage('');

        if (conn.connector) {
            conn.connector.onSave(conn);
        }

		utility.sf.moduleRoot = 'dnncorp/personaBar';
		utility.sf.controller = 'connections';
		var postData = {
		    name: conn.name,
            configurations: []
		};

        //if fields not all empty or all filled, then disable button and not save
		var allEmpty = true;
		var allFilled = true;

		for (var i = 0; i < conn.configurations.length; i++) {
		    var c = conn.configurations[i];
		    var value = c.value();
            postData.configurations.push({
                name: c.name,
                value: value
            });

            if (value != '') {
                allEmpty = false;
            } else {
                allFilled = false;
            }
		}

		var primaryButtons = $('#connector-' + conn.name).find('a.primarybtn');
        if (!allEmpty && !allFilled && !forceSave) {
            primaryButtons.addClass('disabledbtn');
            onSaveConnection = false;
            return;
        } else {
            primaryButtons.removeClass('disabledbtn');
        }

        viewModel.errorMessage('');
        primaryButtons.html(viewModel.resx.btn_Checking);
        utility.sf.post('SaveConnection', postData, function (d) {
            primaryButtons.html(viewModel.resx.btn_Save);
            if (d) {
                if (d.Success) {
                    success(d.Validated);
                } else if (d.Message) {
                    utility.notify(d.Message || 'Failed...');
                } else {
                    utility.notify('Failed...');
                }
            } else {
                utility.notify('Failed...');
            }
            onSaveConnection = false;
        }, function (xhr, status) {
            primaryButtons.html(viewModel.resx.btn_Save);
            utility.notify(status || 'Failed...');
            onSaveConnection = false;
        });
    };

    var loadConnections = function (cb) {
		utility.sf.moduleRoot = 'dnncorp/personaBar';
        utility.sf.controller = 'connections';
        utility.sf.get('GetConnections', null, function (data) {
            var conn = [];
            $.each(data, function (i, v) {
                conn.push(wrapConnection(v));
            });
            viewModel.connections(conn);
        }, function (xhr, status) {
            utility.notify(status || 'Failed...');
        });

        if (typeof cb === 'function') cb();
    };

    var connectionHelper = {
        loadConnections: loadConnections,
        saveConnection: saveConnection
    }

    var localStorageAllowed = function() {
        var mod = 'DNN_localStorageTEST';
        try {
            window.localStorage.setItem(mod, mod);
            window.localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    };

    var loadLocalizedStrings = function(name, cb) {
        var allowLocalStorage = localStorageAllowed();
        var storageName = 'Connections.' + name + '.' + config.culture + '.Table';

        if (allowLocalStorage) {
            if (window.localStorage[storageName]) {
                var table = JSON.parse(window.localStorage[storageName]);
                var time = new Date().getTime() - table.timestamp;
                if (time > 60 * 60 * 1000) { //expire the cache after 1 hour
                    window.localStorage.removeItem(storageName);
                } else {
                    cb(table);
                    return;
                }
            }
        }

        utility.sf.moduleRoot = 'dnncorp/personaBar';
        utility.sf.controller = 'connections';
        utility.sf.get('GetConnectionLocalizedString', { name: name, culture: config.culture }, function(data) {
            if (allowLocalStorage) {
                data.timestamp = new Date().getTime();
                window.localStorage[storageName] = JSON.stringify(data);
            }
            cb(data);
        });
    };

    var copyUtility = function (util) {
        var shadow = {};
        for (var prop in util) {
            if (prop != 'notify') {
                shadow[prop] = util[prop];
            }
        }
        shadow['notify'] = notifyMessage;
        shadow['popupNotify'] = util.notify;
        return shadow;
    };

    var notifyMessage = function (text, success) {
        if (success) {
            viewModel.errorMessage('');
            utility.popupNotify(text);
        } else {
            viewModel.errorMessage(text);
        }
    };

    return {
        init: function (wrapper, util, params, callback) {
            utility = copyUtility(util);
            utility.localizeErrMessages(validator);
            utility.asyncParallel([
                    function(cb1) {
                        loadConnections(cb1);
                    }
                ],
                function() {
                    var container = wrapper[0];
                    viewModel.resx = utility.resx.PersonaBar;
                    viewModel.errorMessage = ko.observable('');
                    ko.applyBindings(viewModel, container);
                    if (typeof callback === 'function') callback();
            });
        },

        initMobile: function (wrapper, util, params, callback) {
            this.init(wrapper, util, params, callback);
        },

        load: function (params, callback) {
            if (typeof callback === 'function') callback();
        },

        loadMobile: function (params, callback) {
            this.load(params, callback);
        }
	};
});