<%@ Control language="C#" Inherits="Evoq.UI.UserControls.PersonaBarContainer" AutoEventWireup="false"  Codebehind="PersonaBarContainer.ascx.cs" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<asp:Panel runat="server" ID="PersonaBarPanel" Visible="False" CssClass="personalBarContainer">
    <input type="hidden" name="__personaBarUserId" value="<%= CurrentUserId %>"/>
    <input type="hidden" name="__personaBarResourceFileModifiedTime" value="<%= ResourceFileModifiedTime %>"/>
    <input type="hidden" name="__personaBarCulture" value="<%= Culture %>"/>
    <input type="hidden" name="__personaBarLogOff" value="<%= LogOff %>"/>
    <input type="hidden" name="__personaBarMainSocialModuleOnPage" value="<%= MainSocialModuleOnPage %>"/>
    <input type="hidden" name="__personaBarHasValidLicenseOrTrial" value="<%= HasValidLicenseOrTrial %>"/>
    <input type="hidden" name="__userMode" value="<%= UserMode.ToString() %>"/>
    <input type="hidden" name="__javascriptMainModuleNames" value="<%= JavascriptMainModuleNames %>"/>
    <input type="hidden" name="__rootFolderId" value="<%= RootFolderId %>"/>
    <input type="hidden" name="__defaultFolderMappingId" value="<%= DefaultFolderMappingId %>"/>
    <input type="hidden" name="__assetsTabId" value="<%= AssetsTabId %>"/>
    <input type="hidden" name="__assetsModuleId" value="<%= AssetsModuleId %>"/>
    <input type="hidden" name="__fileUploadClientId" value="<%= fileUpload.ClientID %>"/>
    <input type="hidden" name="__folderPickerClientId" value="<%= folderPicker.ClientID %>"/>
    <input type="hidden" name="__sku" value="<%= Sku %>"/>
    <input type="hidden" name="__isCommunityManager" value="<%= IsCommunityManager %>"/>

    <asp:Panel runat="server" ID="fileUploadPanel" style="display: none;"></asp:Panel>
    <dnnweb:DnnFileUpload ID="fileUpload" runat="server" />

    <dnnweb:DnnFolderDropDownList ID="folderPicker" runat="server" style="display: none;" />

    <script type="text/javascript">
        // <![CDATA[
        var __personaBarUserSettings = <%= UserSettings %>;
        //]]>
    </script>
	<iframe id="personaBar-iframe" allowTransparency="true" frameBorder="0"></iframe>
	<iframe id="personaBar-mobi-iframe" allowTransparency="true" frameBorder="0"></iframe>
    <script type="text/javascript">
        $(function() {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                desktopIframe = document.getElementById('personaBar-iframe'),
                mobileIframe = document.getElementById('personaBar-mobi-iframe');

            var mobile = x <= 640;

            var src = mobile ? '<%= AppPath %>/admin/personaBar/<%= IndexMobilePageName %>' : '<%= AppPath %>/admin/personaBar/<%= IndexPageName %>';
            src += '?cdv=' + '<%= BuildNo %>';
            if (mobile) {
                desktopIframe.parentElement.removeChild(desktopIframe);
                mobileIframe.src = src;
                $(mobileIframe).wrap('<div class="pb-scroll-wrapper"></div>');
            } else {
                mobileIframe.parentElement.removeChild(mobileIframe);
                desktopIframe.src = src;

                if (/iPad/i.test(navigator.userAgent)) {
                    $(desktopIframe)
                        .addClass('ipad')
                        .width(x)
                        .wrap('<div class="pb-scroll-wrapper"></div>');
                }
            }
        });
    </script>
    
    <style>
         .pb-scroll-wrapper {
            position: absolute;
            top: 0;
            left:0;
            height: 100%;
            -webkit-overflow-scrolling: touch;
            overflow-y: visible;
        }
        .pb-scroll-wrapper iframe#personaBar-iframe.ipad {
            position: relative !important;
        }
    </style>
</asp:Panel>
