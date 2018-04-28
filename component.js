function Component(x, y) {
  this.body = Bodies.rectangle(x, y, config.unit, config.unit, {
    frictionAir: config.speedDecay
  });
  this.body.owner = this; // Add a refernce to this
  World.add(world, this.body)
  this.pos = this.body.position;

  Body.setMass(this.body, 100);

  this.name = "component"

  this.color = color(255);
  this.fColor = color(100);
  this.glowColor = color(255, 5);

  this.parent = null;
  this.parentConstraint = null;
  this.parentConstraintDirection = null;
  this.children = new Array(4);
  this.attachPoints = [
    {x:config.unit/2, y:0},
    {x:0, y:config.unit/2},
    {x:0, y:-config.unit/2}
  ];
}

Component.prototype.show = function() {
  push();

  translate(this.pos.x, this.pos.y)
  rotate(this.body.angle - HALF_PI);
  translate(-config.unit/2, -config.unit/2);

  this.drawGlow();

    fill(this.fColor);
  stroke(this.color);
  strokeWeight(1);

  beginShape();
  vertex(0.2 * config.unit, 0);
  vertex(0.8 * config.unit, 0);
  vertex(      config.unit, 0.2 * config.unit);
  vertex(      config.unit,       config.unit);
  vertex(0         ,       config.unit);
  vertex(0         , 0.2 * config.unit);
  endShape(CLOSE);

  pop();
}

Component.prototype.drawGlow = function() {
  fill(this.glowColor);
  noStroke();
  for (i=1; i<10; i++) {
    let d = 1 + (i/10);
    ellipse(config.unit/2, config.unit/2, d * config.unit, d * config.unit);
  }
}

Component.prototype.getParentRoot = function() {
  let parentRoot = this.parent || this;

  while (parentRoot) {
    if (parentRoot.parent) {
      parentRoot = parentRoot.parent;
    } else {
      break
    }
  }

  return parentRoot;
}

Component.prototype.setParent = function(parent, direction=0) {

  if (parent.children[direction] !== undefined || // component already attached to this side
      parent.attachPoints[direction] === undefined || // side invalid
      this == parent //|| // trying to attach to self
      // parent.getParentRoot().name !== config.playerShipName // Ship is not player ship
      ) {
    return false;
  }

  let offset = parent.attachPoints[direction];

  //Move to parent side & rotate to face
  Body.setPosition(this.body, Vector.add(parent.pos, Vector.rotate(offset, parent.body.angle)));
  Body.setAngle(this.body, Vector.angle(parent.pos, this.pos));

  //Clear any other parents, incase somehow still attached or has objects attached
  this.unsetParent()

  this.parent = parent;

  // Create constraint
  this.parentConstraint = Constraint.create({
    bodyA: this.body,
    bodyB: parent.body,
    pointA: Vector.mult(Vector.rotate(offset, parent.body.angle), -1),
    pointB: Vector.rotate(offset, parent.body.angle),
    length: 0
  });

  // Add reference to parent
  parent.children[direction] = this;
  this.parentConstraintDirection = direction;

  World.add(world, this.parentConstraint);

  // noLoop();
  return true;
}

Component.prototype.unsetParent = function(recursive=true) {
  if (this.parentConstraint) {
    World.remove(world, this.parentConstraint);// remove constraint from world

    if (recursive) {
      for (child of this.children) { // recursively call on children
        if (child) {
          child.unsetParent();
        }
      }
    }

    Body.applyForce(this.body, this.pos, Vector.mult(Vector.normalise(Vector.sub(this.pos, this.parent.pos)), random(1.5)))

    this.parent.children[this.parentConstraintDirection] = undefined;
    this.parentConstraintDirection = null;
    this.parentConstraint = null; 
    this.parent = null;
    return true;
  }
  return false;
}

