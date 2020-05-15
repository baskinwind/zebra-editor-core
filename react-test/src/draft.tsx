import ComponentType from "./const/component-type";

import React, { PureComponent } from "react";
import Article from "./components/article";
import createEmptyArticle from "./util/create-empty-article";
import { getComponentById } from "./components/util";
import { fixImageClick, getSelection } from "./selection-operator";
import { inParagraph, inImage } from "./event/keydown";
import Paragraph from "./components/paragraph";

export default class Draft extends PureComponent {
  article: Article;
  root: HTMLElement | null = null;
  contentDom: HTMLElement;

  constructor(props: any) {
    super(props);
    this.article = createEmptyArticle();
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
    let selection = getSelection();
    let component = getComponentById(selection.range[0].componentId);
    let start = selection.range[0].offset;
    let end = selection.range[1].offset;
    if (start > end) {
      [start, end] = [end, start];
    }
    if (component.type === ComponentType.paragraph) {
      inParagraph(event, component as Paragraph, start, end);
    }
    if (component.type === ComponentType.image) {
      inImage(event, component);
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
