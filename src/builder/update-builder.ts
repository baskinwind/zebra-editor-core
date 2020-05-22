import Article from "../components/article";

export default {
  updateArticle(component: Article) {
    let article = document.getElementById(component.id);
    article?.parentElement?.replaceChild(component.render(), article);
  },
};
