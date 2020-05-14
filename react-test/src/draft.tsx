import React, { PureComponent } from "react";
import Article from "./components/article";
import createEnptyArticle from "./util/create-empty-article";
import { getComponentById } from "./components/util";
import Character from "./components/character";
import { fixImageClick, getSelection } from "./selection-operator";
import { inParagraph, inImage } from "./event/keydown";
import ComponentType from "./const/component-type";

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
    this.root?.addEventListener("keydown", this.proxyKeyDown);
  }

  proxyClick(event: MouseEvent) {
    console.log("click");
    fixImageClick(event);
  }

  proxyKeyDown = (event: KeyboardEvent) => {
    let key = event.key;
    console.log(key);
    let range = getSelection();
    let component = getComponentById(range.range[0].componentId);
    if (component.type === ComponentType.paragraph) {
      let start = range.range[0].offset;
      let end = range.range[1].offset;
      if (start > end) {
        [start, end] = [end, start];
      }
      inParagraph(key, component, start, end);
    }
    if (component.type === ComponentType.image) {
      inImage(key, component);
    }
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
