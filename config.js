const config = {
  speedDecay: 0.04,

  unit: 30,
  sector: 200,

  playerShipName: "Jegonaught",

  minZoom: 0.125,
  maxZoom: 4,
}

config.tractor = {
  deviationQuotient: 40,
  connectDist: 2 * config.unit,
}


//Length formatting for telemetry
String.prototype.toMinLength = function(targetLength) {
  currentLength = this.length;
  if (currentLength < targetLength) {
    let diff = targetLength - currentLength;
    return " ".repeat(diff) + this;
  } else {
    return this;
  }
}
//implement modulo
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};