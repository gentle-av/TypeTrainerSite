import { TrainPage } from "../pages/TrainPage.js";
import { Lessons } from "../pages/Lessons.js";
import { StatsPage } from "../pages/StatsPage.js";

class PageBuilder {
  constructor() {
    this.pages = {
      train: new TrainPage(),
      lessons: new Lessons(),
      stats: new StatsPage(),
    };
  }

  buildMainContent() {
    return `
      <div id="trainPage" class="page active">${this.pages.train.render()}</div>
      <div id="lessonsPage" class="page">${this.pages.lessons.render()}</div>
      <div id="statsPage" class="page">${this.pages.stats.render()}</div>
    `;
  }

  getPageInstance(pageName) {
    return this.pages[pageName];
  }

  getPageElement(pageName) {
    return document.getElementById(`${pageName}Page`);
  }

  showPage(pageName) {
    const pages = ["train", "lessons", "stats"];
    pages.forEach((name) => {
      const element = this.getPageElement(name);
      if (element) {
        element.classList.toggle("active", name === pageName);
      }
    });
  }
}

export { PageBuilder };
