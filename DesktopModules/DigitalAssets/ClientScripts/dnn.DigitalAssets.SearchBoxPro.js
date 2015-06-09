// IE8 doesn't like using var dnnModule = dnnModule || {}
if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };

dnnModule.DigitalAssetsSearchBox = function ($, $scope, $find, servicesFramework, $tags, lastModifiedComboBoxId, $exactSearch, culture) {

    var minInputLength = 2;
    var inputDelay = 400;
    var onSearchFunction = null;
    var lastVal = '';
    var searchTimeout;
    
    function hideAdvancedPanel() {
        var $advancedLabel = $('a.dnnSearchBox_advanced_label', $scope);
        if ($advancedLabel.hasClass('dnnExpanded')) {
            $advancedLabel.next().hide();
            $advancedLabel.removeClass('dnnExpanded');
        }
    }
    
    function init() {
        var $advancedLabel = $('a.dnnSearchBox_advanced_label', $scope);
        $advancedLabel.click(function() {
            $advancedLabel.toggleClass('dnnExpanded');
            $advancedLabel.next().toggle();
            return false;
        }).mouseup(function() {
            return false;
        });

        $('body').mouseup(function() {
            hideAdvancedPanel();
        });

        $advancedLabel.next().mouseup(function() {
            return false;
        });

        var $searchInput = $('input.searchInput', $scope);
        $searchInput.mouseup(function() {
            return false;
        }).keypress(function (e) {
            if (e.keyCode == 13) {
                clearTimeout(searchTimeout);
                searchClick();
                return false;
            }
        }).keyup(function (e) {
            var val = $(this).val();
            if (lastVal.length != val.length &&
                (val.length == 0 || val.length >= minInputLength)) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () {                   
                    searchClick();
                }, inputDelay);
            }
            lastVal = val;
        });
        
        $('.RadComboBoxDropDown').on('mouseup', function () {
            return false;
        });

        $('a.dnnSearchBoxClearText', $scope).click(function () {
            $searchInput.val('').focus();
            clearTimeout(searchTimeout);
            searchClick();
        });
        
        $('a.searchButton', $scope).click(function () {
            clearTimeout(searchTimeout);
            searchClick();
            return false;
        });
        
        $('a.dnnAdvancedSearch', $scope).on('click', searchClick);
        $('a.dnnAdvancedClear', $scope).on('click', clearClick);
    }
    
    function searchClick() {
        var term = $('input.searchInput', $scope).val();

        var options = {
            tags: $tags.val() ? $tags.val().split(',') : [],
            after: $find(lastModifiedComboBoxId).get_value(),
            exactSearch: $exactSearch.is(':checked'),
        };

        var searchKeywords = generateAdvancedSearchTerm(term, options);

        $('div.dnnSearchBox_advanced_query > a', $scope).click(clearClick);
    
        if (onSearchFunction) {
            onSearchFunction(searchKeywords);
        }
        
        hideAdvancedPanel();
    }
        
    function generateAdvancedSearchTerm(term, options) {
        var advancedTerm = "";
        term = term
                .replace(/\"/gi, '')
                .replace(/^\s+|\s+$/g, '');
        
        if (options.exactSearch && term) {
            term = '"' + term + '"';
        }
        
        var tags = options.tags;
        if (tags && tags.length) {

            for (var i = 0; i < tags.length; i++) {
                if (advancedTerm)
                    advancedTerm += ' ';
                advancedTerm += '[' + tags[i] + ']';
            }
        }

        var after = options.after;
        if (after) {
            if (advancedTerm)
                advancedTerm += ' ';
            advancedTerm += 'after:' + after;
        }
        
        var searchKeywords = term;
        if (advancedTerm != '') {
            searchKeywords += ' ' + advancedTerm;
            var formattedAdvancedTerm = advancedTerm.replace(/\[/g, '[&nbsp;').replace(/\]/g, '&nbsp;]')
                .replace(/after:/g, '<b>after: </b>').replace(/type:/g, '<b>type: </b>');
            $('div.dnnSearchBox_advanced_query', $scope).show().find('span').html(formattedAdvancedTerm);
        } else {
            $('div.dnnSearchBox_advanced_query', $scope).hide().find('span').html('');
        }
        
        return searchKeywords;
    }
    
    function doSearch(folderId, search, startIndex, numItems, sortExpression, before, done, fail, always) {
        var contentProServiceUrl = servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/';

        before();
        $.ajax({
            url: contentProServiceUrl + "Search",
            data: {
                "folderId": folderId,
                "search": search,
                "pageIndex": (startIndex / numItems) + 1,
                "pageSize": numItems,
                "sorting": sortExpression,
                "culture": culture,
            },
            type: "GET",
            beforeSend: servicesFramework.setModuleHeaders
        }).done(done).fail(fail).always(always);
    }
    
    function clearClick() {        
        clearAdvancedSearch();
        searchClick();
    }

    function onSearch(onSearchFunc) {
        onSearchFunction = onSearchFunc;
    }
    
    function clearAdvancedSearch() {
        $tags.dnnImportTags('');
        $find(lastModifiedComboBoxId).get_items().getItem(0).select();
        $exactSearch.removeAttr('checked');
    }

    function clearSearch() {
        $('input.searchInput', $scope).val('');
        clearAdvancedSearch();
    }
    
    function getSearchKeywords() {
        var term = $('input.searchInput', $scope).val();

        var options = {
            tags: $tags.val() ? $tags.val().split(',') : [],
            after: $find(lastModifiedComboBoxId).get_value(),
            exactSearch: $exactSearch.is(':checked'),
        };

        return generateAdvancedSearchTerm(term, options);
    }
    
    function highlightItemName(pattern, itemName) {
        if (!pattern || pattern == "" || pattern.indexOf("?") != -1) {
            return itemName;
        }

        var words = pattern.split(' ');
        for (var w = 0; w < words.length; w++) {
            var word = words[w];
            if (word.indexOf('[') == 0 || word.indexOf('after:') == 0) {
                continue;
            }
            
            if (word.indexOf('\"') == 0 && word.lastIndexOf('\"') == word.length - 1) {
                word = word.substring(1, word.length - 1);
            }

            word = word.replace('*', '');
            var matches = itemName.match(new RegExp(word, "i"));
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    itemName = itemName.replace(matches[i], "<font class='dnnModuleDigitalAssetsHighlight'>" + matches[i] + "</font>");
                }
            }            
        }

        return itemName;        
    }
    
    return {
        init: init,
        doSearch: doSearch,
        onSearch: onSearch,
        clearSearch: clearSearch,
        getSearchKeywords: getSearchKeywords,
        highlightItemName: highlightItemName,
    };
};