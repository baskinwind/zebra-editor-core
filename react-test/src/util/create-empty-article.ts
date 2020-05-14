import Article from "../components/article";
import Paragraph from "../components/paragraph";
import Character from "../components/character";
import Media from "../components/media";
import InlineImage from "../components/inline-image";
import ComponentType from "../const/component-type";

export default function createEnptyArticle() {
  let article = new Article();
  article.addChildren(
    new Media(
      ComponentType.image,
      "http://blog.acohome.cn/content/images/size/w100/2019/10/zebra.png"
    )
  );

  let paragraph = new Paragraph();
  paragraph.addIntoParent(article);
  paragraph.addChildren([
    new Character("a"),
    new Character("b"),
    new Character("c"),
    new Character("d"),
  ]);
  paragraph.addChildren(
    new InlineImage(
      "http://blog.acohome.cn/content/images/size/w100/2019/10/zebra.png"
    )
  );
  paragraph.addChildren([
    new Character("1"),
    new Character("2"),
    new Character("3"),
    new Character("4"),
  ]);

  article.addChildren(new Paragraph());
  article.addChildren(
    new Media(
      ComponentType.image,
      "http://blog.acohome.cn/content/images/size/w100/2019/10/zebra.png"
    )
  );
  article.addChildren(new Paragraph());
  return article;
}
