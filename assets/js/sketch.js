let canvas,
    circles,
    CENTER,
    BOUNDS,
    COUNT;

const MAX_CIRCLES = 35,
    MIN_POLIG = 3,
    MAX_POLIG = 7,
    MAX_COUNT = 3000;

function Circle(gen) {
    if (gen)
        this.generator = min(1.0, max(0.0, gen));
    else
        this.generator = random();

    this.tick = (override, towards) => {
        this.move(override, towards);
        this.draw();
    };

    this.draw = () => {
        // translate(this.position.x, this.position.y);
        // rotate(this.position.r);
        // translate(-this.position.x, -this.position.y);

        translate(CENTER.x, CENTER.y);
        point(this.position.x, this.position.y);
        for (let func of this.shapes) func();
        translate(-CENTER.x, -CENTER.y);

        // translate(this.position.x, this.position.y);
        // rotate(-this.position.r);
        // translate(-this.position.x, -this.position.y);
    };

    this.move = (override, towards) => {
        if (COUNT == 0 || outbounds(this) || override) {
            if (! towards) {
                let r1 = random(),
                    r2 = random(),
                    r3 = random();
                if (between(r1, 0.00, 0.33)) this.movement.x = this.generator * random(0, 10);
                if (between(r1, 0.33, 0.67)) this.movement.x = - this.generator * random(0, 10);
                if (between(r2, 0.00, 0.33)) this.movement.y = this.generator * random(0, 10);
                if (between(r2, 0.33, 0.67)) this.movement.y = - this.generator * random(0, 10);
                if (between(r3, 0.00, 0.33)) this.movement.r = this.generator * random(0, 10);
                if (between(r3, 0.33, 0.67)) this.movement.r = - this.generator * random(0, 10);
            } else {
                // TODO
            }
        }

        this.position.x += this.movement.x / 10;
        this.position.y += this.movement.y / 10;
        this.position.r += this.movement.r / 10;
    };

    this.position = {
        x: random(BOUNDS.x[0], BOUNDS.x[1]),
        y: random(BOUNDS.y[0], BOUNDS.y[1]),
        r: random(- this.generator * random(0, 5), this.generator * random(0, 5))
    };

    this.movement = {
        x: 0.0,
        y: 0.0,
        r: 0.0
    };
    this.move(true);

    this.radius = 10.0 * this.generator;
    if (this.generator > 0.5) this.radius *= 2;
    if (this.generator < 0.9) this.radius += 15;
    if (this.generator < 0.8) this.radius += 15;
    if (this.generator < 0.4) this.radius *= 3;
    if (this.generator < 0.1) this.radius *= 5;

    this.shapes = [];

    // Out Circle
    if (this.generator > 0.13) this.shapes.push(() => ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2) );
    // In Circle mid
    if (this.generator >  0.13 && this.generator > 0.8 ||
        this.generator <= 0.13 && this.generator > 0.1) this.shapes.push(() => ellipse(this.position.x, this.position.y, this.radius, this.radius) );
    // In Circle fith
    if (this.generator >  0.13 && this.generator < 0.2 ||
        this.generator <= 0.13 && this.generator < 0.05) this.shapes.push(() => ellipse(this.position.x, this.position.y, this.radius * 2 / 5, this.radius * 2 / 5) );

    // Polygs
    for (let i = MIN_POLIG; i <= MAX_POLIG; i++) {
        let rotat = random(0, 360);
        // Out
        if (this.generator > 0.13) this.shapes.push(() => drawShape(getPolig(i, this.radius, rotat), this.position));
        // In mid
        if (this.generator >  0.13 && this.generator > 0.8 ||
            this.generator <= 0.13 && this.generator > 0.1) this.shapes.push(() => drawShape(getPolig(i, this.radius / 2, rotat), this.position));
        // In fith
        if (this.generator >  0.13 && this.generator < 0.2 ||
            this.generator <= 0.13 && this.generator < 0.05) this.shapes.push(() => drawShape(getPolig(i, this.radius / 5, rotat), this.position));
    }

    this.shapes = shuffle(this.shapes);
    this.shapes.splice(3);
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.canvas.id = "backCanvas"
    // canvas.style('filter', 'blur(5px)');
    CENTER = {
        x: windowWidth / 2,
        y: windowHeight / 2
    };
    BOUNDS = {
        x: [-windowWidth / 2, windowWidth / 2],
        y: [-windowHeight / 2, windowHeight / 2]
    };
    COUNT = 0;

    circles = [];
    for (let i = 0; i < MAX_CIRCLES; i++) {
        circles[i] = new Circle();
    }

    frameRate(30);
}

