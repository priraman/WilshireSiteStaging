/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

/*jshint multistr:true */

/*
 * @class ContentWorkflowsStates
 *
 * @param {object} utils, utils.js lib object
 * @param {bool} isMobile, load web or mobile
 * @param {int} stateID
 * @param {function} afterBindCallback (null), function called after bind and before show dialog
 * @param {function} onCloseCallback(state) (null), function called on close dialog and passet to it a state if saved
 *
 * For use with ContentWorkflows, controls the management of states in dialog (PersonaBarDialog)
 */

define([
	'jquery',
	'knockout',
	'../scripts/PersonaBarDialog',
	'knockout.validation.min',
	'jquery.tokeninput.min',
	'css!../css/permissionGrid.css',
	'../scripts/permissionGrid',
	'../scripts/permissionGridManager'],

function ($, ko, PersonaBarDialog) {
	var ContentWorkflowsStatesClass;

	ContentWorkflowsStatesClass = (function IIFE() {
		'use strict';
		// _self is for gridPermissions
		var _browser, _self, _util, _isMobile, _isNew, _html, _onCloseCallback, _resx, _workflow, _viewModel, _saved, _state, _permissionGrid,
			_personaBarDialog, _afterBindCallback, _gridContainer;

		var loadWeb, loadMobile, configServiceFramework, returnViewModelCallback, afterBind,
			afterBind200Callback, afterBindErrorCallback, onCloseDialogCallback, validateStateName,
			acceptAddNewState, addNewState200Callback, addNewStateErrorCallback, enableAcceptForDialog,
			acceptEditState, editState200Callback, editStateErrorCallback, editAndAdderrosCallback;

		/* Class properties */
		ContentWorkflowsStates.class = 'ContentWorkflowStates';
		ContentWorkflowsStates.type  = 'Class';

		/* Private Constants and Properties */
		_html = '<div class="panel firstPanel workflowState">\
					<label class="state" data-bind="text: stateNameLbl"></label><br><br>\
					<input class="stateName" type="text" data-bind="value: stateName, valueUpdate: \'afterkeydown\', event: {blur: validateStateName}" >\
					<ul class="errors" data-bind="foreach: nameErrors">\
						<li>\
							<span class="backError" data-bind="text: Description"></span>\
						</li>\
					</ul>\
				</div>\
				<div class="panel">\
					<label class="state" data-bind="text: reviewers"></label><br><br>\
					<span data-bind="text: reviewersDescription"></span><br><br><br>\
					<div id="page-permissions"></div>\
				</div>\
				<div class="panel">\
					<input type="checkbox" data-bind="checked: chboxNotifAuthorVal"> <span data-bind="text: chboxNotifAuthorTxt"></span><br><br>\
					<input type="checkbox" data-bind="checked: chboxNotifAdminVal"> <span data-bind="text: chboxNotifAdminTxt"></span>\
				</div>';

		_util = null;
		_isMobile = false;
		_resx = null;
		_workflow = null;
		_state = null;
		_afterBindCallback = null;

		/* Constructor */
		function ContentWorkflowsStates(util, isMobile, newOrEdit, workflow, state, afterBindCallback, onCloseCallback) {
			//console.log('~ContentWorkflowsStates');
			var inObject;
			_self = this; // For permissionGrid

			if (!util) throw 'ContentWorkflowsStates: No util provided';
			_util = util;
			_resx = util.resx.ContentPB;

			if (!isMobile) isMobile = false;
			_isMobile = isMobile;

			_isNew = newOrEdit.toLowerCase() === 'new';

			if (!workflow) throw 'ContentWorkflowsStates: No workflow provided';
			_workflow = workflow;

			if (!state) throw 'ContentWorkflowsStates: No state provided';
			_state = state;

			_afterBindCallback = afterBindCallback;
			_onCloseCallback   = onCloseCallback;

			configServiceFramework();
			inObject = $('body');
			setTimeout(function() {
				_personaBarDialog = new PersonaBarDialog({
					closeOnAccept:    false,
					inObject:         inObject,
					width:            771,
					title:            _isNew ? _resx.workflows_edit_states_title_new : _resx.workflows_edit_states_title_edit,
					innerTitle:       _state.StateName ? _resx.workflows_edit_states_inner_title.replace('{0}', _state.StateName) : _resx.workflows_new_state_inner_title.replace('{0}', _workflow.WorkflowName),
					cancelBtnLbl:     _resx.workflows_common_cancel_btn,
					acceptBtnLbl:     _resx.workflows_common_accept_btn,
					onAcceptCallback: _isNew ? acceptAddNewState : acceptEditState,
					onCloseCallback:  onCloseDialogCallback
				}, _html, returnViewModelCallback, afterBind);
			}, 0);
		}

		/* Private Methods */
		loadWeb = function (params, callback) {
		};

		loadMobile = function (params, callback) {
		};

		// Request Service
		configServiceFramework = function () {
			_util.sf.moduleRoot = 'EvoqContentLibrary';
			_util.sf.controller = 'WorkflowStates';
		};

		// ViewModel
		returnViewModelCallback = function () {
			_viewModel = {
				browser: 		_browser,
				reviewers:      ko.observable(_resx.workflows_states_reviewers),
				reviewersDescription: ko.observable(_resx.workflows_states_reviewers_description),
				stateNameLbl:   ko.observable(_resx.workflows_edit_states_name_lbl),
				stateName:      ko.observable(_state.StateName || '').extend({
												required: true,
												minLength: 3,
												maxLength: 40
											}),
				nameErrors:     ko.observableArray([]),
				chboxNotifAuthorTxt: ko.observable(_resx.workflows_edit_states_notify_author),
				chboxNotifAdminTxt:  ko.observable(_resx.workflows_edit_states_notify_admin),
				WorkflowName: ko.observable(_workflow.workflowName),
				chboxNotifAuthorVal: ko.observable(_isNew ? true : _state.SendNotification),
				chboxNotifAdminVal:  ko.observable(_state.SendNotificationToAdministrators),
				validateStateName:     validateStateName,
				enableAcceptForDialog: enableAcceptForDialog
			};

			return _viewModel;
		};

		enableAcceptForDialog = function () {
			if (_viewModel.stateName().length === 0 ) {
				_viewModel.stateName(' ');
				_viewModel.stateName('');
			}
			return _viewModel.stateName.isValid();
		};

		validateStateName = function () {
			if (_viewModel.stateName().length === 0 ) {
				_viewModel.stateName(' ');
				_viewModel.stateName('');
			}
			return _viewModel.stateName.isValid();
		};

		// Add Permission Grid
		afterBind = function () {
			if (_state.stateId !== null ) {
				_gridContainer = $('#page-permissions');
				configServiceFramework();
				_util.sf.post('GetPermissionsData', {StateId: _state.StateId}, afterBind200Callback, afterBindErrorCallback);
			}

			if (typeof _afterBindCallback === 'function') _afterBindCallback();
		};

		afterBind200Callback = function (data) {
			dnn.controls.PermissionGrid.resx = _resx;

			// Config PermissionGrid Text Resources
			dnn.controls.PermissionGrid.resx = _resx;

			// Create PermissionGrid
			_permissionGrid = new dnn.controls.PermissionGrid(_self /* parent */, data);

			// Add table
			_gridContainer.prepend(_permissionGrid.getLayout());

			setTimeout(function () {
				_personaBarDialog.updateHeight(700);
			}, 500);

			_permissionGrid.getLayout().on('tableUpdated', function() {
				_personaBarDialog.updateHeight();
			});
		};

		afterBindErrorCallback = function (data) {
			console.log('afterBindErrorCallback', data);
		};

		// Add New State
		acceptAddNewState = function () {
			configServiceFramework();
			_util.sf.post('Create',
			{
				WorkflowId: _workflow.WorkflowID,
				State: {
					StateName: _viewModel.stateName(),
					SendNotificationToAdministrators: _viewModel.chboxNotifAdminVal() === true,
					SendNotification: _viewModel.chboxNotifAuthorVal() === true
				},
				Permissions: _permissionGrid.getPermissions()
			}, addNewState200Callback, addNewStateErrorCallback);
		};

		addNewState200Callback = function (data) {
			_saved = true;
			_state = data.State;
			_personaBarDialog.close();
		};

		addNewStateErrorCallback = function (data) {
			editAndAdderrosCallback(data);
		};

		// Edit State
		acceptEditState = function () {
			_state = {
				StateId:   _state.StateId,
				StateName: _viewModel.stateName(),
				SendNotificationToAdministrators: _viewModel.chboxNotifAdminVal() === true,
				SendNotification: _viewModel.chboxNotifAuthorVal() === true
			};

			configServiceFramework();
			_util.sf.post('Edit',
			{
				WorkflowId: _workflow.WorkflowID,
				State: _state,
				Permissions: _permissionGrid.getPermissions()
			}, editState200Callback, editStateErrorCallback);
		};

		editState200Callback = function () {
			_saved = true;
			_personaBarDialog.close();
		};

		editStateErrorCallback = function (data) {
			editAndAdderrosCallback(data);
		};

		// Errors
    editAndAdderrosCallback = function(data) {
        var messages;
        _saved = false;
        if (!data) _util.notify(_resx.workflows_unknown_error);
        if (data.status === 500) _util.notify('Error ' + data.status + ': ' + data.statusText);

        messages = data.responseJSON.Messages;
        _viewModel.nameErrors.removeAll();

        for (var messageIdx in messages) {
            switch (messages[messageIdx].Field) {
            case '':
                // TODO: Show dialog error. (Version stacked dialog)
                // dialogError.push(messages[messageIdx].Description);
                break;

            case 'StateName':
                _viewModel.nameErrors.push({ Description: messages[messageIdx].Description });
                break;
            }
        }
    };

		// Close
		onCloseDialogCallback = function() {
			if (typeof _onCloseCallback !== 'function') return;
			_onCloseCallback(_saved === true ? _state : null);
		};

		/* Public Methods */

		// Puts '_' in public method because of permissionGrid
		ContentWorkflowsStates.prototype._getService = function () {
			configServiceFramework();
			return _util.sf;
		};

		ContentWorkflowsStates.prototype.load = function (params, callback) {
			if (this.isMobile) {
				return loadMobile(params, callback);
			} else {
				return loadWeb(params, callback);
			}
		};

		/* test-code */
		// TODO: Puts function when class is finished
		/* end-test-code */

		return ContentWorkflowsStates;
	})();

	return ContentWorkflowsStatesClass;
});
