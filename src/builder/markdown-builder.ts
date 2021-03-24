import { HeaderType } from "../components/header";
import BaseBuilder, { mapData } from "./base-builder";
import { ListType } from "../components/list";

class MarkdownBuilder extends BaseBuilder {
  listIndent: number = -1;
  blockIndent: number = 0;

  buildArticle(id: string, getChildren: () => string[], style: mapData, data: mapData) {
    return getChildren()
      .map((each) => each[0])
      .join("\n\n");
  }

  buildCustomerCollection(
    id: string,
    tag: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData,
  ) {
    return [
      getChildren()
        .map((each) => each[0])
        .join("\n"),
      "customer-collection",
    ];
  }

  buildTable(
    id: string,
    getChildren: () => [string, string, number][],
    style: mapData,
    data: mapData,
  ) {
    let children = getChildren();
    let firstRowType = children[0][1];
    let col = children[0][2];
    let res = "";
    if (firstRowType === "th") {
      res += `${children[0][0]}\n`;
      children.shift();
    } else {
      res += `| ${Array(col).fill("-").join(" | ")} |\n`;
    }
    res += `| ${Array(col).fill("---").join(" | ")} |\n`;
    res += children.map((each) => each[0]).join("\n");
    return [res, "table"];
  }

  buildTableRow(id: string, getChildren: () => [string, string][], style: mapData, data: mapData) {
    let children = getChildren();
    let cellType = children[0][1];
    return [`| ${children.map((each) => each[0]).join(" | ")} |`, cellType, children.length];
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => string[],
    style: mapData,
    data: mapData,
  ) {
    return [
      getChildren()
        .map((each) => each[0])
        .join("\n"),
      cellType,
    ];
  }

  buildList(
    id: string,
    listType: ListType,
    getChildren: () => [string, string][],
    style: mapData,
    data: mapData,
  ) {
    let ordered = listType === "ol";
    this.listIndent += 1;
    let res = getChildren()
      .map(([item, type]: [string, string], index: number) => {
        let arr = item.split("\n");
        if (type === "paragraph" || type === "header" || type === "media") {
          if (ordered) {
            arr[arr.length - 1] = `${index + 1}. ${arr[arr.length - 1]}`;
          } else {
            arr[arr.length - 1] = `- ${arr[arr.length - 1]}`;
          }
        } else {
          let prefix = Array(this.listIndent + 1)
            .fill("  ")
            .join("");
          arr = arr.map((each) => `${prefix}${each}`);
        }
        return arr.join("\n");
      })
      .join("\n");
    this.listIndent -= 1;

    return [res, "list"];
  }

  buildListItem(list: string): string {
    return list;
  }

  buildParagraph(id: string, getChildren: () => string[], style: mapData, data: mapData) {
    let res = getChildren().join("");
    if (res === "") {
      res = "<br />";
    }
    return [res, "paragraph"];
  }

  buildHeader(
    id: string,
    type: HeaderType,
    getChildren: () => string[],
    style: mapData,
    data: mapData,
  ) {
    let res = `${Array(Number(type[1])).fill("#").join("")} ${getChildren().join("")}`;

    return [res, "header"];
  }

  buildCodeBlock(id: string, content: string, language: string, style: mapData, data: mapData) {
    let code = `\`\`\`${language}\n${content}\`\`\``;
    return [code, "code"];
  }

  buildeImage(id: string, src: string, style: mapData, data: mapData) {
    delete data.sourceLink;
    return [`![image](${src})`, "media"];
  }

  buildeAudio(id: string, src: string, style: mapData, data: mapData) {
    delete data.sourceLink;
    return [`![audio](${src})`, "media"];
  }

  buildeVideo(id: string, src: string, style: mapData, data: mapData) {
    delete data.sourceLink;
    return [`![video](${src})`, "media"];
  }

  buildCharacterList(id: string, text: string, style: mapData, data: mapData) {
    let res = text;
    if (data.code) {
      res = `\`${res}\``;
    }
    if (data.bold) {
      res = `**${res}**`;
    }
    if (data.italic) {
      res = `*${res}*`;
    }
    if (data.deleteText) {
      res = `<s>${res}</s>`;
    }
    if (data.deleteText) {
      res = `<u>${res}</u>`;
    }
    if (data.link) {
      res = `[${res}](${data.link}${data.title ? " " + data.title : ""})`;
    }
    let keys = Object.keys(style);
    if (keys.length) {
      let styleString = keys.map((key) => `${key}:${style[key]}`).join(";");
      res = `<span style="${styleString}">${res}</span>`;
    }
    return res;
  }

  buildInlineImage(id: string, src: string, style: mapData, data: mapData) {
    return `![image](${src})`;
  }
}

export default MarkdownBuilder;
