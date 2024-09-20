class TextDisplay {
  constructor(x, y, sz = 20) {
    this.txt = phrases[0];
    this.startTime = millis();
    this.isFinished = false;
    this.phraseIndex = 0;
    this.x = x;
    this.y = y;
    this.sz = sz;
  }

  display() {
    push();
    translate(this.x, this.y);
    textSize(this.sz);
    fill(255);
    textAlign(CENTER, CENTER);
    let words = textDisplay.getWords();
    if (words) {
      text(words, 0, 0);
    }
    pop();
  }

  getWords() {
    const maxWidth = 600;
    const batchTime = 2000; // 4 seconds
    const currentTime = millis() - this.startTime;

    // Calculate how many batches of words should be displayed so far
    const batchNumber = floor(currentTime / batchTime);

    // Get all words as an array
    const words = this.txt.split(" ");
    let displayedWords = [];
    let currentWidth = 0;

    // Calculate which batch of words to display
    for (let i = 0; i < words.length; i++) {
      let wordWidth = textWidth(words[i] + " "); // Measure the width of the word plus a space
      if (currentWidth + wordWidth <= maxWidth) {
        displayedWords.push(words[i]);
        currentWidth += wordWidth;
      } else {
        break; // Stop if the current line exceeds the max width
      }
    }

    // Every 4 seconds, display the next batch of words
    const numWordsInBatch = displayedWords.length;
    const wordsToShow = words.slice(
      batchNumber * numWordsInBatch,
      (batchNumber + 1) * numWordsInBatch
    );

    if (wordsToShow.length == 0) {
      this.isFinished = true;
      this.nextWord();
      return "";
    }

    return wordsToShow.join(" ");
  }

  nextWord() {
    this.txt = phrases[this.phraseIndex++];
    this.startTime = millis();
  }

  getLetters() {
    const msPerLetter = 100;
    const msPerStr = msPerLetter * this.txt.length;
    const dt = this.startTime + msPerStr;

    if (dt < this.startTime) {
      return "";
    }

    let numLetters = floor(
      map(millis(), this.startTime, dt, 0, this.txt.length, true)
    );
    return this.txt.substring(0, numLetters);
  }
}
