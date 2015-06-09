<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="PreviewPanelControlPro.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.PreviewPanelControlPro" %>
<%@ Import Namespace="DotNetNuke.Entities.Icons" %>
<%@ Register TagPrefix="dam" tagName="PreviewFieldsControl" src="~/DesktopModules/DigitalAssets/PreviewFieldsControl.ascx"%>
<asp:Panel runat="server" ID="ScopeWrapper">
    <div class="dnnModuleDigitalAssetsPreviewInfoTitle"><%=Title %>:</div>
    <asp:Panel runat="server" ID="PreviewIconContainer">
        <div class="dnnModuleDigitalAssetsPreviewInfoImageContainer"><img src="<%=PreviewImageUrl %>" class="dnnModuleDigitalAssetsPreviewInfoImage"/></div>    
    </asp:Panel>
    <asp:Panel runat="server" ID="PreviewImageContainer">
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
    <div class="dnnModuleDigitalAssetsPreviewInfoFieldsContainer">
        <dam:PreviewFieldsControl ID="FieldsControl" runat="server"></dam:PreviewFieldsControl>
    </div>
</asp:Panel>