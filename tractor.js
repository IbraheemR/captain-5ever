function TractorBeam(mouse) {
  this.draggedBodyMask = null;
  this.nearestComponent = null;
  this.nearestSide = null;

  this.mConst = MouseConstraint.create(engine, {
    mouse: mouse,
  });
  this.mConst.collisionFilter.mask = 0b01; // Only colide with 0b01 (normal, draggable elements)

  this.stiffness = 1;
  this.mConst.constraint.damping = 0;

  let that = this;

  Events.on(this.mConst, "startdrag", function(e) {
    that.draggedBodyMask =  e.body.collisionFilter.mask;
    if (e.body.owner.parent) {
      that.mConst.constraint.stiffness = 0; //Attached, so don't move until far enough for detach to happen
    } else {
      that.mConst.constraint.stiffness = that.stiffness; // Reset stiffness just in case
    }
    e.body.collisionFilter.mask = 0; // Do not interact
  });

  Events.on(this.mConst, "mousemove", function(e) {
    if (that.mConst.body) {
      let body = that.mConst.body;
      let mousePos = canvasMouse.position;
  
      let dist = Vector.magnitude(Vector.sub(body.position, mousePos));
  
      if (body.owner.parent && dist > config.tractor.connectDist) { // If attached & far enuogh away
        that.mConst.constraint.stiffness = that.stiffness; // restore stiffness
        body.owner.unsetParent();// detach
      }

      let nearestDist = Infinity;
      for (let wbody of world.bodies) {
        let component = wbody.owner;

        let dist = Vector.magnitude(Vector.sub(body.position, component.pos));
        if (component !== body.owner && // Not same component
            (component.getParentRoot() || {name:null}).name === config.playerShipName && // Part of player ship
            dist < nearestDist && // The closest element
            dist < config.tractor.connectDist) { // Near enough to join

          nearestDist = dist;
          that.nearestComponent = component;
          that.nearestSide = component.queryAttachPoint(body.position);

        }
      }

      if (nearestDist > config.tractor.connectDist) {
        that.nearestComponent = null;
        that.nearestSide = null;
      }

      if (that.nearestComponent && that.nearestSide) {

        let angleToAttach = 
        Vector.angle(
          {x:0, y:0},
          Vector.sub(
            body.position,            
            Vector.add(
              that.nearestComponent.pos,
              Vector.rotate(            
                that.nearestComponent.attachPoints[that.nearestSide], 
                -that.nearestComponent.body.angle
              )
            )
          )
        );

        Body.setAngle(body, angleToAttach);
      }
    }
  });

  Events.on(this.mConst, "enddrag", function(e) {
    e.body.collisionFilter.mask = that.draggedBodyMask || -1;// Reset or set to default if not properly stored

    if (that.nearestComponent) {
      let attached = e.body.owner.setParent(that.nearestComponent, that.nearestSide)
      print(attached)
    }
    that.nearestComponent = null;
    that.nearestSide = null;
  });

  World.add(world, this.mConst);
}

TractorBeam.prototype.show = function () {
  if (this.mConst.constraint.bodyB) {
    noFill()
    stroke(0, 100, 255);
    strokeWeight(2 / zoom);

    let body = this.mConst.constraint.bodyB;
    let tractorVect = Vector.sub(body.position, player.pos);
    let tractorDist = Vector.magnitude(tractorVect);
    
    beginShape();
    vertex(player.pos.x, player.pos.y);
    for (i=1; i<10; i++) {
      let pos = Vector.add(player.pos,
        Vector.mult(tractorVect, i/10)
      );
      let velCoef = 5 * sin(0.1 * PI * i) * tractorDist/100 // Makes the beam drag along behind the ship
      vertex(pos.x + random(-tractorDist/config.tractor.deviationQuotient, tractorDist/config.tractor.deviationQuotient) - velCoef * player.body.velocity.x, pos.y + random(-tractorDist/config.tractor.deviationQuotient, tractorDist/config.tractor.deviationQuotient) - velCoef * player.body.velocity.y);
    }
    vertex(body.position.x, body.position.y);
    endShape();

    if (this.nearestComponent && this.nearestSide) { // draw weld arcs if near
      let offsetA = Vector.add(
        Vector.rotate( this.nearestComponent.attachPoints[this.nearestSide], this.nearestComponent.body.angle),
        Vector.rotate({x:0, y:random(-config.unit/4, config.unit/4)}, Vector.angle({x:0, y:0}, this.nearestComponent.attachPoints[this.nearestSide]) + this.nearestComponent.body.angle)
      );

      let offsetB = Vector.rotate({x: -config.unit/2, y:random(-config.unit/4, config.unit/4)}, body.angle)

      stroke(body.owner.color);
      // strokeWeight(1 / zoom)
      line(
        this.nearestComponent.body.position.x + offsetA.x, 
        this.nearestComponent.body.position.y + offsetA.y,
        body.position.x + offsetB.x, 
        body.position.y + offsetB.y
      );
    }
  }
}