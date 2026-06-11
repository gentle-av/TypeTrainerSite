export class TextDisplay {
  constructor(containerId = "textDisplay") {
    this.container = document.getElementById(containerId);
    this.words = [];
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.userInput = "";
  }

  setText(words) {
    this.words = words || [];
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.userInput = "";
    this.render();
  }

  updateProgress(wordIndex, charIndex, userInput = "") {
    this.currentWordIndex = wordIndex || 0;
    this.currentCharIndex = charIndex || 0;
    if (userInput !== undefined) {
      this.userInput = userInput || "";
    }
    this.render();
    this.scrollToCurrent();
  }

  normalizeChar(char) {
    if (char === "ё") return "е";
    if (char === "Ё") return "Е";
    if (char === "-" || char === "–" || char === "—") return "-";
    return char;
  }

  isCharEqual(char1, char2) {
    return this.normalizeChar(char1) === this.normalizeChar(char2);
  }

  scrollToCurrent() {
    if (!this.container) return;
    const textContainer = document.querySelector(".text-container");
    if (!textContainer) return;
    const currentChar = textContainer.querySelector(".char.current");
    if (currentChar) {
      currentChar.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }

  render() {
    if (!this.container) return;
    if (!this.words || this.words.length === 0) {
      this.container.innerHTML = "<div>Загрузка...</div>";
      return;
    }
    this.container.innerHTML = "";
    let globalCharIndex = 0;
    for (let wordIdx = 0; wordIdx < this.words.length; wordIdx++) {
      const word = this.words[wordIdx];
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      for (let charIdx = 0; charIdx < word.length; charIdx++) {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.textContent = word[charIdx];
        if (wordIdx < this.currentWordIndex) {
          charSpan.classList.add("correct");
        } else if (wordIdx === this.currentWordIndex) {
          if (charIdx < this.currentCharIndex) {
            const userChar = this.userInput[globalCharIndex];
            if (this.isCharEqual(userChar, word[charIdx])) {
              charSpan.classList.add("correct");
            } else {
              charSpan.classList.add("incorrect");
            }
          } else if (charIdx === this.currentCharIndex) {
            charSpan.classList.add("current");
          } else {
            charSpan.classList.add("pending");
          }
        } else {
          charSpan.classList.add("pending");
        }
        wordSpan.appendChild(charSpan);
        globalCharIndex++;
      }
      this.container.appendChild(wordSpan);
      if (wordIdx < this.words.length - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.className = "char";
        spaceSpan.textContent = " ";
        spaceSpan.style.display = "inline-block";
        spaceSpan.style.width = "8px";
        if (globalCharIndex < this.userInput.length) {
          const userSpace = this.userInput[globalCharIndex];
          if (userSpace === " ") {
            spaceSpan.classList.add("correct");
          } else {
            spaceSpan.classList.add("incorrect");
          }
        }
        globalCharIndex++;
        this.container.appendChild(spaceSpan);
      }
    }
  }
}
