import "./default.scss";
import "./index.scss";

import React, { PureComponent } from "react";
import Article from "./components/article";
import modifySelectionDecorate from "./selection-operator/modify-selection-decorate";
import Paragraph from "./components/paragraph";
import Media from "./components/media";
import ComponentType from "./const/component-type";
import InlineImage from "./components/inline-image";
import input from "./selection-operator/input";
import mount from "./util/mount";
import updateComponent from "./selection-operator/update-component";
import insertBlock from "./selection-operator/insert-block";
import Title from "./components/title";
import List, { ListItem } from "./components/list";
import modifyComponentDecorate from "./selection-operator/modify-component-decorate";
import exchangeParagraph from "./selection-operator/exchange-paragraph";

let article = new Article();
article.addChildren(new Title("h3", "A Song of Ice and Fire"));
article.addChildren(
  new Media(ComponentType.image, "https://blogcdn.acohome.cn/demo-draft-1.jpg")
);
article.addChildren(
  new Paragraph(
    "Ser Waymar Royce was the youngest son of an ancient house with too many heirs. He was ahandsome youth of eighteen, grey-eyed and graceful and slender as a knife. Mounted on his hugeblack destrier, the knight towered above Will and Gared on their smaller garrons. He wore blackleather boots, black woolen pants, black moleskin gloves, and a fine supple coat of gleaming blackringmail over layers of black wool and boiled leather. Ser Waymar had been a Sworn Brother of theNight’s Watch for less than half a year, but no one could say he had not prepared for his vocation. Atleast insofar as his wardrobe was concerned."
  )
);
article.addChildren(
  new Paragraph(
    "His cloak was his crowning glory; sable, thick and black and soft as sin. “Bet he killed them allhimself, he did,” Gared told the barracks over wine, “twisted their little heads off, our mightywarrior.” They had all shared the laugh."
  )
);
let paragraph = new Paragraph("InlineImage ");
paragraph.addChildren(
  new InlineImage(
    "http://cdn.acohome.cn/1.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);
paragraph.addText(" InlineImage");
paragraph.addIntoParent(article);

let ul = new List("ul");
ul.addChildren(new ListItem("unorder list part 1"));
ul.addChildren(new ListItem("unorder list part 2"));
ul.addChildren(new ListItem("unorder list part 3"));
ul.addChildren(new ListItem("unorder list part 4"));
ul.addChildren(new ListItem("unorder list part 5"));
ul.addIntoParent(article);

let ol = new List("ol");
ol.addChildren(new ListItem("order list part 1"));
ol.addChildren(new ListItem("order list part 2"));
ol.addChildren(new ListItem("order list part 3"));
ol.addChildren(new ListItem("order list part 4"));
ol.addChildren(new ListItem("order list part 5"));
ol.addIntoParent(article);

export default class Draft extends PureComponent {
  root: HTMLElement | null = null;

  componentDidMount() {
    if (this.root) {
      mount(this.root, article);
    }
  }

  showArticle = () => {
    updateComponent(article);
  };

  bold = () => {
    modifySelectionDecorate({ fontWeight: "bold" });
  };
  delete = () => {
    modifySelectionDecorate({ textDecoration: "line-through" });
  };
  underline = () => {
    modifySelectionDecorate({ textDecoration: "underline" });
  };
  itailc = () => {
    modifySelectionDecorate({ fontStyle: "italic" });
  };
  red = () => {
    modifySelectionDecorate({ color: "red" });
  };
  clearStyle = () => {
    modifySelectionDecorate({ clear: "style" });
  };

  insertInlineImage = () => {
    let index = Math.floor(Math.random() * 56 + 1);
    input(
      new InlineImage(
        `http://cdn.acohome.cn/${index}.png?imageMogr2/auto-orient/thumbnail/x20`
      )
    );
  };
  insertImage = () => {
    let index = Math.random() > 0.5 ? 1 : 3;
    insertBlock(
      new Media(
        ComponentType.image,
        `https://blogcdn.acohome.cn/demo-draft-${index}.jpg`
      )
    );
  };

  modifyType = (tag: string) => {
    if (tag === "normal") {
      exchangeParagraph(Paragraph, tag);
    } else if (tag === "li") {
      exchangeParagraph(ListItem, "ul");
    } else {
      exchangeParagraph(Title, tag);
    }
  };
  modifyStyle = (name: string, value: string) => {
    modifyComponentDecorate({ [name]: value });
  };

  render() {
    return (
      <div>
        <div className="stick">
          <button onClick={this.showArticle}>show article</button>
          <div>
            <span>控制段落内容样式：</span>
            <button onClick={this.bold}>bold</button>
            <button onClick={this.delete}>delete</button>
            <button onClick={this.underline}>underline</button>
            <button onClick={this.itailc}>itailc</button>
            <button onClick={this.red}>red</button>
            <button onClick={this.clearStyle}>clearStyle</button>
          </div>
          <div>
            <span>添加内联的块：</span>
            <button onClick={this.insertInlineImage}>insertInlineImage</button>
          </div>
          <div>
            <span>添加块级元素：</span>
            <button onClick={this.insertImage}>insertImage</button>
          </div>
          <div>
            <span>切换块级类型：</span>
            <button onClick={() => this.modifyType("h1")}>h1</button>
            <button onClick={() => this.modifyType("h2")}>h2</button>
            <button onClick={() => this.modifyType("h3")}>h3</button>
            <button onClick={() => this.modifyType("h4")}>h4</button>
            <button onClick={() => this.modifyType("h5")}>h5</button>
            <button onClick={() => this.modifyType("h6")}>h6</button>
            <button onClick={() => this.modifyType("normal")}>normal</button>
            <button onClick={() => this.modifyType("li")}>li</button>
          </div>
          <div>
            <span>修改块级样式：</span>
            <button onClick={() => this.modifyStyle("padding", "10px")}>
              padding10
            </button>
            <button onClick={() => this.modifyStyle("margin", "10px")}>
              margin10
            </button>
            <button onClick={() => this.modifyStyle("border", "1px solid")}>
              border
            </button>
            <button onClick={() => this.modifyStyle("backgroundColor", "grey")}>
              backgroundGrey
            </button>
            <button onClick={() => this.modifyStyle("color", "white")}>
              textWhite
            </button>
          </div>
        </div>
        <div className="draft-wrap" ref={(el) => (this.root = el)}></div>
      </div>
    );
  }
}
