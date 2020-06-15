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
      return `style=${styleFormat}`;
    }
    return "";
  }

  buildArticle(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-article";
    return `<article class="${className}" style="${this.getStyle(
      style
    )}">${componentList.reduce((acc, item) => acc + item, "")}</article>`;
  }

  buildTable(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-draft-table";
    return `<table class="${className}" style="${this.getStyle(
      style
    )}">${componentList.reduce((acc, item) => acc + item, "")}</table>`;
  }

  buildTableRow(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-draft-tr";
    return `<tr class="${className}" style="${this.getStyle(
      style
    )}">${componentList.reduce((acc, item) => acc + item, "")}</tr>`;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    componentList: string[],
    style: mapData,
    data: mapData
  ) {
    let className = `zebra-draft-${cellType}`;
    return `<${cellType} class="${className}" style="${this.getStyle(
      style
    )}">${componentList.reduce((acc, item) => acc + item, "")}</${cellType}>`;
  }

  buildList(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-list";
    return `<ul class="${className}" style="${this.getStyle(
      style
    )}">${componentList.reduce((acc, item) => acc + item, "")}</ul>`;
  }

  buildParagraph(
    id: string,
    inlineList: string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-draft-${tag}`;
    return `<${tag} class="${className}" style="${this.getStyle(
      style
    )}">${inlineList.reduce((acc, item) => acc + item, "")}</${tag}>`;
  }

  buildCode(
    id: string,
    content: string,
    style: mapData,
    data: mapData
  ): string {
    let className = `zebra-draft-code`;
    return `<pre class="${className}" style="${this.getStyle(
      style
    )}"><code>${content}</code></pre>`;
  }

  buildeImage(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${this.getStyle(
      style
    )}">${image}</figure>`;
  }

  buildeAudio(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<audio src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${this.getStyle(
      style
    )}">${image}</figure>`;
  }

  buildeVideo(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<video src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${this.getStyle(
      style
    )}">${image}</figure>`;
  }

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): string {
    return `<span style="${this.getStyle(style)}">${charList}</span>`;
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
    let className = `zebra-draft-inline-image`;
    return `<span class="${className}" style="${this.getStyle(
      style
    )}">${image}</span>`;
  }
}

export default HtmlBuilder;
