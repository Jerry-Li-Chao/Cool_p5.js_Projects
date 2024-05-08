let particles = [];
let isFist = false;
FRAMERATE = 60;

function preventDefaultBehavior(e) {
    e.preventDefault();
  }

function setup() {  
    // canvas 90% of the window width and height
  let cnv = createCanvas(windowWidth * 0.99, windowHeight * 0.99);

  // Add event listeners to prevent default behavior
  cnv.elt.addEventListener('touchstart', handleStart, {passive: false});
  cnv.elt.addEventListener('touchend', handleEnd, {passive: false});
  cnv.elt.addEventListener('mousedown', handleStart);
  cnv.elt.addEventListener('mouseup', handleEnd);

  for (let i = 0; i < 200; i++) {
    let p = new Particle(random(width), random(height), false);
    particles.push(p);
  }
  
  for (let i = 0; i < 4; i++) {
    let special = new Particle(random(width), random(height), true);
    particles.push(special);
  }


  for (let i = 0; i < 20; i++) {
    let nonInteracting = new Particle(random(width), random(height), false, false);
    particles.push(nonInteracting);
  }

    let blackHoleLocation = createVector(random(width), random(height));    
    let blackHole = new Particle(blackHoleLocation.x, blackHoleLocation.y, false, false, 1);
    particles.push(blackHole);

    // whiteHoleLocation must be at least following pixels away from the black hole
    // minDistanceAway = sqrt((0.4 * width)^2 + (0.4 * height)^2);
    let minDistanceAway = sqrt((0.3 * width) * (0.3 * width) + (0.3 * height) * (0.3 * height));
    let whiteHoleLocation = createVector(random(width), random(height));
    while(dist(blackHoleLocation.x, blackHoleLocation.y, whiteHoleLocation.x, whiteHoleLocation.y) < 300) {
        whiteHoleLocation = createVector(random(width), random(height));
    }
    let whiteHole = new Particle(whiteHoleLocation.x, whiteHoleLocation.y, false, false, 2);
    particles.push(whiteHole);

  
}


function draw() {

    background(0, 30);
    
    for (let p of particles) {
        p.update();
        p.display();
    }
}
function handleStart(e) {
    console.log("touchstart");
    e.preventDefault(); // Prevent default behavior
    isFist = true;      // Set your flag or trigger behavior
  }
  
  function handleEnd(e) {
    console.log("touchend");
    e.preventDefault(); // Prevent default behavior
    isFist = false;     // Reset your flag or end behavior
  }


// function mousePressed() {
//     isFist = true;
// }

// function mouseReleased() {
//     isFist = false;
// }


class Particle {
    constructor(x, y, nucleus = false, interacting = true, type = 0) {
        this.p = createVector(x, y);
        this.v = createVector(random(-2, 2), random(-2, 2));
        this.a = createVector(0, 0);
        this.radius = 10;
        this.special = nucleus;
        this.interacting = interacting;
        this.type = type; // type 0: normal, type 1: black hole, type 2: white hole
        this.justEjected = false;
        this.timeSinceLastEjection = 0.0;
        this.EjectionStateTimeout = 8;

        let color1 = color(255, 105, 180, 200); // pink
        let color2 = color(0, 0, 255, 150); // blue
        this.col = lerpColor(color1, color2, random(0, 1));
        // I want a rainbow gradient, using lerpColor
        // let colors = [
        //     color(255, 0, 0, 150),    // red
        //     color(255, 255, 0, 150),  // yellow
        //     color(0, 255, 0, 150),    // green
        //     color(0, 255, 255, 150),  // cyan
        //     color(0, 0, 255, 150),    // blue
        //     color(255, 0, 255, 150)   // magenta
        //   ];
        // let color1 = colors[floor(random(0, colors.length))];
        // // color2 has to be different from color1
        // let color2 = colors[floor(random(0, colors.length))];
        // while(color2 == color1) {
        //     color2 = colors[floor(random(0, colors.length))];
        // }
        // this.col = lerpColor(color1, color2, random(0, 1))
        
    }

