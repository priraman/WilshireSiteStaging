; if (typeof window.dnn === "undefined" || window.dnn === null) { window.dnn = {}; }; //var dnn = dnn || {};

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved


dnn.ColumnViewModel = function (name, key) {

    var 
        checked = ko.observable(false),
        index = ko.observable(1);

    return {
        name: name,
        key: key,
        checked: checked,
        index: index
    };
};

dnn.ColumnsViewModel = function ($, $find, ko, defaultSortOrderComboBoxId) {

    var
        selectedColumns = ko.observableArray(),

        availableColumns = ko.observableArray(),

        selectedColumnsToString = ko.computed(function () {
            var columns = selectedColumns();
            var result = [];
            for (var i = 0, j = columns.length; i < j; i++) {
                result.push(columns[i].key);
            }
            
            return result.join(",");            
        }),

        selectColumns = function () {
            moveitems(availableColumns, selectedColumns);
        },

        unselectColumns = function () {
            moveitems(selectedColumns, availableColumns);
        },

        isAtLeastOneColumnChecked = function (columns) {
            var item = ko.utils.arrayFirst(columns(), function (column) {
                return column.checked();
            });
            return item == null;
        },

        isAtLeastOneColumnNotChecked = function (columns) {
            var item = ko.utils.arrayFirst(columns(), function (column) {
                return !column.checked();
            });
            return item == null;
        },
        
        checkAllAvailableColumns = ko.computed({
            read: function () {
                return isAtLeastOneColumnNotChecked(availableColumns) && availableColumns().length != 0;
            },
            write: function (value) {
                ko.utils.arrayForEach(availableColumns(), function (column) {
                    column.checked(value);
                });
            }
        }),

        isAtLeastOneAvailableColumnChecked = ko.computed(function () {
            
            return isAtLeastOneColumnChecked(availableColumns);
        }),

        checkAllSelectedColumns = ko.computed({
            read: function () {
                return isAtLeastOneColumnNotChecked(selectedColumns) && selectedColumns().length != 0;
            },
            write: function (value) {
                ko.utils.arrayForEach(selectedColumns(), function (column) {
                    column.checked(value);
                });
            }
        }),

        isAtLeastOneSelectedColumnChecked = ko.computed(function () {
            
            return isAtLeastOneColumnChecked(selectedColumns);
        }),

        init = function (selectedItems, availableItems) {
            selectedColumns(getColumnViewModelArray(selectedItems));
            availableColumns(getColumnViewModelArray(availableItems));
        },

        getColumnViewModelArray = function (columns) {
            var arr = [];
            for (var i = 0; i < columns.length; i++) {
                arr.push(new dnn.ColumnViewModel(columns[i].name, columns[i].key));
            }
            return arr;
        },

        moveitems = function (from, to) {
            for (var i = 0; i < from().length; i++) {
                if (from()[i].checked()) {
                    to.push(from()[i]);
                    from.splice(i, 1);
                    i--;
                }
            }
        },
        
        validateColumns = function (sender, args) {
            args.IsValid = selectedColumnsToString() != '';
        },

        refreshDefaultSortOrderComboBox = function () {

            var defaultSortOrderComboBox = $find(defaultSortOrderComboBoxId);
            if (!defaultSortOrderComboBox) return;

            var tmpSelectedItem = defaultSortOrderComboBox.get_selectedItem();
            var tmpSelectedItemValue = tmpSelectedItem ? tmpSelectedItem.get_value() : "";

            defaultSortOrderComboBox.trackChanges();
            defaultSortOrderComboBox.clearItems();

            for (var i = 0; i < selectedColumns().length; i++) {

                var comboItem = new Telerik.Web.UI.RadComboBoxItem();
                var name = selectedColumns()[i].name;
                var key = selectedColumns()[i].key;

                comboItem.set_text(name);
                comboItem.set_value(key);

                defaultSortOrderComboBox.get_items().add(comboItem);
            }

            // Restore Selected Item
            var selectedItem = defaultSortOrderComboBox.findItemByValue(tmpSelectedItemValue);
            if (selectedItem) {
                selectedItem.select();
            } else {
                var firstItem = defaultSortOrderComboBox.get_items().getItem(0);
                if (firstItem) {
                    firstItem.select();
                }
            }

            defaultSortOrderComboBox.commitChanges();
        };

    selectedColumns.subscribe(function () {
        var columns = selectedColumns();
        for (var i = 0, j = columns.length; i < j; i++) {
            columns[i].index(i + 1);
        }

        setTimeout(refreshDefaultSortOrderComboBox, 10);
    });

    return {
        selectedColumns: selectedColumns,
        availableColumns: availableColumns,
        selectedColumnsToString: selectedColumnsToString,
        selectColumns: selectColumns,
        unselectColumns: unselectColumns,
        checkAllAvailableColumns: checkAllAvailableColumns,
        isAtLeastOneAvailableColumnChecked: isAtLeastOneAvailableColumnChecked,
        checkAllSelectedColumns: checkAllSelectedColumns,
        isAtLeastOneSelectedColumnChecked: isAtLeastOneSelectedColumnChecked,
        validateColumns: validateColumns,
        init: init
    };
};

