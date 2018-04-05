function Player() {
  this.x = 0;
  this.y = 0;
  this.a = 0;

  this.dx = 0;
  this.dy = 0;
  this.da = 0;

  this.aCoef = 0.4;

  this.baseMass = 400;
  this.mass = 400;

  this.update = function() {
    //Get keyboard input
    if (keyIsPressed === true) {
      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {//a
        this.da -= forceCoef *this.aCoef;
      } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {//d
        this.da += forceCoef *this.aCoef;
      }

      if (keyIsDown(UP_ARROW) || keyIsDown(87)) {//w
        this.dx += forceCoef * cos(this.a);
        this.dy -= forceCoef * sin(this.a);
      } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {//s
        this.dx -= forceCoef * cos(this.a) * 0.3; // 0.3 => slower backwards
        this.dy += forceCoef * sin(this.a) * 0.3;
      }
    }

    // Apply physics
    this.x = constrain(this.x + this.dx, -world/2 - 0.1, world/2 - 0.1);
    this.y = constrain(this.y + this.dy, -world/2 - 0.1, world/2 - 0.1);
    this.a = (this.a + this.da).mod(360)

    this.dx *= dragCoef;
    this.dy *= dragCoef;
    this.da *= dragCoef;

    this.draw();
  }

  this.draw = function() {
    // Draw the player
    stroke(255, 0, 0);
    fill(255, 0, 0, 50);


    push();
    mouseTheta = atan2(mouseY - height / 2, mouseX - width / 2);
    rotate(mouseTheta-45);
    line(0, 0, 0.1 *unit, 0.1 *unit);
    pop();

    rotate(this.a + 90);
    translate(-unit/2, -unit/2)

    // rect(-unit/2, -unit/2, unit, unit);
    beginShape();
    vertex(0,         0.2 *unit);
    vertex(0,         0.8 *unit);
    vertex(0.2 *unit, 1   *unit);
    vertex(1   *unit, 1   *unit);
    vertex(1   *unit, 0.7 *unit);
    vertex(0.7 *unit, 0.5 *unit);
    vertex(1   *unit, 0.3 *unit);
    vertex(1   *unit, 0   *unit);
    vertex(0.2 *unit, 0   *unit);
    endShape(CLOSE);

    strokeWeight(2);
    line(0, 0.5 *unit, -0.2 *unit, 0.5 *unit);


  }
  this.drawHUD = function () {
    stroke(255);
    fill(255);
    strokeWeight(1);
    textFont(("Monospace"))
    text(`[x: ${this.x.toStatic()} y: ${this.y.toStatic()} a: ${this.a.toStatic(6)} dx: ${this.dx.toStatic(5)} dy: ${this.dy.toStatic(5)} SECTOR: ${this.x.toSector()}${this.y.toSector()}]`, 10, 20);
  }
}