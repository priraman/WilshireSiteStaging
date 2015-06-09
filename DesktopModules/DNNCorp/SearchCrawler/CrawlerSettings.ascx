<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="CrawlerSettings.ascx.cs" Inherits="DotNetNuke.Professional.SearchCrawler.CrawlerSettings" %>
<%@ Import Namespace="DotNetNuke.Professional.SearchCrawler" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Register TagPrefix="dnn" TagName="IncludedFileExtensions" Src="~/DesktopModules/DNNCorp/SearchCrawler/IncludedFileExtensionsSettings.ascx" %>
<%@ Register TagPrefix="dnn" TagName="ExcludedFileExtensions" Src="~/DesktopModules/DNNCorp/SearchCrawler/ExcludedFileExtensionsSettings.ascx" %>
<%@ Register TagPrefix="dnn" TagName="IncludedDirectories" Src="~/DesktopModules/DNNCorp/SearchCrawler/IncludedDirectoriesSettings.ascx" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<div class="dnnFormExpandContent">
    <a href="" class="dnnSectionExpanded"><%= Localization.GetString("ExpandAll", Localization.SharedResourceFile) %></a>
</div>

<asp:PlaceHolder ID="phPathContent" runat="server">
    <h2 id="dnnSearchAdmin-UrlCrawlerSettings-Url" class="dnnFormSectionHead">
        <a href="" class="dnnSectionExpanded"><%=LocalizeString("Urls")%></a>
    </h2>
    <fieldset>
        <div class="dnnFormItem">
            <p><%=LocalizeString("introUrlPath")%></p>
        </div>
        <div class="dnnTableHeader">
            <asp:LinkButton ID="cmdUrlAdd" runat="server" resourcekey="cmdUrlAdd" CssClass="dnnSecondaryAction dnnRight" CausesValidation="false" />
            <div class="dnnClear"></div>
        </div>
        <dnn:dnngrid id="dgUrls" runat="server" autogeneratecolumns="false">
            <mastertableview datakeynames="UrlId">
						<Columns>
							<dnn:DnnGridBoundColumn DataField="Url" HeaderText="Url" UniqueName="Url" />
							<dnn:DnnGridCheckBoxColumn UniqueName="Active" HeaderText="UrlActive" DataField="UrlActive" />
							<dnn:DnnGridCheckBoxColumn UniqueName="DNNImp" HeaderText="UrlDNNRole" />
							<dnn:DnnGridCheckBoxColumn UniqueName="WinAuth" HeaderText="UrlWinAuthentication" DataField="UrlWinAuthentication" />
                            <dnn:DnnGridTemplateColumn UniqueName="Actions" HeaderText="Actions">
                                <ItemTemplate>
                                    <dnn:DnnImageButton IconKey="Edit"  CommandName="EditItem" runat="server" id="imgEdit"  CssClass="btnEditUrl"/>
                                    <dnn:DnnImageButton IconKey="Delete"  CommandName="DeleteItem" runat="server" id="imgDelete" CssClass="btnDeleteUrl" />
                                </ItemTemplate>
                            </dnn:DnnGridTemplateColumn>
						</Columns>
					</mastertableview>
        </dnn:dnngrid>
    </fieldset>
</asp:PlaceHolder>
<div id="divEditPathContent" runat="server">
    <fieldset>
        <div class="dnnFormItem">
            <dnn:label id="plUrl" controlname="txtUrl" runat="server" CssClass="dnnFormRequired" />
            <asp:TextBox ID="txtUrl" runat="server" />
            <asp:RequiredFieldValidator ID="valUrl" ControlToValidate="txtUrl" Display="Dynamic" runat="server" CssClass="dnnFormMessage dnnFormError" ValidationGroup="EditURL" />
        </div>
        <div class="dnnFormItem">
            <dnn:label id="plSitemapUrl" controlname="txtSitemapUrl" runat="server"></dnn:label>
            <asp:TextBox ID="txtSitemapUrl" runat="server"></asp:TextBox>
            <asp:CustomValidator ID="valSitemapUrl" runat="server" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" ValidationGroup="EditURL" />
        </div>
        <div class="dnnFormItem">
            <dnn:label id="plUrlActive" controlname="chxUrlActive" runat="server"  />
            <asp:CheckBox ID="chxUrlActive" runat="server" Checked="true" />
        </div>
        <div class="dnnFormItem">
            <dnn:label id="plDNNRoles" controlname="rblDNNRoles" runat="server" />
            <div class="dnnLeft dnnFormRadioButtons">
                <asp:RadioButtonList ID="rblDNNRoles" runat="server" RepeatLayout="Flow" RepeatDirection="Vertical" />
            </div>
        </div>
        <div id="divWinAuth" runat="server">
            <div class="dnnFormItem">
                <dnn:label id="plWindowsAuthentication" controlname="chxWindowsAuthentication" runat="server" />
                <asp:CheckBox ID="chxWindowsAuthentication" runat="server" Checked="False" />
            </div>
            <div class="dnnFormItem">
                <dnn:label id="plWindowsDomain" controlname="txtWindowsDomain" runat="server" />
                <asp:TextBox ID="txtWindowsDomain" runat="server" />
            </div>
            <div class="dnnFormItem">
                <dnn:label id="plWindowsUser" controlname="txtWindowsUser" runat="server" />
                <asp:TextBox ID="txtWindowsUser" runat="server" />
            </div>
            <div class="dnnFormItem">
                <dnn:label id="plWindowsPassword" controlname="txtWindowsPassword" runat="server" />
                <asp:TextBox ID="txtWindowsPassword" runat="server" TextMode="Password" />
            </div>
        </div>
        <ul class="dnnActions">
            <li>
                <asp:LinkButton class="dnnPrimaryAction" ID="cmdUpdateUrlConfig" runat="server" resourcekey="cmdUpdateUrlConfig" ValidationGroup="EditURL" /></li>
            <li>
                <asp:LinkButton class="dnnSecondaryAction" ID="cmdCancelUrlConfig" runat="server" resourcekey="cmdCancelUrlConfig" CausesValidation="false" /></li>
        </ul>
    </fieldset>
