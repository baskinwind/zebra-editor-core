import React, { PureComponent } from "react";
import Article from "./components/article";
import createEmptyArticle from "./util/create-empty-article";
import onkeyDown from "./selection-operator/on-keydown";
import onClick from "./selection-operator/on-click";
import modifyDecorate from "./selection-operator/modify-decorate";
import registerEvent from "./event-handle";
import defaultHandle from "./event-handle/default";

export default class Draft extends PureComponent {
  article: Article;
  root: HTMLElement | null = null;
  contentDom: HTMLElement;

  constructor(props: any) {
    super(props);
    this.article = createEmptyArticle();
    this.contentDom = this.article.render();
  }

  componentDidMount() {
    registerEvent(defaultHandle);
    this.root?.appendChild(this.contentDom);
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

  render() {
    return (
      <div>
        <div
          id="zebra-draft-root"
          contentEditable
          ref={(el) => (this.root = el)}
          style={{ whiteSpace: "pre" }}
        ></div>
        <button onClick={this.showArticle}>show article</button>
        <button onClick={this.bold}>bold</button>
        <button onClick={this.delete}>delete</button>
        <button onClick={this.underline}>underline</button>
        <button onClick={this.itailc}>itailc</button>
      </div>
    );
  }
}
