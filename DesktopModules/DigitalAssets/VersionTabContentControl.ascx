<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="VersionTabContentControl.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.VersionTabContentControl" %>

<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>
<%@ Register TagPrefix="dnnweb" Assembly="DotNetNuke.Web" Namespace="DotNetNuke.Web.UI.WebControls" %>
<%@ Register TagPrefix="dnnweb" TagName="Label" Src="~/controls/LabelControl.ascx" %>

<asp:Panel ID="pnlVersionTable" runat="server">
	<fieldset>
		<div class="dnnFormItem dnnClear">
			<dnnweb:Label id="MaxVersionsInfo" runat="server" controlname="MaxVersionsLabel" suffix=":" />
			<asp:Label ID="MaxVersionsLabel" runat="server" />
		</div>
		<dnnweb:DnnGrid ID="VersionsGrid" runat="server" AutoGenerateColumns="false" AllowPaging="True" AllowSorting="True"
			PageSize="5" Name="grdVersions">
			<PagerStyle Mode="NextPrevAndNumeric" AlwaysVisible="True"></PagerStyle>
			<ClientSettings>
				<Selecting />
				<ClientEvents />
			</ClientSettings>
			<MasterTableView HorizontalAlign="Left">
				<Columns>
					<dnnweb:DnnGridBoundColumn UniqueName="Version" HeaderText="Version" DataField="Version" AllowSorting="True">
					    <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesVersionColumn" />
					</dnnweb:DnnGridBoundColumn>
					<dnnweb:DnnGridBoundColumn HeaderText="Date" DataField="Date" AllowSorting="True">
					     <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesDateColumn" />
					</dnnweb:DnnGridBoundColumn>
					<dnnweb:DnnGridBoundColumn HeaderText="User" DataField="User" AllowSorting="True" />
					<dnnweb:DnnGridBoundColumn HeaderText="State" DataField="State" AllowSorting="True">
					    <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesStateColumn" /> 
					</dnnweb:DnnGridBoundColumn>
					<dnnweb:DnnGridTemplateColumn HeaderText="Actions">
						<ItemTemplate>
							<dnnweb:DnnImageButton ID="btnDelete" runat="server" CommandName="Delete" CssClass="VersionDelete" IconKey="Delete"
								Text="Delete" resourcekey="VersionsDelete" />
							<dnnweb:DnnImageButton ID="btnPreview" runat="server" CommandName="Preview" IconKey="HtmlView"
								Text="Preview" resourcekey="VersionsPreview" CssClass="VersionPreview" />
							<dnnweb:DnnImageButton ID="btnRollback" CssClass="VersionRollback" runat="server" CommandName="RollBack" IconKey="Rollback"
								Text="Rollback" resourcekey="VersionsRollback" />
						</ItemTemplate>
                        <ItemStyle CssClass="dnnModuleDigitalAssetsFilePropertiesActionsColumn" />
					</dnnweb:DnnGridTemplateColumn>
				</Columns>
				<NoRecordsTemplate>
					<asp:Label ID="lblNoVersions" runat="server" resourcekey="NoVersions" />
				</NoRecordsTemplate>
			</MasterTableView>
		</dnnweb:DnnGrid>
	</fieldset>
</asp:Panel>
<script type="text/javascript">
    $(document).ready(function() {
        $(".VersionDelete").each(function() {
           $(this).dnnConfirm(
                {
                    text: '<%= Localization.GetSafeJSString(LocalizeString("DeleteVersion.Confirm")) %>',
                    isButton: true,
                    callbackTrue: $(this).attr("onclick")
                });
        });
        $(".VersionRollback").each(function () {
            var version = $(this).attr("data-version");
            var publishedVersion = $(this).attr("data-published-version");

            var confirmText = '<%= Localization.GetSafeJSString(LocalizeString("RollbackVersion.Confirm")) %>';
            confirmText = confirmText.replace("[CURRENTVERSION]", publishedVersion);
            confirmText = confirmText.replace("[OLDVERSION]", version);

            $(this).dnnConfirm(
                 {
                    text: confirmText,
                    isButton: true,
                    callbackTrue: $(this).attr("onclick")
                });
        });
    });
</script>