'use strict';
define(['jquery', 'knockout', '../scripts/pager', '../scripts/validator', '../scripts/config', '../scripts/ParentLoader'], function ($, ko, pager, validator, cf, parentLoader) {
	var config = cf.init();
	var utility = null;
	var triggerSubscribe = true;
	var onCreateUser = false;
	var andSearchTerm = false;
	var viewModel = {
		searchText: ko.observable(''),
		results: ko.observableArray([]),
		totalResults: ko.observable(0),
		sortColumn: ko.observable('Joined'),
		sortAscending: ko.observable(false),
		showSocial: ko.observable(config.sku === 'DNNSOCIAL'),
        isCommunityManager: ko.observable(config.isCommunityManager),
		userEditing: {
			userName: ko.observable(''),
			firstName: ko.observable(''),
			lastName: ko.observable(''),
			email: ko.observable(''),
			save: function(vm, e){
				if(onCreateUser) return;
				if(!validator.validate($('#createusertbl'))) return;
				onCreateUser = true;
				var saveBtn = $(e.target);
				saveBtn.html(utility.resx.PersonaBar.btn_Saving);
				createUser(function(){
					viewModel.userEditing.cancel();
					utility.notify(utility.resx.PersonaBar.txt_UserSaved);
					triggerSubscribe = false;
					viewModel.searchText('');
					viewModel.sortColumn('Joined');
					viewModel.sortAscending(false);
					viewModel.pageIndex(0);
					triggerSubscribe = true;
					searchUsers();
					onCreateUser = false;
					saveBtn.html(utility.resx.PersonaBar.btn_Save);
				}, function(d){
					var $input = $('#createuser-username');
					$('<span></span>').addClass('dnnFormError').html(d).insertAfter($input).click(function () {
						$(this).hide();
						return false;
					});
					$input.bind('focus', function() {
						$input.parent().find('span.dnnFormError').hide();
					});
					onCreateUser = false;
				    utility.notify('Failed...');
					saveBtn.html(utility.resx.PersonaBar.btn_Save);
				});
			},
			cancel: function(){
				$('#createusertbl > tbody > tr > td > div').slideUp(200, 'linear', function(){
					$('#createusertbl > tbody > tr').hide();
				});
			}
		},
		detailUser: {
		    userId: ko.observable(0),
			userName: ko.observable(''),
			displayName: ko.observable(''),
			rank: ko.observable(0),
			reputation: ko.observable(0),
			experience: ko.observable(0),
			engagement: ko.observable(0),
			influence: ko.observable(0),
			profileUrl: ko.observable(''),
            userFolder: ko.observable(0),
            hasFiles: ko.observable(false),
			isDeleted: ko.observable(false),
			lastActive: ko.observable(''),
			timeOnSite: ko.observable(''),
			totalContribution: ko.observable(0),
			recentActivities: ko.observableArray([]),

            // temp value for editing points
			tempReputation: ko.observable(0),
			tempExperience: ko.observable(0),
			tempNotes: ko.observable(''),
            canToggleModerator: ko.observable(false),
			canToggleEditor: ko.observable(false),
			isModerator: ko.observable(false),
			isEditor: ko.observable(false),

			navigateProfile: function(data, e){
				e.preventDefault();
				utility.closePersonaBar(function(){
					window.parent.document.location.href = data.profileUrl();
				});
			},

			navigateFiles: function(data, e){
				e.preventDefault();

				var folderId = data.userFolder();
			    var hasFiles = data.hasFiles();
                if (folderId > 0 && hasFiles) {
                    utility.loadPanel("#assets-panel", $("li.btn_assets.btn_panel"), { folderId: folderId });
                } else {
                    var message = utility.resx.PersonaBar.err_NoUserFolder;
                    message = message.replace("{0}", data.displayName());
                    utility.notify(message);
                }
                
			},			

			editPoint: function(data, e) {
			    e.preventDefault();
			    data.tempExperience(data.experience());
			    data.tempReputation(data.reputation());
			    data.tempNotes('');
			    var inputs = $('.user-statistics-input');
			    inputs.prev().hide();
			    inputs.css({ display: 'block' });
			    var notes = $('.user-statistics-edit-notes');
			    notes.show();
			    $(e.target).hide();
			},

			cancelEditPoint: function (data, e) {
			    if (e) e.preventDefault();

                if (!viewModel.isCommunityManager()) {
                    return;
                }

			    var inputs = $('.user-statistics-input');
			    inputs.css({ display: 'none' });
			    inputs.prev().show();
			    var notes = $('.user-statistics-edit-notes');
			    notes.hide();
			    $('.user-statistics > li > span.dnnFormError').remove();
			    $('#user-editpointbtn').show();
			},

			saveEditPoint: function(data, e) {
			    e.preventDefault();
			    saveAdhocPoint(data, $(e.target));
			}          
		}
	};

	viewModel.sort = function(vm, e){
		var column = $(e.target).data('column');
		if(column === viewModel.sortColumn()){
			viewModel.sortAscending(!viewModel.sortAscending());
		}
		else{
			viewModel.sortColumn(column);
			viewModel.sortAscending(true);
		}
		searchUsers();
	};

	viewModel.sortColumnClass = function(column){
		if(column === viewModel.sortColumn()){
			return viewModel.sortAscending() ? 'asc' : 'desc';
		}
		return '';
	};

	viewModel.create = function(){
		if($('#createusertbl > tbody > tr').is('visible')) return;
		$('#userstbl tr').removeClass('in-edit-row');
		$('#users-editrow > td > div').slideUp(200, 'linear', function(){
			$('#users-editrow').appendTo('#users-editbody');
			viewModel.userEditing.firstName('');
			viewModel.userEditing.lastName('');
			viewModel.userEditing.userName('');
			viewModel.userEditing.email('');
			$('#createusertbl').find('span.dnnFormError').remove();
			$('#createusertbl > tbody > tr').show();
			$('#createusertbl > tbody > tr > td > div').slideDown(400, 'linear');
		});
	};

    var onSaveAdhocPoint = false;
    var saveAdhocPoint = function(user, btn) {
        if (!validator.validate($('#users-editrow'), [
			{
                name: 'nolargerthanexp',
                errorMsg: utility.resx.PersonaBar.err_NoLargerThanExp,
                validate: function () {
					    var r = parseInt(user.tempReputation());
					    var e = parseInt(user.tempExperience());
					    return r <= e;
                 }
            }
        ])) return;

        if (onSaveAdhocPoint) return;
        onSaveAdhocPoint = true;
        btn.html(utility.resx.PersonaBar.btn_Saving);
		utility.sf.moduleRoot = 'dnncorp/personaBar';
        utility.sf.controller = "users";
        utility.sf.post('saveuserpoints', { userId: user.userId(), reputation: user.tempReputation(), experience: user.tempExperience(), note: user.tempNotes() }, function(d) {
            if (d && d.Success) {
                user.experience(user.tempExperience());
                user.reputation(user.tempReputation());
                user.cancelEditPoint();
                utility.notify(utility.resx.PersonaBar.txt_Saved);
            } else {
                utility.notify('Failed...');
            }
            onSaveAdhocPoint = false;
            btn.html(utility.resx.PersonaBar.btn_Save);
        }, function() {
            // failed...
            utility.notify('Failed...');
            onSaveAdhocPoint = false;
            btn.html(utility.resx.PersonaBar.btn_Save);
        });
    };

	var createUser = function(success, fail){
		utility.sf.moduleRoot = 'dnncorp/personaBar';
		utility.sf.controller = 'users';
		var params = {
			firstName: viewModel.userEditing.firstName(),
			lastName: viewModel.userEditing.lastName(),
			userName: viewModel.userEditing.userName(),
			email: viewModel.userEditing.email()
		};
		utility.sf.post('createuser', params, function(d){
			if(/^\d+$/.test(d)){
				// success;
				if(typeof success === 'function') success(d);
			}
			else{
				// fail;
				if(typeof fail === 'function') fail(d);
			}
		}, function(){
		    // failed....
		    if (typeof fail === 'function') fail(d);
		});
	};

    var getUserDetail = function(userId, cb) {
		utility.sf.moduleRoot = 'dnncorp/personaBar';
        utility.sf.controller = 'users';
        utility.sf.get('getuserdetail', { userId: userId }, function(d) {
            if (d.Success && d.UserDetail) {
                //unsubscribe notifications
                for (var i = 0; i < toggleUserRoleSubscribers.length; i++) {
                    toggleUserRoleSubscribers[i].dispose();
                }
                toggleUserRoleSubscribers = [];

                viewModel.detailUser.userId(d.UserDetail.UserId);
                viewModel.detailUser.displayName(d.UserDetail.Displayname);
                viewModel.detailUser.userName(d.UserDetail.Username);
                viewModel.detailUser.rank(d.UserDetail.Rank == -1 ? utility.resx.PersonaBar.label_NA : d.UserDetail.Rank);
                viewModel.detailUser.experience(d.UserDetail.Experience);
                viewModel.detailUser.reputation(d.UserDetail.Reputation);
                viewModel.detailUser.engagement(d.UserDetail.Engagement);
                viewModel.detailUser.influence(d.UserDetail.Influence);
                viewModel.detailUser.profileUrl(d.UserDetail.ProfileUrl);
                viewModel.detailUser.userFolder(d.UserDetail.UserFolder);
                viewModel.detailUser.hasFiles(d.UserDetail.HasUserFiles);
                viewModel.detailUser.isDeleted(d.UserDetail.IsDeleted);
                viewModel.detailUser.timeOnSite(d.UserDetail.TimeOnSite);
                viewModel.detailUser.lastActive(d.UserDetail.LastActive);
                viewModel.detailUser.totalContribution(d.UserDetail.TotalContribution);
                viewModel.detailUser.canToggleModerator(d.UserDetail.ModeratorStatus > 0);
                viewModel.detailUser.canToggleEditor(d.UserDetail.EditorStatus > 0);
                viewModel.detailUser.isModerator(d.UserDetail.ModeratorStatus == 2);
                viewModel.detailUser.isEditor(d.UserDetail.EditorStatus == 2);
                //subscrible notifications
                toggleUserRoleSubscribers.push(viewModel.detailUser.isModerator.subscribe(function(checked) {
                    toggleUserRoleHandler('Moderator', checked);
                }));
                toggleUserRoleSubscribers.push(viewModel.detailUser.isEditor.subscribe(function(checked) {
                    toggleUserRoleHandler('Editor', checked);
                }));
                var activities = [];
                $.each(d.UserDetail.RecentActivities, function(i, v) {
                    var a = {
                        title: ko.observable(v.Title),
                        created: ko.observable(v.Action + ' ' + v.Created),
                        area: ko.observable(v.Area)
                    };

                    activities.push(a);
                });

                viewModel.detailUser.recentActivities(activities);
                viewModel.detailUser.cancelEditPoint();
            }
            if (typeof cb === 'function') cb();

        }, function() {
            // fail....
        });
    };

    var toggleUserRoleSubscribers = [];
    var toggleUserRoleHandler = function (role, checked) {
        var params = { userId: viewModel.detailUser.userId() };
        var action = (checked ? 'Make' : 'Remove') + role;
        var property = role == 'Moderator' ? viewModel.detailUser.isModerator : viewModel.detailUser.isEditor;
        utility.sf.moduleRoot = 'dnncorp/personaBar';
        utility.sf.controller = 'users';
        utility.sf.post(action, params, function(data) {
            if (!data.Success) {
                property(!property());
                utility.notify('Failed...');
            }

        }, function () {
            property(!property());
            utility.notify('Failed...');
        });
    };

	var viewUserDetail = function(user, target){
		var row = $(target);

		if(row.is("tr") == false){
			row = row.closest('tr');
		}

		if(row.hasClass('in-edit-row')){
			row.removeClass('in-edit-row');
			$('#users-editrow > td > div').slideUp(200, 'linear', function(){
				$('#users-editrow').appendTo('#users-editbody');
			});
			return;
		}

		$('#createusertbl > tbody > tr > td > div').slideUp(200, 'linear', function(){
			$('#createusertbl > tbody > tr').hide();
		});

		var tbody = row.parent();
		$('tr', tbody).removeClass('in-edit-row');
		row.addClass('in-edit-row');
		utility.asyncParallel([
			function(cb1){
				getUserDetail(user.userId, cb1);
			},
			function(cb2){
				$('#users-editrow > td > div').slideUp(200, 'linear', function(){
					cb2();
				});
			}
		], function() {
		    $('#users-editrow').insertAfter(row);
			$('#users-editrow > td > div').slideDown(400, 'linear');
		});
	};

	var getUserSearchParams = function () {
	    var searchText = viewModel.searchText();
	    if (andSearchTerm) {
	        // sometimes we need use AND search term, not OR
	        var arr = searchText.split(' ');
	        searchText = arr.join(' AND ');
	    }
		return {
			pageIndex: viewModel.pageIndex(),
			pageSize: viewModel.pageSize,
			sortColumn: viewModel.sortColumn(),
			sortAscending: viewModel.sortAscending(),
			searchText: searchText
		};
	};

	var searchUsers = function(cb) {
	    $('#users-editrow > td > div').hide();
		$('#users-editrow').appendTo('#users-editbody');
		$('#createusertbl > tbody > tr > td > div').hide();
		$('#createusertbl > tbody > tr').hide();

		utility.sf.moduleRoot = 'dnncorp/personaBar';
		utility.sf.controller = 'users';
		var searchParams = getUserSearchParams();
		utility.sf.get('getusers', searchParams, function (d) {
		    andSearchTerm = false;
			var results = [];
			$.each(d.Results, function(i, v){
				var user = {
					userId: ko.observable(v.UserId),
					userName: ko.observable(v.Username),
					displayName: ko.observable(v.Displayname),
					email: ko.observable(v.Email),
					avatar: ko.observable(v.AvatarUrl),
					joined: ko.observable(v.Joined)
				};

				user.expand = function (data, e) {
				    if (e.target.nodeName == 'A' && e.target.className == 'email-link') {
				        window.location.href = e.target.href;
				        return;
				    }
					viewUserDetail(data, e.target);
					e.preventDefault();
				};

				results.push(user);
			});
			viewModel.results(results);
			viewModel.totalResults(d.TotalResults);
			if(typeof cb === 'function') cb();

		}, function(){
		    // fail....
		    andSearchTerm = false;
		});
	};

	var searchUsersStart = function(cb){
		viewModel.pageIndex(0);
		searchUsers(cb);
	};

    var expandMatchedUserDetail = function(params, cb) {
        if (params && params.displayName) {
            setTimeout(function () {
                var users = viewModel.results();
                var matched = 0;
                $.each(users, function(i, v) {
                    if (v.displayName() === params.displayName) {
                        matched = i + 1;
                        return false;
                    }
                });

                if(matched > 0) $('#userstbl tbody tr:nth-child(' + matched + ')').click();
                if (typeof cb === 'function') cb();
            }, 200);
        } else {
            if (typeof cb === 'function') cb();
        }
    };

	return {
		init: function(wrapper, util, params, callback){
			utility = util;
			pager.init(viewModel, 10, searchUsers, utility.resx.PersonaBar, utility.resx.PersonaBar.pager_UserPagedDesc, utility.resx.PersonaBar.pager_UserDesc);
			utility.localizeErrMessages(validator);
			utility.asyncParallel([
				function (cb1) {
				    if (params && params.displayName) {
				        andSearchTerm = true;
				        viewModel.searchText(params.displayName);
				    }
				    searchUsers(cb1);
				}
			],
			function(){
				var searchTextThrottle = null;
				viewModel.searchText.subscribe(function(){
					if(!triggerSubscribe) return;
					if(searchTextThrottle) clearTimeout(searchTextThrottle);
					searchTextThrottle = setTimeout(searchUsersStart, 500);
				});
				var container = wrapper[0];
				viewModel.resx = utility.resx.PersonaBar;
				ko.applyBindings(viewModel, container);
                expandMatchedUserDetail(params, callback);

                // Load dnn jquery plugins for use jScrollPane
                parentLoader.load({
                    get: ['dnn.jquery.js']
                }, [], true, function() {
                    wrapper.find('input[type="checkbox"]').dnnCheckbox();
                });
			});
		},

		initMobile: function (wrapper, util, params, callback) {
		    this.init(wrapper, util, params, callback);
		},

		load: function (params, callback) {
		    if (params && params.displayName) {
		        triggerSubscribe = false;
		        andSearchTerm = true;
		        viewModel.searchText(params.displayName);
		        searchUsersStart(function() {
		            triggerSubscribe = true;
		            expandMatchedUserDetail(params, callback);
		        });
		    }
		},

		loadMobile: function (params, callback) {
		    this.load(params, callback);
		}
	};
});