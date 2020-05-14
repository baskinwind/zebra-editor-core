import React, { PureComponent, KeyboardEvent } from "react";
import Article from "./components/article";
import createEnptyArticle from "./util/create-empty-article";
import { getOperator } from "./selection-operator";

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
  }

  proxy = (e: any) => {
    console.log("click");
    let range = sectionOperator.getSelectRange();
    console.log(range);
  };

  keyDown = (e: KeyboardEvent) => {
    console.log("keyDown");
    // e.preventDefault();
    let section = window.getSelection();
    console.log(section);
  };

  render() {
    return (
      <div
        contentEditable
        ref={(el) => (this.root = el)}
        onClick={this.proxy}
        onKeyDown={this.keyDown}
      >
        {/* <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
        </p>
        <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
        </p>
        <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
        </p>
        <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
        </p>
        <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
        </p>
        <p data-type="PARAGRAPH">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>78</span>
          <span>9</span>
        </p> */}
      </div>
    );
  }
}
