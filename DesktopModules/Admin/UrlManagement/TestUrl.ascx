<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="TestUrl.ascx.cs" Inherits="DotNetNuke.Professional.UrlManagement.TestUrl" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Register TagPrefix="dnnControls" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>


<div>
    <div class="dnnFormItem">
        <dnn:Label ID="selectPageToTestLabel" runat="server" ControlName="searchPageText" Suffix=":" />
        <asp:Panel runat="server" ID="SelectPagePanel" CssClass="select-page-container">
            <div class="left-pane">
                <asp:TextBox ID="searchPageText" CssClass="search-box" runat="server"></asp:TextBox>
                <a class="dnnSecondaryAction" href="javascript:void(0)" id="searchPageButton" runat="server"><%= LocalizeString("Search") %></a>
                <asp:Label ID="pageListLabel" CssClass="page-list-label" AssociatedControlID="pageList" runat="server" />
                <asp:ListBox ID="pageList" Rows="14" runat="server" SelectionMode = "Single"/>

                <h2 id="optionalSettingsHeader" class="dnnFormSectionHead">
                    <a href="" class="dnnSectionExpanded"><%=LocalizeString("OptionalSettings")%></a>
                </h2>
                <fieldset>
                    <div class="label-and-field">
                        <dnn:Label ID="queryStringLabel" runat="server" ControlName="queryStringText" Suffix=":" />
                        <asp:TextBox ID="queryStringText" CssClass="optional-settings-text" runat="server" />
                    </div>
                    <div class="label-and-field">
                        <dnn:Label ID="pageNameLabel" runat="server" ControlName="pageNameText" Suffix=":" />
                        <asp:TextBox ID="pageNameText" CssClass="optional-settings-text" runat="server" />
                    </div>
                </fieldset>
                <a class="test-url-button dnnSecondaryAction" href="javascript:void(0)" id="testUrlButton" runat="server"><%= LocalizeString("TestUrlButtonCaption") %></a>
            </div>
            <div class="right-pane">
                <dnn:Label ID="resultingUrlsLabel" runat="server" ControlName="resultingUrls" Suffix=":" />
                <div class="um-resulting-urls-container">
                <dnnControls:DnnUnsortedList runat="server" ID="resultingUrls"></dnnControls:DnnUnsortedList>
                </div>
            </div>
            <div class="clear"></div>
        </asp:Panel>
    </div>
    <div class="dnnFormItem">
        <dnn:Label ID="testUrlRewritingLabel" runat="server" ControlName="testUrlRewritingTextBox" Suffix=":" />
        <asp:Panel runat="server" ID="TestUrlRewritePanel" CssClass="captioned-box">
            <asp:Label ID="testUrlRewritingCaption" runat="server" AssociatedControlID="testUrlRewritingTextBox"></asp:Label>
            <asp:TextBox ID="testUrlRewritingTextBox" runat="server" />
            <a class="dnnSecondaryAction" href="javascript:void(0)" id="testUrlRewritingButton" runat="server"><%= LocalizeString("testUrlRewritingButton") %></a>

            <asp:RequiredFieldValidator ID="testUrlRewritingValidator" runat="server" Display="Dynamic" SetFocusOnError="True" EnableClientScript="False"
                ControlToValidate="testUrlRewritingTextBox" CssClass="dnnFormMessage dnnFormError" ValidationGroup="TestUrlRewriting"/>
            <asp:Panel runat="server" ID="TestUrlResult" CssClass="test-url-result">
                <div class="dnnFormItem">
                    <dnn:Label ID="rewritingResultLabel" runat="server" ControlName="rewritingResultLabel" Suffix=":" />
                    <asp:Label ID="rewritingResultDescription" runat="server"/>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ID="languageLabel" runat="server" ControlName="languageDescription" Suffix=":" />
                    <asp:Label ID="languageDescription" runat="server"/>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ID="identifiedTabLabel" runat="server" ControlName="identifiedTabDescription" Suffix=":" />
                    <asp:Label ID="identifiedTabDescription" runat="server"/>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ID="redirectionResultLabel" runat="server" ControlName="redirectionResultDescription" Suffix=":" />
                    <asp:Label ID="redirectionResultDescription" runat="server"/>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ID="redirectionResultReasonLabel" runat="server" ControlName="redirectionResultReason" Suffix=":" />
                    <asp:Label ID="redirectionResultReason" runat="server"/>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ID="operationMessagesLabel" runat="server" ControlName="operationMessagesDescription" Suffix=":" />
                    <asp:Label ID="operationMessagesDescription" runat="server" CssClass="messages" />
                </div>
            </asp:Panel>
        </asp:Panel>
    </div>
</div>
