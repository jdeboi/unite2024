const fadeT = 5000;

class WordWave {
  constructor(txt, ypos, seed, id) {
    this.ypos = ypos;
    this.seed = seed;
    this.txt = txt;
    this.id = id;
    this.hasStarted = false;
    this.prevYpos = 0;
    this.endTime = 0;
    this.stopped = false;

    textSize(12);
    let txtW = textWidth(this.txt);
    this.startX = random(0, constrain(width - txtW, 0, width));
    //	this.col = color(255,50)
    this.txtHeights = [];
    for (let i = 0; i < txt.length; i++) {
      this.txtHeights.push({
        y: 100000,
        isGone: false,
        fadeStart: 0,
        isFading: false,
      });
    }
  }

  reset() {
    this.hasStarted = true;
    this.stopped = false;
    textSize(12);
    let txtW = textWidth(this.txt);
    this.startX = random(0, constrain(width - txtW, 0, width));

    for (let i = 0; i < this.txt.length; i++) {
      this.txtHeights[i].y = 100000;
      this.txtHeights[i].isGone = false;
      this.txtHeights[i].fadeStart = 0;
      this.txtHeights[i].isFading = false;
    }
  }

  allGone() {
    if (this.stopped) {
      return true;
    }
    for (let i = 0; i < this.txt.length; i++) {
      if (!this.txtHeights[i].isGone) return false;
    }
    this.stopped = true;
    this.endTime = millis();
    return true;
  }

  display(letterSpacing = 12) {
    // if (!this.hasStarted) return;
    randomSeed(this.txt.length);

    for (let i = 0; i < this.txt.length; i++) {
      this.updateWaveLetter(i, letterSpacing);

      this.displayWaveLetter(i, letterSpacing);
    }
  }

  getXPos(i, letterSpacing) {
    return this.startX + i * letterSpacing;
  }

  updateWaveLetter(i, letterSpacing) {
    if (this.allGone()) {
      if (millis() - this.endTime > 4000) {
        this.reset();
      }
      return;
    }
    if (this.txtHeights[i].isGone) return;
    let x = this.getXPos(i, letterSpacing);
    let y =
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

    // if (this.txtHeights[i].y > y) {
    //   this.txtHeights[i].y = y;
    // } else if (y > this.txtHeights[i].y && !this.txtHeights[i].isFading) {
    //   this.txtHeights[i].isFading = true;
    //   this.txtHeights[i].fadeStart = millis();
    // } else if (
    //   this.txtHeights[i].isFading &&
    //   millis() - this.txtHeights[i].fadeStart > 1000
    // ) {
    //   //   this.txtHeights[i].isGone = true;
    // }

    this.txtHeights[i].y = y + 10;
    const maxH = height * 0.6;
    if (this.txtHeights[i].y < maxH) {
      this.txtHeights[i].y = maxH;
      if (!this.txtHeights[i].isFading) {
        this.txtHeights[i].isFading = true;
        this.txtHeights[i].fadeStart = millis();
      }
    } else if (
      this.txtHeights[i].isFading &&
      millis() - this.txtHeights[i].fadeStart > fadeT
    ) {
      this.txtHeights[i].isGone = true;
    }
  }

  displayWaveLetter(i, letterSpacing) {
    // if (!this.hasStarted) {
    //   return;
    // }
    if (this.txtHeights[i].isGone) {
      return;
    }

    if (this.txtHeights[i].isFading) {
      const col = map(
        millis() - this.txtHeights[i].fadeStart,
        0,
        fadeT,
        255,
        0,
        true
      );

      fill(col);
    } else {
      fill(255);
    }

    let x = this.getXPos(i, letterSpacing);
    text(this.txt[i], x, this.txtHeights[i].y);
  }
}
