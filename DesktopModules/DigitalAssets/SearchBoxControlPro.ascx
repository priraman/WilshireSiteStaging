<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="SearchBoxControlPro.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.SearchBoxControlPro" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>

<div id="dnnModuleDigitalAssetsSearchBox" class="dnnModuleDigitalAssetsSearchBox">
    <input type="text" class="searchInput" placeholder='<%=LocalizeString("Search.Placeholder")%>' />
    
    <a class="searchButton"></a>
    
    <div class="dnnSearchBox_advanced">
        <a class="dnnSearchBox_advanced_label"><%=LocalizeString("Advanced")%></a>
        <div class="dnnSearchBox_advanced_dropdown">
            <div class="dnnForm">
                <div class="dnnFormItem">
                    <dnn:Label ControlName="TagsTextBox" ResourceKey="Tags" runat="server" Suffix=":" />
                    <asp:TextBox ID="TagsTextBox" runat="server" />
                </div>

                <div class="dnnFormItem">

                    <dnn:Label ControlName="LastModifiedComboBox" ResourceKey="LastModified" runat="server" Suffix=":" />
                    <dnn:DnnComboBox ID="LastModifiedComboBox" runat="server">
                        <Items>
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionAll.Text" Value="" Selected="True" />
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionDay.Text" Value="day" />
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionWeek.Text" Value="week" />
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionMonth.Text" Value="month" />
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionQuarter.Text" Value="quarter" />
                            <dnn:DnnComboBoxItem runat="Server" ResourceKey="OptionYear.Text" Value="year" />
                        </Items>
                    </dnn:DnnComboBox>
                </div>

                <div class="dnnFormItem">
                    <dnn:Label ControlName="ExactSearchCheckBox" ResourceKey="ExactSearch" runat="server" Suffix=":" />
                    <asp:CheckBox ID="ExactSearchCheckBox" runat="server" />
                </div>
                <ul class="dnnActions dnnClear">
                    <li>
                        <a class="dnnPrimaryAction dnnAdvancedSearch"><%=LocalizeString("AdvancedSearch")%></a>
                    </li>
                    <li>
                        <a class="dnnSecondaryAction dnnAdvancedClear"><%=LocalizeString("AdvancedClear")%></a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    
    <div class="dnnSearchBox_advanced_query">
        <span></span>
        <a class="dnnSearchBoxClearAdvanced dnnShow"></a> 
    </div>

    <a class="dnnSearchBoxClearText"></a>

</div>

<script type="text/javascript">
    $(function () {

        var servicesFramework = $.ServicesFramework(<%=ModuleId %>);  
        var controller = new dnnModule.DigitalAssetsController(servicesFramework, {});

        var $tags = $("#<%=TagsTextBox.ClientID%>");
        controller.initTagsInput($tags, {
            width: "135px",
            minInputWidth: '80px',
            defaultText: '<%= Localization.GetSafeJSString(LocalizeString("AddTag")) %>',
            maxItemsToShow: 10
        });

        var searchBox = new dnnModule.DigitalAssetsSearchBox($, $('#<%=Parent.ClientID%>'), $find, servicesFramework,
            $tags,
            '<%=LastModifiedComboBox.ClientID%>',
            $('#<%=ExactSearchCheckBox.ClientID%>'),'<%= CultureCode %>');
        searchBox.init();
        
        dnnModule.digitalAssets.setSearchProvider(searchBox);
    });
</script>