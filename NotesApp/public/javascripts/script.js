$().ready(function() {
    // Get ref to save buton so we can set up an event listener to
    // send the image bitmap to the database when saving the note
    var save_button = document.getElementById('save_button');
    // Get ref to hidden image element which will store the
    // image data as a url
    var image_element = document.getElementById('image');
    // Get ref to canvas
    var canvas = document.getElementById('canvas');

    // Set canvas border
    canvas.style.border = "thin dashed #888888";

    // get canvas 2D context and set to correct size
    var ctx = canvas.getContext('2d');

    // Set default line color, width and shape
    var strokeStyle = 'black';
    var lineWidth = 2;
    ctx.lineCap = 'round';

    document.getElementById('blue_button').addEventListener('click', setColor);
    document.getElementById('red_button').addEventListener('click', setColor);
    document.getElementById('green_button').addEventListener('click', setColor);
    document.getElementById('black_button').addEventListener('click', setColor);
    document.getElementById('erase_button').addEventListener('click', setColor);
    function setColor(e) {
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
    function setWidth(e) {
        if (e.currentTarget.id === 'thin_width_button')
            lineWidth = 2;
        if (e.currentTarget.id === 'mid_width_button')
            lineWidth = 4;
        if (e.currentTarget.id === 'thick_width_button')
            lineWidth = 6;
    }
    
    // Set to correct dimensions
    resize();
    canvas.addEventListener('resize', resize);
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        rect = canvas.getBoundingClientRect();
        scaleX = canvas.width / rect.width;
        scaleY = canvas.height / rect.height;
    }
    // Render bitmap data in hidden image element to canvas
    var img = new Image;
    img.onload = function(){
        ctx.drawImage(img, 0, 0); // Draw image at top right
    };
    img.src = image_element.value;

    // last known position
    var pos = { x: 0, y: 0 };
    var windowScrollXStartPos = window.pageXOffset; //window.scrollX;
    var windowScrollYStartPos = window.pageYOffset; //window.scrollY;
    
    // Tie mouse click event listener to save image function
    save_button.addEventListener('click', saveImage);
    function saveImage(e) {
        var urlData = canvas.toDataURL("image/png");
        image_element.setAttribute("value", urlData);
    }

    // Set event listeners to draw on mouse move
    canvas.addEventListener('mousemove', draw);
    function draw(e) {
        if (e.buttons !== 1) return;
        ctx.beginPath(); // begin
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.moveTo(pos.x, pos.y); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y); // to
        ctx.stroke(); // draw it!
    }
    // Set event listeners to record x, y positions on mouse down/enter
    canvas.addEventListener('mousedown', setPosition);
    canvas.addEventListener('mouseenter', setPosition);
    function setPosition(e) {
        pos.x = ((e.clientX - rect.left) + (window.pageXOffset - windowScrollXStartPos)) * scaleX;
        pos.y = ((e.clientY - rect.top) + (window.pageYOffset - windowScrollYStartPos)) * scaleY;
    }
});