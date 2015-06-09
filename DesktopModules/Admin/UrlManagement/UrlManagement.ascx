<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UrlManagement.ascx.cs" Inherits="DotNetNuke.Professional.UrlManagement.UrlManagement" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Register TagPrefix="dnn" TagName="TestUrl" Src="TestUrl.ascx" %>

<div class="dnnForm dnnUrlManagement dnnClear" id="dnnUrlManagement">
    <ul class="dnnAdminTabNav dnnClear">
        <li><a href="#urlGeneral"><%= LocalizeString("General") %></a></li>
        <li><a href="#urlRegex"><%= LocalizeString("Regex") %></a></li>
<% if (IsPortal) %>
<%
   { %>
        <li><a href="#urlTestUrl"><%= LocalizeString("TestUrl") %></a></li>
<% } %>
    </ul>
    <div class="urlGeneral dnnClear" id="urlGeneral">
        <asp:Panel runat="server" ID="GeneralSettingsPanel">
            <div class="dnnFormItem">
                <dnn:Label ID="forceLowerCaseLabel" runat="server" ControlName="forceLowerCaseCheckBox" Suffix=":" />
                <asp:CheckBox ID="forceLowerCaseCheckBox" runat="server"/>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="redirectOnWrongCaseLabel" runat="server" ControlName="redirectOnWrongCaseCheckBox" Suffix=":" />
                <asp:CheckBox ID="redirectOnWrongCaseCheckBox" runat="server"/>
            </div>
            <div class="dnnFormItem">
                <dnn:label id="spaceEncodingLabel" runat="server" controlname="spaceEncodingOptions" Suffix=":" />
                <asp:RadioButtonList ID="spaceEncodingOptions" CssClass="dnnFormRadioButtons" runat="server"
                    EnableViewState="False" RepeatDirection="Horizontal">
                    <asp:ListItem Value="0" resourcekey="spaceEncodingHex" />
                    <asp:ListItem Value="1" resourcekey="spaceEncodingPlus" />
                </asp:RadioButtonList>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="autoAsciiConvertLabel" runat="server" ControlName="autoAsciiConvertCheckBox" Suffix=":" />
                <asp:CheckBox ID="autoAsciiConvertCheckBox" runat="server"/>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="replaceCharsLabel" runat="server" ControlName="replaceCharsTextBox" Suffix=":" />
                <asp:TextBox ID="replaceCharsTextBox" runat="server" />
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="replaceCharPairsLabel" runat="server" ControlName="replaceCharPairsTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="replaceCharPairsCaption" runat="server" AssociatedControlID="replaceCharPairsTextBox"></asp:Label>
                    <asp:TextBox ID="replaceCharPairsTextBox" runat="server" />
                    <asp:CustomValidator ID="replaceCharPairsValidator" runat="server"
                        Display="Dynamic" ControlToValidate="replaceCharPairsTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="General" OnServerValidate="ValidateCharPairs"/>
                </div>
            </div>
<% if (IsPortal) %>
<% { %>
            <div class="dnnFormItem">
                <dnn:Label ID="checkForDuplicatedUrlsLabel" runat="server" ControlName="checkForDuplicatedUrlsCheckBox" Suffix=":" />
                <asp:CheckBox ID="checkForDuplicatedUrlsCheckBox" runat="server"/>
            </div>
<% } %>
<%else %>
<% { %>
            <div class="dnnFormItem">
                <dnn:Label ID="setDefaultSiteLanguageLabel" runat="server" ControlName="setDefaultSiteLanguageCheckBox" Suffix=":" />
                <asp:CheckBox ID="setDefaultSiteLanguageCheckBox" runat="server" />
            </div>
<% } %>
            <div class="dnnFormItem">
                <dnn:Label ID="enableCustomModuleProvidersLabel" runat="server" ControlName="enableCustomModuleProvidersCheckBox" Suffix=":" />
                <asp:CheckBox ID="enableCustomModuleProvidersCheckBox" runat="server"/>
            </div>
