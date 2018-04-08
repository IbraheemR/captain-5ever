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
let canvasMouse, mConstraint;

let speedDecay = 0.04;

let unit = 30,
    sector = 200;


// Other
let testComponent,
    testComponent2;
let player;

let draggedBodyMask;

function setup() {
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;

  canvas = createCanvas(windowWidth, windowHeight);

  canvasMouse = Mouse.create(canvas.elt);
  canvasMouse.pixelRatin = pixelDensity();
  mConstraint = MouseConstraint.create(engine, {
    mouse: canvasMouse,
  });
  mConstraint.collisionFilter.mask = 0b01; // Only colide with 0b01 (normal, draggable elements)

  Events.on(mConstraint, "startdrag", function(e) {
    draggedBodyMask =  e.body.collisionFilter.mask;
    e.body.collisionFilter.mask = 0; // Do not interact

    console.log(draggedBodyMask, e.body.collisionFilter.mask)
  });

  Events.on(mConstraint, "enddrag", function(e) {
    e.body.collisionFilter.mask = draggedBodyMask || -1;// Reset or set to default if not properly stored
  });

  World.add(world, mConstraint);
  
  testComponent = new Component(100, 100);
  testComponent2 = new Component(50, 50);

  player = new CockpitComponent(0, 0);
}

function draw() {
  Mouse.setOffset(canvasMouse, {x: round(player.pos.x - width/2), y: round(player.pos.y - height/2)}); // Adjust the canvas coords to the world coords for physics engine
  Engine.update(engine);

  background(0);
  rectMode(CENTER);

  translate(width/2, height/2);
  // grid
  for (i=round(-width/sector/2); i<round(width/sector/2)+1; i++) {
    stroke(0, 255, 0, 100);
    line(i * sector - player.pos.x % sector , -height/2, i * sector - player.pos.x % sector, height/2);
  }

  for (i=round(-height/sector/2); i<round(height/sector/2)+1; i++) {
    stroke(0, 255, 0, 100);
    line(-width/2, i * sector - player.pos.y % sector , width/2, i * sector - player.pos.y % sector);
  }


  translate(-player.pos.x, -player.pos.y);

  testComponent.show();
  testComponent2.show();
  player.doInput();  
  player.show();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}