</div>
<h2 id="dnnSearchAdmin-UrlCrawlerSettings-Duplicate" class="dnnFormSectionHead">
    <a href=""><%= LocalizeString("Duplicates") %></a>
</h2>
<fieldset id="fsDupeAdd" runat="server" class="dnnFSInfo">
    <div class="dnnFormItem">
        <p><%=LocalizeString("introDuplicates")%></p>
    </div>
    <div class="dnnTableHeader">
        <asp:LinkButton ID="cmdDupAdd" runat="server" resourcekey="cmdDupAdd" CausesValidation="false" CssClass="dnnSecondaryAction dnnRight" />
        <div class="dnnClear"></div>
    </div>
    <dnn:dnngrid id="dgDuplicates" runat="server" autogeneratecolumns="false">
        <mastertableview datakeynames="Descr">
			<Columns>
				<dnn:DnnGridBoundColumn DataField="Descr" HeaderText="Descr" UniqueName="Descr" />
				<dnn:DnnGridTemplateColumn UniqueName="RegexPattern" HeaderText="RegexPattern">
					<ItemTemplate>
							<%# (DataBinder.Eval(Container.DataItem, "DuplicatePattern_Text")) %>
					</ItemTemplate>
				</dnn:DnnGridTemplateColumn>
                <dnn:DnnGridTemplateColumn UniqueName="Actions" HeaderText="Actions">
                    <ItemTemplate>
                        <dnn:DnnImageButton IconKey="Edit"  CommandName="EditItem" runat="server" id="imgEdit"  CssClass="btnEditDuplicate"/>
                        <dnn:DnnImageButton IconKey="Delete"  CommandName="DeleteItem" runat="server" id="imgDelete" CssClass="btnDeleteDuplicate" />
                    </ItemTemplate>
                </dnn:DnnGridTemplateColumn>
			</Columns>
		</mastertableview>
    </dnn:dnngrid>
</fieldset>
<fieldset id="fsDupeConfig" runat="server">
    <div class="dnnFormItem">
        <dnn:label id="plDupDescr" controlname="txtDupDescr" resourcekey="plDupDescr" runat="server" cssclass="dnnFormRequired" />
        <input type="hidden" id="hidDupDescr" runat="server" name="hidDupDescr" />
        <asp:TextBox ID="txtDupDescr" runat="server" />
        <asp:RequiredFieldValidator ID="valDupeDesc" runat="server" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" ValidationGroup="Duplicates" ControlToValidate="txtDupDescr" SetFocusOnError="true" resourcekey="valDupeDesc" />
    </div>
    <div class="dnnFormItem">
        <dnn:label id="plDupRegex" controlname="txtDupRegex" resourcekey="plDupRegex" runat="server" cssclass="dnnFormRequired" />
        <asp:TextBox ID="txtDupRegex" runat="server" CssClass="repTable" TextMode="MultiLine" Rows="5" />
        <asp:RequiredFieldValidator ID="valDupeRegex" runat="server" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" ValidationGroup="Duplicates" ControlToValidate="txtDupRegex" SetFocusOnError="true" resourcekey="valDupeRegex" />
        <asp:CustomValidator ID="valDup" ControlToValidate="txtDupRegex" runat="server" CssClass="dnnFormMessage dnnValidationSummary" ValidationGroup="Duplicates" />
    </div>
    <ul class="dnnActions">
        <li id="liSaveDupe" runat="server">
            <asp:LinkButton class="dnnPrimaryAction" ID="cmdSaveDupConfig" runat="server" resourcekey="cmdSaveDupConfig" ValidationGroup="Duplicates" /></li>
        <li id="liUpdateDupe" runat="server">
            <asp:LinkButton class="dnnPrimaryAction" ID="cmdUpdateDupConfig" runat="server" resourcekey="cmdUpdateDupConfig" ValidationGroup="Duplicates" /></li>
        <li>
            <asp:LinkButton class="dnnSecondaryAction" ID="cmdCancelDupConfig" runat="server" resourcekey="cmdCancelDupConfig" CausesValidation="false" /></li>
    </ul>
