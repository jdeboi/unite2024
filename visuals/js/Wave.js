let waveId = 0;

class Wave {
  constructor(ypos, seed) {
    this.ypos = ypos;
    this.seed = seed;
    this.col = color("rgba(2,45,39,0.35)");
    this.id = waveId++;
    this.word = new WordWave(
      phrases[this.id % phrases.length],
      ypos,
      seed,
      this.id
    );
    //	this.col = color(255,50)
  }

  show() {
    push();
    blendMode(ADD);
    fill(this.col);
    let foam = map(this.ypos, 0, height, 30, 0);
    // stroke(255, 255, 255, 2 * foam);
    strokeWeight(foam / 5);
    beginShape();
    curveVertex(-0.25 * width, 1.2 * height);
    curveVertex(-0.25 * width, 1.2 * height);
    curveVertex(-0.25 * width, this.ypos);
    for (let x = -0.25 * width; x < 1.25 * width; x += width / 10) {
      const y =
        this.ypos +
        (height / 7) *
          sin(
            -frameCount / 300 +
              this.seed +
              (3 * this.ypos + x / (7 + 3 * sin(frameCount / 300))) / 150
          ) +
        (height / 8) *
          noise(
            this.ypos / (height / 2),
            this.seed / 20 - frameCount / 300 + x / (height / 1.5)
          );
      curveVertex(x, y);
    }
    curveVertex(1.25 * width, 1.2 * height);
    curveVertex(1.25 * width, 1.2 * height);
    endShape();
    fill(255);

    this.word.display();
    pop();
  }

  move() {
    this.ypos =
      1.4 * height -
      abs(sin(this.seed + frameCount / 1200) * ((7 * height) / 8));
    this.word.ypos = this.ypos;
  }
}
