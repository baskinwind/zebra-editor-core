import Editor from "..";
import nextTick from "../../util/next-tick";
import Component, { IRawType } from "../../components/component";
import updateComponent from "../../util/update-component";

class ArticleManage {
  editor: Editor;
  update: boolean;

  constructor(editor: Editor) {
    this.editor = editor;
    this.update = false;
  }

  init() {
    this.update = true;
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

  createByRaw(raw: IRawType) {
    if (!raw.type) return this.createEmpty();
    return this.editor.componentFactory.typeMap[raw.type].create(this.editor.componentFactory, raw);
  }

  newArticle(raw?: IRawType) {
    let editorDom = this.editor.mountedDocument.getElementById("zebra-editor-contain");
    if (!editorDom) return;
    editorDom.innerHTML = "";
    this.editor.article.destory();

    const newArticle = raw ? this.createByRaw(raw) : this.createEmpty();
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

    localStorage.setItem("zebra-editor-article-temp", JSON.stringify(article.getRaw()));
  }

  flush() {
    let editorDom = this.editor.mountedDocument.getElementById("zebra-editor-contain");
    if (!editorDom) return;
    editorDom.innerHTML = "";
    editorDom.appendChild(this.editor.article.render(this.editor.contentView));
  }
}

export default ArticleManage;
