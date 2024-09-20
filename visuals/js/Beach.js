class Beach {
  constructor() {
    this.waves = [];
    this.started = false;
    this.bg = 255;
    this.osc;
  }
  
  init() {
    this.sand = createGraphics(width, height);
    //   this.makeSand();
    this.makeWaves();
    this.sand.filter(BLUR, 1);
    this.osc = new p5.Noise("brown");
    this.osc.start();
    this.osc.amp(0);
  }

  display() {
    this.bg = lerp(this.bg, 0, 0.005);
    this.osc.amp(0.2 - cos(frameCount / 100) / 15);
    //   image(this.sand, 0, 0);
    for (let w of this.waves) {
      w.show();
      w.move();
    }
    //   background(0, this.bg);
  }

  makeSand() {
    let start = color("rgb(232,232,186)");
    let end = color("rgb(38,28,15)");
    for (let y = 0; y < sand.height; y++) {
      let col = lerpColor(start, end, map(y, 0, (2 * height) / 3, 0, 1));
      this.sand.strokeWeight(2);
      this.sand.stroke(col);
      this.sand.line(0, y, width, y);
    }
  }

  polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    this.sand.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius;
      let sy = y + sin(a) * radius * 0.95;
      this.sand.vertex(sx, sy);
    }
    this.sand.endShape(CLOSE);
  }

  makeWaves() {
    for (let i = 0; i < 7; i++) {
      let ypos = height / 2;
      let seed = (i * TAU) / 7;
      this.waves.push(new Wave(ypos, seed));
    }
  }
}
