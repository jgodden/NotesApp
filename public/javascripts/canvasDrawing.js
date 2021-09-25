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
    var canvas_row_element = document.getElementById('canvas-row');
    var keys_row_element = document.getElementById('keys-row');
    // Get ref to canvas, but it isn't instantiated yet, so can't set style at this point
    var canvas = document.getElementById('canvas');
    // get canvas 2D context and set to correct size
    var ctx = canvas.getContext('2d');
    // Set canvas border
    canvas.style.border = "thin dashed #888888";

    // Contains list of actions used to implement undo/redo
    var actions = [];
    // Contains array of actions popped from actions on undo
    var redoList = [];
    // Set to correct dimensions
    var rect = canvas.getBoundingClientRect();
    var scaleX = 0;
    var scaleY = 0;
    // Initialise some drawing properties
    var textValue = "";
    var fontSize = "10";
    var windowScrollXStartPos = window.pageXOffset;
    var windowScrollYStartPos = window.pageYOffset;
    var isDrawing = false;
    var pos = { x: 0, y: 0 };
    // Mouse event handlers for freeform draw
    // Set event listeners to draw on mouse move
    canvas.addEventListener('mousemove', drawMouseMoveListener);
    canvas.addEventListener('mousedown', drawMouseDownListener);
    canvas.addEventListener('mouseenter', drawMouseDownListener);

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

    document.getElementById('blue_button').addEventListener('click', changeColor);
    document.getElementById('red_button').addEventListener('click', changeColor);
    document.getElementById('green_button').addEventListener('click', changeColor);
    document.getElementById('black_button').addEventListener('click', changeColor);
    document.getElementById('white_button').addEventListener('click', changeColor);
    document.getElementById('fill_button').addEventListener('click', controlAction);
    document.getElementById('text_button').addEventListener('click', controlAction);
    document.getElementById('text').addEventListener('input', controlAction);
    document.getElementById('fontSize').addEventListener('change', controlAction);
    function changeColor(e) {
        document.getElementById('blue_button').style.border = "none";
        document.getElementById('red_button').style.border = "none";
        document.getElementById('green_button').style.border = "none";
        document.getElementById('black_button').style.border = "none";
        document.getElementById('white_button').style.border = "none";
        document.getElementById('fill_button').style.border = "none";
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
    }
    function controlAction(e) {
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'fill_button') {
            ctx.fillStyle = strokeStyle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            storeAction({
                strokeStyle: strokeStyle,
                mode: "fill"
            });
        }
        if (e.currentTarget.id === 'text_button') {
            ctx.fillStyle = strokeStyle;
            ctx.font = fontSize + 'px serif';
            ctx.fillText(textValue, pos.x, pos.y, textValue.length * (fontSize / 2));
            storeAction({
                startx: pos.x,
                starty: pos.y,
                strokeStyle: strokeStyle,
                fontSize: fontSize,
                textValue: textValue,
                mode: "text"
            });
        }
        if (e.currentTarget.id === 'text') {
            textValue = e.currentTarget.value;
        }
        if (e.currentTarget.id === 'fontSize') {
            fontSize = e.currentTarget.value;
        }
    }

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

    // Set default line color, width and shape
    var strokeStyle = 'black';
    var lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'white';

    document.getElementById('pencil').addEventListener('click', setDrawStyle);
    document.getElementById('line').addEventListener('click', setDrawStyle);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    function setDrawStyle(e) {
        document.getElementById('pencil').style.border = "none";
        document.getElementById('line').style.border = "none";
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'pencil') {
            //freeform
            drawStyle = 0;
            canvas.removeEventListener('touchstart', lineTouchStartListener);
            canvas.removeEventListener('mousedown', lineMouseDownListener);
            canvas.removeEventListener('touchend', lineTouchEndListener);
            canvas.removeEventListener('mouseup', lineMouseUpListener);
            canvas.addEventListener('touchmove', drawTouchMoveListener);
            canvas.addEventListener('mousemove', drawMouseMoveListener);
            canvas.addEventListener('touchstart', drawTouchStartListener);
            canvas.addEventListener('mousedown', drawMouseDownListener);
            canvas.addEventListener('touchend', drawTouchEndListener);
            canvas.addEventListener('mouseup', drawMouseUpListener);
        }
        if (e.currentTarget.id === 'line') {
            // line
            drawStyle = 1;
            canvas.removeEventListener('touchmove', drawTouchMoveListener);
            canvas.removeEventListener('mousemove', drawMouseMoveListener);
            canvas.removeEventListener('touchstart', drawTouchStartListener);
            canvas.removeEventListener('mousedown', drawMouseDownListener);
            canvas.removeEventListener('touchend', drawTouchEndListener);
            canvas.removeEventListener('mouseup', drawMouseUpListener);
            canvas.addEventListener('touchstart', lineTouchStartListener);
            canvas.addEventListener('mousedown', lineMouseDownListener);
            canvas.addEventListener('touchend', lineTouchEndListener);
            canvas.addEventListener('mouseup', lineMouseUpListener);
        }
    }
    function storeAction(a) {
        actions.push(a);
    }
    function drawAction(action) {
        if (action.mode === 'fill') {
            ctx.fillStyle = action.strokeStyle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (action.mode === 'text') {
            ctx.fillStyle = action.strokeStyle;
            ctx.font = action.fontSize + 'px serif';
            ctx.fillText(action.textValue, action.startx, action.starty, action.textValue.length * (action.fontSize / 2));
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
        let index = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        while (index < actions.length) {
            let action = actions[index];
            drawAction(action);
            index += 1;
        }
    }
    function undo(e) {
        if (actions.length > 0) {
            redoList.push(actions.pop());
            redrawAll();
        } else {
            alert('nothing to undo');
        }
    }
    function redo(e) {
        if (redoList.length > 0) {
            let a = redoList.pop();
            actions.push(a)
            drawAction(a);
        } else {
            alert('nothing to redo');
        }
    }
    const lineTouchStartListener = (e) => {
        e.preventDefault();
        lineMouseDownListener(e, true);
    }
    const lineMouseDownListener = (e, touch) => {
        if (!touch && (e.button !== 0)) return;
        if (!isDrawing) {
            drawMouseDownListener(e);
            isDrawing = !isDrawing;
        }
    }
    const lineTouchEndListener = (e) => {
        e.preventDefault();
        lineMouseUpListener(e, true);
    }
    const lineMouseUpListener = (e, touch) => {
        if (!touch && (e.button !== 0)) return;
        if (isDrawing) {
            let startx = pos.x;
            let starty = pos.y;
            drawMouseDownListener(e);
            storeAction({
                startx: startx,
                starty: starty,
                endx: pos.x,
                endy: pos.y,
                lineWidth: lineWidth,
                strokeStyle: strokeStyle,
                mode: "line"
            });
            isDrawing = !isDrawing;
        }
        lineAction();
    }
    // draw a line
    function lineAction() {
        var numberOfActions = actions.length;
        ctx.beginPath();
        for (var i = 0; i < numberOfActions; ++i) {
            var action = actions[i];
            if (action.mode != 'line')
                continue;
            ctx.beginPath();
            ctx.lineWidth = action.lineWidth;
            ctx.strokeStyle = action.strokeStyle;
            ctx.moveTo(action.startx, action.starty);
            ctx.lineTo(action.endx, action.endy);
        }
        var a = actions[numberOfActions-1];
        ctx.stroke();
        if (isDrawing) {
            ctx.lineWidth = a.lineWidth;
            ctx.strokeStyle = a.strokeStyle;
            ctx.moveTo(a.startx, a.starty);
            ctx.lineTo(a.endx, a.endy);
            ctx.stroke();
        }
    }
    // touchmove handler
    function drawTouchMoveListener(e) {
        // Call preventDefault() to prevent any mouse handling
        e.preventDefault();
        drawMouseMoveListener(e, true);
    }
    // draw freeform
    function drawMouseMoveListener(e, touch) {
        if (!touch && (e.buttons !== 1)) return;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        let startX = pos.x;
        let startY = pos.y;
        ctx.moveTo(startX, startY);
        drawMouseDownListener(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // For redo, save the mouse position and 
        // the size/color of the brush to the "undo" array
        storeAction({
            startx: startX,
            starty: startY,
            endx: pos.x,
            endy: pos.y,
            lineWidth: lineWidth,
            strokeStyle: strokeStyle,
            mode: "draw"
        });
    }
    function drawTouchStartListener(e) {
        e.preventDefault();
        var touches = e.changedTouches;
        setPos(touches.clientX, touches.clientY);
    }
    function drawMouseDownListener(e) {
        setPos(e.clientX, e.clientY);
    }
    function drawTouchEndListener(e) {
        e.preventDefault();
        var touches = e.changedTouches;
        setPos(touches.clientX, touches.clientY);
    }
    function drawMouseUpListener(e) {
        setPos(e.clientX, e.clientY);
    }
    function setPos(x, y) {
        pos.x = ((x - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        pos.y = ((y - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
    }
}, false);