</fieldset>

<div id="dnnSearch-FileCrawlerSettings">
    <h2 id="dnnSearchAdmin-FileCrawlerSettings-ExtInclude" class="dnnFormSectionHead">
        <a href=""><%=LocalizeString("IncludedExtensions")%></a>
    </h2>
    <fieldset>
        <dnn:IncludedFileExtensions runat="server" ID="IncludedFileExtensionsSettings"></dnn:IncludedFileExtensions>
    </fieldset>
    
    <h2 id="H1" class="dnnFormSectionHead">
        <a href="">Excluded File Extensions</a>
    </h2>
    <fieldset>
        <dnn:ExcludedFileExtensions runat="server" ID="ExcludedFileExtensionsSettings"></dnn:ExcludedFileExtensions>
    </fieldset>

    <h2 id="dnnSearchAdmin-FileCrawlerSettings-Directories" class="dnnFormSectionHead">
        <a href="" class="dnnSectionExpanded"><%= LocalizeString("Directories")%></a>
    </h2>
    <fieldset>
        <dnn:IncludedDirectories runat="server" ID="IncludedDirectoriesSettings"></dnn:IncludedDirectories>
    </fieldset>
</div>

<script type="text/javascript">
    if (typeof dnn !== 'undefined' && typeof dnn.searchAdminPro !== 'undefined') {
        // register to extensions
        if (typeof dnn.searchAdmin == 'undefined' || dnn.searchAdmin == null)
            dnn.searchAdmin = {};
            
        if (typeof dnn.searchAdmin.extensionsInitializeSettings == 'undefined' || dnn.searchAdmin.extensionsInitializeSettings == null)
            dnn.searchAdmin.extensionsInitializeSettings = {};
            
        dnn.searchAdmin.extensionsInitializeSettings["dnn.searchAdminPro"] = {
            // some localized strings
            lblExpandAll: '<%= Localization.GetSafeJSString(LocalizeString("ExpandAll")) %>',
            lblCollapseAll: '<%= Localization.GetSafeJSString(LocalizeString("CollapseAll")) %>',

            // included file extension
            msgFileExtensionRequired: '<%= Localization.GetSafeJSString(LocalizeString("errorRequiredFileExtension")) %>',
            msgFileExtensionDuplicated: '<%= Localization.GetSafeJSString(LocalizeString("errorDuplicateFileExtension")) %>',
            msgFileExtensionNotAllowed: '<%= Localization.GetSafeJSString(LocalizeString("errorNotAllowedFileExtension")) %>',

            tooltipContentCrawlingAvailable: '<%= Localization.GetSafeJSString(LocalizeString("tooltipContentCrawlingAvailable")) %>',
            tooltipContentCrawlingUnavailable: '<%= Localization.GetSafeJSString(LocalizeString("tooltipContentCrawlingUnavailable")) %>',

            msgUnknownContentType: '<%= Localization.GetSafeJSString(LocalizeString("UnknownContentType")) %>',

            // directory
            cboFolderClientId: '<%= ((IncludedDirectoriesSettings)IncludedDirectoriesSettings).CboFolderClienteID %>',
            msgDirectoryRequired: '<%= Localization.GetSafeJSString(LocalizeString("errorRequiredDirectory")) %>',
            
            // url
            deleteUrlText: '<%= Localization.GetSafeJSString(LocalizeString("DeleteItem")) %>',
            deleteUrlYesText: '<%= Localization.GetSafeJSString("Yes.Text", Localization.SharedResourceFile) %>',
            deleteUrlNoText: '<%= Localization.GetSafeJSString("No.Text", Localization.SharedResourceFile) %>',
            deleteUrlTitle: '<%= Localization.GetSafeJSString("Confirm.Text", Localization.SharedResourceFile) %>',

            chxWindowsAuthenticationClientId: '<%= chxWindowsAuthentication.ClientID %>',
            txtWindowsDomainClientId: '<%= txtWindowsDomain.ClientID %>',
            txtWindowsUserClientId: '<%= txtWindowsUser.ClientID %>',
            txtWindowsPasswordClientId: '<%= txtWindowsPassword.ClientID %>',
            fullTrust: '<%= FullTrust %>',
            moduleId: '<%= ModuleId %>'
        };
    }
</script>

<%--<script type="text/javascript">
    var viewModel = {
        filteredExtensionsTitle: ko.observable() // Initially blank
    };
    viewModel.filteredExtensionsTitle(dnn.searchAdminPro.getLocalizedString("ContentCrawling.Text")); // Text appears
    ko.applyBindings(viewModel);
</script>--%>
