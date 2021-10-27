import AbstractView from "./base-view";
import StructureType from "../const/structure-type";
import { HeadingEnum } from "../components/heading";
import { ListType } from "../components/list";
import { AnyObject } from "../decorate";

class HtmlView extends AbstractView<string> {
  formatStyle(styleName: string) {
    return styleName.replace(/([A-Z])/, "-$1").toLocaleLowerCase();
  }

  getStyle(style: AnyObject) {
    let styleFormat = Object.keys(style).map((key) => `${this.formatStyle(key)}:${style[key]};`);
    if (styleFormat.length) {
      return ` style="${styleFormat.join("")}"`;
    }
    return "";
  }

  getData(data: AnyObject) {
    let format = Object.keys(data).map((key) => `data-${key}=${data[key]};`);
    if (format.length) {
      return ` ${format.join(" ")}"`;
    }
    return "";
  }

  buildHtml(
    tag: string,
    className: string,
    style: AnyObject,
    children: string,
    data: AnyObject = {},
  ): string {
    return `<${tag}${className ? ` class=${className}` : ""}${this.getStyle(style)}${this.getData(
      data,
    )}>${children}</${tag}>`;
  }

  buildArticle(id: string, getChildren: () => string[], style: AnyObject, data: AnyObject): string {
    return this.buildHtml("article", "zebra-editor-article", style, getChildren().join(""));
  }

  buildCustomCollection(
    id: string,
    tag: string,
    getChildren: () => string[],
    style: AnyObject,
    data: AnyObject,
  ): string {
    return this.buildHtml("div", "zebra-editor-customer-collection", style, getChildren().join(""));
  }

  buildTable(id: string, getChildren: () => string[], style: AnyObject, data: AnyObject) {
    let table = this.buildHtml(
      "table",
      "",
      {
        minWidth: "100%",
        borderCollapse: "collapse",
      },
      getChildren().join(""),
    );
    return this.buildHtml("figure", "zebra-editor-table", style, table);
  }

  buildTableRow(id: string, getChildren: () => string[], style: AnyObject, data: AnyObject) {
    return this.buildHtml("tr", "zebra-editor-tr", style, getChildren().join(""));
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => string[],
    style: AnyObject,
    data: AnyObject,
  ) {
    return this.buildHtml(cellType, `zebra-editor-${cellType}`, style, getChildren().join(""));
  }

  buildList(
    id: string,
    listType: ListType,
    getChildren: () => string[],
    style: AnyObject,
    data: AnyObject,
  ): string {
    return this.buildHtml(listType, "zebra-editor-list", style, getChildren().join(""));
  }

  buildListItem(list: string, structureType: StructureType): string {
    let style: AnyObject = {};
    if (structureType !== StructureType.content) {
      style.display = "block";
    }
    return this.buildHtml("li", "zebra-editor-list-item", style, list);
  }

  buildParagraph(
    id: string,
    getChildren: () => string[],
    style: AnyObject,
    data: AnyObject,
  ): string {
    let tag = data.tag || "p";
    return this.buildHtml(
      tag,
      `zebra-editor-${tag}`,
      style,
      `<span>${getChildren().join("") || "<br />"}</span>`,
    );
  }

  buildHeading(
    id: string,
    type: HeadingEnum,
    getChildren: () => string[],
    style: AnyObject,
    data: AnyObject,
  ): string {
    return this.buildHtml(
      type,
      `zebra-editor-${type}`,
      style,
      `<span>${getChildren().join("") || "<br />"}</span>`,
    );
  }

  buildCodeBlock(
    id: string,
    content: string,
    language: string,
    style: AnyObject,
    data: AnyObject,
  ): string {
    return `<pre class="zebra-editor-code-block"${this.getStyle(style)}${this.getData(
      data,
    )} data-language="${language}"><code>${content}</code></pre>`;
  }

  buildeImage(id: string, src: string, style: AnyObject, data: AnyObject): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-editor-image`;
    return `<figure class="${className}"${this.getStyle(style)}>${image}</figure>`;
  }

  buildeAudio(id: string, src: string, style: AnyObject, data: AnyObject): string {
    let image = `<audio src="${src}" alt="${data.alt}" />`;
    let className = `zebra-editor-image`;
    return `<figure class="${className}"${this.getStyle(style)}>${image}</figure>`;
  }

  buildeVideo(id: string, src: string, style: AnyObject, data: AnyObject): string {
    let image = `<video src="${src}" alt="${data.alt}" />`;
    let className = `zebra-editor-image`;
    return `<figure class="${className}"${this.getStyle(style)}>${image}</figure>`;
  }

  buildCharacterList(id: string, text: string, style: AnyObject, data: AnyObject): string {
    let content = text;
    if (data.link) {
      content = `<a href=${data.link}>${content}</a>`;
    }
    if (data.bold) {
      content = `<strong>${content}</strong>`;
    }
    if (data.italic) {
      content = `<em>${content}</em>`;
    }
    if (data.deleteText) {
      content = `<s>${content}</s>`;
    }
    if (data.underline) {
      content = `<u>${content}</u>`;
    }
    if (data.code) {
      content = `<code>${content}</code>`;
    }
    content = `<span${this.getStyle(style)}>${content}</span>`;
    return content;
  }

  buildInlineImage(id: string, src: string, style: AnyObject, data: AnyObject): string {
    let image = `<img src="${src}" alt="${data.alt || ""}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-editor-inline-image`;
    return `<span class="${className}"${this.getStyle(style)}>${image}</span>`;
  }
}

export default HtmlView;
