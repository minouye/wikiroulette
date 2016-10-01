
var pos = 0;
var pages = [];

$( document ).ready(function() {
	initialize();

	// Bind left and right arrows
	Mousetrap.bind('left', function() {
		navigate(-1);
	});
	Mousetrap.bind('right', function() {
		navigate(1);
	});

	// Bind click handlers to buttons
	$(".nav-forward").on('click',function (event) {
		event.preventDefault();
		this.blur();
		navigate(1);
	});
	$(".nav-back").on('click',function (event) {
		event.preventDefault();
		this.blur();
		navigate(-1);
	});

	$('#pageURL').on('focus', function() {
		$(this).select();
	});

	// Handle copy URL tooltip
	$('#copyURL').tooltip();
	$('#copyURL').on('click',function(event) {
		clipboard.copy($('#newTab').attr('href'));
		this.blur();
		$(this).delay(1700).queue(function() {
				$(this).tooltip('hide');
			});
	});
});

function initialize(_callback) {
	console.log("Initializing...");
	setHistory();
	loadMorePages();
}

function navigate(shift) {
	if (shift == -1 && pos < 1) {
		console.log('At the beginning');
	} 
	else {
		pos = pos + shift;
		if (pos == 0) {
			$(".nav-back").attr('disabled','disabled');
		} else {
			$(".nav-back").removeAttr('disabled');
			console.log('update');
		}

		if ((pages.length - 3) == pos) {
			loadMorePages();
		}
		setURL(pos);
		//updateURL(pages[pos]);
	}
}

function loadMorePages() {
	console.log("Loading more random pages...");
	$.ajax({
		url: "https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json",
		dataType: "jsonp",

    // Work with the response
    success: function( response ) {
      $.each( response['query']['random'], function( key, val ) {
				pages.push(val['title'].replace(/ /g,"_"));
			});
      if (pages.length == 10) {
      	setURL(0);
      }
    }
	});
}

function setHistory() {
	chrome.storage.local.get(['history'], function(items) {
    var pastPages = items['history'];
    if (pastPages) {
    	pastPages.forEach(function(obj) {
    		$("#history").append('<li><a href="https://en.wikipedia.org/wiki/' + obj + '" target="_blank">' + obj.replace(/_/g," ") + '</a></li>');
    	});
    }
	});
}

function setURL(pos) {
	var newURL = "https://en.wikipedia.org/wiki/" + pages[pos]
	$('#mainFrame').attr('src', newURL);
	$('#pageURL').attr('value', newURL);
	$('#newTab').attr('href', newURL);

	chrome.storage.local.get(['history'], function(items) {
		var pastPages = items['history'];

		// If history isn't empty
    if (pastPages) {

    	// If going back/forward, check to see if page is in history
    	if (jQuery.inArray(pages[pos], pastPages) == -1) {

    		// Limit history to 10 pages
    		if (pastPages.length == 10) {
    			pastPages.pop();
    		}

    		// Add current page to history and write to page
    		pastPages.unshift(pages[pos]);
    		$("#history").prepend('<li><a href="' + newURL + '" target="_blank">' + pages[pos].replace(/_/g," ") + '</a></li>');
				$('#history li:gt(10)').remove();
    	}
    }
    else {
    	pastPages = [pages[pos]];
    	$("#history").prepend('<li><a href="' + newURL + '">' + pages[pos].replace(/_/g," ") + '</a></li>');
    }

    chrome.storage.local.set({'history': pastPages});

  });


}





