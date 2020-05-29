export interface mapData {
  [key: string]: any;
}

export default {
  buildArticle(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-article";
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<article class="${className}" style="${styleList}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</article>`;
  },
  buildList(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-list";
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<ul class="${className}" style="${styleList}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</ul>`;
  },
  buildParagraph(
    id: string,
    inlineList: string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-draft-${tag}`;
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<${tag} class="${className}" style="${styleList}">${inlineList.reduce(
      (acc, item) => acc + item,
      ""
    )}</${tag}>`;
  },
  buildTitle(
    id: string,
    inlineList: string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-draft-${tag}`;
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<${tag} class="${className}" style="${styleList}">${inlineList.reduce(
      (acc, item) => acc + item,
      ""
    )}</${tag}>`;
  },
  buildeImage(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-draft-image`;
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<figure class="${className}" style="${styleList}">${image}</figure>`;
  },
  buildeAudio(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<audio src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<figure class="${className}" style="${styleList}">${image}</figure>`;
  },
  buildeVideo(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<video src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<figure class="${className}" style="${styleList}">${image}</figure>`;
  },
  buildCharacterList(
    id: string,
    charList: string[],
    style: mapData,
    data: mapData
  ): string {
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<span style="${styleList}">${charList.join("")}</span>`;
  },
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
    let styleList = Object.keys(style).map((key) => `${key}:${style[key]};`);
    return `<span class="${className}" style="${styleList}">${image}</span>`;
  },
};
