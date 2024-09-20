let font;
let textDisplay;
let waves;
let beach;
let sun;
let centerGrad;
let backgroundGrad;

function preload() {
  font = loadFont("assets/AdobeClean-Light.otf");
  // waves = new Waves();
  beach = new Beach();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseSeed(2);
  textFont(font, 50);

  sun = new Sun(width / 2, height * 0.25, 80);
  beach.init();
  colors = [color(88, 91, 255), color(237, 12, 255), color(114, 238, 255)];

  backgroundGrad = new Gradient(colors, 0, 0, -200, width, height, false);

  centerGrad = new Gradient(
    colors,
    width / 2 - 100,
    0,
    0,
    200,
    height,
    true,
    100
  );

  textDisplay = new TextDisplay(width / 2, height / 2, 50);
}

function draw() {
  background(0);

  backgroundGrad.display(this);
  sun.displayRays(0);

  centerGrad.display(this);
  sun.display();
  // waves.display();
  // waves.update(0.5, 0.5, 0.5, 0, 1);
  beach.display();

  textDisplay.display();

  displayFrameRate();
}

function displayFrameRate() {
  fill(255, 0, 0);
  noStroke();
  textFont(font, 14);
  text("FPS: " + round(frameRate()), 20, 20);
}

function mousePressed() {
  // Handle color picking
  let col = colorWheel.pickColor();
  if (col) {
    selectedColor = col; // Store the selected color
    terrain.updateColor(currentIndex, selectedColor);
    console.log(selectedColor);
  }
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    currentIndex++;
  }
  if (keyCode == DOWN_ARROW) {
    currentIndex--;
    // if (currentIndex < 0) {
    //   currentIndex = grad.colors.length - 1;
    // }
  }

  if (key == "p") {
    terrain.printColorHex();
  }
}
