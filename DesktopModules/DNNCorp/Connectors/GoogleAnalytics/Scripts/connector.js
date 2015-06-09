"use strict";
define(['jquery',
        'knockout',
        'templatePath/scripts/ParentLoader',
        'templatePath/scripts/PersonaBarDialog',
        'knockout.validation.min'], function ($, ko, ParentLoader, PersonaBarDialog) {
    var bindViewModel,
        advancedViewModel,
        rootFolder,
        utility,
        helper, rules,
        tempRules,
        pagePickerOptions,
        allRoles,
        pagesDropDown;

    var init = function (koObject, connectionHelper, pluginFolder, util) {
        bindViewModel = koObject;
        rootFolder = pluginFolder;
        utility = util;
        helper = connectionHelper;

        $(document.body).on('click', '#connector-GoogleAnalytics .advancedSetting', onAdvancedClick);

        initRequiredResources();
        splitRuleSettings();
        getAdvancedViewModel();

        ko.validation.localize({
            required: bindViewModel.resx.Validation_Required
        });

        ko.validation.init({errorMessageClass: 'validationMessage'}, true);
    }

    var onSave = function (koObject) {
        mergeRuleSettings();
    }

    var initRequiredResources = function() {
        if (typeof dnn === 'undefined') {
            window.Sys = !window.Sys ? window.top.Sys : window.Sys;
            window.dnn = !window.dnn ? window.top.dnn : window.dnn;
        }
        ParentLoader.load({
            get: [
                'dnn.servicesframework.js',
                'dnn.jquery.js',
                'dnn.extensions',
                'dnn.jquery.extensions.js',
                'dnn.DataStructures.js',
                'jquery.mousewheel.js',
                'dnn.jScrollBar.js',
                'dnn.TreeView.js',
                'dnn.DynamicTreeView.js',
                'dnn.DropDownList.js']
        }, {
            get: ['dnn.DropDownList.css', 'dnn.jScrollBar.css']
        });            
        
    }

    var splitRuleSettings = function () {
        rules = [];
        for (var i = bindViewModel.configurations.length - 1; i >= 0; i--) {
            var config = bindViewModel.configurations[i];
            if (config.name != 'TrackingId') {
                bindViewModel.configurations.splice(i, 1);
                if (config.name.indexOf('rule-') == 0) {
                    var id = config.name.substr(5);
                    var valueParts = config.value().split('$$$');
                    var pageValue = valueParts[2].split(',');
                    var pageId = pageValue[0];
                    var pageName = pageValue[1];

                    var roleValue = valueParts[3].split(',');
                    var roleId = roleValue[0];
                    var roleName = roleValue[1];

                    rules.splice(0, 0, {
                        id: id,
                        label: valueParts[0],
                        value: valueParts[1],
                        page: pageId,
                        role: roleId,
                        pageName: pageName,
                        roleName: roleName
                    });
                }
            }
        }
    }

    var mergeRuleSettings = function() { //merge rules into settings collection
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            
            if (rule.page === '') {
                rule.page = '-1';
            }
            if (rule.role === '') {
                rule.role = '-1';
            }

            var value = rule.label + '$$$' + rule.value + '$$$' + rule.page + '$$$' + rule.role;
            bindViewModel.configurations.push({
                name: 'rule-' + (i + 1),
                value: ko.protectedObservable(value)
            });
        }
    }

    var onAfterBind = function () {
        if (!pagePickerOptions) {
            utility.sf.moduleRoot = 'dnncorp/GoogleAnalyticsConnector';
            utility.sf.controller = 'Services';
            utility.sf.get('GetPagePickerOptions', {}, function(data) {
                pagePickerOptions = data;
                pagePickerOptions.onSelectionChangedBackScript = onPageSelectionChanged;
                createPagesDropDown();
            });
        } else {
            createPagesDropDown();
        }

        if (!pagePickerOptions) {
            utility.sf.moduleRoot = 'dnncorp/GoogleAnalyticsConnector';
            utility.sf.controller = 'Services';
            utility.sf.get('GetRoles', {}, function(data) {
                allRoles = data;
                createRolesDropDown();
            });
        } else {
            createRolesDropDown();
        }

        var $rulesGrid = $('.conn-ga-advancedSetting .rule-grid .items');
        $rulesGrid.jScrollPane();
    }

    var createPagesDropDown = function() {
        pagesDropDown = new dnn.DropDownList(null, pagePickerOptions);
        $('.conn-ga-advancedSetting .pagesDropDown').append(pagesDropDown.$element);
    }

    var onPageSelectionChanged = function () {
        var pageId = pagesDropDown.selectedItem().key;
        advancedViewModel.editModel.page(pageId);
    }

    var createRolesDropDown = function () {
        if (advancedViewModel && advancedViewModel.roleData().length == 0) {
            for (var i = 0; i < allRoles.length; i++) {
                advancedViewModel.roleData.push(allRoles[i]);
            }
        }
    }

    var getAdvancedViewModel = function () {
        if (!advancedViewModel) {
            advancedViewModel = {
                editModel: {
                    id: ko.observable(-1),
                    label: ko.observable('').extend({ required: true }),
                    value: ko.observable('').extend({ required: true }),
                    page: ko.observable(''),
                    role: ko.observable('-1'),
                },
                rules: ko.observableArray(rules),
                roleData: ko.observableArray([]),
                resx: bindViewModel.resx,
                editRule: onEditRule,
                deleteRule: onDeleteRule,
                moveUp: onMoveUp,
                moveDown: onMoveDown
            }
        } else {
            resetEditModel();
        }

        return advancedViewModel;
    }

    var resetEditModel = function (item) {
        if (!item) {
            item = {
                id: -1,
                label: '',
                value: '',
                page: '',
                role: '-1',
                pageName: bindViewModel.resx.AnyPage,
                roleName: bindViewModel.resx.AnyRole
            }
        }

        advancedViewModel.editModel.id(item.id);
        advancedViewModel.editModel.label(item.label);
        advancedViewModel.editModel.label.isModified(false);
        advancedViewModel.editModel.value(item.value);
        advancedViewModel.editModel.value.isModified(false);
        advancedViewModel.editModel.page(item.page);
        advancedViewModel.editModel.role(item.role);

        if (pagesDropDown) {
            pagesDropDown.selectedItem({ key: item.page, value: item.pageName });
        }
        $('#RolesDropDown').val(item.role);
    }

    var onAdvancedSettingAccept = function() {
        var editModel = advancedViewModel.editModel;
        var result = ko.validation.group(editModel, {deep: true});
        if (!editModel.isValid()) 
        {
            result.showAllMessages(true);
            return;
        }
        
        if (editModel.id() == -1) {
            rules.push({
                id: rules.length + 1,
                label: editModel.label(),
                value: editModel.value(),
                page: editModel.page(),
                role: editModel.role()
            });
        } else {
            rules.splice(editModel.id() - 1, 1, {
                id: editModel.id(),
                label: editModel.label(),
                value: editModel.value(),
                page: editModel.page(),
                role: editModel.role()
            });
        }

        helper.saveConnection(bindViewModel, onSaveComplete, true);
    }

    var onEditRule = function (item, e) {
        resetEditModel(item);
    }

    var onDeleteRule = function(item, e) {
        utility.confirm(bindViewModel.resx.DeleteConfirm,
                        bindViewModel.resx.Delete,
                        bindViewModel.resx.Cancel,
                        function() {
                            doDeleteRule(item);
                        });
    }

    var doDeleteRule = function(item) {
        rules.splice(item.id - 1, 1);
        helper.saveConnection(bindViewModel, onSaveComplete, true);
    }

    var onMoveUp = function (item, e) {
        if (item.id == 1) {
            return;
        }

        var currentIndex = item.id - 1;
        var rule = rules[currentIndex];
        rules.splice(currentIndex, 1);
        rules.splice(currentIndex - 1, 0, rule);

        helper.saveConnection(bindViewModel, onSaveComplete, true);
    }

    var onMoveDown = function(item, e) {
        if (item.id == rules.length) {
            return;
        }

        var currentIndex = item.id - 1;
        var rule = rules[currentIndex];
        rules.splice(currentIndex, 1);
        rules.splice(currentIndex + 1, 0, rule);

        helper.saveConnection(bindViewModel, onSaveComplete, true);
    }

    var onSaveComplete = function () {
        copyTempRules();
        splitRuleSettings();
        var $rulesGrid = $('.conn-ga-advancedSetting .rule-grid .items');
        var scollY = 0;
        if ($rulesGrid.length > 0 && $rulesGrid.data('jsp')) {
            scollY = $rulesGrid.data('jsp').getContentPositionY();
            $rulesGrid.find('.jspContainer').remove();
            $rulesGrid.data('jsp', null);
        }

        advancedViewModel.rules.removeAll();
        for (var i = 0; i < rules.length; i++) {
            if (!rules[i].pageName) {
                rules[i].pageName = i < tempRules.length && tempRules[i].pageName ? tempRules[i].pageName : getSelectedPageName();
            }
            if (!rules[i].roleName) {
                rules[i].roleName = i < tempRules.length && tempRules[i].roleName ? tempRules[i].roleName : getSelectedRoleName();
            }

            advancedViewModel.rules.push(rules[i]);
        }

        if ($rulesGrid.length > 0) {
            $rulesGrid.jScrollPane();
            $rulesGrid.data('jsp').scrollToY(scollY);
        }

        resetEditModel();
    }

    var copyTempRules = function() {
        tempRules = [];
        for (var i = 0; i < rules.length; i++) {
            tempRules.push(rules[i]);
        };
    }

    var getSelectedPageName = function() {
        return pagesDropDown.selectedItem().value;
    }

    var getSelectedRoleName = function() {
        var rolesDropDown = document.getElementById('RolesDropDown');
        var selectedValue = rolesDropDown.value;
        for (var i = 0; i < rolesDropDown.options.length; i++)
        {
            if (rolesDropDown.options[i].value == selectedValue) {
                return rolesDropDown.options[i].text;
            }
        }

        return '';
    }

    var onAdvancedSettingCancel = function() {
                
    }

    var onAdvancedClick = function () {
        require(['text!rootPath' + rootFolder + 'advanced.htm'], function(html) {
            var dialog = new PersonaBarDialog({
                inObject: $('body'),
                width: 771,
                title: bindViewModel.resx.AdvancedSettings,
                innerTitle: bindViewModel.resx.AdvancedSettingsTitle,
                cancelBtnLbl: 'Cancel',
                acceptBtnLbl: 'Save',
                onAcceptCallback: onAdvancedSettingAccept,
                closeOnAccept: false,
                onCloseCallback: onAdvancedSettingCancel
            }, html, getAdvancedViewModel, onAfterBind);
        });
    }
    
    var getActionButtons = function() {
        return [
            {
                className: 'primarybtn',
                text: bindViewModel.resx.Save,
                action: function(conn, e) {
                    saveConnection(conn, e);
                }
            }
        ];
    }

    var saveConnection = function(conn, e) {
        conn.save(conn, e, function(success) {
            onSaveComplete();
        });
    }

    return {
        init: init,
        onSave: onSave,
        getActionButtons: getActionButtons
    }
});