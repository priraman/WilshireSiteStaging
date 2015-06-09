<%@ Control Language="C#" Inherits="DotNetNuke.Modules.HtmlPro.EditHtml" CodeBehind="EditHtml.ascx.cs"
	AutoEventWireup="false" %>
<%@ Register TagPrefix="dnn" TagName="texteditor" Src="~/controls/texteditor.ascx" %>
<%@ Import Namespace="System.Globalization" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<div class="dnnForm dnnEditHtml dnnClear" id="dnnEditHtml">
	<ul class="dnnAdminTabNav dnnClear">
	    <li><a href="#currentContent">
                <%=LocalizeString("dshCurrentContent")%></a>
        </li>

		<%if (ShowMasterContent)
	    { %>
	    	<li><a href="#masterContent">
		    	<%=LocalizeString("dshMaster")%></a>
	    	</li>
	    <% } %>

	</ul>

	<div class="ehContent dnnClear" id="ehContent" runat="server">
		<div class="ehccContent dnnClear" id="currentContent">
			<fieldset>
				<div class="dnnFormItem">
					<dnn:texteditor id="txtContent" runat="server" height="400" width="100%">
					</dnn:texteditor>
				</div>
			</fieldset>
			<div class="dnnFormItem" id="divSubmittedContent" runat="server">
				<div class="html_preview">
					<asp:Literal ID="litCurrentContentPreview" runat="server" />
				</div>
			</div>
		</div>
		<%if (ShowMasterContent)
	{ %>
		<div class="ehccContent dnnClear" id="masterContent">
			<div class="ehmContent dnnClear" id="ehmContent">
				<div class="html_preview">
					<asp:PlaceHolder ID="placeMasterContent" runat="server" />
				</div>
			</div>
		</div>
		<% } %>
		<div id="divSaveActions" runat="server">
			<ul class="dnnActions dnnClear">
				<li>
					<asp:LinkButton ID="cmdClose" runat="server" class="dnnSecondaryAction" resourcekey="cmdClose" />
				</li>
			</ul>
		</div>

			<script type="text/javascript">


			    /*globals jQuery, window, Sys */
			    (function ($, Sys) {
			        var callbackTab = null;
			        var showMasterContent = "<%=ShowMasterContent.ToString(CultureInfo.InvariantCulture).ToLowerInvariant() %>" == "true";
			        var Editors = {};

			        var TIME_TO_AUTOSAVE = 5000;
			        var autosaveContent, saveContent, autoSaveInterval, moduleId, sf, autoSaveEnabled, editor, onkeydownTimeout, addOnChangeEvent, enableAutoSave,
                        setupDnnEditHtml, getContent, addBeforUnloadEvent, addBeforeCloseDialogEvent, setInitialValues, DeleteBeforeCloseDialogEvent, contentIsChanged;

			        setupDnnEditHtml = function(selectedTab) {
			            // TODO: Disable edit tab when locked by other user: var options = { disabled: [0] };
			            var options = {};
			            if (selectedTab != null) options.selected = selectedTab;
			            if (showMasterContent) {
			                var $tabs = $('#dnnEditHtml').dnnTabs(options).dnnPanels();
			                $tabs.bind("tabsactivate", function(event, ui) {
			                    switch (ui.newTab.index()) {
			                    case 0:
			                        $('#<%=divSaveActions.ClientID%>').show();
			                        break;
			                    case 2:
			                        $('#<%=divSaveActions.ClientID%>').hide();
			                        break;
			                    }
			                });

			                if ($tabs.tabs("option").active == 0) {
			                    $('#<%=divSaveActions.ClientID%>').show();
			                }
			            } else {
			                $('#dnnEditHtml').dnnPanels();
			                $(".dnnAdminTabNav").hide();
			            }


			            $("input.VersionPreview").click(function () {
			                callbackTab = "contentPreview";
			            });

			            var $toolbar = $('div[id$="txtContent_PanelView"]');
                        var $rightButtons = $toolbar.find('> div.right-buttons');
                        if ($rightButtons.length == 0) {
                            $rightButtons = $('<div class="right-buttons"></div>');
                            $toolbar.append($rightButtons);
                        }

                        var $classicButton = $('<a href="#" class=""><%= Localization.GetSafeJSString("ClassicEditor.Text", LocalResourceFile) %></a>');
                        $classicButton.click(function(e) {
                            e.preventDefault();

                            saveContent(function(data) {
                                if (window != window.top) {
                                    var content = getContent();
                                    (function($top) {
                                        var $module = $top('div.DnnModule-<%=ModuleId%>');
                                        $module.find('div[id$="HtmlModule_lblContent"]').html(content);
                                        $module.trigger('editmodule');
                                    }(window.top.$));
                                    window.top.dnnModal.closePopUp(false);
                                } else {
                                    if (typeof dnn.dom != "undefined") {
                                        dnn.dom.setCookie('CEM_NewModuleId', '<%=ModuleId%>', 0, dnn.getVar("sf_siteRoot", "/"));
                                    }
                                    location.href = '<%=ReturnURL%>';
                                }
                            });
                        });

                        $rightButtons.append($classicButton);
			        };


			        Editors.ContentEditorId = '<%=ContentEditorId%>';
			        Editors.BasicContentEditorId = '<%=BasicContentEditorId%>';

			        getContent = function() {
			            var result = null;
			            var editorById = $('#' + Editors.BasicContentEditorId);
			            if (editorById != null && editorById.val() != undefined)
			                result = editorById.val();
			            else {
			                editorById = $find(Editors.ContentEditorId);
			                if (editorById != null)
			                    result = editorById.get_html();
			                else result = null;
			            }

			            return result;
			        }

			        var UnLoadSettings = {};

			        UnLoadSettings.SaveAction = false; //Save button will change this value at OnclientScript code
			        UnLoadSettings.LeaveDialog = false; //Dialog will change this value at BeforeCloseDialog code
			        UnLoadSettings.CancelAction = false; //Cancel link will change this value at onclick event code
			        UnLoadSettings.ActionButton = false; //Buttons will change this value at onclient click
			        UnLoadSettings.AutoSaveAction = false; //Buttons will change this value at onclient click

			        moduleId = <% = ModuleId %>;
			        autoSaveEnabled = false;

			        autosaveContent = function() {
			            if (contentIsChanged() && autoSaveEnabled) {
			                autoSaveEnabled = false; //Until new changes on Editor
			                saveContent();
			            }
			        };

			        saveContent = function(successCallBack) {
			            // Save
			            sf = $.ServicesFramework(moduleId);
			            $.ajax({
			                type: "POST",
			                url: sf.getServiceRoot('HtmlPro') + "HtmlTextPro/Save",
			                beforeSend: sf.setModuleHeaders,
			                data: {
			                    HtmlText: getContent()
			                },
			                success: function(data) {
			                    if (typeof successCallBack == "function") {
			                        successCallBack(data);
			                    }
			                },
			                error: function(xhr, status, error) {
			                    alert(error);
			                }
			            });
			        };

			        addOnChangeEvent = function() {
			            editor = $find(Editors.ContentEditorId);
			            if (editor != null) {
			                editor.attachEventHandler("onchange", function() {
			                    enableAutoSave();
			                });

			                editor.attachEventHandler("onkeydown", function() {
			                    clearTimeout(onkeydownTimeout);
			                    setTimeout(function() {
			                        enableAutoSave();
			                    }, 500);
			                });

			            }
			        };

			        enableAutoSave = function() {
			            autoSaveEnabled = true;
			        };

			        addBeforUnloadEvent = function() {
			            $(window).bind('beforeunload', function () {
			                if (!UnLoadSettings.AutoSaveAction) {

			                    if (UnLoadSettings.LeaveDialog) { //If user has response to the dialog confirm, here we do nothing
			                        UnLoadSettings.LeaveDialog = false;

			                    } else {

			                        if (!UnLoadSettings.ActionButton) {
			                            clearInterval(autoSaveInterval);
			                            if (contentIsChanged()) {
			                                saveContent();
			                            }
			                        }
			                    }
			                }
			            });
			        }

			        addBeforeCloseDialogEvent = function() {
			            var dialog = parent.$('.ui-dialog:visible'); //this object remains shown when the confirm dialog appears

			            if (dialog != null) {
			                dialog.bind('dialogbeforeclose', function (event, ui) {
			                    if (!UnLoadSettings.ActionButton) {
			                        if ($('#currentContent').is(':visible')) {
			                            if (contentIsChanged()) {
			                                saveContent();
			                                UnLoadSettings.LeaveDialog = true;
			                                return true;
			                            } else {
			                                return true;
			                            }
			                        } else {
			                            UnLoadSettings.LeaveDialog = true;
			                            return true;
			                        }
			                    }
			                });
			            }
			        }

			        //This method is called when a button is clicked, to prevent unexpected close behavior
			        DeleteBeforeCloseDialogEvent = function () {
			            var dialog = parent.$('.ui-dialog:visible'); //this object remains shown when the confirm dialog appears

			            if (dialog != null) {
			                dialog.unbind('dialogbeforeclose');
			            }
			        }

                    //Put the onclick event method accesible for Close button declaration
			        window.dnn = window.dnn || {};
			        window.dnn.editHtml = window.dnn.editHtml || {};
			        window.dnn.editHtml.onCloseButtonClick = function() {
			            UnLoadSettings.SaveAction = true;
			            UnLoadSettings.ActionButton = true;
			            DeleteBeforeCloseDialogEvent();
			        }

			        setInitialValues = function() {
			            UnLoadSettings.InitialContent = getContent();
			            if (UnLoadSettings.InitialContent == null) {
			                setTimeout(setInitialValues, 250);
			            } else {
			                addOnChangeEvent();
			            }
			        }

			        contentIsChanged = function () {
			            return getContent() != UnLoadSettings.InitialContent;
			        }

			        $(document).ready(function () {

			            dnn.dom.setCookie("dnnPanel-Content", "true", 0, '/', '', false, 120000);

			            setupDnnEditHtml(0);

			            setInitialValues();

			            addBeforeCloseDialogEvent();

			            addBeforUnloadEvent();

			            autoSaveInterval = setInterval(autosaveContent, TIME_TO_AUTOSAVE);

			            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
			                setupDnnEditHtml();

			                setInitialValues();

			                addBeforeCloseDialogEvent();

			                addBeforUnloadEvent();

			                autoSaveInterval = setInterval(autosaveContent, TIME_TO_AUTOSAVE);

			                if (callbackTab !== null) {
			                    $(".dnnAdminTabNav").find("a[href$=" + callbackTab + "]").click();
			                    callbackTab = null;
			                };

			                if (__editorOverrideCSSPath)
			                    replacejscssfile('Telerik.Web.UI.WebResource.axd', __editorOverrideCSSPath, 'css');

			            });
			        });
			    } (jQuery, window.Sys));
			</script>
	</div>
</div>
