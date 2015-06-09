<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="WorkflowTabContentControl.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.WorkflowTabContentControl" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>
<%@ Import Namespace="DotNetNuke.Entities.Icons" %>
<%@ Register TagPrefix="dnnweb" Assembly="DotNetNuke.Web" Namespace="DotNetNuke.Web.UI.WebControls" %>
<%@ Register TagPrefix="dnnweb" TagName="Label" Src="~/controls/LabelControl.ascx" %>

<asp:Panel ID="pnlWorkflowTable" runat="server">
    <fieldset>
        <div class="dnnFormItem dnnClear">
            <asp:Panel runat="server" id="WorkflowTabHeader" class="dnnModuleDigitalAssetsTabHeader">
                <asp:Panel runat="server" ID="PreviewWorkflowItemContainer">
                    <div class="dnnModuleDigitalAssetsPreviewInfoImageContainer">
                        <div class="dnnModuleDigitalAssetsPreviewInfoImageContainerThumbnail">
                            <a href="<%=ItemUrl %>" target="_blank">
                                <img src="<%=ThumbnailUrl %>" alt="<%=ZoomImageAltText %>" title="<%=ZoomImageAltText %>"/>
                            </a>
                            <div class="dnnModuleDigitalAssetsPreviewInfoZoomOutContainer">
                                <a href="<%=ItemUrl %>" target="_blank">
                                    <img src="<%=ResolveUrl(IconController.IconURL("Preview", "16x16", "Standard")) %>" class="dnnModuleDigitalAssetsPreviewInfoZoomOut" alt="<%=ZoomImageAltText %>" title="<%=ZoomImageAltText %>"/>
                                </a>
                            </div>
                        </div>
                    </div>
                </asp:Panel>
                <asp:Panel id="PreviewWorkflowDataPanel" CssClass="dnnModuleDigitalAssetsPreviewWorkflowDataPanel" runat="server">
                    <asp:Label runat="server" ID="PendingVersionTitleLabel" CssClass="dnnModuleDigitalAssetsPanelHeader"></asp:Label><br/>
                    <asp:Label runat="server" ID="PendingVersionFileNameLabel"></asp:Label><br/>
                    <asp:Label runat="server" ID="PendingVersionSizeLabel"></asp:Label><br/>
                    <asp:Label runat="server" ID="PendingVersionModifiedOnFieldLabel" resourcekey="PendingVersionModifiedOnFieldLabel"/>&nbsp;<asp:Label runat="server" ID="PendingVersionModifiedOnLabel"></asp:Label><br/>
                    <asp:Label runat="server" ID="PendingVersionModifiedByFieldLabel" resourcekey="PendingVersionModifiedByFieldLabel"/>&nbsp;<asp:Label runat="server" ID="PendingVersionModifiedByLabel"></asp:Label>
                    <br/><br/>
                    <asp:Label runat="server" ID="WorkflowFieldLabel" resourcekey="WorkflowFieldLabel"></asp:Label>&nbsp;<asp:Label ID="WorkflowNameLabel" runat="server" /><br/>
                    <asp:Label runat="server" ID="WorkflowStateFieldLabel" resourcekey="WorkflowStateFieldLabel"></asp:Label>&nbsp;<asp:Label runat="server" ID="WorkflowStateLabel"></asp:Label><br/>
                    <asp:HiddenField runat="server" ID="CurrentStateIdHiddenField"/>
                </asp:Panel>
                <asp:Panel runat="server" ID="PreviewWorkflowUserActionPanel" CssClass="dnnModuleDigitalAssetsPreviewWorkflowUserActionPanel">
                    <asp:Label runat="server" ID="WorkflowCommentFieldLabel" resourcekey="WorkflowCommentFieldLabel" CssClass="dnnModuleDigitalAssetsPanelHeader"/><br/>
                    <asp:TextBox runat="server" ID="WorkflowCommentTextBox" TextMode="MultiLine" CssClass="textbox"></asp:TextBox>
                    <asp:RequiredFieldValidator ID="WorkflowCommentRequiredValidator" CssClass="dnnFormMessage dnnFormError" ValidationGroup="Workflow"
                        runat="server" resourcekey="WorkflowCommentRequired.ErrorMessage" Display="Dynamic" ControlToValidate="WorkflowCommentTextBox" />
                    <asp:RegularExpressionValidator ID="WorkflowCommentRegularExpressionValidator" CssClass="dnnFormMessage dnnFormError" ValidationGroup="Workflow"
                        ValidationExpression="(\s|.){0,200}$" runat="server" resourcekey="WorkflowCommentMaxLength.ErrorMessage" Display="Dynamic" ControlToValidate="WorkflowCommentTextBox" />
                    <div id="dnnModuleDigitalAssetsPreviewWorkflowUserActionButtonPane">
                        <ul class="dnnActions dnnClear">
                            <li>
                                <asp:LinkButton ID="ApproveButton" ValidationGroup="Workflow" runat="server" class="dnnPrimaryAction" /></li>
                            <li>
                                <asp:LinkButton ID="RejectButton" ValidationGroup="Workflow" runat="server" class="dnnSecondaryAction" /></li>
                        </ul>
                    </div>
                </asp:Panel>
            </asp:Panel>
        </div>
        <dnnweb:DnnGrid ID="WorkflowLogGrid" runat="server" AutoGenerateColumns="false" AllowPaging="True" AllowSorting="True" 
            PageSize="10" Name="grdWorkflowLogs">
            <PagerStyle Mode="NextPrevAndNumeric"></PagerStyle>
            <ClientSettings>
                <Selecting />
                <ClientEvents />
            </ClientSettings>
            <MasterTableView HorizontalAlign="Left">
                <Columns>
                    <dnnweb:DnnGridBoundColumn HeaderText="Date" DataField="Date" AllowSorting="True">
                        <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesWorkflowGridColumn DateColumn" />
                    </dnnweb:DnnGridBoundColumn>
                    <dnnweb:DnnGridBoundColumn HeaderText="User" DataField="User" AllowSorting="True">
                        <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesWorkflowGridColumn" />
                    </dnnweb:DnnGridBoundColumn>
                    <dnnweb:DnnGridBoundColumn HeaderText="Action" DataField="Action" AllowSorting="True">
                        <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesWorkflowGridColumn" />
                    </dnnweb:DnnGridBoundColumn>
                    <dnnweb:DnnGridBoundColumn HeaderText="Comment" DataField="Comment" AllowSorting="True" />
                </Columns>
                <NoRecordsTemplate>
                    <asp:Label ID="lblNoWorkflowLogs" runat="server" resourcekey="NoWorkflowLogs" />
                </NoRecordsTemplate>
            </MasterTableView>
        </dnnweb:DnnGrid>
    </fieldset>
</asp:Panel>
<script type="text/javascript">
    
    // IE8 doesn't like using var dnnModule = dnnModule || {}
    if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };
    
    dnnModule.digitalAssets = dnnModule.digitalAssets || {};
    dnnModule.digitalAssets.workflowProperties = function ($) {
        function init(controls, settings) {
            
            var workflowTab = $('#' + controls.workflowTabId);
            
            if (settings.canViewWorkflowLogs === "true") {
                workflowTab.css("display", "");
            } else {
                workflowTab.hide();
            }
        }

        return {
            init: init
        };
    }(jQuery);

    dnnModule.digitalAssets.workflowProperties.init(
        {
            workflowTabId: 'dnnModuleDigitalAssetsWorkflow_tab'
        },
        {
            canViewWorkflowLogs: '<%=Localization.GetSafeJSString(CanViewWorkflowLogs.ToString().ToLowerInvariant()) %>'            
        });
</script>