    update() {
        if(this.type == 1) {
            this.p.add(this.v);
            this.v.limit(1);
        }
        else if(this.type == 2) {
            this.p.add(this.v);
            this.v.limit(3);
        }
        else {
            this.p.add(this.v);
            this.v.add(this.a);
            this.v.limit(5);
        }

        // if this.justEjected is true, then add time to the timeSinceLastEjection
        if(this.justEjected) {
            this.timeSinceLastEjection += 1.0/60;
            if(this.timeSinceLastEjection > this.EjectionStateTimeout) {
                this.justEjected = false;
            }
        }
        

        // edge
        if(this.p.x + this.radius > width) {
            this.v.x *= -1;
            this.p.x = width - this.radius;
        }
        if (this.p.x - this.radius < 0) {
            this.v.x *= -1;
            this.p.x = this.radius;
        }
        if (this.p.y + this.radius > height) {
            this.v.y *= -1;
            this.p.y = height - this.radius;
        }
        if (this.p.y - this.radius < 0) {
            this.v.y *= -1;
            this.p.y = this.radius;
        }
        
        // iterate over all particles
        // bounce off the special particle, when distance with the special particle is less than 100
        if(this.interacting) {
            for (let other of particles) {
                if (other.special) {
                    let d = dist(this.p.x, this.p.y, other.p.x, other.p.y);
                    // bumping into the special particle
                    if (d < 50) {
                        let diff = p5.Vector.sub(this.p, other.p);
                        // add velocity to avoid the special particle
                        // normal should bounce off from special with a greater force
                        if(this.special == false) {
                            this.v.add(diff.div(240));
                        }
                        else { // special particle should bounce off with a less force
                            this.v.add(diff.div(500));
                        }
                    }
                }
                else{
                    let d = dist(this.p.x, this.p.y, other.p.x, other.p.y);
                    // bumping into the normal particle
                    if (d < 30) {
                        let diff = p5.Vector.sub(this.p, other.p);
                        // normal should bounce off from special with a greater force
                        if (this.special == false) {
                            this.v.add(diff.div(240));
                        }
                        else { // special particle should bounce off with a less force
                            this.v.add(diff.div(500));
                        }
                    }
                }

                // if the particle is a black hole, when it touches the black hole, it should be teleported to the white hole
                if(other.type == 1) {
                    let d = dist(this.p.x, this.p.y, other.p.x, other.p.y);
                    if (d < 20) {
                        this.p = createVector(particles[particles.length - 1].p.x, particles[particles.length - 1].p.y);
                        this.justEjected = true;
                        this.timeSinceLastEjection = 0;
                    }
                }
            }
        }
        // if particle is not interacting
        else {
            // the particle should still be attracted to the black hole and repelled from the white hole
            for (let other of particles) {
                if(other != this) {
                    if(other.type == 1) {
                        let d = dist(this.p.x, this.p.y, other.p.x, other.p.y);
                        if (d < 30) {
                            this.p = createVector(particles[particles.length - 1].p.x, particles[particles.length - 1].p.y);
                            this.justEjected = true;
                            this.timeSinceLastEjection = 0;
                        }
                    }
                }   
            }
        }

        // if the particle is a black hole
        if(this.type == 1) {
            // all particles should be attracted to the black hole
            for (let other of particles) {
                if(other != this) {
                    let diff = p5.Vector.sub(this.p, other.p);
                    // dist < 100, the force is applied
                    if(diff.mag() < 200) {
                        if(!other.special) {
                            diff.normalize();
                            diff.mult(0.2);
                            other.a.add(diff);
                        }
                    }
                }
            }
        }
        // if the particle is a white hole
        if(this.type == 2) {
            // all particles should be repelled from the white hole
            for (let other of particles) {
                if(other != this) {
                    let diff = p5.Vector.sub(this.p, other.p);
                    if(diff.mag() < 100) {
                        if(!other.special) {
                            diff.normalize();
                            diff.mult(-0.02);
                            other.a.sub(diff);
                        }
                    }
                }
            }
        }
        

        // seek mouse position
        
        let center = createVector(mouseX, mouseY);
        if(!this.special) {
            if(isFist) {
                // only affect particles in the radius of 
                let affectingRadius = sqrt((0.2 * width) * (0.2 * width) + (0.2 * height) * (0.2 * height));
                if(dist(this.p.x, this.p.y, center.x, center.y) < affectingRadius) {
                    let diff = p5.Vector.sub(center, this.p);
                    this.a = diff.div(500);
                    this.a.limit(3);
                }
                else {
                    this.a = createVector(0, 0);
                }
            }
            else {
                this.a = createVector(0, 0);
            }
        }
        
    }

    display() {
        noStroke();
        if(this)
        if(!this.interacting) {
            if(this.type == 1) {
                // add a hazy glow around the black hole
                // dotted circle with golden color
                noFill();
                stroke(255, 204, 0, 75); // golden color
                strokeWeight(2);
                let radius = 200;
                for (let i = 0; i < TWO_PI; i += 0.03) {
                    let x = this.p.x + cos(i) * radius;
                    let y = this.p.y + sin(i) * radius;
                    point(x, y);
                }

                fill(255,100);
                ellipse(this.p.x, this.p.y, this.radius*2.5, this.radius*2.5);
                fill(0);
                ellipse(this.p.x, this.p.y, this.radius*2, this.radius*2);
            }
            else if(this.type == 2) {
                fill(0,100);
                ellipse(this.p.x, this.p.y, this.radius*2.7, this.radius*2.7);
                fill(255);
                ellipse(this.p.x, this.p.y, this.radius*2, this.radius*2);
            }else {
                if(this.justEjected) {
                    // lerp between white and transparent grey, based on timeSinceLastEjection/EjectionStateTimeout
                    let color1 = color(255, 255, 255, 200); // white
                    let color2 = color(150, 100);
                    let col = lerpColor(color1, color2, this.timeSinceLastEjection/this.EjectionStateTimeout);
                    fill(col);
                    ellipse(this.p.x, this.p.y, this.radius, this.radius);
                }
                // fill with transparent grey
                else {
                    fill(150, 100);
                    ellipse(this.p.x, this.p.y, this.radius, this.radius);
                }
                
            }
        }
        else if(this.special) {
            if(this.justEjected) {
                // lerp between white and red, based on timeSinceLastEjection/EjectionStateTimeout
                let color1 = color(255, 255, 255, 200); // white
                let color2 = color((255, 0, 0, 150));
                let col = lerpColor(color1, color2, this.timeSinceLastEjection/this.EjectionStateTimeout);
                fill(col);
                ellipse(this.p.x, this.p.y, this.radius, this.radius);
            }
            else {
                fill(255, 0, 0, 150);
                ellipse(this.p.x, this.p.y, this.radius*3, this.radius*3);
            }
            
        }
        else {
            if(this.justEjected) {
                // lerp between yellow and red, based on timeSinceLastEjection/EjectionStateTimeout
                let color1 = color(255, 200); // yellow
                let color2 = this.col;
                let col = lerpColor(color1, color2, this.timeSinceLastEjection/this.EjectionStateTimeout);
                fill(col);
                ellipse(this.p.x, this.p.y, this.radius, this.radius);
            }
            else {
                fill(this.col);
                ellipse(this.p.x, this.p.y, this.radius*1.5, this.radius*1.5);
            }
            
        }
    }
}

