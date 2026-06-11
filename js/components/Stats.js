export class Stats {
  constructor() {
    this.elements = {
      cpm: document.getElementById("cpm"),
      wpm: document.getElementById("wpm"),
      accuracy: document.getElementById("accuracy"),
      errors: document.getElementById("errors"),
    };
  }

  update({ cpm, wpm, accuracy, errors }) {
    console.log("Stats.update called:", { cpm, wpm, accuracy, errors });
    if (this.elements.cpm) this.elements.cpm.textContent = Math.round(cpm);
    if (this.elements.wpm) this.elements.wpm.textContent = Math.round(wpm);
    if (this.elements.accuracy)
      this.elements.accuracy.textContent = accuracy.toFixed(1);
    if (this.elements.errors) this.elements.errors.textContent = errors;
  }

  reset() {
    this.update({ cpm: 0, wpm: 0, accuracy: 100, errors: 0 });
  }
}
