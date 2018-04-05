function Component() {
  this.parent = null;

  this.properties = {};

  this.update = function() {
    push()
    if (this.parent) {
      rotate(this.parent.a)
    } else {
      // translate away from player
      translate(player.y - unit/2, player.x - unit/2)
    }
    fill(this.properties.fill);
    stroke(this.properties.stroke);
    
    this.draw(this);
    pop()
  }
}



function TestGirderComponent(properties, parent) {
  this.parent = parent;
  this.properties = Object.assign(properties || {}, {
    mass: 300,
    fill: color(255, 128, 0, 100),
    stroke: color(255, 128, 0),

  });
  this.draw = function(that) {

    rect(that.x, that.y, unit, unit);
  }
}
TestGirderComponent.prototype = new Component();
