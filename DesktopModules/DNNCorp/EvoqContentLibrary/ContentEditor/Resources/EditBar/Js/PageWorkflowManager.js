/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

 /*jshint multistr:true */

/*
 * @class PageWorkflowManager
 *
 * @param {function} resquest, function to send request to the server.
 * @param {object} historyManager, an instance of @link{PageHistoryModel}.
 * @param {object} resx, resources to be used
 * @param {object} services, $.dnnSF() services
 * @param {bool} hasPendingChanges, indicates if there are pending changes in the current page
 * @param {object} imageInfo:
 * {
 *   {string} folder, folder where the images will be uploaded.
 *   {string} filter, extensions filter of the uploaded files.
 * }
 *
 */

// namespaces
window.dnn = window.dnn || {};
window.dnn.pageWorkflow = window.dnn.pageWorkflow || {};

(function IIFE() {
    var PageWorkflowManagerClass;

    PageWorkflowManagerClass = (function IIFE() {
        'use strict';

        var _browser, _request, _resx, _services, _state, _hasPendingChanges, _viewModel,
            _pageHistoryManager,
            _editBarDialog,
            _imageInfo, _imageCallbackInfo,
            _htmlSubmit, _htmlApprovalReject, _submitViewModel,
            _canEditThePage;

        var toogleUserMode,
            confirmAction,
            submit, approve, viewModelSubmitCallback, viewModelAproveCallback, viewModelDiscardCallback, viewModelRejectCallback, goNextOnSubmitCallback, goNextOnApprovalCallback,
            goPrevious, rejectCallback,
            discardWithComment, discardWithCommentCallback,
            publish, discard, close,
            createViewModel, isPrivatePage,
            getPublishingState, getPublishingState200Callback, getPublishingStateErrorCallback,
            publishingStateHasToBeUpdated, updateStateIfNeeded,
            configureVisibleControls,
            printInfo;

        /* Class properties */
        PageWorkflowManager.class = 'PageWorkflowManager';
        PageWorkflowManager.type = 'Class';

        /* Private Constants and Properties */
        _imageCallbackInfo = {};
        _htmlSubmit = '<div class="PageWorkflowMangaer message"><textarea rows="8" data-bind="value: message, valueUpdate: \'afterkeydown\'"></textarea></div>';

        _htmlApprovalReject =   '<div class="EditBarDialog message" data-bind="css: browser">\
                                    <textarea rows="8" data-bind="value: message, valueUpdate: \'afterkeydown\'"></textarea>\
                                    <ul class="errors" data-bind="foreach: messageErrors">\
                                        <li>\
                                            <span class="backError" data-bind="text: Description"></span>\
                                        </li>\
                                    </ul>\
                                </div>\
                                <div class="workflowManagerDropZone">\
                                    <div class="fileUploadZone" data-bind="fileUpload">\
                                        <input type="file" class="uploadFileInput normalFileUpload" />\
                                        <div class="paintImageZone"></div>\
                                        <div class="dropMessage">DROP_MSG</div>\
                                    </div>\
                                </div>';

        /* Constructor */
        function PageWorkflowManager(request, historyManager, resx, services, hasPendingChanges, imageInfo) {
            var agent, osx, dropMsg;

            _request = request;
            _pageHistoryManager = historyManager;
            _resx = resx;
            _services = services;
            _hasPendingChanges = hasPendingChanges;
            _imageInfo = imageInfo;

            // {0} => class for <span class="{0}">Browse</span>
            dropMsg = _resx.workflow_approval_reject_image_label.replace('{0}', 'browse').replace('{1}', 'data-bind="openBrowser"');
            _htmlApprovalReject = _htmlApprovalReject.replace(/DROP_MSG/m, dropMsg);

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

                default:
                _browser = 'unknown';
            }

            createViewModel();
            getPublishingState();
            isPrivatePage();

            ko.bindingHandlers.fileUpload = {
                init: function fileUpload(element, valueAccessor) {
                    var el = $(element);
                    el.EditBarWorkflowImageUpload({
                        paintInObj: el.closest('.workflowManagerDropZone').find('.paintImageZone'),
                        addElementDragover: el.closest('.workflowManagerDropZone'),
                        url: _services.getServiceRoot('internalservices') + "FileUpload/PostFile",
                        request: {
                            folder: imageInfo.folder,
                            filter: imageInfo.filter,
                            overwrite: "true"
                        },
                        imageCallbackInfo: _imageCallbackInfo,
                        paramName: "POSTFILE",
                        servicesFramework: _services,
                        param: valueAccessor()
                    });
                }
            };

            ko.bindingHandlers.openBrowser = {
                init: function (element, valueAccessor) {
                    var el = $(element);
                    el.on('click', function clickOpenBrowser(){
                        el.closest('.workflowManagerDropZone').find('.uploadFileInput').trigger('click');
                    });
                }
            };
        }

        confirmAction = function (options, yesAction, noAction) {
            $("<div class='dnnDialog'></div>").html(options.dialogText).dialog({
                modal: true,
                autoOpen: true,
                dialogClass: "dnnFormPopup",
                width: 400,
                height: 215,
                resizable: false,
                title: options.dialogTitle,
                buttons:
                [
                    {
                        id: "delete_button", text: options.yesText, "class": "dnnPrimaryAction", click: function () {
                            $(this).dialog("close");
                            if (yesAction && typeof yesAction == 'function') {
                                yesAction();
                            }
                        }
                    },
                    {
                        id: "cancel_button", text: options.noText, click: function () {
                            $(this).dialog("close");
                            if (noAction && typeof noAction == 'function') {
                                noAction();
                            }
                        }, "class": "dnnSecondaryAction"
                    }
                ]
            });
        };

        publishingStateHasToBeUpdated = function () {
            return _state && _state.IsCompleteWorkflow;
        };

        isPrivatePage = function() {
            _request('EvoqContentLibrary',
                'Common',
                'IsPrivatePage',
                'get',
                null,
                function (data) {
                    _viewModel.isPrivatePage(data);
                },
                getPublishingStateErrorCallback
            );
        };

        getPublishingState = function () {
            _request('EvoqContentLibrary', 'Publishing', 'GetPublishingState', 'get', null, getPublishingState200Callback, getPublishingStateErrorCallback);
        };

        updateStateIfNeeded = function () {
            if (publishingStateHasToBeUpdated()) {
                getPublishingState();
            } else {
                configureVisibleControls();
            }
        };

        createViewModel = function () {
            _viewModel = {
                close: close,
                goPrevious: goPrevious,
                submit: submit,
                approve: approve,
                isApprovalAction: ko.observable(false),
                publish: publish,
                discard: discard,
                discardWithComment: discardWithComment,
                hasPrevious: ko.observable(false),
                hasNext: ko.observable(false),
                isPublishAvailable: ko.observable(false),
                isDiscardAvailable: ko.observable(false),
                isDiscardWithCommentAvailable: ko.observable(false),
                isCloseAvailable: ko.observable(false),
                isSaveDraftAvailable: ko.observable(false),
                isEditableByUser: ko.observable(false),
                hasPendingChanges: ko.observable(_hasPendingChanges),
                info: ko.observable(""),
                isPrivatePage: ko.observable(false)
            };
        };

        printInfo = function () {
            if (!_state) {
                return "";
            }

            var isEditor = _canEditThePage(_state);
            var isEditorOnDraft = isEditor && _state.PreviousState === null;
            var editableInfo = (_state.IsEditableByUser || isEditorOnDraft) ? _resx.message_ChangesNotPublished : _resx.workflow_hasStateReviewerPermission_errorMessage;
            var workflowInfo = (_state.IsCompleteWorkflow) ? "" : editableInfo;

            return workflowInfo;
        };

        /* Private Methods */
        getPublishingState200Callback = function (data) {
            _state = data.State;
            PageWorkflowManager.prototype.updateHistoryList();
            configureVisibleControls();
        };

        getPublishingStateErrorCallback = function (e) {
            var response, message;

            if (e.status == 500) {
                response = $.parseJSON(e.responseText);
                message = response.ExceptionMessage || response.Message;
                $.dnnAlert({
                    title: _resx.WorkFlowErrorTitle,
                    text: message ? message.replace(/^"(.+(?="$))"$/, '$1') : ""
                });
            } else {
                response = $.parseJSON(e.responseText);
                message = response.Message;
                $.dnnAlert({
                    title: _resx.WorkFlowErrorTitle,
                    text: message
                });
            }
        };

        _canEditThePage = function (state) {
            var isPageEditor = dnn.getVar('cem_isPageEditor').toLowerCase();
            if (isPageEditor == "true") {
                return state.PreviousState === null;
            }
            return false;
        };

        configureVisibleControls = function () {
            if (_state) {
                var isEditor = _canEditThePage(_state);
                _viewModel.isEditableByUser(_state.IsEditableByUser || isEditor);

                _viewModel.hasPrevious(_viewModel.isEditableByUser() && _viewModel.hasPendingChanges() && _state.PreviousState);
                _viewModel.hasNext(_viewModel.isEditableByUser() && _viewModel.hasPendingChanges() && !_state.ReadyToBePublished && _state.NextState);
                _viewModel.isPublishAvailable(_viewModel.isEditableByUser() && _viewModel.hasPendingChanges() && _state.ReadyToBePublished);
                _viewModel.isDiscardAvailable(_viewModel.isEditableByUser() && _viewModel.hasPendingChanges() && !_state.PreviousState);
                _viewModel.isDiscardWithCommentAvailable(_viewModel.isEditableByUser() && !_viewModel.isDiscardAvailable());
                _viewModel.isSaveDraftAvailable(_viewModel.isEditableByUser() && _viewModel.hasPendingChanges() && _state.IsSaveDraftWorkflow);

                var isCloseAvailableSaveDraftWorkflow = _state.IsSaveDraftWorkflow && !_viewModel.hasPendingChanges() && (!_viewModel.isEditableByUser() || _state.CanStayInDraft);
                var isCloseAvailableOtherWorkflows = !_state.IsSaveDraftWorkflow && (!_viewModel.hasPendingChanges() || !_viewModel.isEditableByUser() || _state.CanStayInDraft);
                _viewModel.isCloseAvailable(isCloseAvailableSaveDraftWorkflow || isCloseAvailableOtherWorkflows);

                _viewModel.isApprovalAction(!_state.ReadyToBePublished && _state.PreviousState);

                _viewModel.info(printInfo());
            }
        };

        /* Private Methods */
        // mode => VIEW | EDIT | LAYOUT
        toogleUserMode = function (mode) {
            _request('internalservices', 'controlBar', 'ToggleUserMode', 'post', { UserMode: mode }, function () {
                if (mode !== 'EDIT') {
                     document.cookie = document.cookie.replace('StayInEditMode=YES', 'StayInEditMode=NO');
                }
                window.location.reload();
            }, function () {
                // failed...
            });
        };

        close = function () {
            toogleUserMode("VIEW");
        };

        viewModelSubmitCallback = function () {
            _submitViewModel = {
                browser: _browser,
                message: ko.observable(""),
                messageErrors: ko.observableArray([])
            };

            return _submitViewModel;
        };

        viewModelAproveCallback = function () {
            _submitViewModel = {
                browser: _browser,
                message: ko.observable(""),
                messageErrors: ko.observableArray([])
            };

            return _submitViewModel;
        };

        viewModelDiscardCallback = function () {
            _submitViewModel = {
                browser: _browser,
                message: ko.observable(""),
                messageErrors: ko.observableArray([])
            };

            return _submitViewModel;
        };

        viewModelRejectCallback = function () {
            _submitViewModel = {
                browser: _browser,
                message: ko.observable("").extend({required: true}),
                messageErrors: ko.observableArray([])
            };

            _submitViewModel.enableAcceptForDialog = function () {
                if (_submitViewModel.message().length === 0 ) {
                    _submitViewModel.message(' ');
                    _submitViewModel.message('');
                }
                return _submitViewModel.message.isValid();
            };

            return _submitViewModel;
        };

        goNextOnSubmitCallback = function () {
            _request('EvoqContentLibrary', 'Publishing', 'SubmitChanges', 'post', { CurrentStateId: _state.CurrentState.StateID, Message: _submitViewModel.message() }, getPublishingState200Callback, getPublishingStateErrorCallback);
        };

        goNextOnApprovalCallback = function () {
            var params = { CurrentStateId: _state.CurrentState.StateID, Message: _submitViewModel.message() };
            if (_imageCallbackInfo.filePath) {
                params.ImagePath = _imageCallbackInfo.filePath;
                params.ImageId = _imageCallbackInfo.fileId;
            }
            _request('EvoqContentLibrary', 'Publishing', 'SubmitChanges', 'post', params, getPublishingState200Callback, getPublishingStateErrorCallback);
        };

        rejectCallback = function () {
            if (!_submitViewModel.message.isValid) return;

            var params = { CurrentStateId: _state.CurrentState.StateID, Message: _submitViewModel.message() };
            if (_imageCallbackInfo.filePath) {
                params.ImagePath = _imageCallbackInfo.filePath;
                params.ImageId = _imageCallbackInfo.fileId;
            }
            _request('EvoqContentLibrary', 'Publishing', 'RejectChanges', 'post', params, getPublishingState200Callback, getPublishingStateErrorCallback);
        };

        submit = function () {
            _imageCallbackInfo = {};
            _editBarDialog = new window.dnn.editBar.PersonaBarDialog({
                width: 419,
                title: _resx.workflow_submit_title,
                innerTitle: _resx.workflow_submit_innerTitle,
                cancelBtnLbl: _resx.WorkFlowDiscardConfirmCancel,
                acceptBtnLbl: _resx.workflows_submit_accept_btn,
                showAcceptBtn: true,
                onAcceptCallback: goNextOnSubmitCallback,
            }, _htmlSubmit, viewModelSubmitCallback, null);
        };

        approve = function () {
            _imageCallbackInfo = {};
            _editBarDialog = new window.dnn.editBar.PersonaBarDialog({
                width: 419,
                title: _resx.workflow_approval_title,
                innerTitle: _resx.workflow_approval_innerTitle,
                cancelBtnLbl: _resx.workflows_common_cancel_btn,
                acceptBtnLbl: _resx.workflows_approve_accept_btn,
                showAcceptBtn: true,
                onAcceptCallback: goNextOnApprovalCallback,
            }, _htmlApprovalReject, viewModelAproveCallback, null);
        };

        // Reject
        goPrevious = function () {
            _imageCallbackInfo = {};
            _editBarDialog = new window.dnn.editBar.PersonaBarDialog({
                width: 419,
                title: _resx.workflow_rejection_title,
                innerTitle: _resx.workflow_rejection_innerTitle,
                cancelBtnLbl: _resx.workflows_common_cancel_btn,
                acceptBtnLbl: _resx.workflows_reject_accept_btn,
                showAcceptBtn: true,
                onAcceptCallback: rejectCallback,
            }, _htmlApprovalReject, viewModelRejectCallback, null);
        };

        publish = function() {
            if (_request && typeof _request == 'function') {
                var params = { CurrentStateId: _state.CurrentState.StateID };
                _request('EvoqContentLibrary', 'Publishing', 'PublishTab', 'post', params, function() {
                        $.dnnNotif({
                            dialogClass: 'noTittle',
                            height: 50,
                            styleBlue: true,
                            text: _resx.page_published_successfully,
                            onCloseCallback: function() { toogleUserMode("VIEW"); }
                        });
                    },
                    getPublishingStateErrorCallback);
            }
        };

        discardWithComment = function () {
            _imageCallbackInfo = {};
            _editBarDialog = new window.dnn.editBar.PersonaBarDialog({
                title: _resx.WorkFlowDiscardTitle,
                innerTitle: _resx.workflow_discard_innerTitle,
                cancelBtnLbl: _resx.WorkFlowDiscardConfirmCancel,
                acceptBtnLbl: _resx.WorkFlowDiscardConfirmYes,
                showAcceptBtn: true,
                onAcceptCallback: discardWithCommentCallback,
                width: '420px'
            }, _htmlApprovalReject, viewModelDiscardCallback, null);
        };

        discardWithCommentCallback = function () {
            var params = { CurrentStateId: _state.CurrentState.StateID, Message: _submitViewModel.message() };
            if (_imageCallbackInfo.filePath) {
                params.ImagePath = _imageCallbackInfo.filePath;
                params.ImageId = _imageCallbackInfo.fileId;
            }

            if (_request && typeof _request == 'function') {
                _request('EvoqContentLibrary', 'Publishing', 'DiscardTab', 'post', params, function () {
                    toogleUserMode("VIEW");
                },
                getPublishingStateErrorCallback);
            }
        };

        discard = function () {
            var options = {
                dialogTitle: _resx.WorkFlowDiscardTitle,
                dialogText: _resx.WorkFlowDiscardConfirmText,
                yesText: _resx.WorkFlowDiscardConfirmYes,
                noText: _resx.WorkFlowDiscardConfirmCancel
            };

            confirmAction(options, function () {
                var params = { CurrentStateId: _state.CurrentState.StateID };
                if (_request && typeof _request == 'function') {
                    _request('EvoqContentLibrary', 'Publishing', 'DiscardTab', 'post', params, function () {
                        $.dnnNotif({
                            dialogClass: 'noTittle',
                            height: 50,
                            styleBlue: true,
                            text: _resx.page_discarded_successfully,
                            onCloseCallback: function() {toogleUserMode("VIEW");}
                        });
                    },
                    getPublishingStateErrorCallback);
                }
            }, function () {

            }
            );
        };

        /* Public Methods */
        PageWorkflowManager.prototype.getViewModel = function () {
            return _viewModel;
        };

        PageWorkflowManager.prototype.hasPendingChanges = function (visible) {
            _viewModel.hasPendingChanges(visible);
            if (visible) {
                updateStateIfNeeded();
            }
        };

        PageWorkflowManager.prototype.updateHistoryList = function () {
            if (_state && !_state.IsCompleteWorkflow) {
                _pageHistoryManager.modifyLastVersionState(_state.CurrentState.StateName);
            }
        };

        PageWorkflowManager.prototype.isPrivatePage = function () {
            isPrivatePage();
        }

        PageWorkflowManager.prototype.getPublishingState = function () {
            getPublishingState();
        }

        /* test-code */
        // TODO: Expose private Methods for test when class is finished
        // PageWorkflowManager.prototype.privateMethod = privateMethod;
        /* end-test-code */

        return PageWorkflowManager;
    })();

    window.dnn.pageWorkflow.PageWorkflowManager = PageWorkflowManagerClass;

}).call(this);
