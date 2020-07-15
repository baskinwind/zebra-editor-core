import BaseBuilder, { mapData } from "./base-builder";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContainDocument } from "../operator-selection/util";

class ContentBuilder extends BaseBuilder<HTMLElement> {
  static bulider: ContentBuilder;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new ContentBuilder();
    }
    return this.bulider;
  }

  addStyle(dom: HTMLElement, style?: mapData, data?: mapData) {
    dom.setAttribute("style", "");
    if (style) {
      for (let key in style) {
        dom.style[key] = style[key];
      }
    }
  }

  buildArticle(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let article = containDocument.getElementById(id);
    if (!article || !this.updateDecorate) {
      article = containDocument.createElement("article");
      article.id = id;
      article.classList.add("zebra-editor-article");
      article.dataset.type = ComponentType.article;
      article.dataset.structure = StructureType.structure;
      getChildren().forEach((component) => {
        article?.appendChild(component);
      });
    }
    this.addStyle(article, style, data);
    return article;
  }

  buildCustomerCollection(
    id: string,
    tag: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let collection = containDocument.getElementById(id);
    if (!collection || !this.updateDecorate) {
      collection = containDocument.createElement(tag);
      collection.id = id;
      collection.classList.add("zebra-editor-customer");
      collection.dataset.type = ComponentType.customerCollection;
      collection.dataset.structure = StructureType.structure;
      getChildren().forEach((component) => {
        collection?.appendChild(component);
      });
    }
    this.addStyle(collection, style, data);
    return collection;
  }

  buildTable(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    let figure = containDocument.getElementById(id);
    if (!figure || !this.updateDecorate) {
      figure = containDocument.createElement("figure");
      figure.id = id;
      figure.dataset.structure = StructureType.structure;
      figure.contentEditable = "false";
      figure.style.overflowX = "auto";
      const table = containDocument.createElement("table");
      table.style.minWidth = "100%";
      table.style.borderCollapse = "collapse";
      getChildren().forEach((item) => table.appendChild(item));
      figure.appendChild(table);
    }
    this.addStyle(figure, style, data);
    return figure;
  }

  buildTableRow(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    let tr = containDocument.getElementById(id);
    if (!tr || !this.updateDecorate) {
      tr = containDocument.createElement("tr");
      tr.id = id;
      tr.dataset.structure = StructureType.structure;
      getChildren().forEach((item) => tr?.appendChild(item));
    }
    this.addStyle(tr, style, data);
    return tr;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    let cell = containDocument.getElementById(id);
    if (!cell || !this.updateDecorate) {
      cell = containDocument.createElement(cellType);
      cell.id = id;
      cell.dataset.structure = StructureType.structure;
      cell.contentEditable = "true";
      getChildren().forEach((item) => cell?.appendChild(item));
    }
    this.addStyle(cell, style, data);
    return cell;
  }

  buildList(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let list = containDocument.getElementById(id);
    if (!list || !this.updateDecorate) {
      let tag: string = data.tag || "ul";
      list = containDocument.createElement(tag);
      list.id = id;
      list.classList.add("zebra-editor-list");
      list.dataset.type = ComponentType.article;
      list.dataset.structure = StructureType.structure;
      getChildren().forEach((component) => {
        list?.appendChild(component);
      });
    }
    this.addStyle(list, style, data);
    return list;
  }

  buildListItem(
    id: string,
    getChildren: () => HTMLElement,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let li = containDocument.createElement("li");
    li.id = id;
    li.appendChild(getChildren());
    this.addStyle(li, style, data);
    return li;
  }

  buildParagraph(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let parapraph = containDocument.getElementById(id);
    if (!parapraph || !this.updateDecorate) {
      const tag: string = data.tag || "p";
      parapraph = containDocument.createElement(tag);
      parapraph.id = id;
      parapraph.classList.add(`zebra-editor-${tag}`);
      parapraph.dataset.type = ComponentType.paragraph;
      parapraph.dataset.structure = StructureType.content;
      let children = getChildren();
      if (children.length) {
        children.forEach((component) => {
          parapraph?.appendChild(component);
        });
      } else {
        parapraph.appendChild(containDocument.createElement("br"));
      }
    }
    this.addStyle(parapraph, style, data);
    return parapraph;
  }

  buildCode(
    id: string,
    content: string,
    language: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let pre = containDocument.getElementById(id);
    if (!pre || !this.updateDecorate) {
      pre = containDocument.createElement("pre");
      pre.id = id;
      pre.classList.add(`zebra-editor-code`);
      pre.dataset.type = ComponentType.code;
      pre.dataset.structure = StructureType.plainText;
      const code = containDocument.createElement("code");
      code.append(content);
      code.dataset.type = ComponentType.characterList;
      code.dataset.structure = StructureType.partialContent;
      pre.appendChild(code);
    }
    pre.dataset.language = language;
    this.addStyle(pre, style, data);
    return pre;
  }

  buildeImage(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    let figure = containDocument.getElementById(id);
    if (
      !figure ||
      figure.dataset.src !== src ||
      figure.dataset.link !== data.link
    ) {
      figure = containDocument.createElement("figure");
      figure.id = id;
      figure.classList.add("zebra-editor-image", "zebra-editor-image-loading");
      figure.dataset.type = ComponentType.media;
      figure.dataset.structure = StructureType.content;
      figure.dataset.src = src;
      let child;
      let image = containDocument.createElement("img");
      image.src = src;
      image.alt = data.alt || "";
      image.style.maxWidth = "100%";
      image.style.display = "block";
      image.addEventListener("load", () => {
        figure?.classList.remove("zebra-editor-image-loading");
      });
      if (data.link) {
        figure.dataset.link = data.link;
        let link = containDocument.createElement("a");
        link.href = data.link;
        link.appendChild(image);
        child = link;
      } else {
        child = image;
      }
      figure.appendChild(child);
    }
    this.addStyle(figure, style, data);
    return figure;
  }

  buildeAudio(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    let figure = containDocument.getElementById(id);
    if (!figure || !this.updateDecorate) {
      figure = containDocument.createElement("figure");
      figure.id = id;
      figure.classList.add("zebra-editor-image");
      figure.dataset.type = ComponentType.media;
      figure.dataset.structure = StructureType.content;
      let audio = containDocument.createElement("audio");
      audio.src = src;
      figure.appendChild(audio);
    }
    this.addStyle(figure, style, data);
    return figure;
  }

  buildeVideo(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    let figure = containDocument.getElementById(id);
    if (!figure || !this.updateDecorate) {
      figure = containDocument.createElement("figure");
      figure.id = id;
      figure.classList.add("zebra-editor-image");
      figure.dataset.type = ComponentType.media;
      figure.dataset.structure = StructureType.content;
      let video = containDocument.createElement("video");
      video.src = src;
      figure.appendChild(video);
    }
    this.addStyle(figure, style, data);
    return figure;
  }

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let wrap = containDocument.createElement("span");
    if (data.bold) {
      wrap = containDocument.createElement("strong");
    } else if (data.bold === false) {
      style.fontWeight = "normal";
    }
    wrap.innerText = charList;
    this.addStyle(wrap, style, data);
    if (data.italic) {
      let em = containDocument.createElement("em");
      em.appendChild(wrap);
      wrap = em;
    }
    if (data.deleteText) {
      let s = containDocument.createElement("s");
      s.appendChild(wrap);
      wrap = s;
    }
    if (data.underline) {
      let u = containDocument.createElement("u");
      u.appendChild(wrap);
      wrap = u;
    }
    if (data.code) {
      let code = containDocument.createElement("code");
      code.appendChild(wrap);
      wrap = code;
    }
    if (data.link) {
      let link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(wrap);
      wrap = link;
      link.addEventListener("click", (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey) {
          window.open(link.href);
        } else {
          event.preventDefault();
        }
      });
    }
    wrap.id = id;
    wrap.dataset.type = ComponentType.characterList;
    wrap.dataset.structure = StructureType.partialContent;
    return wrap;
  }

  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    const span = containDocument.createElement("span");
    span.id = id;
    span.classList.add("zebra-editor-inline-image");
    span.dataset.type = ComponentType.inlineImage;
    span.dataset.structure = StructureType.partialContent;
    this.addStyle(span, style, data);
    let child;
    let image = containDocument.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.minWidth = "1em";
    if (data.link) {
      const link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    span.appendChild(child);
    return span;
  }
}

export default ContentBuilder;
