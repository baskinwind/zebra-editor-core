import React, { PureComponent } from "react";
import Article from "./components/article";
import createEnptyArticle from "./util/create-empty-article";
import { getOperator } from "./selection-operator";
import { getComponentById } from "./components/util";
import Character from "./components/character";

const sectionOperator = getOperator();

export default class Draft extends PureComponent {
  article: Article;
  root: HTMLElement | null = null;
  contentDom: HTMLElement;

  constructor(props: any) {
    super(props);
    this.article = createEnptyArticle();
    this.contentDom = this.article.getContent();
  }

  componentDidMount() {
    this.root?.appendChild(this.contentDom);
    this.root?.addEventListener("click", this.proxyClick);
    this.root?.addEventListener("keydown", this.proxyKeyPress);
  }

  proxyClick(event: MouseEvent) {
    console.log("click");
    console.log(event);
    sectionOperator.flushRangeByClick(event);
  }

  proxyKeyPress = (event: any) => {
    // console.log(event);
  };

  showArticle = () => {
    this.root?.replaceChild(
      this.article.getContent(),
      document.getElementById(this.article.id) as HTMLElement
    );
  };

  render() {
    return (
      <div>
        <div contentEditable ref={(el) => (this.root = el)}></div>
        <button onClick={this.showArticle}>show article</button>
      </div>
    );
  }
}
