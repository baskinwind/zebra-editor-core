import BaseBuilder, { mapData } from "./base-builder";

class HtmlBuilder extends BaseBuilder<string> {
  static bulider: HtmlBuilder;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new HtmlBuilder();
    }
    return this.bulider;
  }

  formatStyle(styleName: string) {
    return styleName.replace(/([A-Z])/, "-$1").toLocaleLowerCase();
  }

  getStyle(style: mapData) {
    let styleFormat = Object.keys(style).map(
      (key) => `${this.formatStyle(key)}:${style[key]};`
    );
    if (styleFormat) {
      return `style="${styleFormat}"`;
    }
    return "";
  }

  buildArticle(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-editor-article";
    return `<article class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</article>`;
  }

  buildCustomerCollection(
    id: string,
    tag: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-editor-article";
    return `<article class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</article>`;
  }

  buildTable(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-editor-table";
    return `<figure class="${className}" ${this.getStyle(
      style
    )}><table style="width:100%;border-collapse:collapse;">${getChildren().reduce(
      (acc, item) => acc + item,
      ""
    )}</table></figure>`;
  }

  buildTableRow(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-editor-tr";
    return `<tr class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</tr>`;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ) {
    let className = `zebra-editor-${cellType}`;
    return `<${cellType} class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</${cellType}>`;
  }

  buildList(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-editor-list";
    let tag: string = data.tag || "ul";
    return `<${tag} class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</${tag}>`;
  }

  buildListItem(
    id: string,
    getChildren: () => string,
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-editor-list";
    let tag: string = data.tag || "ul";
    return `<${tag} class="${className}" ${this.getStyle(
      style
    )}>${getChildren()}</${tag}>`;
  }

  buildParagraph(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-editor-${tag}`;
    return `<${tag} class="${className}" ${this.getStyle(
      style
    )}>${getChildren().reduce((acc, item) => acc + item, "")}</${tag}>`;
  }

  buildCode(
    id: string,
    content: string,
    language: string,
    style: mapData,
    data: mapData
  ): string {
    let className = `zebra-editor-code`;
    return `<pre class="${className}" ${this.getStyle(
      style
    )}><code>${content}</code></pre>`;
  }

  buildeImage(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-editor-image`;
    return `<figure class="${className}" ${this.getStyle(
      style
    )}>${image}</figure>`;
  }

  buildeAudio(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<audio src="${src}" alt="${data.alt}" />`;
    let className = `zebra-editor-image`;
    return `<figure class="${className}" ${this.getStyle(
      style
    )}>${image}</figure>`;
  }

  buildeVideo(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<video src="${src}" alt="${data.alt}" />`;
    let className = `zebra-editor-image`;
    return `<figure class="${className}" ${this.getStyle(
      style
    )}>${image}</figure>`;
  }

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): string {
    return `<span ${this.getStyle(style)}>${charList}</span>`;
  }

  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-editor-inline-image`;
    return `<span class="${className}" ${this.getStyle(style)}>${image}</span>`;
  }
}

export default HtmlBuilder;
