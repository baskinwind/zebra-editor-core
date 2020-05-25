import React, { PureComponent } from "react";
import Article from "./components/article";
import createEmptyArticle from "./util/create-empty-article";
import onkeyDown from "./selection-operator/on-keydown";
import onClick from "./selection-operator/on-click";
import modifyDecorate from "./selection-operator/modify-decorate";
import Paragraph from "./components/paragraph";
import Media from "./components/media";
import ComponentType from "./const/component-type";
import InlineImage from "./components/inline-image";
import input from "./selection-operator/input";

import "./index.scss";

export default class Draft extends PureComponent {
  article: Article;
  root: HTMLElement | null = null;

  constructor(props: any) {
    super(props);
    this.article = createEmptyArticle();
    this.article.removeChildren(0);
    this.article.addChildren(
      new Media(
        ComponentType.image,
        "https://w.wallhaven.cc/full/0p/wallhaven-0p2jwj.jpg"
      )
    );
    this.article.addChildren(
      new Paragraph(
        "Ser Waymar Royce was the youngest son of an ancient house with too many heirs. He was ahandsome youth of eighteen, grey-eyed and graceful and slender as a knife. Mounted on his hugeblack destrier, the knight towered above Will and Gared on their smaller garrons. He wore blackleather boots, black woolen pants, black moleskin gloves, and a fine supple coat of gleaming blackringmail over layers of black wool and boiled leather. Ser Waymar had been a Sworn Brother of theNight’s Watch for less than half a year, but no one could say he had not prepared for his vocation. Atleast insofar as his wardrobe was concerned."
      )
    );
    this.article.addChildren(
      new Paragraph(
        "His cloak was his crowning glory; sable, thick and black and soft as sin. “Bet he killed them allhimself, he did,” Gared told the barracks over wine, “twisted their little heads off, our mightywarrior.” They had all shared the laugh."
      )
    );
    this.article.addChildren(
      new Paragraph(
        "It is hard to take orders from a man you laughed at in your cups, Will reflected as he sat shiveringatop his garron. Gared must have felt the same."
      )
    );
    let paragraph = new Paragraph("happy!!! ");
    paragraph.addChildren(
      new InlineImage(
        "http://cdn.acohome.cn/1.png?imageMogr2/auto-orient/thumbnail/x20"
      )
    );
    paragraph.addText(" happy!!!");
    paragraph.addIntoParent(this.article);
  }

  componentDidMount() {
    this.root?.appendChild(this.article.render());
    this.root?.addEventListener("click", this.proxyClick);
    this.root?.addEventListener("keydown", this.proxyKeyDown);
  }

  proxyClick(event: MouseEvent) {
    console.log("click");
    onClick(event);
  }

  proxyKeyDown = (event: KeyboardEvent) => {
    onkeyDown(event);
  };

  showArticle = () => {
    console.log(this.article);
    this.root?.replaceChild(
      this.article.render(),
      document.getElementById(this.article.id) as HTMLElement
    );
  };

  bold = () => {
    modifyDecorate("fontWeight", "bold");
  };
  delete = () => {
    modifyDecorate("textDecoration", "line-through");
  };
  underline = () => {
    modifyDecorate("textDecoration", "underline");
  };
  itailc = () => {
    modifyDecorate("fontStyle", "italic");
  };
  red = () => {
    modifyDecorate("color", "red");
  };
  addCake = () => {
    let index = Math.floor(Math.random() * 56 + 1);
    input(
      new InlineImage(
        `http://cdn.acohome.cn/${index}.png?imageMogr2/auto-orient/thumbnail/x20`
      )
    );
  };

  render() {
    return (
      <div>
        <button onClick={this.showArticle}>show article</button>
        <div>
          <span>控制字符：</span>
          <button onClick={this.bold}>bold</button>
          <button onClick={this.delete}>delete</button>
          <button onClick={this.underline}>underline</button>
          <button onClick={this.itailc}>itailc</button>
          <button onClick={this.red}>red</button>
          <button onClick={this.addCake}>addCake</button>
        </div>
        <div
          className="zebra-draft-root"
          contentEditable
          ref={(el) => (this.root = el)}
        ></div>
      </div>
    );
  }
}