function draw() {
    background(200);
    angleMode(DEGREES);

    noFill();
    strokeWeight(1);
    ellipse(mouseX, mouseY, 10, 10);

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let d = dist(circle.position.x, circle.position.y, mouseX - CENTER.x, mouseY - CENTER.y);

        for (let j = i; j < circles.length; j++) {
            let circle2 = circles[j];
            let d2 = dist(circle.position.x, circle.position.y, circle2.position.x, circle2.position.y);

            if (d2 < 300) {
                stroke(d2 * 2 / 3)
                drawLine({ x: circle.position.x + CENTER.x, y: circle.position.y + CENTER.y, r: 0 }, { x: circle2.position.x + CENTER.x, y: circle2.position.y + CENTER.y, r: 0 })
                stroke(0)
            }
        }

        if (d < 300) {
            circle.tick(true, { x: mouseX, y: mouseY });

            stroke(d * 2 / 3)
            drawLine({ x: mouseX, y: mouseY, r: 10 }, { x: circle.position.x + CENTER.x, y: circle.position.y + CENTER.y, r: 0 })
            stroke(0)
        } else {
            circle.tick();
        }

    }
    // translate(CENTER.x, CENTER.y);
    // point(circles[0].position.x, circles[0].position.y);
    // translate(-CENTER.x, -CENTER.y);

    // filter(BLUR, 1);
    COUNT = (COUNT + 1) % MAX_COUNT;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    CENTER = {
        x: windowWidth / 2,
        y: windowHeight / 2
    };
    BOUNDS = {
        x: [-windowWidth / 2, windowWidth / 2],
        y: [-windowHeight / 2, windowHeight / 2]
    };
    for (let circle of circles) {
        circle.position = {
            x: random(BOUNDS.x[0], BOUNDS.x[1]),
            y: random(BOUNDS.y[0], BOUNDS.y[1])
        };
    }
}

function drawLine(from, to) {
    let diff_from_x = ((to.x - from.x) * from.r) || 0.0;
    let diff_from_y = ((to.y - from.y) * from.r) || 0.0;

    let diff_to_x = ((to.x - from.x) * to.r) || 0.0;
    let diff_to_y = ((to.y - from.y) * to.r) || 0.0;

    line(from.x, from.y, to.x, to.y);
}

function drawShape(points, offset) {
    let o = offset || { x: 0, y: 0 };

    beginShape();
    for (let point of points) {
        vertex(point.x + o.x, point.y + o.y);
    }
    endShape(CLOSE);
}

function getPolig(n, radius, rot) {
    let points = []
    let a = (360 / n) || 120;
    let b = rot || 0;

    let p = {
        x: 0,
        y: radius || 100
    };

    points.push({
        x: p.x * cos(b) - p.y * sin(b),
        y: p.y * cos(b) + p.x * sin(b)
    });

    for (let i = 1; i < n; i++) {
        points.push({
            x: points[i - 1].x * cos(a) - points[i - 1].y * sin(a),
            y: points[i - 1].y * cos(a) + points[i - 1].x * sin(a)
        });
    }

    return points;
}

function between(a, b, c) {
    return (a >= b) && (a <= c);
}

function outbounds(circle) {
    let x = circle.position.x;
    let y = circle.position.y;
    let r = circle.radius;
    return ( (x + r) < BOUNDS.x[0] || (x - r) > BOUNDS.x[1] || (y + r) < BOUNDS.y[0] || (y - r) > BOUNDS.y[1] )
}

function shuffle(a, t) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}