Component.prototype.queryAttachPoint = function(pos) {

  pos = Vector.sub(pos, this.pos)
  pos = Vector.rotate(pos, -this.body.angle)

  let nearestDist = Infinity;
  let nearestSide;
  for (side in this.attachPoints) {
    let dist = Vector.magnitude(Vector.sub(pos, this.attachPoints[side]))

    if (dist < nearestDist && this.attachPoints[side] !== null) {
      nearestDist = dist;
      nearestSide = side;
    }
  }
  return nearestSide;
}


/*
 *  CockpitComponent 
 */

function CockpitComponent(x, y) {
  Component.call(this, x, y); // Inherit attributes

  this.name = "<replace me>"// TODO: ship name generation - issue #6

  this.mass = 200;

  this.thrust = 0.1;
  this.rotationOffset = 1.5;

  this.body.collisionFilter.category = 0b10 // 0b10  = Non draggable
  // this.body.collisionFilter.mask = 0 // Dont collide with anything

  this.color = color(255, 0, 0);
  this.fColor = color(100, 0, 0);
  this.glowColor = color(255, 0,  0, 10);

  this.children = new Array(4);
  this.attachPoints = [
    {x:0, y:-config.unit/2},
    {x:config.unit/2, y:0},
    {x:0, y:config.unit/2},
    {x:-config.unit/2, y:0}
  ];
}

CockpitComponent.prototype = Object.create(Component.prototype); // Inherit prototype methods

CockpitComponent.prototype.show = function() {
  push();

  translate(this.pos.x, this.pos.y)
  rotate(this.body.angle);
  translate(-config.unit/2, -config.unit/2);

  this.drawGlow();

  fill(this.fColor);
  stroke(this.color);
  strokeWeight(1);

  beginShape();
  vertex(0.2 * config.unit, 0);
  vertex(0.8 * config.unit, 0);
  vertex(      config.unit, 0.2 * config.unit);
  vertex(      config.unit,       config.unit);
  vertex(0.7 * config.unit,       config.unit);
  vertex(0.5 * config.unit, 0.7 * config.unit);
  vertex(0.3 * config.unit,       config.unit);
  vertex(0         ,       config.unit);
  vertex(0         , 0.2 * config.unit);
  endShape(CLOSE);

  pop();
}

CockpitComponent.prototype.doInput = function() {
  let a = this.body.angle;

  // Forward/Backward
  if(keyIsDown(87 /*w*/) || keyIsDown(UP_ARROW)) {
    Body.applyForce(this.body, this.pos, Vector.rotate({x: 0, y: -this.thrust}, this.body.angle))
  } else if (keyIsDown(83 /*s*/) || keyIsDown(DOWN_ARROW)) {
    Body.applyForce(this.body, this.pos, Vector.rotate({x: 0, y: this.thrust}, this.body.angle))
  }

  // Strafe
  if(keyIsDown(81 /*q*/) || keyIsDown(188 /*<*/)) {
    Body.applyForce(this.body, this.pos, Vector.rotate({x: -this.thrust, y: 0}, this.body.angle))
  } else if (keyIsDown(69 /*e*/) || keyIsDown(190 /*>*/)) {
    Body.applyForce(this.body, this.pos, Vector.rotate({x: this.thrust, y: 0}, this.body.angle))
  }

  // Turn
  if(keyIsDown(65 /*a*/) || keyIsDown(LEFT_ARROW)) {
    Body.applyForce(this.body, {x: this.pos.x + this.rotationOffset, y: this.pos.y}, {x: 0, y: -this.thrust})
    Body.applyForce(this.body, {x: this.pos.x - this.rotationOffset, y: this.pos.y}, {x: 0, y: this.thrust})
  } else if (keyIsDown(68 /*d*/) || keyIsDown(RIGHT_ARROW)) {
    Body.applyForce(this.body, {x: this.pos.x + this.rotationOffset, y: this.pos.y}, {x: 0, y: this.thrust})
    Body.applyForce(this.body, {x: this.pos.x - this.rotationOffset, y: this.pos.y}, {x: 0, y: -this.thrust})
  }
}

CockpitComponent.prototype.setParent = function() {return false;}
CockpitComponent.prototype.unsetParent = function() {return false;}