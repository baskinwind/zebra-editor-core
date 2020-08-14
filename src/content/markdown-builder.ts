import BaseBuilder, { mapData } from "./base-builder";
import Block from "../components/block";

class MarkdownBuilder extends BaseBuilder {
  static mdbulider?: MarkdownBuilder;
  static getInstance() {
    if (!this.mdbulider) {
      this.mdbulider = new MarkdownBuilder();
    }
    return this.mdbulider;
  }

  listIndent: number = -1;
  blockIndent: number = 0;

  buildArticle(
    id: string,
    getChildren: () => any[],
    style: mapData,
    data: mapData
  ) {
    return getChildren()
      .map((item) => item[0])
      .join("\n\n");
  }

  buildCustomerCollection(
    id: string,
    tag: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ) {
    return [
      getChildren()
        .map((item) => item[0])
        .join("\n"),
      "customer-collection"
    ];
  }

  buildBlockquote(
    id: string,
    getChildren: () => [string, string][],
    style: mapData,
    data: mapData
  ) {
    this.blockIndent += 1;
    let res = getChildren()
      .map(([item, type]: [string, string]) => {
        let arr = item.split("\n");
        if (type === "paragraph" || type === "media") {
          arr[arr.length - 1] = `${Array(this.blockIndent)
            .fill(">")
            .join("")} ${arr[arr.length - 1]}`;
          if (this.blockIndent === 1) {
            arr.unshift("");
          }
        } else if (type !== "blockquote") {
          arr = arr.map((item) => `  ${item}`);
        }
        return arr.join("\n");
      })
      .join("\n");
    this.blockIndent -= 1;
    return [res, "blockquote"];
  }

  buildHr(id: string, style: mapData, data: mapData) {
    return ["---", "hr"];
  }

  buildTable(
    id: string,
    getChildren: () => [string, string, number][],
    style: mapData,
    data: mapData
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
    res += children.map((item) => item[0]).join("\n");
    return [res, "table"];
  }

  buildTableRow(
    id: string,
    getChildren: () => [string, string][],
    style: mapData,
    data: mapData
  ) {
    let children = getChildren();
    let cellType = children[0][1];
    return [
      `| ${children.map((item) => item[0]).join(" | ")} |`,
      cellType,
      children.length
    ];
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => any[],
    style: mapData,
    data: mapData
  ) {
    return [
      getChildren()
        .map((item) => item[0])
        .join("\n"),
      cellType
    ];
  }

  buildList(
    id: string,
    getChildren: () => [string, string][],
    style: mapData,
    data: mapData
  ) {
    let ordered = data.tag === "ol";
    this.listIndent += 1;
    let res = getChildren()
      .map(([item, type]: [string, string], index: number) => {
        let arr = item.split("\n");
        if (type === "paragraph" || type === "media") {
          if (ordered) {
            arr[arr.length - 1] = `${index + 1}. ${arr[arr.length - 1]}`;
          } else {
            arr[arr.length - 1] = `- ${arr[arr.length - 1]}`;
          }
        } else {
          let prefix = Array(this.listIndent + 1)
            .fill("  ")
            .join("");
          arr = arr.map((item) => `${prefix}${item}`);
        }
        return arr.join("\n");
      })
      .join("\n");
    this.listIndent -= 1;

    return [res, "list"];
  }

  buildListItem(block: Block) {
    return block.render();
  }

  buildParagraph(
    id: string,
    getChildren: () => string[],
    style: mapData,
    data: mapData
  ) {
    let res = getChildren().join("");
    if (/^h[1-6]$/.test(data.tag)) {
      res = `${Array(Number(data.tag[1])).fill("#").join("")} ${res}`;
    }
    if (res === "") {
      res = "<br />";
    }
    return [res, "paragraph"];
  }

  buildCode(
    id: string,
    content: string,
    language: string,
    style: mapData,
    data: mapData
  ) {
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

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ) {
    let res = charList;
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
