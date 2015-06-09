'use strict';
define(['jquery', 'knockout'], function ($, ko) {
    var utility = null;
	var viewModel = {
	    pageIndex: ko.observable(0),
        pageSize: 10,
		totalResults: ko.observable(0),
		totalTasks: ko.observable(0),
		results: ko.observableArray([]),
		hasNewTasks: ko.observable(false),
		hasMoreTasks: ko.observable(false)
	};

	viewModel.totalTasks.subscribe(function (totalTasks) {
        $(window).trigger("total-tasks-changed", [totalTasks]);
	});

	viewModel.loadMore = function () {
	    if (viewModel.hasMoreTasks()) {
	        var notifications = viewModel.results();
	        var lastNotificationId = 0;
	        if (notifications.length) {
	            lastNotificationId = notifications[notifications.length - 1].notificationId();
	        }
	        getTasks(lastNotificationId);
	    }
	    else {
	        viewModel.results([]);
	        getTasks(0);
	    }
	};

    var isMobile = false;

	var currentDetailView = null;
	var toggleDetailView = function(task, li){
		var detailView = li.next();
		if(li.hasClass('detail-view')){
			detailView.slideUp(100, 'linear', function(){
				currentDetailView = null;
				li.removeClass('detail-view');
			});
		}
		else {
		    detailView.find(".mobile").each(function () {
		        var href = $(this).attr("href");
		        var mobileQueryString = "";
		        if (isMobile) {
		            mobileQueryString = href.indexOf("?") > -1 ? "&mobile=true" : "?mobile=true";
		        }

		         $(this).attr("href", href + mobileQueryString);
		    });

		    detailView.find(".notification-body a[target!='_blank']").unbind('click').bind('click', function (evt) {
		        evt.preventDefault();
				var link = $(this).attr('href');
				if(link){
					utility.closePersonaBar(function() {
						window.parent.document.location.href = link;
					});
				}
			});
			if(currentDetailView){
				currentDetailView.prev().removeClass('detail-view');
			    currentDetailView.slideUp(100, 'linear', function() {
			        li.addClass('detail-view');
			        detailView.slideDown(200, 'linear', function() {
			            currentDetailView = detailView;
			        });
			    });
			}
			else{
				li.addClass('detail-view');
				detailView.slideDown(200, 'linear', function(){
					currentDetailView = detailView;
				});
			}
		}
	};

	var removeTask = function(task){
	    var count = task.count();
	    var totalTasks = viewModel.totalTasks() - count;
	    totalTasks = totalTasks < 0 ? 0 : totalTasks;
		viewModel.totalTasks(totalTasks);
		var results = viewModel.results();
		var index = -1;
		$.each(results, function(i, v){
			if(v.notificationId() === task.notificationId()){
				index = i;
				return false;
			}
		});
		if(index >= 0){
			results.splice(index, 1);
			viewModel.results(results);
		}
	};

	var bindTaskAction = function(action, task){
		action.call = function(data, e){
			e.preventDefault();
			if(action.onCall) return;
			action.onCall = true;
			var li = $(e.target).closest('li');
			var titleLi = li.prev();
			if (!data.api) return;
		    utility.sf.moduleRoot = 'dnncorp/personaBar';
			var url = utility.sf.getSiteRoot() + data.api;
			utility.sf.rawCall('POST', url, { NotificationId: data.notificationId }, function(d){
				action.onCall = false;
				if (d && d.Result === 'success') {
				    // sucess...
				    li.slideUp(200, 'linear', function() {
				        titleLi.slideUp(50, 'linear', function() {
				            currentDetailView = null;
				            removeTask(task);
				        });
				    });
				} else {
				    utility.notify('Failed...');
				}
			}, function(d){
			    // fail...
			    utility.notify('Failed...');
				if (d.status == 404) {
                    li.slideUp(200, 'linear', function(){
						titleLi.slideUp(50, 'linear', function(){
							currentDetailView = null;
							removeTask(task);
						});
					});
                }
				action.onCall = false;
			});
		};
	};

	var getTasks = function (afterNotificationId, cb) {
        utility.sf.moduleRoot = 'dnncorp/personaBar';
		utility.sf.controller = 'tasks';
		utility.sf.get('gettasks', { pageIndex: viewModel.pageIndex(), pageSize: viewModel.pageSize, afterNotificationId: afterNotificationId }, function (d) {

		    var results = viewModel.results();
		    if (d) {
		        $.each(d.Results || [], function(i, v) {
		            var t = {
		                count: ko.observable(v.Count),
		                subject: ko.observable(v.Subject),
		                summary: ko.observable(v.Summary),
		                index: ko.observable(1),
		                notificationId: ko.observable(v.NotificationId),
		                currentView: {
		                    body: ko.observable(v.Body),
		                    avatar: ko.observable(v.SenderAvatarUrl),
		                    displayName: ko.observable(v.SenderDisplayName),
		                    when: ko.observable(v.When),
		                    notificationId: ko.observable(v.NotificationId),
		                    actions: ko.observableArray([])
		                }
		            };

		            var actions = [];
		            if (v.Actions) {
		                $.each(v.Actions, function(ii, vv) {
		                    var a = {
		                        api: vv.ApiCall,
		                        name: vv.Name,
		                        notificationId: v.NotificationId
		                    };
		                    a.css = actions.length == 0 ? 'primarybtn' : 'secondarybtn';
		                    a.onCall = false;
		                    bindTaskAction(a, t);
		                    actions.push(a);
		                });
		            }

		            t.currentView.actions(actions);
		            t.currentView.parent = t;

		            t.showFooter = ko.computed(function() {
		                return t.count() > 1;
		            });

		            t.navigateViewDesc = ko.computed(function() {
		                var f = utility.resx.PersonaBar.txt_ViewIndex;
		                return f.replace('{0}', t.index()).replace('{1}', t.count());
		            });

		            t.onNav = false;

		            t.navPrev = function(data, e) {
		                e.preventDefault();
		                var parent = data.parent;
		                if (parent.index() == 1) return;

		                parent.index(parent.index() - 1);
		                if (parent.onNav) return;
		                parent.onNav = true;
		                getTaskView(parent, function() {
		                    parent.onNav = false;
		                });

		            };

		            t.navNext = function(data, e) {
		                e.preventDefault();
		                var parent = data.parent;
		                if (parent.index() == parent.count()) return;

		                parent.index(parent.index() + 1);
		                if (parent.onNav) return;
		                parent.onNav = true;
		                getTaskView(parent, function() {
		                    parent.onNav = false;
		                });
		            };

		            t.expand = function(data, e) {
		                e.preventDefault();
		                var li = $(e.target);
		                if (e.target.nodeName !== 'LI') {
		                    li = $(e.target).closest('li');
		                }

		                if (li.hasClass('detail-view')) return;
		                toggleDetailView(data, li);
		            };

		            t.collapse = function(data, e) {
		                e.preventDefault();
		                var li = $(e.target).parent('li');

		                if (!li.hasClass('detail-view')) return;
		                toggleDetailView(data, li);
		            };

		            results.push(t);
		        });
		    }

		    viewModel.results(results);
			if (afterNotificationId == 0) {
			    viewModel.totalResults(d.TotalRollups || 0);
			    viewModel.totalTasks(d.TotalTasks || 0);
			    viewModel.hasNewTasks(false);
			}

			viewModel.hasMoreTasks(viewModel.totalResults() > results.length);
			if(typeof cb === 'function') cb();
		}, function(){
		    // failed ...
		    utility.notify('Failed...');
		    viewModel.results([]);
		    if (afterNotificationId == 0) {
		        viewModel.totalResults(0);
		        viewModel.totalTasks(0);
		        viewModel.hasNewTasks(false);
		    }
		    viewModel.hasMoreTasks(false);
		    if (typeof cb === 'function') cb();
		});
	};

	var getTaskView = function (task, cb) {
        utility.sf.moduleRoot = 'dnncorp/personaBar';
		utility.sf.controller = 'tasks';
		utility.sf.get('gettask', { notificationId: task.notificationId(), indexId: task.index() }, function(d){
		    if (!d || !d.Success) {
		        utility.notify('Failed...');
		        if (typeof cb === 'function') cb();
			    return;
			}
			var v = d.UserDetail;
			task.currentView.body(v.Body);
			task.currentView.avatar(v.SenderAvatarUrl);
			task.currentView.displayName(v.SenderDisplayName);
			task.currentView.when(v.When);
			task.currentView.notificationId(v.NotificationId);

			var actions = [];
			if(v.Actions){
				$.each(v.Actions, function(ii, vv){
					var a = {
						api: vv.ApiCall,
						name: vv.Name,
						notificationId: v.NotificationId
					};
					a.css = actions.length == 0 ? 'primarybtn': 'secondarybtn';
					bindTaskAction(a, task);
					actions.push(a);
				});
			}

			task.currentView.actions(actions);
			if(typeof cb === 'function') cb();

		}, function(){
		    // failed...
		    utility.notify('Failed...');
		    if (typeof cb === 'function') cb();
		});
	};

	var refreshTasks = function () {
	    if (!utility.persistent.load().expandPersonaBar) return;
        utility.sf.moduleRoot = 'dnncorp/personaBar';
	    utility.sf.controller = 'tasks';
	    utility.sf.getsilence('gettasks', { pageIndex: 0, pageSize: 1, afterNotificationId: 0 }, function (d) {
	        var originalCount = viewModel.totalTasks();
	        var newCount = d.TotalTasks || 0;
	        viewModel.totalTasks(newCount);
	        if (newCount > originalCount && newCount > 0) {
	            viewModel.hasNewTasks(true);
	        }
	    }, function () {
	        // failed ...
	        utility.notify('Failed...');
	        viewModel.hasNewTasks(false);
	    });
	};

	return {
		init: function(wrapper, util, params, callback){
		    utility = util;

			$('.socialtasksheader > div > div.right > a').click(function(e){
				e.preventDefault();
				if(utility.inAnimation) return;
				utility.inAnimation = true;
			    // For Ipad
				var width = parent.document.body.clientWidth;
				var socialTasksPanel = -297;
				if (width <= 1024 && width > 768) {
				    socialTasksPanel = -238;
				} else if (width <= 768) {
				    socialTasksPanel = -182;
				}
				var userSettings = utility.persistent.load();
				if(userSettings.expandTasksPane){
					$('.socialtasks').css('background-color', 'transparent');
					$('.socialtasks > div > div').animate({ left: socialTasksPanel }, 189, 'linear', function () {
						$('.socialtasksheader').animate({ left: 58}, 378, 'linear', function(){
						    utility.inAnimation = false;
							utility.persistent.save({
                                expandTasksPane: false
							});
						});
					});
				}
				else{
					$('.socialtasksheader').css({ left: 0});
					$('.socialtasks > div > div').animate({ left: 0}, 189, 'linear', function(){
					    utility.inAnimation = false;
					    utility.persistent.save({
					        expandTasksPane: true
					    });
						$('.socialtasks').css('background-color', '#eee');
					});
				}
			});

			if (!utility.persistent.load().expandTasksPane) {
				$('.socialtasks').css('background-color', 'transparent');
				$('.socialtasks > div > div').css({ left: -297 });
				$('.socialtasksheader').css({ left: 58 });
			}

			utility.asyncParallel([
				function(cb1){
					getTasks(0, cb1);
				}
			], function(){
				var container = wrapper[0];
				viewModel.resx = utility.resx.PersonaBar;
				ko.applyBindings(viewModel, container);
				setInterval(refreshTasks, 30 * 1000);
				if(typeof callback === 'function') callback();
			});
		},

		initMobile: function (wrapper, util, params, callback) {
		    isMobile = true;
		    this.init(wrapper, util, params, callback);
		},

		load: function (params, callback) {
		    isMobile = true;
		    if (typeof callback === 'function') callback();
		},

		loadMobile: function (params, callback) {
		    isMobile = false;
		    this.load(params, callback);
		}
	};
});