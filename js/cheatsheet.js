$(function(){
    // the current item data object as global jQuery variable
    var currentItemData;

    function loadItem(sStrippedHash) {
        currentItemData = $("#data-" + sStrippedHash);

        $(".item-element").removeClass("active");
        $("#item-" + sStrippedHash).parent().addClass("active");

        if ( $(currentItemData).length == 0 ) {
            return;
        }

        $("#showbox-code").html( $(currentItemData).children(".code").html() );
        if ($(currentItemData).children(".alt-rendered").length) {
            var htmlForPreview = $(currentItemData).children(".alt-rendered")
        } else {
            var htmlForPreview = $(currentItemData).children(".rendered")
        }

        $("#showbox-example").html( $(htmlForPreview).html() );
        $("#current-item-title").html($(currentItemData).children(".display-title").html());
        $("#showcase").show();
        // prevent links from going to the top in the preview box
        $('#showbox-example a[href="#"]').click(function (e) {
          e.preventDefault()
        })

        if (   sStrippedHash === "dropdown__open" 
            || sStrippedHash === "dropdown-divider"
            || sStrippedHash === "dropdown-item__disabled"
            || sStrippedHash === "dropdown-header") {
            // Bootstrap.js somehow removes .open from this when copying from data to preview box
            $("#showbox-example").children(".dropdown").addClass('open');
        }

        $('#showbox-example [data-spy="scroll"]').each(function () {
          $(this).scrollspy('refresh')
        })

        $('#showbox-example [data-toggle="tooltip"]').tooltip();
        $('#showbox-example [data-toggle="popover"]').popover()

        highlightClass();
    }

    function highlightClass() {
        // A programmer has a problem, he decides to use regex. Now he has two problems.

        if( $(currentItemData).children(".clipboard").length ) {
            // As basis we take the clipboard value of any type (eg. "col-md-1")
            var sHighlightThis = $(currentItemData).children(".clipboard").html();

            // Use regex to make a regex :)
            var sFindRegex = sHighlightThis.replace(/(xs|sm|md|lg|xl)/, '(xs|sm|md|lg|xl)');
            sFindRegex = sFindRegex.replace(/(1|2|3|4|5|6|7|8|9|10|12)/, '(1|2|3|4|5|6|7|8|9|10|12)');
            sFindRegex += '(?!-)'; // prevents greedy matching for list-item and list-item-inline
            var rFindRegex = new RegExp(sFindRegex, 'g');
            // above example, "col-md-1", would now be "col-(xs|sm|md|lg|xl)-(1|2|3|4|5|6|7|8|9|10|12)"
            // a bug right now is that in the case of "col-md-1 col-xs-5" this would highlight both


            // Cooking up the replace pattern,
            // from "col-md-1" to "col-$1-$2" OR "display-1" to "display-$1"
            if(sHighlightThis.match(/(xs|sm|md|lg|xl)/)) {
                // if xs* is present, then the number will be the second match..
                var sNumberReplaceVariable = '$$2';
            } else {
                // otherwise it will be the first and only match
                var sNumberReplaceVariable = '$$1';
            }
            var sReplacePattern = sHighlightThis.replace(/(12|10|1|2|3|4|5|6|7|8|9)/,
                                                        sNumberReplaceVariable);
            sReplacePattern = sReplacePattern.replace(/(xs|sm|md|lg|xl)/, '$$1');

            $("#showbox-code").html(
                $("#showbox-code").html().replace(
                    rFindRegex ,'<span class="harder-highlight">' + sReplacePattern + '</span>'
                )
            );
        }
    }

    function refreshAfterHashChange(){
        //remove # from hash string
        
        var sStrippedHash= location.hash.replace('#', '');
        if(location.hash.length > 0) {
            loadItem(sStrippedHash);
        }
    }

    window.onhashchange = function() {
        refreshAfterHashChange();
    };

    $(".item-link").click(function(e) {
        //refreshAfterHashChange();
        //
        
        if ( $(this).attr('href') == location.hash ) {

        $("#showcase").toggle();
        e.preventDefault()

        }
    });

    //this array will carry a list of all present items, for navigation arrows
    aItemList = [];

    $(".item-link").each(function() {
        aItemList.push($(this).attr("id"));
    });

    $("#next-item-link").click(function(e){
        e.preventDefault();
        var sCurrentlyActive = $('.item-element.active .item-link').attr("id");
        var iNextItem = 0;
        var index = aItemList.indexOf(sCurrentlyActive);
        if (index >= 0 && index < aItemList.length - 1) {
            iNextItem = index + 1;
        }
        var jqNextItem = $("#"+aItemList[iNextItem]);
        $(jqNextItem).closest("ul").show();
        $(jqNextItem).get(0).click();
    });

    $("#previous-item-link").click(function(e){
        e.preventDefault();
        var sCurrentlyActive = $('.item-element.active .item-link').attr("id");
        var iNextItem = aItemList.length - 1;
        var index = aItemList.indexOf(sCurrentlyActive);
        if (index >= 1 && index < aItemList.length) {
            iNextItem = index - 1;
        }
        var jqNextItem = $("#"+aItemList[iNextItem]);
        $(jqNextItem).closest("ul").show();
        $(jqNextItem).get(0).click();
    });

    var elementClipboard = new Clipboard('.item-copy-link', {
        text: function(trigger) {
            var elementToCopy = $(trigger).attr("id").replace('copy-','data-');
            return $("#"+elementToCopy + " .rendered").html();
        }
    });

    var showboxClipboard = new Clipboard('#showbox-copy', {
        text: function() {
            // TODO: catch null
            return $(currentItemData).children(".rendered").html();
        }
    });


    var classClipboard = new Clipboard('.class-copy-link');

    $("#showbox-copy").tooltip();
    $(".item-copy-link").tooltip();
    $(".doc-link").tooltip();
    $(".class-copy-link").tooltip();

    function tooltipSwitcharoo(e) {
        var originalTitle = $(e.trigger).attr('data-original-title');
        $(e.trigger)
            .attr('title', 'Copied!')
            .tooltip('_fixTitle')
            .tooltip('show')
            .attr('title', originalTitle)
            .tooltip('_fixTitle')
    }

    showboxClipboard.on('success', tooltipSwitcharoo);
    elementClipboard.on('success', tooltipSwitcharoo);
    classClipboard.on('success', tooltipSwitcharoo);

    $('.item-copy-link').click(function (e) {
      e.preventDefault()
    });

    $('.class-copy-link').click(function (e) {
      e.preventDefault()
    });

    $('#showbox-copy').click(function (e) {
      e.preventDefault()
    });

    $("#close-showcase").click(function(e) {
        $("#showcase").hide();
        e.preventDefault()
    });
    
    $(".category h3").click(function(e) {
        $(this).siblings("ul").toggle();
    });

    $(".category h3 a.doc-link").click(function(e) {
        e.stopPropagation();
    });
    
    $("#show-all").click(function(e) {
        $(".category ul").show();
        e.preventDefault()
    });

    $("#collapse-all").click(function(e) {
        $(".category ul").hide();
        e.preventDefault()
    });
    refreshAfterHashChange();
});
