import { headerType } from "../components/header";
import BaseBuilder from "./base-builder";

interface IStatistic {
  word: number;
  image: number;
  audio: number;
  video: number;
  table: number;
  list: number;
  codeBlock: number;
  block: number;
  paragraph: number;
  header: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
}

class StatisticBuilder extends BaseBuilder<any> {
  statistic!: IStatistic;

  init() {
    this.statistic = {
      word: 0,
      image: 0,
      audio: 0,
      video: 0,
      table: 0,
      list: 0,
      codeBlock: 0,
      block: 0,
      paragraph: 0,
      header: {
        h1: 0,
        h2: 0,
        h3: 0,
        h4: 0,
        h5: 0,
        h6: 0,
      },
    };
  }

  buildArticle(id: string, getChildren: () => void): IStatistic {
    this.init();
    getChildren();
    return {
      ...this.statistic,
      header: {
        ...this.statistic.header,
      },
    };
  }

  buildCustomerCollection(id: string, tag: string, getChildren: () => void) {
    getChildren();
  }

  buildTable(id: string, getChildren: () => void) {
    getChildren();
    this.statistic.block += 1;
    this.statistic.table += 1;
  }

  buildTableRow(id: string, getChildren: () => void) {
    getChildren();
  }

  buildTableCell(id: string, cellType: "th" | "td", getChildren: () => void) {
    getChildren();
  }

  buildList(id: string, getChildren: () => void) {
    getChildren();
    this.statistic.block += 1;
    this.statistic.list += 1;
  }

  buildListItem(list: string) {}

  buildParagraph(id: string, getChildren: () => void) {
    getChildren();
    this.statistic.block += 1;
    this.statistic.paragraph += 1;
  }

  buildHeader(id: string, type: headerType, getChildren: () => void) {
    getChildren();
    this.statistic.block += 1;
    this.statistic.header[type] += 1;
  }

  buildCodeBlock(id: string, content: string) {
    this.statistic.block += 1;
    this.statistic.codeBlock += 1;
    this.statistic.word += [...content].length;
  }

  buildeImage(id: string, src: string) {
    this.statistic.block += 1;
    this.statistic.image += 1;
  }

  buildeAudio(id: string, src: string) {
    this.statistic.block += 1;
    this.statistic.audio += 1;
  }

  buildeVideo(id: string, src: string) {
    this.statistic.block += 1;
    this.statistic.video += 1;
  }

  buildCharacterList(id: string, charList: string) {
    this.statistic.word += [...charList].length;
  }

  buildInlineImage(id: string, src: string) {
    this.statistic.image += 1;
  }
}

export default StatisticBuilder;
