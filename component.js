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

  this.parentConstraint = null;

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

  this.setParent = function(parent, direction) {
    let offset;
    switch (direction) {
      case 1://right
        offset = { x: unit, y: 0 };
        break;
      case 2://bottom
        offset = { x: 0, y: unit };
        break;
      case 3://left
        offset = { x: -unit, y: 0 };
        break;
      case 0://top    
      default:
        offset = { x: 0, y: -unit };
        break;
    }

    //Move to parent side & rotate to face
    Body.setPosition(this.body, Vector.add(parent.pos, Vector.rotate(offset, parent.body.angle)));
    Body.setAngle(this.body, Vector.angle(this.pos, parent.pos));

    //Clear any other parents
    this.unsetParent()

    this.parentConstraint = Constraint.create({
      bodyA: this.body,
      bodyB: parent.body,
      pointB: Vector.rotate(offset, parent.body.angle),
      length: 0
    });
    World.add(world, this.parentConstraint)


  }

  this.unsetParent = function() {
    if (this.parentConstraint) {
      World.remove(world, this.parentConstraint)
    }
    this.parentConstraint = null;
  }
}

function CockpitComponent(x, y, mass) {
  Component.call(this, x, y, 200);

  this.thrust = 0.2;
  this.rotationOffset = 1;

  this.color = color(255, 0, 0);
  this.fColor = color(100, 0, 0);

  this.draggable = false;

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
}