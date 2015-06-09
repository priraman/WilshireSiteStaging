'use strict';
define(['jquery', '../scripts/config'], function ($, cf) {

    return {
        init: function (util) {
            var config = cf.init();
            var btnEdit = $(".btn_edit.btn_panel");
            var btnsPanel = $('.btn_panel');

            var saveBtnEditSettings = function () {
                util.persistent.save({
                    expandPersonaBar: false,
                    btnIndex: btnsPanel.index(btnEdit),
                    activePanelId: null,
                });
            };
            // Setting for 1024 resolution
            var width = parent.document.body.clientWidth;
            if (width < 1024) {
                btnEdit.hide();
            }

            var toogleUserMode = function (mode) {
                util.sf.moduleRoot = 'internalservices';
                util.sf.controller = "controlBar";
                util.sf.post('ToggleUserMode', { UserMode: mode }, function (data) {
                    window.parent.location.reload();
                });
            };

            if (!config.hasValidLicenseOrTrial) return;

            btnEdit.on('click', function () {
                util.closePersonaBar(saveBtnEditSettings());
            });

            if (config.userMode != 'Edit') {
                btnEdit.on('click', function () {
                    toogleUserMode('EDIT');
                });
            } else {
                btnEdit.addClass('selected');

                btnEdit.on('closingPersonaBar', function () {
                    btnEdit.addClass('selected');
                    saveBtnEditSettings();
                });
            }
        }
    };
});