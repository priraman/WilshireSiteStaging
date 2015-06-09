// IE8 doesn't like using var dnnModule = dnnModule || {}
if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };

dnnModule.DigitalAssetsTagsListMenu = function() {

	var tagsListMenu = null;
	var resources;
    function init(initResources) {
        resources = initResources;
    }
	function initTagsListMenu(sender) {
	    tagsListMenu = sender;
	}
    
	function tagsListMenuOnItemClicked(sender, args) {
		switch (args.get_item().get_value()) {
			case "GetTagUrl":
				var target = $(args.get_targetElement());
				if (!target) return;
				var tagName = target.find('a').attr('data-termname');
			    var url = dnnModule.digitalAssets.getFullUrl("?tagName=" + encodeURIComponent(tagName));				
			    dnnModule.digitalAssets.openGetUrlModal(url, resources.getTagUrlLabel);
				break;
		}
	};
    
	function showTagsListMenu(event) {
		tagsListMenu.show(event);
	}

    function selectTerm(tagName, targetLink) {
        var target = targetLink || $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags ul li a[data-termname='" + tagName + "']");
        $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags ul li").removeClass("selected");
        target.parent().addClass("selected");
        return { Id: target.attr("data-termid"), Name: target.attr("data-termname") };
    }

    return {
        init: init,
        initTagsListMenu: initTagsListMenu,
        tagsListMenuOnItemClicked: tagsListMenuOnItemClicked,
        showTagsListMenu: showTagsListMenu,
        selectTerm: selectTerm
	};
}();