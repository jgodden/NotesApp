window.addEventListener("DOMContentLoaded", function() {
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
    var drawingSurfaceImageData;
    // Set to correct dimensions
    var rect = canvas.getBoundingClientRect();
    var scaleX = 0;
    var scaleY = 0;
    // Render bitmap data in hidden image element to canvas
    var img = new Image;
    img.src = image_url_element.value;
    // Set cross origin otherwise the retrieved png image from cloudinary will be
    // tainted, and the canvas.toDataUrl will fail with security error
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function(){
        ctx.drawImage(img, 0, 0); // Draw image at top right
    };
    drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    resize();
    window.addEventListener('resize', resize);
    function resize() {
        canvas.width = window.innerWidth;
        ctx.putImageData(drawingSurfaceImageData, 0, 0);
        rect = canvas.getBoundingClientRect();
        scaleX = canvas.width / rect.width;
        scaleY = canvas.height / rect.height;
    }

    // Tie mouse click event listener to save image function
    save_button.addEventListener('click', saveImage);
    function saveImage(e) {
        try {
            var urlData = canvas.toDataURL("image/png");
            image_data_element.value = urlData;
        } catch(e) {
            alert('update data error: ' + e);
        }
    }



    document.getElementById('blue_button').addEventListener('click', setColor);
    document.getElementById('red_button').addEventListener('click', setColor);
    document.getElementById('green_button').addEventListener('click', setColor);
    document.getElementById('black_button').addEventListener('click', setColor);
    document.getElementById('erase_button').addEventListener('click', setColor);
    function setColor(e) {
        document.getElementById('blue_button').style.border = "none";
        document.getElementById('red_button').style.border = "none";
        document.getElementById('green_button').style.border = "none";
        document.getElementById('black_button').style.border = "none";
        document.getElementById('erase_button').style.border = "none";
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'black_button')
            strokeStyle = 'black';
        if (e.currentTarget.id === 'blue_button')
            strokeStyle = 'blue';
        if (e.currentTarget.id === 'red_button')
            strokeStyle = 'red';
        if (e.currentTarget.id === 'green_button')
            strokeStyle = 'green';
        if (e.currentTarget.id === 'erase_button')
            strokeStyle = 'white';
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
    var drawStyle = 0; // freeform
    ctx.lineCap = 'round';
    ctx.fillStyle = 'white';
    
    document.getElementById('pencil').addEventListener('click', setDrawStyle);
    document.getElementById('line').addEventListener('click', setDrawStyle);
    function setDrawStyle(e) {
        document.getElementById('pencil').style.border = "none";
        document.getElementById('line').style.border = "none";
        e.target.style.border = "thin solid black";
        if (e.currentTarget.id === 'pencil') {
            //freeform
            drawStyle = 0;
            canvas.removeEventListener('mousedown', lineMouseDownListener);
            canvas.removeEventListener('mousemove', lineMouseMoveListener);
            canvas.removeEventListener('mouseup', lineMouseUpListener);
            canvas.addEventListener('mousemove', freeformDraw);
            canvas.addEventListener('mousedown', setPosition);
            canvas.addEventListener('mouseenter', setPosition);
        }
        if (e.currentTarget.id === 'line') {
            // line
            drawStyle = 1;
            canvas.removeEventListener('mousemove', freeformDraw);
            canvas.removeEventListener('mousedown', setPosition);
            canvas.removeEventListener('mouseenter', setPosition);
            canvas.addEventListener('mousedown', lineMouseDownListener);
            canvas.addEventListener('mousemove', lineMouseMoveListener);
            canvas.addEventListener('mouseup', lineMouseUpListener);
        }
    }

    var windowScrollXStartPos = window.pageXOffset; //window.scrollX;
    var windowScrollYStartPos = window.pageYOffset; //window.scrollY;
    var isDrawing = false;
    var existingLines = [];
    var pos = { x: 0, y: 0 };

    const lineMouseDownListener = (e) => {
        if (e.button === 0) {
            if (!isDrawing) {
                startX = getXPosition(e);
                startY = getYPosition(e);
                isDrawing = true;
            }
            lineDraw(e);
        }
    }
    
    const lineMouseUpListener = (e) => {
        if (e.button === 0) {
            if (isDrawing) {
                existingLines.push({
                    startX: startX,
                    startY: startY,
                    endX: pos.x,
                    endY: pos.y,
                    lineWidth: lineWidth,
                    strokeStyle: strokeStyle
                });      
                isDrawing = false;
            }
            lineDraw(e);
        }
    }
    
    const lineMouseMoveListener = (e) => {
        setPosition(e);
        //if (isDrawing) {
        //    lineDraw();
        //}
    }
     
    function lineDraw(e) {
        if (e.buttons !== 1) return;
        ctx.beginPath();
        for (var i = 0; i < existingLines.length; ++i) {
            var line = existingLines[i];
            ctx.beginPath();
            ctx.lineWidth = line.lineWidth;
            ctx.strokeStyle = line.strokeStyle;
            ctx.moveTo(line.startX,line.startY);
            ctx.lineTo(line.endX,line.endY);
        }
        ctx.stroke();
        if (isDrawing) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(pos.x , pos.y);
            ctx.stroke();
        }
        drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function freeformDraw(e) {
        if (e.buttons !== 1) return;

        ctx.beginPath(); // begin
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.moveTo(pos.x, pos.y); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y); // to
        ctx.stroke(); // draw it!
        drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    // Mouse event handlers for freeform draw
    // Set event listeners to draw on mouse move
    canvas.addEventListener('mousemove', freeformDraw);
    canvas.addEventListener('mousedown', setPosition);
    canvas.addEventListener('mouseenter', setPosition);
    function getXPosition(e) {
        const x = ((e.clientX - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        return x;
    }
    function getYPosition(e) {
        const y = ((e.clientY - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
        return y;
    }
    function setPosition(e) {
        pos.x = getXPosition(e);
        pos.y = getYPosition(e);
    }
}, false);