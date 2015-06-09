<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="StatisticsTabContentControl.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.StatisticsTabContentControl" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<asp:Panel ID="ScopeWrapper" runat="server" CssClass="dnnForm">
    
    <div class="dam-stats-top-bar">
        <dnn:DnnDatePicker ID="StartDatePicker" runat="server" resourcekey="StartDatePicker" data-bind="dnnDatePicker: selectedStartDate" />
        <asp:Label ID="ToLabel" runat="server" ControlName="EndDatePicker" resourcekey="To" CssClass="dam-stats-to-label" />
        <dnn:DnnDatePicker ID="EndDatePicker" runat="server" resourcekey="EndDatePicker" data-bind="dnnDatePicker: selectedEndDate" />
        <div class="dam-stats-separator">&nbsp;</div>
        <dnn:DnnComboBox ID="PeriodComboBox" runat="server" data-bind="dnnComboBox: setDefaultPeriod">
            <Items>
                <dnn:DnnComboBoxItem Value="7" ResourceKey="Last7Days"></dnn:DnnComboBoxItem>
                <dnn:DnnComboBoxItem Value="30" ResourceKey="Last30Days" Selected="True"></dnn:DnnComboBoxItem>
                <dnn:DnnComboBoxItem Value="90" ResourceKey="Last90Days"></dnn:DnnComboBoxItem>
                <dnn:DnnComboBoxItem Value="365" ResourceKey="LastYear"></dnn:DnnComboBoxItem>
            </Items>
        </dnn:DnnComboBox>        
    </div>

    <div class="dam-stats-graph-container">

        <ul class="dam-stats-period-aggregation">    
            <li>
                <a href='#' data-bind="css: { selected: isDayScale }, click: changePeriodAggregation" data-value="Day" ><%=LocalizeString("Day")%></a>
            </li>
            <li>
                <a href='#' data-bind="css: { selected: isWeekScale }, click: changePeriodAggregation" data-value="Week" ><%=LocalizeString("Week")%></a>
            </li>
            <li>
                <a href='#' data-bind="css: { selected: isMonthScale }, click: changePeriodAggregation" data-value="Month"><%=LocalizeString("Month")%></a>
            </li>
            <li>
                <a href='#' data-bind="css: { selected: isYearScale }, click: changePeriodAggregation" data-value="Year"><%=LocalizeString("Year")%></a>
            </li>
        </ul>

        <div id="GraphContainer" runat="server" class="dam-stats-graph">
            <div class="dam-stats-tooltip" style="display:none">
                <span></span>                
                <div class="dam-stats-tooltip-anchor"></div>
            </div>
        </div>
    </div>
    
    <div id="StatContainer" runat="server" class="dam-stats-container">
        <table class="stats fixed">
            <thead>
                <tr>
                    <th scope="col"><%= LocalizeString("TotalDownloads") %></th>
                    <th scope="col"><%= LocalizeString("LastUpdated") %></th>                    
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="stats-cell-total-downloads" data-bind="text: totalDownloads"></td>
                    <td class="stats-cell-last-updated">
                        <span class="date" data-bind="text: lastUpdatedDate"></span>
                        <span class="time" data-bind="text: lastUpdatedTime"></span>
                        <span data-bind="if: lastUpdatedByUserName()">
                            | <%=LocalizeString("By")%>
                            <a class="user" data-bind="text: lastUpdatedByUserName, attr: { href: '<%=UserInfoUrl%>' + lastUpdatedByUserId() }"></a>
                        </span>
                    </td>                    
                </tr>
            </tbody>
        </table>
    </div>

</asp:Panel>
<script type="text/javascript">
    
    // IE8 doesn't like using var dnnModule = dnnModule || {}
    if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };
    
    dnnModule.digitalAssets = dnnModule.digitalAssets || {};
    dnnModule.digitalAssets.statisticsTab = function ($) {
        function init(controls, settings) {
            
            var statsTab = $('#' + controls.statsTabId);
            
            if (settings.areStatsTracked === "true") {
                statsTab.css("display", "");
            } else {
                statsTab.hide();
            }
        }

        return {
            init: init
        };
    }(jQuery);

    dnnModule.digitalAssets.statisticsTab.init(
        {
            statsTabId: 'dnnModuleDigitalAssetsStatistics_tab'
        },
        {
            areStatsTracked: '<%=IsFileStatsTrackingEnabled.ToString().ToLowerInvariant() %>'            
        });
</script>