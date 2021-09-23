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

    // save mouse actions for undo/redo
    //var actions_input = document.getElementById('actions');
    //var startx_input = document.getElementById('startx');
    //var starty_input = document.getElementById('starty');
    //var endx_input = document.getElementById('endx');
    //var endy_input = document.getElementById('endy');
    //actions_input.value = '0';
    //startx_input.value = '0';
    //starty_input.value = '0';
    //endx_input.value = '0';
    //endy_input.value = '0';
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
    canvas.addEventListener('mousemove', freeformDraw);
    canvas.addEventListener('mousedown', storeMouseCoords);
    canvas.addEventListener('mouseenter', storeMouseCoords);

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
            addAction({
                strokeStyle: strokeStyle,
                mode: "fill"
            });
        }
        if (e.currentTarget.id === 'text_button') {
            ctx.fillStyle = strokeStyle;
            ctx.font = fontSize + 'px serif';
            ctx.fillText(textValue, pos.x, pos.y, textValue.length * (fontSize / 2));
            addAction({
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
            canvas.removeEventListener('mousedown', lineMouseDownListener);
            canvas.removeEventListener('mouseup', lineMouseUpListener);
            canvas.addEventListener('mousemove', freeformDraw);
            canvas.addEventListener('mousedown', storeMouseCoords);
            canvas.addEventListener('mouseenter', storeMouseCoords);
        }
        if (e.currentTarget.id === 'line') {
            // line
            drawStyle = 1;
            canvas.removeEventListener('mousemove', freeformDraw);
            canvas.removeEventListener('mousedown', storeMouseCoords);
            canvas.removeEventListener('mouseenter', storeMouseCoords);
            canvas.addEventListener('mousedown', lineMouseDownListener);
            canvas.addEventListener('mouseup', lineMouseUpListener);
        }
    }

    function addAction(a) {
        actions.push(a);
        //updateIndicators(a);
    }
    //function updateIndicators(a) {
    //    let len = actions.length;
    //    actions_input.value = len;
    //    startx_input.value = a.startx;
    //    starty_input.value = a.starty;
    //    endx_input.value = a.endx;
    //    endy_input.value = a.endy;
    //}
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
        //updateIndicators(action);
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
    const lineMouseDownListener = (e) => {
        if (e.button !== 0) return;
        if (!isDrawing) {
            storeMouseCoords(e);
            isDrawing = !isDrawing;
        }
    }
    const lineMouseUpListener = (e) => {
        if (e.button !== 0) return;
        if (isDrawing) {
            let startx = pos.x;
            let starty = pos.y;
            storeMouseCoords(e);
            addAction({
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
        lineDraw();
    }
    function lineDraw() {
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
    function freeformDraw(e) {
        if (e.buttons !== 1) return;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        let startX = pos.x;
        let startY = pos.y;
        ctx.moveTo(startX, startY);
        storeMouseCoords(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // For redo, save the mouse position and 
        // the size/color of the brush to the "undo" array
        addAction({
            startx: startX,
            starty: startY,
            endx: pos.x,
            endy: pos.y,
            lineWidth: lineWidth,
            strokeStyle: strokeStyle,
            mode: "draw"
        });
    }
    function storeMouseCoords(e) {
        pos.x = ((e.clientX - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        pos.y = ((e.clientY - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
    }
}, false);
