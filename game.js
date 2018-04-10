// Physics / world
let Engine = Matter.Engine,
    World = Matter.World,

    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Vector = Matter.Vector;

let engine, world;
let canvasMouse, tractorBeam;

let speedDecay = 0.04;

let unit = 30,
    sector = 200;


// Other
let testComponent,
    testComponent2;
let player;

let draggedBodyMask; // Keep track of old mask when dragging

let zoom = 1;

function setup() {
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;

  canvas = createCanvas(windowWidth, windowHeight);

  canvasMouse = Mouse.create(canvas.elt);
  canvasMouse.pixelRatio = pixelDensity();

  tractorBeam = MouseConstraint.create(engine, {
    mouse: canvasMouse,
  });
  tractorBeam.collisionFilter.mask = 0b01; // Only colide with 0b01 (normal, draggable elements)

  Events.on(tractorBeam, "startdrag", function(e) {
    draggedBodyMask =  e.body.collisionFilter.mask;
    tractorBeam.constraint.stiffness = 0; //Dont move anything (untill far enought away)
    e.body.collisionFilter.mask = 0; // Do not interact
  });

  Events.on(tractorBeam, "mousemove", function(e) {
    if (tractorBeam.body) {
      let bodyPos = tractorBeam.body.position;
      let mousePos = canvasMouse.position;
  
      let dist = Vector.magnitude(Vector.sub(bodyPos, mousePos));
  
      if (dist > unit) {
        tractorBeam.constraint.stiffness = 0.5; //Dont move anything (untill far enought away)
      }
    }
  });

  Events.on(tractorBeam, "enddrag", function(e) {
    e.body.collisionFilter.mask = draggedBodyMask || -1;// Reset or set to default if not properly stored
  });

  World.add(world, tractorBeam);
  
  testComponent = new Component(100, 100);
  testComponent2 = new Component(50, 50);

  player = new CockpitComponent(0, 0);
  player.shipName = "Jegonaught"
}

function draw() {
  Mouse.setOffset(canvasMouse, {x: round(player.pos.x - width/2 * 1/zoom), y: round(player.pos.y - height/2 * 1/zoom)}); // Adjust the canvas coords to the world coords for physics engine
  Engine.update(engine);

  background(0);
  rectMode(CENTER);

  push();
  translate(width/2, height/2);
  scale(zoom);
  // grid
  for (i=round(-width/sector/2 * 1/zoom) ; i<round(width/sector/2 * 1/zoom)+1; i++) {
    stroke(0, 255, 0, 100);
    line(i * sector - player.pos.x % sector , -height/2 * 1/zoom, i * sector - player.pos.x % sector, height/2 * 1/zoom);
  }

  for (i=round(-height/sector/2 * 1/zoom); i<round(height/sector/2 * 1/zoom)+1; i++) {
    stroke(0, 255, 0, 100);
    line(-width/2 * 1/zoom, i * sector - player.pos.y % sector , width/2 * 1/zoom, i * sector - player.pos.y % sector);
  }

  translate(-player.pos.x, -player.pos.y);

  //render physics objects
  player.doInput();  
  player.show();

  testComponent.show();
  testComponent2.show();

  //Tractor beam

  if (tractorBeam.constraint.bodyB) {
    noFill()
    stroke(0, 100, 255);
    strokeWeight(2)

    let bodyPos = tractorBeam.constraint.bodyB.position;
    let tractorVect = Vector.sub(bodyPos, player.pos);
    let tractorDist = Vector.magnitude(tractorVect);
    
    beginShape();
    vertex(player.pos.x, player.pos.y);
    for (i=1; i<10; i++) {
      let pos = Vector.add(player.pos,
        Vector.mult(tractorVect, i/10)
      );
      let velCoef = 5 * sin(0.1 * PI * i) * tractorDist/100 // Makes the beam drag along behind the ship
      vertex(pos.x + random(-tractorDist/20, tractorDist/20) - velCoef * player.body.velocity.x, pos.y + random(-tractorDist/20, tractorDist/20) - velCoef * player.body.velocity.y);
    }
    vertex(bodyPos.x, bodyPos.y);
    endShape();
  }



  pop();

  //telemetry data
  //y axis is inverted to look like more standard coords
  let telemetry = 
  `x : ${player.pos.x.toFixed(2).toMinLength(9)}  dx: ${player.body.velocity.x.toFixed(2).toMinLength(9)}
y : ${(-player.pos.y).toFixed(2).toMinLength(9)}  dy: ${(-player.body.velocity.y).toFixed(2).toMinLength(9)}
a : ${degrees(player.body.angle).mod(360).toFixed(1).toMinLength(8)}   da: ${(player.body.angularVelocity * 100).toFixed(1).toMinLength(8)}
SECTOR:  p5:${floor(player.pos.x / sector)}:${floor(-player.pos.y / sector)}
ZOOM: ${zoom}`
  
  fill(255)
  noStroke()
  textFont("monospace");
  rectMode(CORNER);

  text(telemetry, 20, 40, width-20, height);
}

//Check for zoom change
function keyPressed() {
  if (keyCode == 82) {// r
    zoom *= 2;
    canvasMouse.pixelRatio *= 2;// Adjust mouse positioning
  } else if (keyCode == 70){ // f
    zoom /= 2;
    canvasMouse.pixelRatio /= 2;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//Length formatting for telemetry
String.prototype.toMinLength = function(targetLength) {
  currentLength = this.length;
  if (currentLength < targetLength) {
    let diff = targetLength - currentLength;
    return " ".repeat(diff) + this;
  } else {
    return this;
  }
}
//implement modulo
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};