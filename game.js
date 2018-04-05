const
    world = 2000000;
    dimension = 600;
    sector = 200,
    unit = 20;
const forceCoef = 0.5,
      dragCoef = 0.95;

var player;
var testComponent;


function setup() {
  createCanvas(dimension, dimension);
  angleMode(DEGREES);


  player = new Player();
  testComponent = new TestGirderComponent({x: 100, y: 200}, player);
  testComponent2 = new TestGirderComponent({x: 100, y: 200});
}

function draw() {
  background(0);

  // Draw the grid around the player
  stroke(0, 255, 0, 50);
  for (i=0; i<dimension/sector + 1; i++) {
    line(0, (i * sector) + (player.x % sector), dimension, (i * sector) + (player.x % sector));
    line((i * sector) + (player.y % sector), 0, (i * sector) + (player.y % sector), dimension);
  }
  push();
  translate(dimension/2, dimension/2);

  testComponent.update();
  testComponent2.update();


  player.update();
  pop();
  player.drawHUD();
}


Number.prototype.toStatic = function(places=8) {
  let sign = this >= 0 ? "+" : "";
  let out = sign + this.toFixed(1);
  let l = places - out.length;
  out = " ".repeat( l > 0 ? l : 0) + out;
  return out;
}

Number.prototype.toSector = function() {
  let s = Math.round(this/sector);
  let sign = s >= 0;

  return (sign ? "$" : "~") + String(abs(s));
}

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};