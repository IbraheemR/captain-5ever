let Engine = Matter.Engine,
    World = Matter.World,

    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Vector = Matter.Vector;


let engine = Engine.create();
let world = engine.world;
world.gravity.y = 0;

let speedDecay = 0.02;

let unit = 30,
    sector = 200;

let testComponent,
    testComponent2;
let player;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  testComponent = new Component(100, 100);
  testComponent2 = new Component(50, 50);

  player = new CockpitComponent(0, 0);
}

function draw() {
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