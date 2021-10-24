import Editor from "..";
import Component, { JSONType } from "../../components/component";
import updateComponent from "../../util/update-component";
import Article from "../../components/article";
import { nextTick } from "../../util";

class ArticleManage {
  editor: Editor;
  update: boolean;

  constructor(editor: Editor) {
    this.editor = editor;
    this.update = false;
  }

  init() {
    this.update = true;
    let editorDom = this.editor.mountedDocument.getElementById("zebra-editor-contain");
    editorDom?.appendChild(this.editor.article.render(this.editor.contentView));
    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });

    this.editor.article.$on("updateComponent", (componentList: Component[]) => {
      if (this.update) {
        updateComponent(this.editor, ...componentList);
      }
    });
  }

  stopUpdate() {
    this.update = false;
  }

  startUpdate() {
    this.update = true;
  }

  createEmpty() {
    let article = this.editor.componentFactory.buildArticle();
    article.add(0, this.editor.componentFactory.buildParagraph());
    return article;
  }

  createByJSON(json: JSONType) {
    if (!json.type) return this.createEmpty();
    return this.editor.componentFactory.typeMap[json.type].create(this.editor.componentFactory, json);
  }

  newArticle(article?: JSONType | Article) {
    let editorDom = this.editor.mountedDocument.getElementById("zebra-editor-contain");
    if (!editorDom) return;
    editorDom.innerHTML = "";
    this.editor?.article.destory();
    let newArticle: Article;

    if (typeof article === "string") {
      newArticle = this.createByJSON(article);
    } else if (!article) {
      newArticle = this.createEmpty();
    } else {
      newArticle = article as Article;
    }

    this.editor.init(newArticle);

    editorDom.appendChild(newArticle.render(this.editor.contentView));
    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  save() {
    const article = this.editor.article;
    // 空文章不做存储，示例文章不做存储
    if (article.isEmpty() || /^demo/.test(article.id)) return;

    localStorage.setItem("zebra-editor-article-temp", JSON.stringify(article.getJSON()));
  }

  flush() {
    let editorDom = this.editor.mountedDocument.getElementById("zebra-editor-contain");
    if (!editorDom) return;
    editorDom.innerHTML = "";
    editorDom.appendChild(this.editor.article.render(this.editor.contentView));
  }
}

export default ArticleManage;
