'use strict';
(function() {
    var v = (function () {
        var d = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
        var q = location.search.substring(1);
        var k = q.split('&');
        for (var i in k) {
            var l = k[i].split('=');
            if (l.length > 1) {
                if ('cdv' === d(l[0]))
                    return d(l[1]);
            }
        }
        return '';
    })();
    var debugMode = window.top['dnn'] && (window.top['dnn'].getVar('pb_debugMode') == "true");
    window.requirejs.config({
        baseUrl: 'scripts/contrib/',
        paths: {
            'templatePath': '../../',
            'cssPath': '../../css/'
        },
        urlArgs: (v ? 'cdv=' + v : '') + (debugMode ? '&t=' + Math.random() : ''),
        shim: {
            //'jquery.easydropdown.min': ['jquery'],
            'jquery.hoverintent.min': ['jquery'],
            'owl-carousel/owl.carousel': ['jquery'],
            'jquery.qatooltip': ['jquery.hoverintent.min']
        }
    });
})();


require(['jquery', 'knockout', 'moment', '../util', '../sf', '../config', '../persistent',
        //'jquery.easydropdown.min',
        'domReady!', 'owl-carousel/owl.carousel'], function ($, ko, moment, ut, sf, cf, persistent) {
    var iframe = window.parent.document.getElementById("personaBar-mobi-iframe");
    if (!iframe) return;

    var $iframeContainer = $(iframe.parentNode);
    var $parentWindow = $(window.parent);
	var parentHtml = window.parent.document.documentElement;
	var config = cf.init();
    var utility = ut.init(config);
    var inAnimation = false;
    
    var rootPath = location.protocol + '//' + location.host + (location.port ? (':' + location.port) : '');
    if (rootPath.substr(rootPath.length - 1, 1) == '/') {
        rootPath = rootPath.substr(0, rootPath.length - 1);
    }
    window.requirejs.config({
        paths: {
            'rootPath': rootPath
        }
    });
    
    var util = {
        sf: sf.init(config.siteRoot, config.tabId, config.antiForgeryToken, '#personaBar-loadingbar'),
        persistent: persistent.init(config, sf),
		moment: moment,
        closePersonaBar: function(callback) {
            viewSite();
            if (typeof callback === 'function') callback();
        },
        
        loadPanel: function (panelId, name, params) {
            var wrapper = $(panelId);
            $('#toggle').parent().removeClass('expanded');
            var self = this;
            $('#nav-menu').slideUp(200, function () {
                $('.socialpanel').hide();
                $(panelId).slideDown(200, function () {
                    var template = wrapper.data('template');
                    self.loadMobileTemplate(template, wrapper, params);
                    $('#breadcrumb').html(name);
                    inAnimation = false;
                    navMenuVisible = false;
                    panelVisible = true;
                });
            });
        },
        loadModuleDashboard: function (moduleName) {
            var self = this;
            self.loadPanel('#social-dashboard-panel', moduleName, { moduleName: moduleName });
        }
    };
    
    util = $.extend(util, utility);

    var collapseIframe = function() {
        $iframeContainer.css("bottom", "auto");
        $iframeContainer.height("auto");
        var height = $("#header-mobi").outerHeight();
        iframe.style.height = height + "px";
        $(parentHtml).css("overflow-y", "auto");
        $(window.parent.document.body).css('margin-top', height);
    };

    var expandIframe = function() {
        $iframeContainer.css("bottom", 0);
        $iframeContainer.height($parentWindow.height());
        iframe.style.height = "100%";
        $(parentHtml).css("overflow-y", "hidden");
    };

	var navMenuVisible = false;
	var panelVisible = false;
    
	$('#toggle').click(function(e){
		e.preventDefault();
		if(inAnimation) return;
		inAnimation = true;	
	   
		if(!navMenuVisible) {
		    expandIframe();
		    $('div.body')[0].scrollTop = 0;
		    $('#toggle').parent().addClass('expanded');
			$('#nav-menu').slideDown(200, function(){
				inAnimation = false;
				navMenuVisible = true;
			});
		}
		else{
			$('#nav-menu').slideUp(200, function(){				
			    if (!panelVisible) collapseIframe();
				inAnimation = false;
				navMenuVisible = false;		
				$('#toggle').parent().removeClass('expanded');
			});
		}
	});

    var viewSite = function() {
        $('.socialpanel').slideUp(200, function() {
            $('#breadcrumb').html('');
            $('#nav-menu').slideUp(200, function() {
                inAnimation = false;
                navMenuVisible = false;
                panelVisible = false;
                $('#toggle').parent().removeClass('expanded');
                collapseIframe();
            });
        });
    };

    var selectMenu = function($li) {
        $('#nav-menu > ul li.selected').removeClass('selected');
        $li.addClass('selected');
    };

    // Module Initialization
    var javascriptMainModuleNames = config.javascriptMainModuleNames.split(",");
    for (var i = 0; i < javascriptMainModuleNames.length; i++) {
        if (!javascriptMainModuleNames[i]) continue;
        var name = javascriptMainModuleNames[i] + '.mobi';
		var moduleName = "../" + name;
        var moduleCss = "css!cssPath" + name + ".css";
        require([moduleName, moduleCss], function (mainModule) {
            if (!mainModule) return;

            if (typeof mainModule === 'object') {
                mainModule.init(util);
            }
            else if (typeof mainModule === 'function') {
                switch (mainModule.type) {
                    case 'Class':
                        new mainModule(util);
                        break;
                    case 'Static Class':
                        mainModule.init(util);
                        break;
                }
            }
        });
    }
    

    if (config.hasValidLicenseOrTrial) {

        $('#nav-menu > ul > li > div.arrow').click(function(e) {
            e.stopPropagation();
            $(this).parent().toggleClass("expanded");
        });

        $('#nav-menu > ul > li').click(function (e) {
            e.preventDefault();
            
            if ($(this).attr('id') == 'btn-logout') {
                var onLogOffSuccess = function () {
                    viewSite();
                    window.top.document.location.href = window.top.document.location.href;
                };
                util.sf.rawCall("GET", config.logOff, null, onLogOffSuccess);
                return;
            }

            if (inAnimation) return;
            inAnimation = true;
            if ($(this).attr('id') == 'btn-viewsite') {
                viewSite();
                return;
            }

            var panelId = $(this).data('panel-id');
            if (!panelId) {
                return;
            } else {
                selectMenu($(this));
            }

            var name = $(panelId).data('name');
            util.loadPanel(panelId, name);
        });

        $('#nav-menu > ul > li > ul.submenu > li').click(function(e) {
            e.stopPropagation();
            selectMenu($(this).parent().parent());
            $(this).addClass('selected');
            var panelId = $(this).data('panel-id');
            var name = $(this).data('module-name');
            var params = name ? { moduleName: name } : {};
            name = name ? name : $(panelId).data('name');
            util.loadPanel(panelId, name, params);
        });

        $(window).on("total-tasks-changed", function(event, totalTasks) {
            if (totalTasks > 0) {
                $('#nav-menu span.total-tasks').show().text(totalTasks);
            } else {
                $('#nav-menu span.total-tasks').hide();
            }
        });

        util.loadTemplate("tasks", $("#tasks-panel"));
    } else {
        $('#nav-menu > ul > li > ul.submenu > li, #nav-menu > ul > li').addClass("disabled");
    }
    
    $iframeContainer.css({
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        'z-index': 99999
    });

    collapseIframe();

    util.loadResx(function () {
	    ko.applyBindings(util.resx.PersonaBar, document.getElementById('nav-menu'));
	});
});