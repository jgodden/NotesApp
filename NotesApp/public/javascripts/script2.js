$().ready(function() {
    var canvas = document.getElementById('canvas');
    document.body.appendChild(canvas);

    // some hotfixes... ( ≖_≖)
    document.body.style.margin = 0;
    canvas.style.position = 'fixed';

    // get canvas 2D context and set him correct size
    var ctx = canvas.getContext('2d');
    resize();

    // last known position
    var pos = { x: 0, y: 0 };
    
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mousedown', setPosition);
    canvas.addEventListener('mouseenter', setPosition);

    // new position from mouse event
    function setPosition(e) {
        pos.x = e.clientX;
        pos.y = e.clientY;
    }

    // resize canvas
    function resize() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight
    }

    function draw(e) {
        // mouse left button must be pressed
        if (e.buttons !== 1) return;
        ctx.beginPath(); // begin

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#c0392b';

        ctx.moveTo(pos.x, pos.y - 700); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y - 700); // to
        ctx.stroke(); // draw it!
    }
});