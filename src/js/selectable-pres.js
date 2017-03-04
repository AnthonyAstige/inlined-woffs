// Less jQuery Snippit from http://stackoverflow.com/a/2838358
function selectElementText(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
	        sel = win.getSelection();
	        range = doc.createRange();
	        range.selectNodeContents(el);
	        sel.removeAllRanges();
	        sel.addRange(range);
	    } else if (doc.body.createTextRange) {
	        range = doc.body.createTextRange();
	        range.moveToElementText(el);
	        range.select();
	    }
}

// Our logic to select selectable pre elements
$(document).ready(function() {
	$('.selectable-pres').on('click', 'pre', function() {
		selectElementText($(this)[0])
	})
})
