import ComponentType from "../const/component-type";

export default {
  buildArticle(
    id: string,
    componentList: HTMLElement[],
    style: any,
    data: any
  ): HTMLElement {
    const article = document.createElement("article");
    article.id = id;
    article.dataset.type = ComponentType.article;
    componentList.forEach((component) => {
      article.appendChild(component);
    });
    return article;
  },
  buildParagraph(
    id: string,
    inlineList: HTMLElement[],
    style: any,
    data: any
  ): HTMLElement {
    const parapraph = document.createElement("p");
    parapraph.id = id;
    parapraph.dataset.type = ComponentType.paragraph;
    if (inlineList.length) {
      inlineList.forEach((component) => {
        parapraph.appendChild(component);
      });
    } else {
      parapraph.appendChild(document.createElement("br"));
    }
    return parapraph;
  },
  buildeImage(id: string, src: string, style: any, data: any) {
    const figure = document.createElement("figure");
    figure.id = id;
    figure.dataset.type = ComponentType.image;
    let child;
    let image = document.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    if (data.link) {
      const link = document.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    figure.appendChild(child);
    return figure;
  },
  buildCharacterList(
    id: string,
    charList: string[],
    style: any,
    data: any
  ): HTMLElement {
    const span = document.createElement("span");
    span.id = id;
    span.dataset.type = ComponentType.characterList;
    span.innerText = charList.join("");
    return span;
  },
  buildChar(id: string, char: string): string {
    return char;
  },
  buildInlineImage(
    id: string,
    src: string,
    style: any,
    data: any
  ): HTMLElement {
    const span = document.createElement("span");
    span.id = id;
    span.dataset.type = ComponentType.inlineImage;
    let child;
    let image = document.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    if (data.link) {
      const link = document.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    span.appendChild(child);
    return span;
  },
};