<% if (!IsPortal) %>
<% { %>
            <div class="dnnFormItem">
                <dnn:Label ID="showPageIndexRebuildMessagesLabel" runat="server" ControlName="showPageIndexRebuildMessagesCheckBox" Suffix=":" />
                <asp:CheckBox ID="showPageIndexRebuildMessagesCheckBox" runat="server"/>
            </div>
<% } %>
            <ul class="dnnActions dnnClear">
                <li><asp:LinkButton id="UpdateGeneralSettingsButton" runat="server" CssClass="dnnPrimaryAction" resourcekey="upDateButton" /></li>
            </ul>
        </asp:Panel>
    </div>
    <div class="urlRegex dnnClear" id="urlRegex">
        <asp:Panel runat="server" ID="RegExSettingsPanel">
            <div class="dnnFormItem">
                <dnn:Label ID="ignoreRegExLabel" runat="server" ControlName="ignoreRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="ignoreRegExCaption" runat="server" AssociatedControlID="ignoreRegExTextBox"></asp:Label>
                    <asp:TextBox ID="ignoreRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="ignoreRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="ignoreRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="doNotRewriteRegExLabel" runat="server" ControlName="doNotRewriteRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="doNotRewriteRegExCaption" runat="server" AssociatedControlID="doNotRewriteRegExTextBox"></asp:Label>
                    <asp:TextBox ID="doNotRewriteRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="doNotRewriteRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="doNotRewriteRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="siteUrlsOnlyRegExLabel" runat="server" ControlName="siteUrlsOnlyRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="siteUrlsOnlyRegExCaption" runat="server" AssociatedControlID="siteUrlsOnlyRegExTextBox"></asp:Label>
                    <asp:TextBox ID="siteUrlsOnlyRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="siteUrlsOnlyRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="siteUrlsOnlyRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="doNotRedirectUrlRegExLabel" runat="server" ControlName="doNotRedirectUrlRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="doNotRedirectUrlRegExCaption" runat="server" AssociatedControlID="doNotRedirectUrlRegExTextBox"></asp:Label>
                    <asp:TextBox ID="doNotRedirectUrlRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="doNotRedirectUrlRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="doNotRedirectUrlRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="doNotRedirectHttpsUrlRegExLabel" runat="server" ControlName="doNotRedirectHttpsUrlRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="doNotRedirectHttpsUrlRegExCaption" runat="server" AssociatedControlID="doNotRedirectHttpsUrlRegExTextBox"></asp:Label>
                    <asp:TextBox ID="doNotRedirectHttpsUrlRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="doNotRedirectHttpsUrlRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="doNotRedirectHttpsUrlRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="preventLowerCaseUrlRegExLabel" runat="server" ControlName="preventLowerCaseUrlRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="preventLowerCaseUrlRegExCaption" runat="server" AssociatedControlID="preventLowerCaseUrlRegExTextBox"></asp:Label>
                    <asp:TextBox ID="preventLowerCaseUrlRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="preventLowerCaseUrlRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="preventLowerCaseUrlRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="doNotUseFriendlyUrlsRegExLabel" runat="server" ControlName="doNotUseFriendlyUrlsRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="doNotUseFriendlyUrlsRegExCaption" runat="server" AssociatedControlID="doNotUseFriendlyUrlsRegExTextBox"></asp:Label>
                    <asp:TextBox ID="doNotUseFriendlyUrlsRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="doNotUseFriendlyUrlsRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="doNotUseFriendlyUrlsRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="keepInQueryStringRegExLabel" runat="server" ControlName="keepInQueryStringRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="keepInQueryStringRegExCaption" runat="server" AssociatedControlID="keepInQueryStringRegExTextBox"></asp:Label>
                    <asp:TextBox ID="keepInQueryStringRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="keepInQueryStringRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="keepInQueryStringRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="urlsWithNoExtensionRegExLabel" runat="server" ControlName="urlsWithNoExtensionRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="urlsWithNoExtensionRegExCaption" runat="server" AssociatedControlID="urlsWithNoExtensionRegExTextBox"></asp:Label>
                    <asp:TextBox ID="urlsWithNoExtensionRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="urlsWithNoExtensionRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="urlsWithNoExtensionRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <div class="dnnFormItem">
                <dnn:Label ID="validFriendlyUrlRegExLabel" runat="server" ControlName="validFriendlyUrlRegExTextBox" Suffix=":" />
                <div class="captioned-box">
                    <asp:Label ID="validFriendlyUrlRegExCaption" runat="server" AssociatedControlID="validFriendlyUrlRegExTextBox"></asp:Label>
                    <asp:TextBox ID="validFriendlyUrlRegExTextBox" runat="server" />
                    <asp:CustomValidator ID="validFriendlyUrlRegExValidator" runat="server"
                        Display="Dynamic" ControlToValidate="validFriendlyUrlRegExTextBox" SetFocusOnError="True"
                        CssClass="dnnFormMessage dnnFormError" ValidationGroup="RegEx" OnServerValidate="ValidateRegexPattern"/>
                </div>
            </div>
            <ul class="dnnActions dnnClear">
                <li><asp:LinkButton id="UpdateRegExSettingsButton" runat="server" CssClass="dnnPrimaryAction" resourcekey="upDateButton" /></li>
            </ul>
        </asp:Panel>
    </div>

<% if (IsPortal) %>
<%
   { %>
    <div class="urlTestUrl dnnClear" id="urlTestUrl">
        <dnn:TestUrl ID="testUrlControl" runat="server"></dnn:TestUrl>
        <ul class="dnnActions dnnClear">
            <li><asp:LinkButton id="UpdateTestUrlSettingsButton" runat="server" CssClass="dnnPrimaryAction" resourcekey="upDateButton" /></li>
        </ul>
    </div>
    <script language="javascript" type="text/javascript">
        /*globals jQuery, window, Sys */
        (function ($, Sys) {
            
            function setUpUrlManagement() {
                
                $(".dnnUrlManagement .dnnPrimaryAction").click(function () {
                    //Clear the testUrl querystring box to avoid a Page Event Validation error
                    $('input[id$="searchPageText"]').val("");
                    $('input[id$="queryStringText"]').val("");
                    $('input[id$="pageNameText"]').val("");
                    $('input[id$="testUrlRewritingTextBox"]').val("");
                    $('select[id$="pageList"]').val(null);

                });
            }

            $(document).ready(function () {
                setUpUrlManagement();
                Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
                    setUpUrlManagement();
                });
            });

        }(jQuery, window.Sys));
    </script>
<% } %>

 </div>
