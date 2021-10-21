var changesMade = false;
window.addEventListener("resize", function () {
	resize_text_input();
});
function resize_text_input() {
	var ih = window.innerHeight;
	var rmax = 11;
	var rmin = 1;
	var row_range = rmax - rmin;
	var wmax = 975;
	var wmin = 280;
	var win_range = wmax - wmin;
	var row = Math.floor((((ih - wmin) + 1) * row_range) / win_range) + 1;
	if (row < 1)
		row = 1;
	var summary_rows = row / 2;
	summary_rows = Math.floor(summary_rows);
	if (summary_rows < 1)
		summary_rows = 1;
	document.getElementById('keywords').rows = row;
	document.getElementById('questions').rows = row;
	document.getElementById('comments').rows = row;
	var ln = document.getElementById('lectureNote');
	ln.rows = (row * 3) + 1;
	document.getElementById('summary').rows = summary_rows;
}

window.addEventListener("DOMContentLoaded", function () {
	//resize_text_input();
	let script = document.createElement('script');
	script.src = "https://media-library.cloudinary.com/global/all.js"
	document.head.appendChild(script);
	script.onload = function() {
		var subjectid = document.getElementById('subjectid').value;
		var topicid = document.getElementById('topicid').value;
		var subtopicid = document.getElementById('subtopicid').value;

		// base folder with leading / for urls
		var baseFolder = '/' + subjectid + '/' + topicid + '/' + subtopicid;
		// image folder without leading / for cloudinary media library
		var imageFolder = subjectid + '/' + topicid + '/' + subtopicid + '/' + noteid;
		const cancelButton = document.getElementById('cancel_button');
		if (cancelButton) cancelButton.onclick = function() { confirmCancel(baseFolder + '/notes') };	

		var noteid = document.getElementById('noteid').value;
		if (noteid) {
			var cloud_name = 'ddpa7qntq';
			var api_key = '127533828577153';
			var username = 'jgodden@hotmail.com';
			var unixTimestamp = Math.floor(Date.now() / 1000);
			var enc_sig = document.getElementById('enc_sig').value;
			var actionFolder = baseFolder + '/note/' + noteid;

			try {
				var mediaLibraryWidget = cloudinary.createMediaLibrary({
					cloud_name: cloud_name,
					signature: enc_sig,
					api_key: api_key,
					username: username,
					timestamp: unixTimestamp,
					button_class: 'btn',
					button_caption: 'Select Image or Video',
				});
				const moveButton = document.getElementById('move_button');
				if (moveButton) moveButton.onclick = function() { relocate(actionFolder + '/move') };
				const deleteButton = document.getElementById('delete_button');
				if (deleteButton) deleteButton.onclick = function() { relocate(actionFolder + '/delete') };
				const drawButton = document.getElementById('draw_button');
				if (drawButton) drawButton.onclick = function() { relocate(actionFolder + '/draw')};
				const imageButton = document.getElementById('image_button');
				if (imageButton) imageButton.onclick = function() { mediaLibraryWidget.show({folder: {path: imageFolder}}) };
			} catch(err) {
				// disable image button
				const imageButton = document.getElementById('image_button');
				if (imageButton) {
					imageButton.disabled = true;
					imageButton.ariaDisabled = true;
					alert('Images button disabled as unable to run cloudinary\n\nMore detailed error: Cannot load ' + err);
				}
			}
		}
	};
	script.onerror = function() {
		// disable image button
		image_button = document.getElementById('image_button');
		if (imageButton) {
			image_button.disabled = true;
			image_button.ariaDisabled = true;
			alert('Images button disabled as unable to load required code from cloudinary to make Images function work\n\nMore detailed error: Cannot load ' + this.src);
		}
	};

	var note_form = document.getElementById('note_form');
	note_form.addEventListener('keypress', formKeyPressed);
});
function relocate(url) {
	window.location.href = url;
}
function formKeyPressed(e) {
	changesMade = true;
}
confirmCancel = function confirmCancel(url) {
	if (changesMade) {
		if (!confirm('You have made changes to this note which will be lost if you cancel\nOk to discard these changes?'))
			return;
	}
	relocate(url);
}
function insertThisInThere(HTMLSelectElement) {
    let collection = HTMLSelectElement.selectedOptions;
    let theChar = "";
    for (let i=0; i<collection.length; i++) {
        theChar = collection[i].label.substr(0, 1);
		break;
	}
	// reset to top, both to redisplay the title of the dropdown and allow repeated
	// chars to be input (onchange does nothing if selecting the selected dropdown item)
	HTMLSelectElement.selectedIndex = 0;
	// ignore the first item in the selection which starts with <
	if (theChar === '<')
		return;
	function theCursorPosition(ofThisInput) {
		// set a fallback cursor location
		var pos = { start: 0, end: 0 };
 
		// find the cursor location via IE method...
		if (document.selection) {
			ofThisInput.focus();
			var theSelectionRange = document.selection.createRange();
			theSelectionRange.moveStart('character', -ofThisInput.value.length);
			pos.start = theSelectionRange.text.length;
			pos.end = pos.start;	// not sure how to calculate this, so use same value
		} else if (ofThisInput.selectionStart || ofThisInput.selectionStart == '0') {
			// or the FF way 
			pos.start = ofThisInput.selectionStart;
			pos.end = ofThisInput.selectionEnd;
		}
		return pos;
	}
	function getSelectionBoundaryElement(isStart) {
		var range, sel, container;
		if (document.selection) {
			range = document.selection.createRange();
			range.collapse(isStart);
			return range.parentElement();
		} else {
			sel = window.getSelection();
			if (sel.getRangeAt) {
				if (sel.rangeCount > 0) {
					range = sel.getRangeAt(0);
				}
			} else {
				// Old WebKit
				range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
	
				// Handle the case when the selection was selected backwards (from the end to the start in the document)
				if (range.collapsed !== sel.isCollapsed) {
					range.setStart(sel.focusNode, sel.focusOffset);
					range.setEnd(sel.anchorNode, sel.anchorOffset);
				}
		   }
	
			if (range) {
			   container = range[isStart ? "startContainer" : "endContainer"];
			   // Check if the container is a text node and return its parent if so
			   return container.nodeType === 3 ? container.parentNode : container;
			}   
		}
	}
 
	var id = getSelectionBoundaryElement(true).children[0].id;
	var htmlElement = document.getElementById(id);
	if (!((htmlElement instanceof HTMLInputElement) || (htmlElement instanceof HTMLTextAreaElement))) {
		return;
	}
	let pos = theCursorPosition(htmlElement);
	var origValue = htmlElement.value;
	var newValue = origValue.substr(0, pos.start) + theChar + origValue.substr(pos.end);
	htmlElement.value = newValue;
	htmlElement.setSelectionRange(pos.start + 1, pos.start + 1)
	htmlElement.focus();
}
tinymce.init(
	{
		selector: '#lectureNote',
		width  : '100%',
		height : '100%',
		plugins: [
			'advlist autolink link image lists charmap print preview hr anchor pagebreak',
			'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
			'table emoticons template paste help'
		  ],
		toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
		'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
		'forecolor backcolor emoticons | help',
		menu: {
		  favs: {title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons'}
		},
		menubar: 'favs file edit view insert format tools table help',
		content_css: '/stylesheets/style.css',
	}
);

