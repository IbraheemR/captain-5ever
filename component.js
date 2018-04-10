function Component(x, y, mass) {
  this.body = Bodies.rectangle(x, y, unit, unit, {
    frictionAir: speedDecay
  });
  World.add(world, this.body)
  this.pos = this.body.position;

  Body.setMass(this.body, mass || 100);
  // Body.setAngle(this.body, -HALF_PI)

  this.color = color(255);
  this.fColor = color(100);

  this.draggable = true;

  this.parent = null;
  this.parentConstraint = null;
  this.parentConstraintDirection = null;
  this.children = new Array(4);
  this.attachPoints = [
    {x:-unit/2, y:0},
    {x:0, y:unit/2},
    {x:0, y:-unit/2}
  ];

  this.show = function() {
    fill(this.fColor);
    stroke(this.color);
    strokeWeight(1);

    push();

    translate(this.pos.x, this.pos.y)
    rotate(this.body.angle + HALF_PI);
    translate(-unit/2, -unit/2);

    beginShape();
    vertex(0.2 * unit, 0);
    vertex(0.8 * unit, 0);
    vertex(      unit, 0.2 * unit);
    vertex(      unit,       unit);
    vertex(0         ,       unit);
    vertex(0         , 0.2 * unit);
    endShape(CLOSE);

    pop();
  }

  this.setParent = function(parent, direction=0) {
    let parentRoot = parent;
    while (parentRoot) {
      if (parentRoot.parent) {
        parentRoot = parentRoot.parent;
      } else {
        break
      }
    }

    if (parent.children[direction] !== undefined || // component already attached to this side
        parent.attachPoints[direction] === undefined || // side invalid
        this == parent || // trying to attach to self
        parentRoot.shipName !== "Jegonaught" // Ship is not player ship
        ) {
      return false;
    }

    let offset = parent.attachPoints[direction];

    //Move to parent side & rotate to face
    Body.setPosition(this.body, Vector.add(parent.pos, Vector.rotate(offset, parent.body.angle)));
    Body.setAngle(this.body, Vector.angle(this.pos, parent.pos));

    //Clear any other parents, incase somehow still attached or has objects attached
    this.unsetParent(false)

    this.parent = parent;

    //Create constraint
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

    return true;
  }

  this.unsetParent = function(recursive=true) {
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
}

function CockpitComponent(x, y, mass) {
  Component.call(this, x, y, 200);

  this.shipName = "<replace me>"// TODO: ship name generation - issue #6

  this.thrust = 0.2;
  this.rotationOffset = 1.5;

  this.body.collisionFilter.category = 0b10 // 0b10  = Non draggable
  // this.body.collisionFilter.mask = 0 // Dont collide with anything

  this.color = color(255, 0, 0);
  this.fColor = color(100, 0, 0);

  this.children = new Array(4);
  this.attachPoints = [
    {x:0, y:-unit/2},
    {x:unit/2, y:0},
    {x:0, y:unit/2},
    {x:-unit/2, y:0}
  ];

  this.show = function() {
    fill(this.fColor);
    stroke(this.color);
    strokeWeight(1);

    push();

    translate(this.pos.x, this.pos.y)
    rotate(this.body.angle);
    translate(-unit/2, -unit/2);

    beginShape();
    vertex(0.2 * unit, 0);
    vertex(0.8 * unit, 0);
    vertex(      unit, 0.2 * unit);
    vertex(      unit,       unit);
    vertex(0.7 * unit,       unit);
    vertex(0.5 * unit, 0.7 * unit);
    vertex(0.3 * unit,       unit);
    vertex(0         ,       unit);
    vertex(0         , 0.2 * unit);
    endShape(CLOSE);

    pop();
  }

  this.doInput = function() {
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

  delete this.setParent;
  delete this.unsetParent;
}