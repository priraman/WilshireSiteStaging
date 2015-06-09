'use strict';
requirejs.config({
    baseUrl: 'scripts/contrib/',
    paths: {
        'QUnit': 'qunit',
        'templatePath': '../../'
    },
    urlArgs: 'v=' + (new Date()).getTime(),
    shim: {
        'QUnit': {
            exports: 'QUnit',
            init: function() {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        },
        
        'jquery.easydropdown.min': ['jquery'],
        'jquery.hoverintent.min': ['jquery'],
        'jquery.qatooltip': ['jquery.hoverintent.min']
    }
});

require(['QUnit', '../util-mock-for-test', '../pager-test', '../scroller-test', '../tabpanel-test',
         '../analytics-test', '../dashboard-test', '../gaming-test', '../settings-test', '../users-test', '../tasks-test'
],
    function (QUnit, util, pagertest, scrollertest, tabpaneltest, 
              analyticstest, dashboardtest, gamingtest, settingstest, userstest, taskstest        
        ) {
        
        
        util.asyncWaterfall([
            function(cb) {
                pagertest.run(cb);
            },
            
            function(cb) {
                scrollertest.run(cb);
            },
            
            function(cb) {
                tabpaneltest.run(cb);
            },
                
            function(cb) {
                analyticstest.run(cb);
            },
                
            function (cb) {
                dashboardtest.run(cb);
            },
                
            function (cb) {
                gamingtest.run(cb);
            },
                
            function (cb) {
                settingstest.run(cb);
            },
                
            function (cb) {
                userstest.run(cb);
            },
                
            function (cb) {
                taskstest.run(cb);
            }
        ],
        function () {
            // all done here...
            console.log('all done');
        });
        
        QUnit.load();
        QUnit.start();
});
