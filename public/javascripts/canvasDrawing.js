window.addEventListener("DOMContentLoaded", function () {
    // Get ref to save buton so we can set up an event listener to
    // send the image bitmap to the database when saving the note
    var save_button = document.getElementById('save_button');
    // Get ref to image data url element which will initially receive the
    // cloudinary url. This will be used as the src attribute of the canvas
    // image, and the image data will be retrieved from cloudinary using this
    // to render the image to the canvas.
    // When the save button is clicked, this will be replaced with the updated
    // base64 image data which will be posted back to the server for upload to
    // cloudinary
    var image_data_element = document.getElementById('imageData');
    var image_url_element = document.getElementById('imageUrl');
    // Get ref to canvas, but it isn't instantiated yet, so can't set style at this point
    var canvas = document.getElementById('canvas');
    // get canvas 2D context and set to correct size
    var ctx = canvas.getContext('2d');
    // Set canvas border
    canvas.style.border = "thin dashed #888888";

    // true if changes made to drawing in this session
    var changesMade = false;
    // Contains list of actions used to implement undo/redo
    var actions = [];
    // Contains array of actions popped from actions on undo
    var redoList = [];
    // Set to correct dimensions
    var rect = canvas.getBoundingClientRect();
    var scaleX = 0;
    var scaleY = 0;
    // Initialise some drawing properties
    var windowScrollXStartPos = window.pageXOffset;
    var windowScrollYStartPos = window.pageYOffset;
    var isDrawing = false;
    var firstLine = false;  // true if first line when line drawing, so we know whether to undo previous line
    var bold = false;
    var italic = false;
    var lastpos = { x: 0, y: 0 };
    var currentpos = { x: 0, y: 0 };
    // Mouse and touch event handlers for freeform draw
    canvas.addEventListener('mousemove', penMouseMoveListener);
    canvas.addEventListener('mousedown', mouseDownListener);
    canvas.addEventListener('mouseup', penMouseUpListener);
    canvas.addEventListener('touchstart', touchStartListener);
    canvas.addEventListener('touchend', penTouchEndListener);
    canvas.addEventListener('touchmove', penTouchMoveListener);

    // Render bitmap data in hidden image element to canvas
    var img = new Image;
    img.src = image_url_element.value;
    // Set cross origin otherwise the retrieved png image from cloudinary will be
    // tainted, and the canvas.toDataUrl will fail with security error
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
        ctx.drawImage(img, 0, 0); // Draw image at top right
    };

    resize();
    window.addEventListener('resize', resize);
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 120;
        rect = canvas.getBoundingClientRect();
        scaleX = canvas.width / rect.width;
        scaleY = canvas.height / rect.height;
        windowScrollXStartPos = window.pageXOffset;
        windowScrollYStartPos = window.pageYOffset;
        // draw initial image to canvas
        ctx.drawImage(img, 0, 0);
        // and draw all objects since loading
        redrawAll();
    }

    // Tie mouse click event listener to save image function
    save_button.addEventListener('click', saveImage);
    function saveImage(e) {
        try {
            var urlData = canvas.toDataURL("image/png");
            image_data_element.value = urlData;
        } catch (e) {
            alert('save image data error: ' + e);
        }
    }
    confirmCancel = function confirmCancel(e) {
        uri = e.baseURI;
        if (changesMade) {
            if (!confirm('You have made changes to this drawing which will be lost if you cancel\nOk to discard these changes?'))
                return;
        }
        location.href = uri.substring(0, uri.lastIndexOf('/'));
    }

    // Buttons and other controls
    var fontElement = document.getElementById('font');
    var fontSizeElement = document.getElementById('fontSize');
    var floatingElement = document.getElementById('floating');
    var fs = floatingElement.style;
    fs.backgroundColor = "white";
    fs.borderStyle = "dashed solid";
    fs.position = "absolute";
    fs.zIndex = "1";
    fs.height = "32px";
    var boldElement = document.getElementById('bold_button');
    var italicElement = document.getElementById('italic_button');
    function hideFloatingText() {
        floatingElement.style.top = "-100px";
    }
    document.getElementById('pencil').addEventListener('click', setDrawStyle);
    document.getElementById('line').addEventListener('click', setDrawStyle);
    document.getElementById('text_button').addEventListener('click', setDrawStyle);
    boldElement.addEventListener('click', toggleBold);
    italicElement.addEventListener('click', toggleItalic);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    function setDrawStyle(e) {
        document.getElementById('pencil').style.border = "none";
        document.getElementById('line').style.border = "none";
        document.getElementById('text_button').style.border = "none";
        hideFloatingText();
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'pencil') {
            drawStyle = 0;
            removeLineEvents();
            removeTextEvents();
            addPenEvents();
        }
        if (e.currentTarget.id === 'line') {
            drawStyle = 1;
            removePenEvents();
            removeTextEvents();
            addLineEvents();
        }
        if (e.currentTarget.id === 'text_button') {
            drawStyle = 2;
            removePenEvents();
            removeLineEvents();
            addTextEvents();
        }
    }
    function toggleBold(e) {
        bold = !bold;
        setBold(bold);
    }
    function setBold(bold) {
        if (bold) {
            boldElement.style.border = "thin solid black";
            floatingElement.style.fontWeight = "bold";
        } else {
            boldElement.style.border = "none";
            floatingElement.style.fontWeight = "normal";
        }
    }
    function toggleItalic(e) {
        italic = !italic;
        setItalic(italic);
    }
    function setItalic(italic) {
        if (italic) {
            italicElement.style.border = "thin solid black";
            floatingElement.style.fontStyle = "italic";
        } else {
            italicElement.style.border = "none";
            floatingElement.style.fontStyle = "normal";
        }
    }
    // initialize floating text box font familiy and size
    floatingElement.style.fontFamily = fontElement[fontElement.selectedIndex].text;
    floatingElement.style.fontSize = fontSizeElement[fontSizeElement.selectedIndex].text;
    setFloatingTextBoxSize();
    fontElement.addEventListener('change', (event) => {
        floatingElement.style.fontFamily = event.target[event.target.selectedIndex].text;
        setFloatingTextBoxSize();
        e.preventDefault();
      });
    fontSizeElement.addEventListener('change', (event) => {
        floatingElement.style.fontSize = event.target[event.target.selectedIndex].text;        
        setFloatingTextBoxSize();
        e.preventDefault();
    });
    floatingElement.addEventListener('input', (event) => {
        setFloatingTextBoxSize();
        e.preventDefault();
    });
    function setFloatingTextBoxSize() {
        var width = getTextWidth(floatingElement.value, getCanvasFontSize(floatingElement));
        floatingElement.style.width = 30 + width + "px";
    }
    function getTextWidth(text, font) {
        // re-use canvas object for better performance
        const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }
    function getCssStyle(element, prop) {
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }
    function getCanvasFontSize(el = document.body) {
        const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
        const fontSize = getCssStyle(el, 'font-size') || '16px';
        const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }
    // Prevent form from being submitted when pressing return in the
    // floating text box
    document.addEventListener('keydown', handleKey);
    // Handle escape and enter
    function handleKey(e) {
        if (e.key == "Escape") {
            e.preventDefault();
            hideFloatingText();
        }
        if (e.keyCode == 13) {  // enter - place text
            e.preventDefault();
            hideFloatingText();
            placeText();
            return false;
        }
    }

    function placeText() {
        floatingElement.style.fontWeight = "bold";
        floatingElement.style.fontStyle = "italic";

        let fontString = '';
        if (bold)
            fontString += ' bold';
        if (italic)
            fontString += ' italic';
        fontString += ' ' + floatingElement.style.fontSize;
        fontString += ' ' + floatingElement.style.fontFamily;
        ctx.font = fontString;
        ctx.fillStyle = strokeStyle;
        ctx.fillText(floatingElement.value, lastpos.x, lastpos.y);
        storeAction({
            startx: lastpos.x,
            starty: lastpos.y,
            endx: lastpos.x,
            endy: lastpos.y,
            font: ctx.font,
            textValue: floatingElement.value,
            mode: "text"
        });
    }
    // colors
    document.getElementById('black_button').addEventListener('click', changeColor);
    document.getElementById('white_button').addEventListener('click', changeColor);
    document.getElementById('blue_button').addEventListener('click', changeColor);
    document.getElementById('red_button').addEventListener('click', changeColor);
    document.getElementById('green_button').addEventListener('click', changeColor);
    document.getElementById('yellow_button').addEventListener('click', changeColor);
    function changeColor(e) {
        document.getElementById('black_button').style.border = "none";
        document.getElementById('white_button').style.border = "none";
        document.getElementById('blue_button').style.border = "none";
        document.getElementById('red_button').style.border = "none";
        document.getElementById('green_button').style.border = "none";
        document.getElementById('yellow_button').style.border = "none";
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'black_button')
            strokeStyle = 'black';
        if (e.currentTarget.id === 'white_button')
            strokeStyle = 'white';
        if (e.currentTarget.id === 'blue_button')
            strokeStyle = 'blue';
        if (e.currentTarget.id === 'red_button')
            strokeStyle = 'red';
        if (e.currentTarget.id === 'green_button')
            strokeStyle = 'green';
        if (e.currentTarget.id === 'yellow_button')
            strokeStyle = 'orange';
    }

    // line width
    document.getElementById('thin_width_button').addEventListener('click', setWidth);
    document.getElementById('mid_width_button').addEventListener('click', setWidth);
    document.getElementById('thick_width_button').addEventListener('click', setWidth);
    document.getElementById('thickest_width_button').addEventListener('click', setWidth);
    function setWidth(e) {
        document.getElementById('thin_width_button').style.border = "none";
        document.getElementById('mid_width_button').style.border = "none";
        document.getElementById('thick_width_button').style.border = "none";
        document.getElementById('thickest_width_button').style.border = "none";
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'thin_width_button') {
            lineWidth = 2;
        }
        if (e.currentTarget.id === 'mid_width_button') {
            lineWidth = 5;
        }
        if (e.currentTarget.id === 'thick_width_button') {
            lineWidth = 8;
        }
        if (e.currentTarget.id === 'thickest_width_button') {
            lineWidth = 12;
        }
    }

    // Drawing
    var strokeStyle = 'black';
    var lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'white';

    // Prevent scrolling when touching the canvas
	document.body.addEventListener("touchstart", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, { passive: false });
	document.body.addEventListener("touchend", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, { passive: false });
	document.body.addEventListener("touchmove", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, { passive: false });

    function storeAction(a) {
        changesMade = true;
        actions.push(a);
    }
    function drawAction(action) {
        if (action.mode === 'text') {
            ctx.font = action.font;
            ctx.fillText(action.textValue, action.startx, action.starty);
        }
        if ((action.mode === 'draw') || (action.mode === 'line')) {
            if (action.mode === 'line') {
                ctx.beginPath();
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.lineWidth = action.lineWidth;
            ctx.strokeStyle = action.strokeStyle;
            ctx.moveTo(action.startx, action.starty);
            if (action.mode === 'draw') {
                ctx.lineTo(action.endx, action.endy);
                ctx.stroke();
            } else {
                ctx.lineTo(action.endx, action.endy);
                ctx.stroke();
            }
        }
    }
    function redrawAll() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        actions.forEach(action => {
            drawAction(action);
        });
    }
    function undo(e, discard) {
        hideFloatingText();
        if (actions.length > 0) {
            var a = actions.pop();
            if (!discard)
                redoList.push(a);
            redrawAll();
        } else {
            alert('nothing to undo');
        }
    }
    function redo(e) {
        hideFloatingText();
        if (redoList.length > 0) {
            let a = redoList.pop();
            actions.push(a)
            drawAction(a);
        } else {
            alert('nothing to redo');
        }
    }
    function addLineEvents() {
//        canvas.addEventListener('touchstart', touchStartListener);
        canvas.addEventListener('touchend', lineTouchEndListener);
        canvas.addEventListener('touchmove', lineTouchMoveListener);
        canvas.addEventListener('mousedown', mouseDownListener);
        canvas.addEventListener('mouseup', lineMouseUpListener);
        canvas.addEventListener('mousemove', lineMouseMoveListener);
    }
    function removeLineEvents() {
//        canvas.removeEventListener('touchstart', touchStartListener);
        canvas.removeEventListener('touchmove', lineTouchMoveListener);
        canvas.removeEventListener('touchend', lineTouchEndListener);
        canvas.removeEventListener('mousedown', mouseDownListener);
        canvas.removeEventListener('mousemove', lineMouseMoveListener);
        canvas.removeEventListener('mouseup', lineMouseUpListener);
    }
    function addPenEvents() {
//        canvas.addEventListener('touchstart', touchStartListener);
        canvas.addEventListener('touchmove', penTouchMoveListener);
        canvas.addEventListener('touchend', penTouchEndListener);
        canvas.addEventListener('mousedown', mouseDownListener);
        canvas.addEventListener('mousemove', penMouseMoveListener);
        canvas.addEventListener('mouseup', penMouseUpListener);
    }
    function removePenEvents() {
//        canvas.removeEventListener('touchstart', touchStartListener);
        canvas.removeEventListener('touchmove', penTouchMoveListener);
        canvas.removeEventListener('touchend', penTouchEndListener);
        canvas.removeEventListener('mousedown', mouseDownListener);
        canvas.removeEventListener('mousemove', penMouseMoveListener);
        canvas.removeEventListener('mouseup', penMouseUpListener);
    }
    function addTextEvents() {
        canvas.addEventListener('touchstart', textTouchStartListener);
        canvas.addEventListener('mousedown', textMouseDownListener);
    }
    function removeTextEvents() {
        canvas.removeEventListener('touchstart', textTouchStartListener);
        canvas.removeEventListener('mousedown', textMouseDownListener);
    }
    function touchStartListener(e) {
        mouseDownListener(e);
    }
    function mouseDownListener(e) {
        isDrawing = true;
        firstLine = true;
        if (e.touches) {
            setLastPos(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            setLastPos(e.clientX, e.clientY);
        }
    }
    function lineTouchEndListener(e) {
        lineMouseUpListener(e);
    }
    function lineMouseUpListener(e) {
        if (e.touches) {
            setCurrentPos(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        } else {
            if (e.button === 0) {
                setCurrentPos(e.clientX, e.clientY);
            }
        }
        isDrawing = false;
    }
    function lineTouchMoveListener(e) {
        lineMouseMoveListener(e);
    }
    function lineMouseMoveListener(e) {
        if (isDrawing && !firstLine) {
            // if drawing in line mode, undo last line and draw current,
            // discarding action from redo list
            undo(e, true);
        }
        if (e.touches) {
            setCurrentPos(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        } else {
            if (e.button === 0) {
                setCurrentPos(e.clientX, e.clientY);
            }
        }
        lineDraw();
        firstLine = false;
    }
    function penTouchMoveListener(e) {
        // Call preventDefault() to prevent any mouse handling
        e.preventDefault();
		penMouseMoveListener(e);
    }
    // draw freeform
    function penMouseMoveListener(e) {
        // draw freeform
        if (!isDrawing) return;
        if (e.touches) {
            setCurrentPos(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            setCurrentPos(e.clientX, e.clientY);
        }
        penDraw();
    }
    function penTouchEndListener(e) {
        penMouseUpListener(e);
    }
    function penMouseUpListener(e) {
        isDrawing = false;
    }
    function textTouchStartListener(e) {
        textMouseDownListener(e);
    }
    function textMouseDownListener(e) {
        e.preventDefault(); // stops focus being stolen by another event
        if (e.touches) {
            setLastPos(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            setLastPos(e.clientX, e.clientY);
        }
        setFloatingTextBoxSize();
        fs.left = (lastpos.x - 16) + "px";
        fs.top = (lastpos.y - 42) + "px";
        floatingElement.focus();
        setBold(bold);
        setItalic(italic);
    }
    function setLastPos(x, y) {
        lastpos.x = ((x - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        lastpos.y = ((y - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
    }
    function setCurrentPos(x, y) {
        currentpos.x = ((x - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        currentpos.y = ((y - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
    }
    function penDraw() {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.moveTo(lastpos.x, lastpos.y);
        ctx.lineTo(currentpos.x, currentpos.y);
        ctx.stroke();
        // For redo, save the mouse position and 
        // the size/color of the brush to the "undo" array
        storeAction({
            startx: lastpos.x,
            starty: lastpos.y,
            endx: currentpos.x,
            endy: currentpos.y,
            lineWidth: lineWidth,
            strokeStyle: strokeStyle,
            mode: "draw"
        });
        lastpos.x = currentpos.x;
        lastpos.y = currentpos.y;
    }
    function lineDraw() {
        if (isDrawing) {
            storeAction({
                startx: lastpos.x,
                starty: lastpos.y,
                endx: currentpos.x,
                endy: currentpos.y,
                lineWidth: lineWidth,
                strokeStyle: strokeStyle,
                mode: "line"
            });
        }
        ctx.beginPath();
        actions.forEach(action => {
            if (action.mode != 'line')
                return;
            ctx.beginPath();
            ctx.lineWidth = action.lineWidth;
            ctx.strokeStyle = action.strokeStyle;
            ctx.moveTo(action.startx, action.starty);
            ctx.lineTo(action.endx, action.endy);
        });
        ctx.stroke();
        if (isDrawing) {
            var a = actions[actions.length-1];
            ctx.lineWidth = a.lineWidth;
            ctx.strokeStyle = a.strokeStyle;
            ctx.moveTo(a.startx, a.starty);
            ctx.lineTo(a.endx, a.endy);
            ctx.stroke();
        }
    }
}, false);
