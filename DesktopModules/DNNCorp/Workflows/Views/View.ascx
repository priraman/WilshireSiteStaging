<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="View.ascx.cs" Inherits="DotNetNuke.Professional.Workflows.View" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<div class="workflowspanelbody" id="workflows-panel">
    <div id="workflowIndexTemplate" class="workflowIndexTemplate" data-module="<%= ModuleId %>">
        <p data-bind="text: workflows.page.description"></p>

        <div class="workflows" style="display:none;" data-bind="visible: koBinded">
            <div class="actionsHeader">
                <!-- Create New Workflow -->
                <button class="left dnnPrimaryAction" data-bind="click: showNew, text: workflows.page.newWorkflowBtn"></button>
            </div>

            <div class="headersForList">
                <div class="workflowType" data-bind="text: workflows.header.workflowType"></div>
                <div class="inUse" data-bind="text: workflows.header.inUse"></div>
                <div class="actions" data-bind="text: workflows.header.actions"></div>
            </div>

            <!-- List of Workflows (first Workflow is new Workflow) -->
            <ul class="workflowsList" data-bind="template: {foreach: workflows.list}">
                <li class="workflowsListItem" data-bind="css: $parent.firstWorkflowClass($index())">
                    <!-- Workflow title -->
                    <div class="title" data-bind="click: function(data, event) {$parent.toggleEdit(data, event, $index())}, css: {active: isOpen(), odd: $index() % 2 === 0, even: $index() % 2 === 1}">

                        <!-- Workflow name -->
                        <div class="name" data-bind="text: WorkflowName"></div>

                        <!-- Workflow actions Actions -->
                        <div class="actions" data-bind="css: isOpen() ? 'open' : ''">
                            <!-- Used (✓) -->
                            <div class="icon inUse" data-bind="css: isUsed() ? '' : 'notUsed'"></div>

                            <div class="hiddenActions" data-bind="css: isOpen() ? 'open' : ''">
                                <!-- Arrow -->
                                <div class="icon arrow" data-bind="css: isOpen() ? 'open' : ''"></div>

                                <!-- Lock -->
                                <div class="icon lock qaTooltip" data-bind="visible: isSystem && ! isOpen()">
                                    <div class="tag-menu">
                                        <p data-bind="text: $parent.workflows.tooltip.lock"></p>
                                    </div>
                                </div>

                                <!-- Delete (x) -->
                                <div class="icon delete" data-bind="visible: !isOpen() && isEditable() && !isUsed(),
                                        click: function(data, event) {$parent.delWorkflow($index(), event)}">D</div>

                                <!-- Edit (pen) -->
                                <div class="icon edit" data-bind="visible: !isOpen(), css: (isUsed() && !isSystem) ? 'lockDelSpace' : ''">E</div>
                            </div>

                        </div>
                    </div>

                    <!-- Workflow details -->
                    <div class="animationPanel">
                        <div class="detailsPanel" id="workflowEditTemplate">
                            <div class="info description" data-bind="visible: Description">
                                <div data-bind="css: {spaceInfo: Description}"></div>
                                <div class="text" data-bind="text: Description"></div>
                                <div data-bind="css: {spaceInfo: Description}"></div>
                            </div>

                            <div class="resourcesInfo" data-bind="visible: isUsed()">
                                <div data-bind="css: {spaceInfo: isUsed()}"></div>
                                <div class="icon info left"></div>
                                <div class="infoText left" data-bind="text: $parent.workflows.page.resources_info"></div>
                                <a class="right" data-bind="text: $parent.workflows.page.resources_link, click: $parent.showResources"></a>
                                <div data-bind="css: {spaceInfo: isUsed()}"></div>
                            </div>

                            <hr class="bigHR clearBoth" />

                            <!-- States -->
                            <div class="states" data-bind="visible: $index() != 0">
                                <div class="header">
                                    <h3 data-bind="text: $parent.workflows.page.states.title"></h3>
                                    <span data-bind="text: $parent.workflows.page.states.description"></span>
                                </div>

                                <table class="cmxtbl" id="influencetbl">
                                    <thead>
                                        <tr>
                                            <!-- Order -->
                                            <th>
                                                <span data-bind="text: $parent.workflows.page.table.order"></span>
                                            </th>
                                            <!-- State Name -->
                                            <th data-bind="text: $parent.workflows.page.table.state"></th>
                                            <!-- Actions -->
                                            <th data-bind="visible: (isEditable() || (isSystem && States().length > 2)), text: $parent.workflows.page.table.actions"></th>
                                            <!-- Move -->
                                            <th data-bind="visible: isEditable() || (isSystem && States().length > 2), text: $parent.workflows.page.table.move"></th>
                                        </tr>
                                    </thead>

                                    <tbody data-bind="foreach: States">
                                        <tr data-bind="css: {odd: $index()%2 === 0, even: $index()%2 === 1}">
                                            <!-- Order -->
                                            <td width="10%"><span data-bind="text: Order"></span></td>
                                            <!-- State Name -->
                                            <td width="70%"><span data-bind="text: StateName "></span></td>
                                            <!-- Actions -->
                                            <td width="10%" class="actions" data-bind="visible: ($parent.isEditable() || ($parent.isSystem && $parent.States().length > 2))">
                                                <div data-bind="visible: $index() !== 0 && $index() !== ($parent.States().length -1)">
                                                    <!-- Action EDIT -->
                                                    <div class="item">
                                                        <div class="icon edit" data-bind="click: $root.showEditState.bind($data, $parentContext.$index(), $index())">E</div>
                                                    </div>
                                                    <div class="item separator"></div>
                                                    <!-- Action DELETE -->
                                                    <div class="item">
                                                        <div class="icon delete" data-bind="visible: !$parent.isSystem, click: function (data, event) {$root.delState($parentContext.$index(), $index(), event)}">D</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <!-- Move -->
                                            <td width="10%" class="move" data-bind="visible: $parent.isEditable() || ($parent.isSystem && $parent.States().length > 2)">
                                                <div data-bind="visible: $index() !== 0 && $index() !== ($parent.States().length -1)">
                                                    <!-- Move UP -->
                                                    <div class="item" data-bind="visible: $index() !== 1">
                                                        <div class="icon moveUp"  data-bind="click: function(data, event) {$root.moveUp(data, $parentContext.$index(), $index())}"></div>
                                                    </div>
                                                    <!-- Move DOWN -->
                                                    <div class="item" data-bind="visible: $index() !== ($parent.States().length - 2)">
                                                        <div class="icon moveDown" data-bind="click: function(data, event) {$root.moveDown(data, $parentContext.$index(), $index())}, css: {first: $index() === 1}"></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <button class="addAState dnnPrimaryAction" data-bind="click: function(data, event) {$parent.showAddState($index(), event)}, visible: isEditable, enable: isAddStateBtnEnable">
                                    <span data-bind="text: $parent.workflows.page.form.addStateBtn"></span>
                                </button>

                                <hr data-bind="visible: isEditable, enable: isAddStateBtnEnable"/>
                            </div>

                            <!-- Title and Description -->
                            <div class="generalSettings">
                                <div class="titleSettings">
                                    <label class="title" data-bind="text: $parent.workflows.page.form.title"></label><br />
                                    <input class="focusMe" type="text" data-bind="value: WorkflowName, valueUpdate: 'afterkeydown'" />
                                    <ul class="errors" data-bind="foreach: NameErrors">
                                        <li>
                                            <span class="backError" data-bind="text: Description"></span>
                                        </li>
                                    </ul>
                                </div>

                                <br />

                                <div class="description">
                                    <label class="title" data-bind="text: $parent.workflows.page.form.description"></label><br />
                                    <textarea rows="8" data-bind="value: Description, valueUpdate: 'afterkeydown'"></textarea>
                                    <ul class="errors" data-bind="foreach: DescriptionErrors">
                                        <li>
                                            <span class="backError" data-bind="text: Description"></span>
                                        </li>
                                    </ul>
                                </div>

                                <div class="actions">
                                    <!-- New Workflow -->
                                    <button class="dnnSecondaryAction" data-bind="click: $parent.cancelNew, visible: $index() === 0">
                                        <span data-bind="text: $parent.workflows.page.form.cancel"></span>
                                    </button>
                                    <button class="dnnPrimaryAction" data-bind="click: $parent.saveNew,
                                        visible: $index() === 0,
                                        enable: WorkflowName.isValid() && Description.isValid(),
                                        css: { disabled: !(WorkflowName.isValid() && Description.isValid()), lastTag: ($index() === 0) }">
                                        <span data-bind="text: $parent.workflows.page.form.save"></span>
                                    </button>

                                    <!-- Edited Workflow -->
                                    <button class="dnnSecondaryAction" data-bind="click: function(data, event) {$parent.cancelEdited(data, event, $index())},
                                        visible: $index() !== 0">
                                        <span data-bind="text: $parent.workflows.page.form.cancel"></span>
                                    </button>
                                    <button class="dnnPrimaryAction" data-bind="click: function(data, event) {$parent.saveEdited(data, event, $index())},
                                        visible: $index() !== 0,
                                        enable: WorkflowName.isValid() && Description.isValid(),
                                        css: { disabled: !(WorkflowName.isValid() && Description.isValid()), lastTag: ($index() !== 0) }">
                                        <span data-bind="text: $parent.workflows.page.form.save"></span>
                                    </button>
                                </div>
                            </div>

                        </div><!-- /detailsPanel -->
                    </div>

                </li>
            </ul>
        </div>

    </div>
</div>

<div class="default-workflow-settings">
    <div class="dnnFormItem">
        <dnn:label id="DefaultPageWorkflowLabel" runat="server" controlname="DefaultPageWorkflowComboBox" />  
        <dnn:DnnComboBox ID="DefaultPageWorkflowComboBox" runat="server" DataValueField="WorkflowID" DataTextField="WorkflowName"></dnn:DnnComboBox>  
    </div>
    <ul class="dnnActions dnnClear">
        <li>
            <asp:LinkButton ID="cmdUpdate" runat="server" CssClass="dnnPrimaryAction" resourcekey="cmdUpdate" /></li>
        <li>
    </ul>
</div>