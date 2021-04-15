import ComponentFactory from "../components";
import Article from "../components/article";
import ContentView from "../view/dom-view";
import Operator from "../operator";
import ArticleManage from "./manage/article-manage";
import HistoryManage from "./manage/history-manage";
import StoreManage from "./manage/store-manage";
import createEditor from "./create-editor";
import Event from "./event";

export interface EditorOption {
  placeholder?: string;
  operator: typeof Operator;
  contentView: typeof ContentView;
  componentFactory: typeof ComponentFactory;
  onError?: (error: Error) => void;
  beforeCreate?: (document: Document, window: Window | null) => void;
  afterCreate?: (document: Document, window: Window | null) => void;
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

  constructor(idOrElement: string | HTMLElement, article: Article, option: EditorOption) {
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

    article.setEditor(this);
    this.article = article;
    this.placeholder = option.placeholder || "";

    this.userOperator = new option.operator(this);
    this.contentView = new option.contentView(this);
    this.componentFactory = new option.componentFactory(this);

    this.storeManage = new StoreManage(this);
    this.historyManage = new HistoryManage(this);
    this.articleManage = new ArticleManage(this);
    this.init(article);

    createEditor(
      this.mountedElement,
      this.article,
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
    this.article = article;
    this.articleManage.init();
    this.historyManage.init();
    this.storeManage.init();
  }
}

export default Editor;
