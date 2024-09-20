class Gradient {
  constructor(colors, x, y, z, w, h, invert = false, alphaVal = 255) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    let segH = floor(h / colors.length);
    this.h = segH * colors.length;
    this.invert = invert;
    // this.maskPg = null;
    // this.bufferPg = null;
    this.alphaVal = alphaVal;
    // if (maskPg) {
    //   this.maskPg = maskPg;
    //   this.bufferPg = createGraphics(w, h);
    // }
    this.colors = colors;
  }

  drawLinearGradient(colors, pg) {
    colorMode(RGB, 255);
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;
    let h = this.h;
    let invert = this.invert;

    let extendedColors = [...colors, colors[0]]; // Create a local extended array
    let segmentHeight = h / (extendedColors.length - 1);
    let offset = (frameCount * 2) % h;

    pg.push();
    pg.translate(x, y); //, z);
    if (invert) {
      pg.scale(1, -1);
      pg.translate(0, -h);
    }

    // Loop through each segment and draw lines to create the gradient
    for (let i = 0; i < extendedColors.length - 1; i++) {
      let c1 = extendedColors[i];
      let c2 = extendedColors[i + 1];
      for (let _y = 0; _y < segmentHeight; _y++) {
        let inter = map(_y, 0, segmentHeight, 0, 1);
        let c = lerpColor(c1, c2, inter);
        let animatedY = _y + i * segmentHeight + offset;
        if (animatedY < 0) animatedY += h;
        animatedY %= h;

        pg.stroke(red(c), green(c), blue(c), this.alphaVal);
        pg.line(0, animatedY, w, animatedY);
      }
    }

    pg.pop();
  }

  display(pg, colors = this.colors) {
    if (this.maskPg) {
      this.drawLinearGradient(colors, pg);
    } else {
      this.drawLinearGradient(colors, pg);
    }
  }

  static lerpColors(colors, t) {
    // Ensure the value of t is between 0 and 1
    t = constrain(t, 0, 1);

    // Calculate the index of the segment
    let segment = t * (colors.length - 1);
    let index = floor(segment); // Get the lower index
    let localT = segment - index; // The fractional part for lerp

    // Get the two colors to interpolate between
    let c1 = colors[index];
    let c2 = colors[index + 1];

    // Return the interpolated color
    return lerpColor(c1, c2, localT);
  }

  static printColorHex(colors) {
    let str = "";
    colorMode(RGB, 255);
    for (let i = 0; i < colors.length; i++) {
      let c = colors[i];
      // Extract RGB components
      let r = red(c);
      let g = green(c);
      let b = blue(c);

      // Convert to hex and format with leading zeros if necessary
      let hexColor =
        "#" +
        nf(r, 2, 0).toString(16).padStart(2, "0") +
        nf(g, 2, 0).toString(16).padStart(2, "0") +
        nf(b, 2, 0).toString(16).padStart(2, "0");

      // Add hex color to the string wrapped in quotes
      str += `"${hexColor}"`;

      // Add a comma separator, but avoid it for the last color
      if (i < colors.length - 1) {
        str += ",";
      }
    }
    console.log(str);
  }
}
