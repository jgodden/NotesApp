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
	resize_text_input();
	var subjectid = document.getElementById('subjectid').value;
	var topicid = document.getElementById('topicid').value;
	var subtopicid = document.getElementById('subtopicid').value;
	var noteid = document.getElementById('noteid').value;
	// base folder with leading / for urls
	var baseFolder = '/' + subjectid + '/' + topicid + '/' + subtopicid;
	// image folder without leading / for cloudinary media library
	var imageFolder = subjectid + '/' + topicid + '/' + subtopicid + '/' + noteid;
	var actionFolder = baseFolder + '/note/' + noteid;
	var tinyImagesElement = document.getElementById('tinyImages');
	// collect array of image filenames to return to server for comparison with cloudinary files
	document.getElementById('save_button').onclick = function() {
		tinyImagesElement.value = collectTinyMCEImages();
	};
	const cancelButton = document.getElementById('cancel_button');
	if (cancelButton) cancelButton.onclick = function() { confirmCancel(baseFolder) };
	const moveButton = document.getElementById('move_button');
	if (moveButton) moveButton.onclick = function() { relocate(actionFolder + '/move') };
	const deleteButton = document.getElementById('delete_button');
	if (deleteButton) deleteButton.onclick = function() { relocate(actionFolder + '/delete') };
	const drawButton = document.getElementById('draw_button');
	if (drawButton) drawButton.onclick = function() { relocate(actionFolder + '/draw')};
	const imageButton = document.getElementById('image_button');
	if (imageButton) imageButton.onclick = function() { mediaLibraryWidget.show({folder: {path: imageFolder}}) };
	document.getElementById('note_form').addEventListener('keypress', formKeyPressed);
});
function collectTinyMCEImages() {
	var tinyImages = [];
	var domUtils = tinymce.dom.DOMUtils.DOM;
	var node = tinymce.activeEditor.dom.select('img');
	for (var i=0;i<node.length;i++) {
		// get url of image file
		var url = domUtils.getAttrib(node[i], "src")
		// get filename from url
		var filename = url.substring(url.lastIndexOf('/') + 1);
		// remove extension
		filename = filename.replace(/\.[^/.]+$/, "");
		tinyImages.push(filename);
	}
	return tinyImages;
}
function relocate(url) {
	window.location.href = url;
}
function formKeyPressed(e) {
	changesMade = true;
}
confirmCancel = function confirmCancel(folder) {
	if (changesMade) {
		if (!confirm('You have made changes to this note which will be lost if you cancel\nOk to discard these changes?'))
			return;
	}
	relocate(folder + '/notes');
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
// to store cloudinary image url for img src attribute update after upload
var cloudinary_url;
function _imageUploadHandler (resource, success, failure, progress) {
	var subjectid = document.getElementById('subjectid').value;
	var topicid = document.getElementById('topicid').value;
	var subtopicid = document.getElementById('subtopicid').value;
	var noteid = document.getElementById('noteid').value;
	// image folder without leading / for cloudinary folder
	var imageFolder = subjectid + '/' + topicid + '/' + subtopicid + '/' + noteid;

	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	//restricted it to image only using resource_type = image in url,
	// you can set it to auto for all types 
	xhr.open('POST', 'https://api.cloudinary.com/v1_1/ddpa7qntq/image/upload', false);
	xhr.onload = function(e) {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var response = JSON.parse(xhr.responseText);
			var url = response.secure_url; //get the url 
			var json = {location: url}; //set it in the format tinyMCE wants it
			cloudinary_url = json.location;
			if (success)
				success(cloudinary_url);
		}
	};
	xhr.onerror = function(e) {
		alert(xhr.statusText);
	}
	var formData = new FormData();
	if (resource.blob) {
		formData.append('file', resource.blob(), resource.filename());
	} else {
		formData.append('file', resource);
	}
	formData.append('folder', imageFolder);
	formData.append('upload_preset', 'ik272aj0');
	xhr.send(formData);
};
// paste_preprocess is called when dragging and dropping or copying and pasting
// an image from a browser. Because the image_upload_handler is not triggered
// in ths instance, it is called directly here. However, this does not handle
// updating the src attribute with the cloudinary url, since the success function
// is not passed in and cannot therefore be called at the end.
// Instead, the paste_postprocess finds the image element just pasted and updates
// the src attribute with the cloudinary url stored during the image upload.
function _pastePreProcess(plugin, args) {
	var content = args.content;
	var src;
	try {
		src = content.match(/src=\"(.*?)\"/i)[1];
	} catch (e) {
	}
	if (!src || src.substring(0, 4) == "blob")
		return;
	_imageUploadHandler(src);
}
function _pastePostProcess(plugin, args) {
	var thisNode = args.node;
    if (thisNode.childNodes)
    {
        var nodes = thisNode.childNodes;
		for (var i=0;i<nodes.length;i++)
		{
			var node = nodes[i];
			if (node.src) {
				setUrl(node);
				return;
			}
		}
	}
}
function setUrl(node) {
	if (!cloudinary_url) {
		setTimeout(setUrl,1000,node);
	} else {
		tinymce.activeEditor.dom.setAttrib(node, 'src', cloudinary_url);
		cloudinary_url = null;
	}
}
tinymce.init(
{
	selector: '#lectureNote',
	paste_preprocess: _pastePreProcess,
	paste_postprocess: _pastePostProcess,
	images_upload_handler: _imageUploadHandler,
	//images_upload_url: 'https://api.cloudinary.com/v1_1/ddpa7qntq/image/upload',
	width  : '100%',
	height : '100%',
	plugins: [
		'advlist autolink link image lists charmap print hr anchor',
		'searchreplace insertdatetime',
		'table paste'
		],
	toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
	'bullist numlist outdent indent | link image | print | ' +
	'forecolor backcolor | paste | charmap | ' +
	'table tabledelete | tableprops tablerowprops tablecellprops | ' +
	'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
	'tableinsertcolbefore tableinsertcolafter tabledeletecol',
	menubar: '',
	content_css: '/stylesheets/style.css',
	
	// enable title field in the Image dialog
	image_title: true,
	// Do not remove in-line images from the pasted content
	paste_data_images: true,
	// enable automatic uploads of images represented by blob or data URIs
	automatic_uploads: true,
	// here we add custom filepicker only to Image dialog
	file_picker_types: 'image',
	/* and here's our custom image picker*/
	file_picker_callback: function (cb, value, meta) {
	var input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('accept', 'image/*');

	/*
		Note: In modern browsers input[type="file"] is functional without
		even adding it to the DOM, but that might not be the case in some older
		or quirky browsers like IE, so you might want to add it to the DOM
		just in case, and visually hide it. And do not forget do remove it
		once you do not need it anymore.
	*/

	input.onchange = function () {
		var file = this.files[0];

		var reader = new FileReader();
		reader.onload = function () {
			/*
				Note: Now we need to register the blob in TinyMCEs image blob
				registry. In the next release this part hopefully won't be
				necessary, as we are looking to handle it internally.
			*/
			var id = 'blobid' + (new Date()).getTime();
			var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
			var base64 = reader.result.split(',')[1];
			var blobInfo = blobCache.create(id, file, base64);
			blobCache.add(blobInfo);
	
			/* call the callback and populate the Title field with the file name */
			cb(blobInfo.blobUri(), { title: file.name });	
		};
		reader.readAsDataURL(file);
	};
		
	input.click();
	},

	content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
});