window.addEventListener("DOMContentLoaded", function () {
    var lx = document.getElementById('lastposx');
    var lxv = 0;
    var ly = document.getElementById('lastposy');
    var lyv = 0;
    var cx = document.getElementById('currentposx');
    var cxv = 0;
    var cy = document.getElementById('currentposy');
    var cyv = 0;
    var md = document.getElementById('mousedown');
    var mdv = 0;
    var mu = document.getElementById('mouseup');
    var muv = 0;
    var mm = document.getElementById('mousemove');
    var mmv = 0;
    var ts = document.getElementById('touchstart');
    var tsv = 0;
    var te = document.getElementById('touchend');
    var tev = 0;
    var tm = document.getElementById('touchmove');
    var tmv = 0;
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
                startx: currentpos.x,
                starty: currentpos.y,
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

    // Get a regular interval for drawing to the screen
    window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    // Allow for animation
    (function drawLoop () {
        requestAnimFrame(drawLoop);
        //renderCanvas();
    })();

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
            canvas.removeEventListener('touchend', lineTouchEndListener);
            canvas.removeEventListener('mouseup', lineMouseUpListener);
            canvas.addEventListener('touchmove', penTouchMoveListener);
            canvas.addEventListener('mousemove', penMouseMoveListener);
            canvas.addEventListener('touchend', penTouchEndListener);
            canvas.addEventListener('mouseup', penMouseUpListener);
        }
        if (e.currentTarget.id === 'line') {
            // line
            drawStyle = 1;
            canvas.removeEventListener('touchmove', penTouchMoveListener);
            canvas.removeEventListener('mousemove', penMouseMoveListener);
            canvas.removeEventListener('touchend', penTouchEndListener);
            canvas.removeEventListener('mouseup', penMouseUpListener);
            canvas.addEventListener('touchend', lineTouchEndListener);
            canvas.addEventListener('mouseup', lineMouseUpListener);
        }
    }
    // Prevent scrolling when touching the canvas
	document.body.addEventListener("touchstart", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);
	document.body.addEventListener("touchend", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);
	document.body.addEventListener("touchmove", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);
    function touchStartListener(e) {
        ts.value = tsv++;
        e.preventDefault();
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    function mouseDownListener(e) {
        md.value = mdv++;
        isDrawing = true;
        if (e.touches) {
            setLastPos(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            setLastPos(e.clientX, e.clientY);
        }
    }
    const lineTouchEndListener = (e) => {
        te.value = tev++;
        e.preventDefault();
        var mouseEvent = new MouseEvent("mouseup", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
		canvas.dispatchEvent(mouseEvent);
    }
    const lineMouseUpListener = (e) => {
        mu.value = muv++;
        if (!e.touches && (e.button !== 0)) return;
        if (e.touches) {
            setCurrentPos(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            setCurrentPos(e.clientX, e.clientY);
        }
        lineDraw();
    }
    function penTouchMoveListener(e) {
        tm.value = tmv++;
        // Call preventDefault() to prevent any mouse handling
        e.preventDefault();
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousemove", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
    }
    // draw freeform
    function penMouseMoveListener(e) {
        mm.value = mmv++;
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
        te.value = tev++;
        e.preventDefault();
        var mouseEvent = new MouseEvent("mouseup", {});
		canvas.dispatchEvent(mouseEvent);
    }
    function penMouseUpListener(e) {
        mu.value = muv++;
        isDrawing = false;
    }
    function setLastPos(x, y) {
        lastpos.x = ((x - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        lastpos.y = ((y - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
        lx.value = lastpos.x;
        ly.value = lastpos.y;
    }
    function setCurrentPos(x, y) {
        currentpos.x = ((x - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        currentpos.y = ((y - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
        cx.value = currentpos.x;
        cy.value = currentpos.y;
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
            isDrawing = !isDrawing;
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