ko.bindingHandlers.dnnCheckbox = {
    init: function (element) {
        $(element).dnnCheckbox();
    }
};

ko.bindingHandlers.sortableList = {
    init: function (element, valueAccessor, allBindingsAccessor, data, context) {
        var options = ko.utils.unwrapObservable(valueAccessor());
        $(element).data("sortList", options.list || valueAccessor()); //attach meta-data
        $(element).sortable({
            cursor: 'move',
            placeholder: "dnnDocumentViewerSettingsPlaceholder",
            dropOnEmpty: true,
            update: function (event, ui) {
                var item = ui.item.data("sortItem");
                if (item) {
                    //identify parents
                    var originalParent = ui.item.data("parentList");
                    var newParent = ui.item.parent().data("sortList");
                    //figure out its new position
                    var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                    if (position >= 0) {
                        originalParent.remove(item);
                        newParent.splice(position, 0, item);
                    }
                    ui.item.remove();
                }
            },
            helper: function (e, tr) {
                var $originals = tr.children();
                var $helper = tr.clone();
                $helper.children().each(function (index) {
                    // Set helper cell sizes to match the original sizes
                    $(this).width($originals.eq(index).width());
                });
                return $helper;
            },
            connectWith: '.dnnDocumentViewerSettingsGrid>tbody'
        });
        return ko.bindingHandlers.template.init.apply(this, arguments);
    },
    update: function (element, valueAccessor, allBindingsAccessor, data, context) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            newOptions = {};

        //build our options to pass to the template engine
        if (options.list) {
            newOptions.foreach = options.list;
            newOptions.name = options.tmpl;
            newOptions.includeDestroyed = options.includeDestroyed;
            newOptions.afterAdd = options.afterAdd;
            newOptions.beforeRemove = options.beforeRemove;
        } else {
            newOptions.foreach = valueAccessor();
        }

        //use an afterRender function to add meta-data
        if (options.afterRender) {
            //wrap the existing function, if it was passed
            newOptions.afterRender = function (element, data) {
                ko.bindingHandlers.sortableList.afterRender.call(data, element, data);
                options.afterRender.call(data, element, data);
            };
        } else {
            newOptions.afterRender = ko.bindingHandlers.sortableList.afterRender;
        }
        //call the actual template binding
        ko.bindingHandlers.template.update(element, function () { return newOptions; }, allBindingsAccessor, data, context);
    },
    afterRender: function (elements, data) {
        ko.utils.arrayForEach(elements, function (element) {
            if (element.nodeType === 1) {
                $(element).data("sortItem", data);
                $(element).data("parentList", $(element).parent().data("sortList"));
            }
        });
    }
};