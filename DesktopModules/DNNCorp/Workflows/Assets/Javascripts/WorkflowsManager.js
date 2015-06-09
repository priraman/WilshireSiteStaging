/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

/*jshint multistr:true */

/***
 * TODO: Doc params, change private vars to _var, change params names
 *
 * @class WorkflowsManager
 *
 * @depends jQuery
 * @depends dnn.jquery.js
 * @depends knockout
 * @depends knockout.validations
 * @depends util.js
 *
 * Controls personabar/settings/workflows
 */

// Namespace
window.dnn = window.dnn || {};
window.dnn.modules = window.dnn.modules || {};
window.dnn.modules.workflows = window.dnn.modules.workflows  || {};

(function IIFE() {
    var WorkflowsManagerClass;

    WorkflowsManagerClass = (function IIFE() {
        'use strict';

        var NEW_WORKFLOW_TITLE_SELECTOR, HTML_HEADER_INDEX, NEW_WORKFLOW_HEIGHT, STATE_ROW_HEIGHT, NEW_WORKFLOW_TITLE_HEIGHT, BORDER_BOTTOM_WIDTH, NO_EDITABLE_WORKFLOW_HEIGHT,
            OPACITY_VISIBLE, OPACITY_INVISIBLE, EDIT_WORKFLOW_HEIGHT, INFO_DESCRIPTION_MARGIN, WORKFLOW_ANIMATION_DURATION, WORKFLOW_ANIMATION_EASING, WORKFLOW_ANIMATION_DURATION_TITLE,
            WORKFLOW_ANIMATION_EASING_TITLE, ERROR_HEIGHT, MOVE_UP, MOVE_DOWN, ANIMATION_PANEL_MARGIN, LAST_TAG_TO_END_DISTANCE;

        var _browser, htmlHeader, configServiceFramework, configServiceFrameworkStates, util, viewModel, newWorkflowExtendedObj, viewModelExtra, isMobile, newWorkflowJqObj, newWorkflowJqObjTitle, newWorkflowJqObjAnimationPanel, personaBarDialog,
            _resx, _contentWorkflowsStates, _tmpEditedWorkflow, _htmlError, _utilConfirmBtnLbl, _utilCancelBtnLbl, _resourcesLoadOffset, _isGettingMoreResources, _viewModelResources, _personaBarDialog,
            _dnnAlertOptions, _dnnConfirmOptions, _msie, _scrollObj, _confirmOpts, _newWorkflowTarget;

        var getBrowser, getParentJs, getParentCss, showDialog, showAddState, showEditState, loadWeb, usedText, showResources, showResources200Callback, viewModelResourcesAddData, showResourcesErrorCallback,
            afterBindShowResourcesCallback, getResourcesLazyLoad, getResourcesLazyLoad200Callback, loadMobile, init200Callback, initErrorCallback,
            initViewModel, firstWorkflowClass, cleanNewForm, showNew, hideNew, toggleNew, createWorkflowErrorCallback, createWorkflow200Callback, saveNew, showEdit, hideEdit, toggleEdit, bindDescriptionHeight, unbindDescriptionHeight,
            editWorkflow200Callback, editWorkflowErrorCallback, saveEdited, cleanEditedTmp, cancelEdited, cancelNew, animateShowPanel, animateHidePanel, highlightLastAdded, enableAddStateBtn, disableAddStateBtn,
            delWorkflow200Callback, delWorkflowErrorCallback, delWorkflow, delState, delState200Callback, delStateErrorCallback , cleanBackendErrors, showBackendErrors, moveUp, moveDown, move, move200Callback, moveErrorCallback;

        /* Class properties */
        WorkflowsManager.class = 'WorkflowsManager';
        WorkflowsManager.type  = 'Class';

        /* Private Constants and Properties */
        ANIMATION_PANEL_MARGIN = 88;
        LAST_TAG_TO_END_DISTANCE = 60;
        MOVE_UP = 1;
        MOVE_DOWN = 2;
        NEW_WORKFLOW_TITLE_SELECTOR = '.workflowspanelbody .workflows ul li:first';
        HTML_HEADER_INDEX = 0;

        NEW_WORKFLOW_HEIGHT = 458;
        NO_EDITABLE_WORKFLOW_HEIGHT = 553;
        EDIT_WORKFLOW_HEIGHT = 633;
        INFO_DESCRIPTION_MARGIN = 20;

        NEW_WORKFLOW_TITLE_HEIGHT = 32;
        STATE_ROW_HEIGHT = 31;
        BORDER_BOTTOM_WIDTH = '4px';
        WORKFLOW_ANIMATION_DURATION = 300;
        WORKFLOW_ANIMATION_DURATION_TITLE = 100;
        ERROR_HEIGHT = 13;
        WORKFLOW_ANIMATION_EASING = 'swing';
        WORKFLOW_ANIMATION_EASING_TITLE = 'linear';
        OPACITY_VISIBLE = 1;
        OPACITY_INVISIBLE = 0;

        util = null;
        viewModel = null;
        newWorkflowExtendedObj = null;
        viewModelExtra = null;
        isMobile = null;
        newWorkflowJqObj = null;
        newWorkflowJqObjTitle = null;
        newWorkflowJqObjAnimationPanel = null;
        _resx = null;
        _tmpEditedWorkflow = {};
        _htmlError = '<div data-bind="css: errorClass">\
                        <ul data-bind="foreach: messages">\
                            <li data-bind="name"></li>\
                        </ul>\
                    </div>';

        _dnnAlertOptions = {};
        _dnnConfirmOptions = {};

        /* Constructor */
        function WorkflowsManager(utilities, workflowsDOM, mobile) {
            //console.log('~WorkflowsManager');

            // scrollTop behaviour is the same for firefox and ie
            _msie = navigator.userAgent.search(/msie|\.net|firefox/i) !== -1 ? true : false;
            _scrollObj = _msie ? $('html') : $('body');

            getBrowser();

            // Defaults
            if (!mobile) mobile = false;
            isMobile = mobile;

            htmlHeader = workflowsDOM;

            // Config requesst
            util = utilities;
            _resx = util.resx.ContentPB;

            // Config validation i18n
            ko.validation.localize({
                required: _resx.validation_required,
                min: _resx.validation_min,
                max: _resx.validation_max,
                minLength: _resx.validation_minLength,
                maxLength: _resx.validation_maxLength,
                number: _resx.validation_number,
                digit:  _resx.validation_digit
            });

            ko.validation.init({errorMessageClass: 'validationMessage '+_browser}, true);

            configServiceFramework();

            // Get all workflows
            util.sf.get('Index', {}, init200Callback, initErrorCallback);

            $('#confirmbtn').addClass('btn active');

            _confirmOpts = {
                title:   _resx.settings_common_confirm,
                yesText: _resx.settings_common_yes_btn,
                noText:  _resx.settings_common_no_btn
            };
        }

        /* Private Methods */
        getBrowser = function () {
          var agent, osx;

          agent = navigator.userAgent;
          osx = agent.search(/Macintosh/i) !== -1 ? 'osx' : '';

          switch(true) {
            case agent.search(/msie|\.net/i) !== -1:
              _browser = 'ie';
            break;

            case agent.search(/Firefox/i) !== -1:
              _browser = 'ff' + osx;
            break;

            case agent.search(/Chrome/i) !== -1:
              _browser = 'chrome';
            break;

            case agent.search(/AppleWebKit/i) !== -1:
              _browser = 'safari';
            break;

            default:
              _browser = 'unknown '+osx;
          }
        };

        loadWeb = function (params, callback) {
        };

        loadMobile = function (params, callback) {
        };

        initViewModel = function (data, htmlHeader) {
            var item, itemState;

            // Clone new workflow object
            newWorkflowExtendedObj = jQuery.extend(true, {}, data.NewWorkflow);

            viewModel = {
                browser:    _browser,
                load: ko.observable(true),
                title: _resx.settings_title,
                subtitle: _resx.workflows_title,
                workflows: {
                    header: {
                        workflowType: _resx.workflows_header_workflow_type || 'WORKFLOW TYPE',
                        inUse:        _resx.workflows_header_in_use || 'IN USE',
                        actions:      _resx.workflows_header_actions || 'ACTIONS'
                    },
                    tooltip: {
                      lock:           _resx.workflows_tooltip_lock
                    },
                    page: {
                        title:          _resx.workflows_page_title || 'Workflows',
                        description:    _resx.workflows_page_description || '',
                        newWorkflowBtn: _resx.workflows_new_btn,
                        inUse:          _resx.workflows_in_use,
                        NotInUse:       _resx.workflows_not_in_use,
                        resources_info: _resx.workflows_resources_info,
                        resources_link: _resx.workflows_resources_link,
                        states: {
                            title:        _resx.workflows_states_title || 'Workflows States',
                            description: _resx.workflows_states_descriptions || '',
                        },
                        table: {
                            order:   _resx.workflows_states_table_order,
                            state:   _resx.workflows_states_table_state,
                            active:  _resx.workflows_states_table_active,
                            actions: _resx.workflows_states_table_actions,
                            move:    _resx.workflows_states_table_move
                        },
                        form: {
                            addStateBtn: _resx.workflows_add_state_btn || 'Add a State',
                            title:       _resx.workflows_common_title_lbl,
                            description: _resx.workflows_common_description_lbl,
                            cancel:      _resx.workflows_common_cancel_btn,
                            save:        _resx.workflows_common_save_btn
                        }
                    },
                    list: ko.observableArray([])
                },
                firstWorkflowClass: firstWorkflowClass,
                isAnimationEnable:  ko.observable(false),
                isNewOpen:          ko.observable(false),
                isEditOpen:         ko.observableArray([]),
                isAddStateOpen:     ko.observable(false),
                koBinded:           ko.observable(false),
                showNew:            showNew,
                toggleNew:          toggleNew,
                saveNew:            saveNew,
                toggleEdit:         toggleEdit,
                saveEdited:         saveEdited,
                cancelEdited:       cancelEdited,
                cancelNew:          cancelNew,
                highlightLastAdded: highlightLastAdded,
                showDialog:         showDialog,
                showAddState:       showAddState,
                showEditState:      showEditState,
                delWorkflow:        delWorkflow,
                delState:           delState,
                showResources:      showResources,
                moveUp:             moveUp,
                moveDown:           moveDown
            };

            // Put new workflow on top of workflows array
            data.Workflows.unshift(data.NewWorkflow);

            // Observe workflows
            data.Workflows.forEach(function (elemWorkFlow, idx) {
                item = {
                    isUsed:              ko.observable(elemWorkFlow.IsInUse),
                    isOpen:              ko.observable(false),
                    isEditable:          ko.observable(!elemWorkFlow.IsSystem),
                    isSystem:            elemWorkFlow.IsSystem,
                    isAddStateBtnEnable: ko.observable(idx === 0 || elemWorkFlow.IsSystem ? false : true),
                    WorkflowId:          ko.observable(elemWorkFlow.WorkflowId),
                    WorkflowName:        ko.observable(elemWorkFlow.WorkflowName || _resx.workflows_new_workflow)
                                             .extend({
                                                required: true,
                                                minLength: 3,
                                                maxLength: 40
                                            }),
                    NameErrors:         ko.observableArray([]),
                    Description:        ko.observable(elemWorkFlow.Description)
                                            .extend({ maxLength: 255 }),
                    DescriptionErrors:  ko.observableArray([]),
                    States:             ko.observableArray([])
                };

                if (elemWorkFlow.States) {
                    elemWorkFlow.States.forEach(function (elemState) {
                        itemState = {
                            StateId:   ko.observable(elemState.StateId),
                            StateName: ko.observable(elemState.StateName),
                            Order:     ko.observable(elemState.Order),
                            IsSystem:  ko.observable(elemState.IsSystem),
                            SendNotification: ko.observable(elemState.SendNotification),
                            SendNotificationToAdministrators: ko.observable(elemState.SendNotificationToAdministrators)
                        };
                        item.States().push(itemState);
                    });
                }

                viewModel.workflows.list().push(item);
            });

            // Bind KO
            ko.applyBindings(viewModel, htmlHeader[0]);
            viewModel.koBinded(true);

            setTimeout(function () {
                _newWorkflowTarget = $('.workflows .isNewWorkflow .detailsPanel');
                $('.qaTooltip').qaTooltip();
            }, 0);
        };

        showResources = function (workflow) {
            _resourcesLoadOffset = 0;
            configServiceFramework();
            util.sf.post('Resources', {WorkflowId: workflow.WorkflowId(), Offset: _resourcesLoadOffset}, function (data) {showResources200Callback(data, workflow);}, showResourcesErrorCallback);
        };

        showResources200Callback = function (data, workflow) {
            var html, modelCallback;
            html = '<div class="panel">\
                        <div class="resourcesUsedByWorkflow head">\
                            <div class="name" data-bind="text: name"></div>\
                            <div class="contentType" data-bind="text: contentType"></div>\
                        </div>\
                        <div class="resourcesUsedByWorkflow resources">\
                            <ul class="" data-bind="foreach: messages">\
                                <li class="clearBoth" data-bind="css: {odd: $index()%2 === 0, even: $index()%2 === 1}">\
                                    <span class="title" data-bind="text: title"></span>\
                                    <span class="contentType" data-bind="text: contentType"></span>\
                                    <span class="clearBoth"></span>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>';

            modelCallback = function () {
                var messages;

                _viewModelResources = {
                    name: _resx.worflow_usages_dialog_table_name,
                    contentType: _resx.worflow_usages_dialog_table_contentType,
                    messages: ko.observableArray([])
                };

                viewModelResourcesAddData(data);

                return _viewModelResources;
            };

            _personaBarDialog = new window.dnn.utils.KoBindedDialog({
                title: _resx.worflow_usages_dialog_title,
                innerTitle: _resx.worflow_usages_dialog_inner_title.replace('{0}', workflow.WorkflowName()),
                showAcceptBtn: false,
                cancelBtnLbl: _resx.workflows_common_close_btn
            }, html, modelCallback, function (data) {afterBindShowResourcesCallback(data, workflow);});
        };

        viewModelResourcesAddData = function (data) {
            var resource;
            data.resources.forEach(function (elem) {
                resource = {
                    title: ko.observable(elem.title),
                    contentType: ko.observable(elem.type === 'Tab' ? 'Page' : elem.type)
                };
                _viewModelResources.messages.push(resource);
            });
        };

        // Lazy loading resources
        afterBindShowResourcesCallback = function (data, workflow) {
            var resources, scrollable, initialPos, lastPos, currentPos, scrollDown;

            _isGettingMoreResources = false;
            _resourcesLoadOffset++;

            // Apply jScrollPane
            resources = $('.resourcesUsedByWorkflow.resources');
            resources.jScrollPane();
            resources.css('width', '100%');
            resources.find('.jspContainer').css('width', '100%');
            if (resources.find('.jspDrag').length === 0)
                $('.personaBarDialog .resourcesUsedByWorkflow.head').css('width', 'calc(100% - 22px)');
            else
                $('.personaBarDialog .resourcesUsedByWorkflow.head').css('width', 'calc(100% - 20px)');

            // Controll scroll for lazy loading
            scrollable = $('.resourcesUsedByWorkflow.resources .jspDrag');
            initialPos = scrollable.css('top');

            setTimeout(function() {
                resources.off('scroll.workflowResources').on('scroll.workflowResources', function (evt) {
                    if (_isGettingMoreResources) return;
                    scrollable = $('.resourcesUsedByWorkflow.resources .jspDrag');
                    currentPos = scrollable.css('top');
                    scrollDown = lastPos > currentPos ? false : true;

                    if (scrollDown && currentPos === lastPos) {
                        _isGettingMoreResources = true;

                        // End of scroll, load more
                        getResourcesLazyLoad(workflow);
                    }

                    lastPos = currentPos;
                });

                _personaBarDialog.updateHeight();
            }, 0);
        };

        getResourcesLazyLoad = function (workflow) {
            configServiceFramework();
            util.sf.post('Resources', {WorkflowId: workflow.WorkflowId(), Offset: _resourcesLoadOffset}, getResourcesLazyLoad200Callback, null/*error*/);
        };

        getResourcesLazyLoad200Callback = function (data) {
            var resources;
            viewModelResourcesAddData(data);
            setTimeout(function() {
                // Apply jScrollPane
                resources = $('.resourcesUsedByWorkflow.resources');
                resources.jScrollPane();
                resources.css('width', '100%');
                resources.find('.jspContainer').css('width', '100%');
                _resourcesLoadOffset++;
                _isGettingMoreResources = !data.loadMore;
                if(!data.loadMore) resources.off('scroll.workflowResources');
            }, 0);
        };

        showResourcesErrorCallback = function (data) {
        };

        showDialog = function () {
        };

        configServiceFramework = function () {
            util.sf.moduleRoot = 'EvoqContentLibrary';
            util.sf.controller = 'Workflows';
        };

        configServiceFrameworkStates = function() {
            util.sf.moduleRoot = 'EvoqContentLibrary';
            util.sf.controller = 'WorkflowStates';
        };

        init200Callback = function (data) {
            if (!data) return;
            initViewModel(data, htmlHeader);
            if (typeof callback === 'function') callback();
        };

        initErrorCallback = function (data) {
            if (!data) _dnnAlertOptions.text = _resx.workflows_unknown_error;
            else if (data.status !== 200) _dnnAlertOptions.text = 'Error ' + data.status + ': ' + data.statusText;

            $('.workflowspanelbody .loading').hide();

            _dnnAlertOptions.title = 'Error';
            $.dnnAlert(_dnnAlertOptions);
        };

        usedText = function (isUsed) {
            return isUsed ? _resx.workflows_in_use : _resx.workflows_not_used;
        };

        firstWorkflowClass = function (index) {
            return index === 0 ? 'isNewWorkflow' : '';
        };

        animateShowPanel = function (isEditable, objTitle, objPanel, numberOfStates, endAnimationCallback) {
            var finalHeight, initialPosition, scrollPosition, panelPosition;

            finalHeight = objPanel.find('.lastTag')[0].getBoundingClientRect().top - objPanel[0].getBoundingClientRect().bottom + LAST_TAG_TO_END_DISTANCE;

            // Animate show panel
            objPanel.stop(true, true).animate({
                opacity: OPACITY_VISIBLE,
                height: finalHeight,
                'border-bottom-width': BORDER_BOTTOM_WIDTH
            },
            {
                duration: WORKFLOW_ANIMATION_DURATION,
                easing: WORKFLOW_ANIMATION_EASING,
                queue: false,
                complete: function () {
                    endAnimationCallback();

                    scrollPosition = _scrollObj.scrollTop();
                    panelPosition  = objPanel[0].getBoundingClientRect().top;
                    initialPosition = scrollPosition + panelPosition;

                    _scrollObj.stop(true, true).animate({
                        'scroll-top': parseInt(initialPosition - ANIMATION_PANEL_MARGIN, 10)
                    },
                    {
                        duration: WORKFLOW_ANIMATION_DURATION
                    });
                }
            });

            if (!objTitle) return;

            // Animate show title
            objTitle.stop(true, true).animate({
                opacity: OPACITY_VISIBLE,
                height: NEW_WORKFLOW_TITLE_HEIGHT + 'px'
            },
            {
                duration: WORKFLOW_ANIMATION_DURATION_TITLE,
                easing: WORKFLOW_ANIMATION_EASING_TITLE,
                queue: false
            });
        };

        animateHidePanel = function (objTitle, objPanel, endAnimationCallback) {
            var endAnimationTitleCallback, endAnimationPanelCallback;

            // Determine when is ending animation for callback
            if (objTitle) {
                endAnimationPanelCallback = false;
                endAnimationTitleCallback = function () {
                    endAnimationCallback();
                };
            } else {
                endAnimationTitleCallback = false;
                endAnimationPanelCallback = function () {
                    endAnimationCallback();
                };
            }

            // Animate hide panel
            objPanel.stop(true, true).animate({
                opacity: OPACITY_INVISIBLE,
                height: 0,
                'border-bottom-width': 0
            },
            {
                duration: WORKFLOW_ANIMATION_DURATION,
                easing: WORKFLOW_ANIMATION_EASING,
                queue: false,
                complete: endAnimationPanelCallback
            });

            if (!objTitle) return;

            // Animate hide title
            setTimeout(function () {
                objTitle.stop(true, true).animate({
                    opacity: OPACITY_INVISIBLE,
                    height: 0
                },
                {
                    duration: WORKFLOW_ANIMATION_DURATION_TITLE,
                    easing: WORKFLOW_ANIMATION_EASING_TITLE,
                    queue: false,
                    complete: endAnimationTitleCallback
                });
            }, 0); //WORKFLOW_ANIMATION_DURATION - WORKFLOW_ANIMATION_DURATION_TITLE);
        };

        highlightLastAdded = function () {
            var lastListTitle, originalBackground;

            lastListTitle = $('.workflowsList:last').find('div.title div:first');
            originalBackground = lastListTitle.css('background-color');

            //lastListTitle.css('background-color', '#ff9'); // Work

            // Need jQuery color
            lastListTitle.stop(true, true).animate({
                backgroundColor: '#ffff99'
            },
            {
                duration: 700,
                queue: false,
                complete: function () {
                    lastListTitle.stop(true, true).animate(
                    {
                        'background-color': originalBackground
                    },
                    {
                        duration: 700,
                        complete: function () {
                            lastListTitle.css('background-color', '');
                        }
                    }
                    );
                }
            });
        };

        cleanNewForm = function () {
            viewModel.workflows.list()[0].WorkflowName(newWorkflowExtendedObj.WorkflowName || 'New Workflow');
            viewModel.workflows.list()[0].Description(newWorkflowExtendedObj.Description || '');
        };

        showNew = function (event) {
            var callback;

            if (viewModel.isNewOpen()) return;
            hideEdit();

            viewModel.isNewOpen(true);
            viewModel.workflows.list()[0].isOpen(true);

            // Cache the object panel if not
            if (newWorkflowJqObj === null) {
                newWorkflowJqObj = $(NEW_WORKFLOW_TITLE_SELECTOR);
                newWorkflowJqObjTitle = newWorkflowJqObj.find('.title:first');
                newWorkflowJqObjAnimationPanel = newWorkflowJqObj.find('.animationPanel');
                newWorkflowJqObj = true;
            }

            // Focus input title
            callback = function () {
                newWorkflowJqObjAnimationPanel.find('.focusMe').focus().select();
                bindDescriptionHeight(_newWorkflowTarget);
            };

            // Move iframe to top and open form
            $(document.body).animate({ scrollTop: 0 }, { duration: WORKFLOW_ANIMATION_DURATION });

            animateShowPanel(true /*isEditable*/, newWorkflowJqObjTitle, newWorkflowJqObjAnimationPanel, 0 /*No States*/, callback);
        };

        hideNew = function (endAnimationCallback) {
            var callback;

            cleanNewForm();
            cleanBackendErrors(viewModel.workflows.list()[0], _newWorkflowTarget);
            unbindDescriptionHeight(_newWorkflowTarget);

            if (!viewModel.isNewOpen()) return;

            viewModel.isNewOpen(false);
            callback = function () {
                viewModel.workflows.list()[0].isOpen(true);
                if (typeof endAnimationCallback == 'function') endAnimationCallback();
            };

            // Cache the object panel if not
            if (newWorkflowJqObj === null) {
                newWorkflowJqObj = $(NEW_WORKFLOW_TITLE_SELECTOR);
                newWorkflowJqObjTitle = newWorkflowJqObj.find('.title:first');
                newWorkflowJqObjAnimationPanel = newWorkflowJqObj.find('.animationPanel');
                newWorkflowJqObj = true;
            }

            animateHidePanel(newWorkflowJqObjTitle, newWorkflowJqObjAnimationPanel, callback);
        };

        toggleNew = function (workflow, event) {
            if (viewModel.isNewOpen()) {
                hideNew();
            } else {
                showNew(event);
            }
        };

        createWorkflow200Callback = function (data) {
            var newWorkflow, itemState, hideCallback;

            newWorkflow = {
                isSystem: false,
                isUsed: ko.observable(false),
                isAddStateBtnEnable: ko.observable(true),
                isOpen: ko.observable(false),
                isEditable: ko.observable(true),
                WorkflowId: ko.observable(data.Workflow.WorkflowId),
                WorkflowName: ko.observable(data.Workflow.WorkflowName)
                                .extend({
                                    required: true,
                                    minLength: 3,
                                    maxLength: 40
                                }),
                Description: ko.observable(data.Workflow.Description)
                                .extend({ maxLength: 255 }),
                States: ko.observableArray([]),
                NameErrors: ko.observableArray([]),
                DescriptionErrors: ko.observableArray([])
            };

            data.States.forEach(function (elemState) {
                itemState = {
                    StateName: ko.observable(elemState.StateName),
                    Order: ko.observable(elemState.Order),
                    IsSystem: ko.observable(elemState.IsSystem),
                    SendNotification: ko.observable(elemState.SendNotification),
                    SendNotificationToAdministrators: ko.observable(elemState.SendNotificationToAdministrators)
                };

                newWorkflow.States().push(itemState);
            });

            // Add new workflow to the end of workflows list and hightlight
            hideCallback = function () {
                viewModel.workflows.list.push(newWorkflow);
                highlightLastAdded();
            };

            hideNew(hideCallback);
        };

        createWorkflowErrorCallback = function (data, workflow, eventTarget) {
            var res, messages;
            if (data && data.status != 500) {
                if (data.responseJSON && data.responseJSON.Messages) messages = data.responseJSON.Messages;

                if (data.responseText) {
                    res = JSON.parse(data.responseText);
                    if (res.Messages) messages = res.Messages;
                }

                if (messages) showBackendErrors(workflow, eventTarget, messages);
                else $.dnnNotif({
                    text: _resx.unknown_error,
                    height: 70
                });
            } else {
                $.dnnNotif({
                    text: _resx.unknown_error,
                    height: 70
                });
            }
        };

        saveNew = function (bindedWorkflow, event) {
            var workflow, panel;

            cleanBackendErrors(bindedWorkflow, event.target);

            workflow = {
                WorkflowName: bindedWorkflow.WorkflowName(),
                Description: bindedWorkflow.Description() || ''
            };

            configServiceFramework();
            util.sf.post('Create', workflow, createWorkflow200Callback,
                function (data) {
                    createWorkflowErrorCallback(data, bindedWorkflow, event.target);
                });
        };

        showEdit = function (event, index) {
            var workflow, animationPanel, numberOfStates, callback;

            if (index === 0 || viewModel.isEditOpen()[index]) return;
            hideEdit();
            hideNew();

            viewModel.isEditOpen()[index] = true;
            workflow = viewModel.workflows.list()[index];

            workflow.isOpen(true);

            animationPanel = $('.workflowsListItem').eq(index).find('.animationPanel');
            numberOfStates = workflow.States().length;

            callback = function() {
                bindDescriptionHeight(event.target);
            };

            animateShowPanel(workflow.isEditable(), null /*Not hide title*/, animationPanel, numberOfStates, callback);

            _tmpEditedWorkflow.WorkflowName = workflow.WorkflowName();
            _tmpEditedWorkflow.Description  = workflow.Description();
            _tmpEditedWorkflow.index        = index;
            _tmpEditedWorkflow.event        = event;
        };

        hideEdit = function (index, force) {
            var workflowObj, callback;
            if (index === 0) return hideNew();
            if (!force && index !== undefined && (!viewModel.isEditOpen()[index])) return;

            if (index && index === _tmpEditedWorkflow.index) {
                unbindDescriptionHeight(_tmpEditedWorkflow.event.target);
                cancelEdited(viewModel.workflows.list()[index], _tmpEditedWorkflow.event, index);
            }

            // Search and close opened edit panel
            if (index === undefined) {
                viewModel.isEditOpen().forEach(function (elem, idx) {
                    if (elem === true) hideEdit(idx, true);
                });
                return;
            }

            viewModel.isEditOpen()[index] = false;
            callback = function () {
                viewModel.workflows.list()[index].isOpen(false);
            };

            workflowObj = $('.workflowsListItem').eq(index).find('.animationPanel');
            animateHidePanel(null /*not hide title*/, workflowObj, callback);
        };

        toggleEdit = function (workflow, event, index) {
            if (index === 0) {
                toggleNew(workflow, event, index);
            } else {
                if (viewModel.isEditOpen()[index]) {
                    cancelEdited(workflow, event, index);
                    hideEdit(index);
                } else {
                    showEdit(event, index);
                }
            }
        };

        bindDescriptionHeight = function (eventTarget) {
            var panel, infoBox, textarea, diff, infoBoxHeight, animationPanel, animationPanelHeight, currentinfoBoxHeight;

            panel = $(eventTarget).closest('li.workflowsListItem');
            infoBox  = panel.find('.info.description');
            textarea = panel.find('textarea');
            animationPanel = panel.find('.animationPanel');

            animationPanelHeight = animationPanel.height();
            setTimeout(function getInfoBoxHeight() {
                infoBoxHeight = infoBox.height();
            }, 0);

            textarea.on('keydown.contentWorkflow, onpaste.contentWorkflow', function handleTextareaText() {
                // Send to queue to wait ko bind
                setTimeout(function () {
                    currentinfoBoxHeight = infoBox.height();

                    if (currentinfoBoxHeight === infoBoxHeight) return;

                    if (currentinfoBoxHeight > infoBoxHeight) {
                        diff = currentinfoBoxHeight - infoBoxHeight;
                        animationPanelHeight = animationPanelHeight + diff;
                    } else {
                        diff = infoBoxHeight - currentinfoBoxHeight;
                        animationPanelHeight = animationPanelHeight - diff;
                    }
                    animationPanel.height(animationPanelHeight);
                    infoBoxHeight = infoBox.height();
                }, 0);
            });
        };

        unbindDescriptionHeight = function (eventTarget) {
            $(eventTarget).closest('li.workflowsList').find('textarea').off('keydown.contentWorkflow');
        };

        editWorkflow200Callback = function (data, workflow, editedWorkflow, eventTarget) {
            workflow.WorkflowName(editedWorkflow.WorkflowName);
            workflow.Description(editedWorkflow.Description);

            cleanEditedTmp();

            hideEdit();
        };

        editWorkflowErrorCallback = function (data, workflow, eventTarget) {
            var res, messages;
            if (data && data.status != 500) {
                if (data.responseJSON && data.responseJSON.Messages) messages = data.responseJSON.Messages;

                if (data.responseText) {
                    res = JSON.parse(data.responseText);
                    if (res.Messages) messages = res.Messages;
                }

                if (messages) showBackendErrors(workflow, eventTarget, messages);
                else $.dnnNotif({
                    text: _resx.workflows_unknown_error,
                    height: 70
                });
            } else {
                $.dnnNotif({
                    text: _resx.workflows_unknown_error,
                    height: 70
                });
            }
        };

        saveEdited = function (workflow, event, index) {
            var editedWorkflow;

            cleanBackendErrors(workflow, event.target);

            editedWorkflow = {
                WorkflowId: workflow.WorkflowId(),
                WorkflowName: workflow.WorkflowName(),
                Description: workflow.Description() || ''
            };

            configServiceFramework();
            util.sf.post('Edit', editedWorkflow,
                function (data) { editWorkflow200Callback(data, workflow, editedWorkflow, event.target); },
                function (data) { editWorkflowErrorCallback(data, workflow, event.target);});
        };

        delWorkflow200Callback = function (data, index) {
            viewModel.workflows.list.splice(index, 1);
            $.dnnNotif({
                text: _resx.workflows_notify_deleted,
                height: 70
            });
        };

        delWorkflowErrorCallback = function (data) {
            var messages, dialogObj, errorCallback;
            /*
            ERRORS
            1 - Messages field/value - associated to field
            2 - Messages field == '' - show in dialog
            3 - other = notify 'unknown error'
            */

            // 3
            if (!data.responseJSON || !data.responseJSON.Messages) {
                $.dnnNotif({
                    text: 'Error ' + data.status + ': ' + data.statusText,
                    height: 70
                });
            }

            // 2
            messages = [];
            for (var idx in data.responseJSON.Messages) {
                if (messages.Field === '') {
                    messages.push(data.responseJSON.Messages[idx]);
                }
            }

            if (messages.length > 0) {
                dialogObj = {
                    cancelBtnLbl: _resx.workflows_common_close_btn,
                    showAcceptBtn: false
                };

                // 412 - Resources using workflow
                if (data.status === 412) {
                    dialogObj.title = _resx.workflows_common_error_resource_busy;
                    dialogObj.errorClass = 'resourceBusy';
                } else {
                    dialogObj.title = _resx.workflows_common_errors_title;
                    dialogObj.errorClass = 'panel errors';
                }

                _personaBarDialog = new window.dnn.utils.KoBindedDialog(dialogObj, _htmlError, function () {
                    return {messages: ko.observableArray(messages)};
                });
            }
        };

        delWorkflow = function (index, event) {
            var workflow, title;
            event.stopPropagation();

            workflow = viewModel.workflows.list()[index];
            console.log('_resx.settings_common_confirm_delete_wf', _resx.settings_common_confirm_delete_wf);
            _confirmOpts.title = _resx.settings_common_confirm_delete_wf;
            _confirmOpts.text = _resx.workflows_confirm_delete_workflow.replace('{0}', workflow.WorkflowName());

            _confirmOpts.callbackTrue = function (data) {
                configServiceFramework();
                util.sf.post('Delete', {WorkflowId: workflow.WorkflowId()}, function (data) { delWorkflow200Callback(data, index); }, delWorkflowErrorCallback);
            };

            $.dnnConfirm(_confirmOpts);
        };

        delState = function (indexWorkflow, indexState, event) {
            var workflow, state, onConfirmCallback, panel;

            panel = $(event.target).closest('.animationPanel');
            workflow = viewModel.workflows.list()[indexWorkflow];
            state = workflow.States()[indexState];

            _dnnConfirmOptions.callbackTrue = function () {
                configServiceFrameworkStates();
                util.sf.post('delete',
                {
                    WorkflowId: workflow.WorkflowId(),
                    StateId:    state.StateId()
                },
                function (data) { delState200Callback(data, panel, workflow, indexState); }, delStateErrorCallback);
            };

            _dnnConfirmOptions.title = _resx.settings_common_confirm_delete_wf_state;
            _dnnConfirmOptions.text = _resx.workflows_confirm_delete_state.replace('{0}', state.StateName());

            $.dnnConfirm(_dnnConfirmOptions);
        };

        delState200Callback = function(data, panel, workflow, indexState) {
            var height;
            workflow.States.splice(indexState, 1);
            height = parseInt(panel.height(), 10);
            panel.height(height - STATE_ROW_HEIGHT);

            workflow.States().forEach(function (elem, idx) {
                elem.Order(idx+1);
            });
        };

        delStateErrorCallback = function(data) {
            var messages, json;

            if (!data.responseText) {
                $.dnnNotif({
                    text: _resx.workflows_unknown_error,
                    height: 70
                });
                return;
            }

            try {
                json = JSON.parse(data.responseText);
            } catch (err) {
                $.dnnNotif({
                    text: _resx.workflows_unknown_error,
                    height: 70
                });
                return;
            }

            if (!json.Messages) {
                $.dnnNotif({
                    text: _resx.workflows_unknown_error,
                    height: 70
                });
                return;
            }

            messages = '';
            for (var i in json.Messages) {
                if (typeof json.Messages[i].Description == 'string') messages += json.Messages[i].Description+'. ';
            }

            $.dnnNotif({
                text: messages,
                height: 70*json.Messages.length
            });
        };

        cleanEditedTmp = function() {
            _tmpEditedWorkflow.WorkflowName = null;
            _tmpEditedWorkflow.Description  = null;
            _tmpEditedWorkflow.index        = null;
            _tmpEditedWorkflow.event        = null;
        };

        cancelEdited = function (workflow, event, index) {
            workflow.WorkflowName(_tmpEditedWorkflow.WorkflowName);
            workflow.Description(_tmpEditedWorkflow.Description);

            cleanEditedTmp();

            cleanBackendErrors(workflow, event.target);
            hideEdit(index);
        };

        cancelNew = function (workflow, event) {
            hideNew();
        };

        showAddState = function (index, event) {
            var workflow, onCloseCallback;
            workflow = viewModel.workflows.list()[index];

            onCloseCallback = function (state) {
                var lastState, animationPanel;
                workflow.isAddStateBtnEnable(true);

                if (!state || !state.Order) return;

                state = {
                    isEditable: ko.observable(!state.IsSystem),
                    StateId:    ko.observable(state.StateId),
                    StateName:  ko.observable(state.StateName),
                    IsSystem:   ko.observable(state.IsSystem),
                    Order:      ko.observable(state.Order),
                    SendNotificationToAdministrators: ko.observable(state.SendNotificationToAdministrators),
                    SendNotification: ko.observable(state.SendNotification)
                };

                lastState = workflow.States.slice(-1).pop();
                lastState.Order(lastState.Order()+1);

                workflow.States.valueWillMutate();
                workflow.States()[workflow.States().length-1] = state;
                workflow.States.valueHasMutated();

                workflow.States.push(lastState);

                animationPanel = $(event.target).closest('.animationPanel');
                animationPanel.height(animationPanel.height() + STATE_ROW_HEIGHT);
            };

            _contentWorkflowsStates = new dnn.modules.workflows.WorkflowStatesManager(
                util,
                isMobile,
                'new',
                {
                    WorkflowID:   workflow.WorkflowId(),
                    WorkflowName: workflow.WorkflowName(),
                },
                { StateId: null },
                null /*afterBind*/,
                onCloseCallback);
            workflow.isAddStateBtnEnable(false);
        };

        showEditState = function (workflowIndex, stateIndex) {
            var workflow, state, onCloseCallback;

            workflow = viewModel.workflows.list()[workflowIndex];
            state = workflow.States()[stateIndex];

            onCloseCallback = function (stateSaved) {
                if (!stateSaved) return;

                state.StateName(stateSaved.StateName);
                state.SendNotification(stateSaved.SendNotification);
                state.SendNotificationToAdministrators(stateSaved.SendNotificationToAdministrators);
            };

            _contentWorkflowsStates = new dnn.modules.workflows.WorkflowStatesManager(
                util,
                isMobile,
                'edit',
                {
                    WorkflowID:   workflow.WorkflowId(),
                    WorkflowName: workflow.WorkflowName(),
                },
                {
                    StateId:   state.StateId(),
                    StateName: state.StateName(),
                    SendNotification: state.SendNotification(),
                    SendNotificationToAdministrators: state.SendNotificationToAdministrators(),
                },
                null /*afterBind*/,
                onCloseCallback
            );

            // TODO: Disable edit button (icon)
        };

        showBackendErrors = function (workflow, eventTarget, messages) {
            var panel, messageIdx, increasePanelHeight;
            panel = $(eventTarget).closest('.animationPanel');

            for (messageIdx in messages) {
                switch (messages[messageIdx].Field) {
                    case '':
                        //console.log('TODO: Show dialog error');
                        //dialogError.push(messages[messageIdx].Description);
                        break;

                    case 'WorkflowName':
                        workflow.NameErrors.push({ Description: messages[messageIdx].Description });
                        break;

                    case 'Description':
                        workflow.DescriptionErrors.push({ Description: messages[messageIdx].Description });
                        break;
                }
            }

            // Update panel size
            increasePanelHeight = 0;
            panel.find('ul.errors').each(function (idx, elem) {
                increasePanelHeight += $(elem).height();
            });
            panel.height(panel.height() + increasePanelHeight);
        };

        cleanBackendErrors = function (workflow, eventTarget) {
            var panel, decreaseHeight, elemObj;
            panel = $(eventTarget).closest('.animationPanel');

            decreaseHeight = 0;
            panel.find('ul.errors').each(function (idx, elem) {
                decreaseHeight += $(elem).height();
            });
            panel.height(panel.height() - decreaseHeight);

            workflow.NameErrors.removeAll();
            workflow.DescriptionErrors.removeAll();
        };

        move = function (stateId, direction, state, workflowIndex, stateIndex) {
            configServiceFrameworkStates();

            util.sf.post('ConmuteStates', {StateID: stateId, Direction: direction},
                function (data) {
                    move200Callback(data, direction,  state, workflowIndex, stateIndex);
                }, moveErrorCallback);
        };

        move200Callback = function (data, direction, state, workflowIndex, stateIndex) {
            var workflow, tmpUpOrDownState;

            workflow = viewModel.workflows.list()[workflowIndex];

            switch (direction) {
                case MOVE_UP:
                    tmpUpOrDownState = workflow.States()[stateIndex-1];

                    workflow.States.valueWillMutate();

                    workflow.States()[stateIndex-1] = state;
                    workflow.States()[stateIndex]   = tmpUpOrDownState;

                    state.Order(state.Order() - 1);
                    tmpUpOrDownState.Order(tmpUpOrDownState.Order() + 1);

                    workflow.States.valueHasMutated();
                break;

                case MOVE_DOWN:
                    tmpUpOrDownState = workflow.States()[stateIndex+1];

                    workflow.States.valueWillMutate();

                    workflow.States()[stateIndex+1] = state;
                    workflow.States()[stateIndex]   = tmpUpOrDownState;

                    state.Order(state.Order() + 1);
                    tmpUpOrDownState.Order(tmpUpOrDownState.Order() - 1);

                    workflow.States.valueHasMutated();
                break;
            }
        };

        moveErrorCallback = function () {
        };

        moveUp = function (state, workflowIndex, stateIndex) {
            move(state.StateId(), MOVE_UP, state, workflowIndex, stateIndex);
        };

        moveDown = function (state, workflowIndex, stateIndex) {
            move(state.StateId(), MOVE_DOWN, state, workflowIndex, stateIndex);
        };

        /* Public Methods */
        WorkflowsManager.prototype.load = function (params, callback) {
            if (this.isMobile) {
                return loadMobile(params, callback);
            } else {
                return loadWeb(params, callback);
            }
        };

        /* test-code */
        // TODO: Puts functions when class is finished
        /* end-test-code */

        return WorkflowsManager;

    })();

    // Add to dnn namespace
    window.dnn.modules.workflows.WorkflowsManager = WorkflowsManagerClass;

}).call(this);
