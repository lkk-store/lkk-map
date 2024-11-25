let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU7WUEmGn6K4Fc6MOw_46trqCnhtIxaCYo9AQOOWT_yNQi43LF0e_m0G61H8FBTEAyAY65nFqgY4x7/pub?gid=71895201&output=csv&" + Date.now()

// let url = "data.csv";


d3.queue()
    .defer(d3.csv, url)
    .awaitAll(function(err, res){

        let s10 = res[0].filter(d => d.section == 10)[0];

    //-----------Var Inits--------------
    canvas = d3.select("#canvas canvas");
    ctx = canvas.node().getContext("2d");

    var cw = innerWidth;
    var ch = innerHeight;

    canvas.width = cw;
    canvas.height = ch;
    canvas.style("width", cw + "px");
    canvas.style("height", ch + "px");
    canvas.attr("width", cw + "px");
    canvas.attr("height", ch + "px");
    cx = ctx.canvas.width/2;
    cy = ctx.canvas.height/2;

    const src = "cp_head.png";
    var img = new Image();

    let confetti = [];
    const confettiCount = 300;
    const gravity = 0.5;
    const terminalVelocity = 2.5;
    const drag = 0.075;
    const colors = [
        { front : 'red', back: 'darkred'},
        { front : 'green', back: 'darkgreen'},
        { front : 'blue', back: 'darkblue'},
        { front : 'yellow', back: 'darkyellow'},
        { front : 'orange', back: 'darkorange'},
        { front : 'pink', back: 'darkpink'},
        { front : 'purple', back: 'darkpurple'},
        { front : 'turquoise', back: 'darkturquoise'},
    ];

    //-----------Functions--------------
    resizeCanvas = () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        canvas.style("width", innerWidth + "px");
        canvas.style("height", innerHeight + "px");
        canvas.attr("width", innerWidth + "px");
        canvas.attr("height", innerHeight + "px");
        cx = ctx.canvas.width/2;
        cy = ctx.canvas.height/2;

        cancelAnimationFrame(window.timer);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initConfetti();
        render();

    }


    randomRange = (min, max) => Math.random() * (max - min) + min

    initConfetti = () => {
        for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            color      : colors[Math.floor(randomRange(0, colors.length))],
            dimensions : {
            x: 40,//randomRange(5, 10),
            y: 40//randomRange(5, 10),
            },
            position   : {
            x: randomRange(0, canvas.width),
            y: canvas.height,
            },
            rotation   : randomRange(0, 2 * Math.PI),
            scale      : {
            x: 1,
            y: 1,
            },
            velocity   : {
            x: randomRange(-25, 25),
            y: randomRange(0, -50),
            },
        });
        }

        // console.log(confetti)
    }


    var chromiumIssue1092080WorkaroundOverlay = d3.select(".chromium-issue-1092080-workaround__overlay")
    //---------Render-----------
    render = () => {  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((confetto, index) => {
            let width = (confetto.dimensions.x * confetto.scale.x);
            let height = (confetto.dimensions.y * confetto.scale.y);
            
            // Move canvas to position and rotate
            ctx.translate(confetto.position.x, confetto.position.y);
            // ctx.rotate(confetto.rotation);
            
            // Apply forces to velocity
            confetto.velocity.x -= confetto.velocity.x * drag;
            confetto.velocity.y = Math.min(confetto.velocity.y + gravity, terminalVelocity);
            confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
            
            // Set position
            confetto.position.x += confetto.velocity.x;
            confetto.position.y += confetto.velocity.y;
            
            // Delete confetti when out of frame
            if ((confetto.position.y) >= ((canvas.height))) {
                confetti.splice(index, 1);
            }

            // Loop confetto x position
            if (confetto.position.x > (canvas.width)) confetto.position.x = 0;
            // if (confetto.position.x < 0) confetto.position.x = canvas.width;

            // Spin confetto by scaling y
            confetto.scale.y = Math.cos(confetto.position.y * 0.1);
            // ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
                
            // Draw confetto
            // ctx.fillRect(-width / 2, -height / 2, width, height);

            // if (img.complete){  // has the image loaded
            // img.onload = function() {
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
            // }

            // Reset transform matrix
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        });

        // // Fire off another round of confetti
        if (confetti.length <= 30) {
            initConfetti();
        }

        window.timer = window.requestAnimationFrame(render);
    }

    //---------Execution--------

    // console.log(s10)
    if (s10.real_time_end != '') {

        d3.select("#finish-text").classed("finished", true);
        d3.select(".last-updated").classed("finished", true);


        img.onload = function() {
            initConfetti();
            render();
        }
        // setInterval(render, 15)

        img.src = "cp_head.png"

        //----------Resize----------
        window.addEventListener('resize', debounce(function(e){
            resizeCanvas();
        }));

        // //------------Click------------
        window.addEventListener('click', function() {
            initConfetti();
            // render();
        });

    }
        
    function debounce(func){
        var timer;
        return function(event){
        if(timer) clearTimeout(timer);
        timer = setTimeout(func,250,event);
        };
    }

})