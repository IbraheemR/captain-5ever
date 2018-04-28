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

// Other
let components = [];
let player;

let zoom = 1;

function setup() {
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;

  canvas = createCanvas(windowWidth, windowHeight);

  canvasMouse = Mouse.create(canvas.elt);
  canvasMouse.pixelRatio = pixelDensity();

  tractorBeam = new TractorBeam(canvasMouse);
  
  for (i=0; i<20; i++) {
    components.push(
      new Component(random(-200, 200), random(-200, 200))
     );
  }

  player = new CockpitComponent(0, 0);
  player.name = config.playerShipName;
}

function draw() {
  Mouse.setOffset(canvasMouse, {x: round(player.pos.x - width/2 * 1/zoom), y: round(player.pos.y - height/2 * 1/zoom)}); // Adjust the canvas coords to the world coords for physics engine
  Engine.update(engine);

  background(0);
  rectMode(CENTER);
  ellipseMode(CENTER);

  push();
  translate(width/2, height/2);
  scale(zoom);

  // grid
  strokeWeight(1 / zoom);
  stroke(0, 255, 0, 50);
  for (i=round(-width/config.sector/2 * 1/zoom) ; i<round(width/config.sector/2 * 1/zoom)+1; i++) {
    line(i * config.sector - player.pos.x % config.sector , -height/2 * 1/zoom, i * config.sector - player.pos.x % config.sector, height/2 * 1/zoom);
  }

  for (i=round(-height/config.sector/2 * 1/zoom); i<round(height/config.sector/2 * 1/zoom)+1; i++) {
    line(-width/2 * 1/zoom, i * config.sector - player.pos.y % config.sector , width/2 * 1/zoom, i * config.sector - player.pos.y % config.sector);
  }

  translate(-player.pos.x, -player.pos.y);

  //render physics objects
  for (let component of components) {
    component.show()
  }

  player.doInput();
  player.show();

  //Tractor beam
  tractorBeam.show();

  pop();

  //telemetry data
  //y axis is inverted to look like more standard coords
  let telemetry = 
  `x : ${player.pos.x.toFixed(2).toMinLength(9)}  dx: ${player.body.velocity.x.toFixed(2).toMinLength(9)}
y : ${(-player.pos.y).toFixed(2).toMinLength(9)}  dy: ${(-player.body.velocity.y).toFixed(2).toMinLength(9)}
a : ${degrees(player.body.angle).mod(360).toFixed(1).toMinLength(8)}   da: ${(player.body.angularVelocity * 100).toFixed(1).toMinLength(8)}
SECTOR:  p5:${floor(player.pos.x / config.sector)}:${floor(-player.pos.y / config.sector)}
ZOOM: x${zoom}`
  
  fill(255)
  noStroke()
  textFont("monospace");
  rectMode(CORNER);

  text(telemetry, 20, 40, width-20, height);
}

//Check for zoom change
function keyPressed() {
  if (keyCode == 82 /*r*/ && zoom < config.maxZoom) {
    zoom *= 2;
    canvasMouse.pixelRatio *= 2;// Adjust mouse positioning
  } else if (keyCode == 70 /*f*/ && zoom > config.minZoom){
    zoom /= 2;
    canvasMouse.pixelRatio /= 2;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}