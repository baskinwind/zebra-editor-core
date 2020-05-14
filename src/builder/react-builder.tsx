import React from "react";

export default {
  buildeImage(src: string, style: any, data: any) {
    let alt = data.alt || "";
    let image = <img src={src} alt={alt} />;
    if (data.link) {
      image = <a href={data.link}>{image}</a>;
    }
    return <figure>{image}</figure>;
  },
  buildChar(char: string, style: any, data: any): string {
    return char;
  },
  buildInlineImage(src: string, style: any, data: any) {
    let alt = data.alt || "";
    let image = <img src={src} alt={alt} />;
    if (data.link) {
      image = <a href={data.link}>{image}</a>;
    }
    return <span>{image}</span>;
  },
  buildCharacterList(charList: string[], style: any, data: any) {
    return <span>{charList.join("")}</span>;
  },
  render(content: any) {
    return content;
  },
};
