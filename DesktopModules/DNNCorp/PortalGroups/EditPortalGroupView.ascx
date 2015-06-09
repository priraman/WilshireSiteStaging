<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="EditPortalGroupView.ascx.cs" Inherits="DotNetNuke.Professional.PortalGroups.Views.EditPortalGroupView" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>

<div class="dnnForm dnnPortalGroups dnnClear">
    <div id="addPortalGroupMessage" runat="server" class="dnnFormMessage dnnFormInfo"><%=LocalizeString("AddPortalGroup") %></div>
    <div class="dnnFormItem">
		<dnn:Label ID="nameLabel" runat="server" ControlName="nameTextBox" CssClass="dnnFormRequired" />
		<asp:TextBox ID="nameTextBox" CssClass="dnnFormRequired" runat="server" MaxLength="100" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="nameTextBox" 
			resourcekey="valGroupName" CssClass="dnnFormMessage dnnFormError" Display="Dynamic"></asp:RequiredFieldValidator>
	</div>
    <div class="dnnFormItem">
		<dnn:Label ID="descriptionLabel" runat="server" ControlName="txtPortalName" CssClass="dnnFormRequired" />
		<asp:TextBox ID="descriptionTextBox" CssClass="dnnFormRequired" runat="server" TextMode="MultiLine" Rows="2" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="descriptionTextBox" 
			resourcekey="valGroupDesc" CssClass="dnnFormMessage dnnFormError" Display="Dynamic"></asp:RequiredFieldValidator>
	</div>
    <div class="dnnFormItem">
		<dnn:Label ID="masterPortalLabel" runat="server" ControlName="availablePortalsList" />
		<asp:Label ID="masterPortal" runat="server"  />       
        <dnn:DnnComboBox ID="availablePortalsList" runat="server" DataTextField="PortalName" DataValueField="PortalID" />
	</div>
    <div id="domainRow" runat="server" class="dnnFormItem">
		<dnn:Label ID="domainLabel" runat="server" ControlName="domainTextBox"/>
		<asp:TextBox ID="domainTextBox" runat="server" MaxLength="200"  />
		<asp:RegularExpressionValidator runat="server" ControlToValidate="domainTextBox"
			ValidationExpression="^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$"
			resourcekey="valDomain" CssClass="dnnFormMessage dnnFormError" Display="Dynamic"></asp:RegularExpressionValidator>
	</div>
    <div id="noPortals" runat="server" class="dnnFormMessage dnnFormInfo"><%=LocalizeString("NoPortals") %></div>
    <div id="memberPortalsRow" runat="server" class="dnnFormItem">
		<dnn:Label ID="memberPortalsLabel" runat="server" ControlName="portalsDualListBox" />
        <dnn:DnnListBox ID="portalsListBox" runat="server" CheckBoxes="true" AutoPostBack="true"
			 OnClientItemChecking="OnClientItemChecking" OnClientSelectedIndexChanging="OnClientSelectedIndexChanging"></dnn:DnnListBox>
        <asp:CheckBox ID="copyUsers" runat="server" style="display: none;"/>
	</div>
    <div class="managePortalProgress" style="text-align:center">
        <dnn:DnnProgressManager id="progressManager" runat="server" />
        <dnn:DnnProgressArea id="managePortalProgressArea" runat="server" TimeElapsed="true"  />
    </div>
    <ul class="dnnActions dnnClear">
	    <li><asp:LinkButton id="createButton" runat="server" CssClass="dnnPrimaryAction" resourcekey="createPortalGroup" /></li>
	    <li><asp:LinkButton id="updateButton" runat="server" CssClass="dnnPrimaryAction" resourcekey="savePortalGroup" /></li>
	    <li><asp:LinkButton id="deleteButton" runat="server" CssClass="dnnSecondaryAction dnnDeleteProductGroup" resourcekey="deletePortalGroup" Causesvalidation="False"/></li>
	    <li><asp:Hyperlink id="cancelHyperLink" runat="server" CssClass="dnnSecondaryAction" resourcekey="cmdCancel" /></li>
    </ul>
</div>
<script language="javascript" type="text/javascript">
    /*globals jQuery, window, Sys */
    (function ($, Sys) {
        function setUpMessageList() {
            var yesText = '<%= Localization.GetSafeJSString("Yes.Text", Localization.SharedResourceFile) %>';
            var noText = '<%= Localization.GetSafeJSString("No.Text", Localization.SharedResourceFile) %>';
            var title = '<%= Localization.GetSafeJSString("Confirm.Text", Localization.SharedResourceFile) %>';
            $('.dnnDeleteProductGroup').dnnConfirm({
                text: '<%= Localization.GetSafeJSString("Delete.Text", LocalResourceFile) %>',
                yesText: yesText,
                noText: noText,
                title: title
            });
			
        	var copyUser = $('#<%=copyUsers.ClientID%>');
        	copyUser.dnnConfirm({
        		text: '<%= Localization.GetSafeJSString("ConfirmRemoveAllUsers.Text", LocalResourceFile) %>',
		    	yesText: yesText,
		    	noText: noText,
		    	title: title,
		    	isButton: true,
		    	callbackTrue: function () {
		    	    copyUser.prop("checked", false);
		    	    var dialogText = '<%= Localization.GetSafeJSString("ConfirmRemoveSiteAndRemoveUsers.Text", LocalResourceFile) %>';		    	    
		    	    showConfirmRemoveSiteDialog(title, dialogText, yesText, noText);
		    	},
		    	callbackFalse: function () {
		    	    copyUser.prop("checked", true);
		    	    var dialogText = '<%= Localization.GetSafeJSString("ConfirmRemoveSite.Text", LocalResourceFile) %>';
		    	    showConfirmRemoveSiteDialog(title, dialogText, yesText, noText);
		    	}
		    });
        }

        function showConfirmRemoveSiteDialog(dialogTitle, dialogText, okText, noText) {

            $("<div class='dnnDialog'></div>").html(dialogText).dialog({
                modal: true,
                autoOpen: true,
                dialogClass: "dnnFormPopup",
                width: 400,
                height: 300,                
                title: dialogTitle,
                buttons:
                [
                    {
                        id: "ok_button",
                        text: okText,
                        "class": "dnnPrimaryAction",
                        click: function() {
                            $(selectedItem.get_element()).data("confirmed", true);
                            $(selectedItem.get_checkBoxElement())[0].click();
                            $(this).dialog("close");
                        }
                    },
                    {
                        id: "no_button",
                        text: noText,
                        click: function () {
                            $(this).dialog("close");
                        },
                        "class": "dnnSecondaryAction"
                    }
                ]
            });
        }

        var selectedItem = null;
	    window.OnClientItemChecking = function(sender, e) {
	        selectedItem = e.get_item();
	        
	    	if (selectedItem.get_checked() && !$(selectedItem.get_element()).data("confirmed")) {
	    	    
			    e.set_cancel(true);
	    		setTimeout(function() {
	    			$('#<%=copyUsers.ClientID%>').trigger("click");
	    		}, 0);
	    	}
	    };
	    
    	window.OnClientSelectedIndexChanging = function (sender, e) {
    		e.set_cancel(true);
		};

        $(document).ready(function () {
            setUpMessageList();
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
                setUpMessageList();
            });
        });
    } (jQuery, window.Sys));
</script>