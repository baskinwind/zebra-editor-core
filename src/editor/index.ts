import Article from "../components/article";
import ContentView from "../view/dom-view";
import Operator from "../operator";
import ArticleManage from "./manage/article-manage";
import HistoryManage from "./manage/history-manage";
import StoreManage from "./manage/store-manage";
import createEditor from "./create-editor";
import ComponentFactory from "../factory";
import Component from "../components/component";
import Event from "./event";

export interface EditorOption {
  placeholder?: string;
  operator: typeof Operator;
  contentView: typeof ContentView;
  componentFactory: typeof ComponentFactory;
  updateComponent: (editor: Editor, ...componentList: Component[]) => void;
  beforeCreate?: (document: Document, window: Window | null) => void;
  afterCreate?: (document: Document, window: Window | null) => void;
  onError?: (error: Error) => void;
}

class Editor extends Event {
  mountedElement: HTMLElement;
  article!: Article;
  placeholder: string;

  mountedWindow!: Window;
  mountedDocument!: Document;

  userOperator: Operator;
  componentFactory: ComponentFactory;
  contentView: ContentView;

  storeManage: StoreManage;
  historyManage: HistoryManage;
  articleManage: ArticleManage;
  updateComponent: (editor: Editor, ...componentList: Component[]) => void;

  constructor(idOrElement: string | HTMLElement, option: EditorOption) {
    super();

    if (typeof idOrElement === "string") {
      let dom = document.getElementById(idOrElement);
      if (!dom) {
        throw Error("请传入正确的节点或节点 id");
      }
      this.mountedElement = dom;
    } else {
      this.mountedElement = idOrElement;
    }

    this.placeholder = option.placeholder || "";
    this.updateComponent = option.updateComponent;

    this.userOperator = new option.operator(this);
    this.contentView = new option.contentView(this);
    this.componentFactory = new option.componentFactory(this);

    this.storeManage = new StoreManage(this);
    this.historyManage = new HistoryManage(this);
    this.articleManage = new ArticleManage(this);

    createEditor(
      this.mountedElement,
      this,
      (document: Document, window: Window) => {
        this.mountedDocument = document;
        this.mountedWindow = window;
        option.beforeCreate?.(document, window);
      },
      option.afterCreate,
    );
  }

  init(article: Article) {
    article.active = true;
    article.setEditor(this);
    this.article = article;
    this.articleManage.init();
    this.historyManage.init();
    this.storeManage.init();
  }
}

export default Editor;
