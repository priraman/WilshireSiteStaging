'use strict';
define([
        'jquery',
        'knockout',
        '../../../Resources/Shared/Scripts/dnn.jquery',
        'css!../css/tags-input.css'
],

function($, ko) {
    ko.bindingHandlers.tagsInput = {
        init: function (element, valueAccessor) {
            $(element).dnnTagsInput({
                width: '100%',
                minInputWidth: '80px',
                defaultText: '',
                onAddTag: function () {
                    valueAccessor()($(element).val());
                },
                onRemoveTag: function () {
                    valueAccessor()($(element).val());
                }
            });
        },
        update: function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());
            if ($(element).val() != value) {
                $(element).dnnImportTags(!value ? '' : value);    
            }            
        }
    };
});
