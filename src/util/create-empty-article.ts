import Article from "../components/article";
import Paragraph from "../components/paragraph";
import Character from "../components/character";
import Media from "../components/media";
import InlineImage from "../components/inline-image";
import ComponentType from "../const/component-type";

export default function createEnptyArticle() {
  let article = new Article();
  // let paragraph = new Paragraph(
  //   "Ser Waymar Royce was the youngest son of an ancient house with too many heirs. He was ahandsome youth of eighteen, grey-eyed and graceful and slender as a knife. Mounted on his hugeblack destrier, the knight towered above Will and Gared on their smaller garrons. He wore blackleather boots, black woolen pants, black moleskin gloves, and a fine supple coat of gleaming blackringmail over layers of black wool and boiled leather. Ser Waymar had been a Sworn Brother of theNight’s Watch for less than half a year, but no one could say he had not prepared for his vocation. Atleast insofar as his wardrobe was concerned."
  // );
  article.addChildren(new Paragraph("0123456789"));
  article.addChildren(new Paragraph("0123456789"));
  article.addChildren(new Paragraph("0123456789"));
  article.addChildren(new Paragraph("0123456789"));
  article.addChildren(new Paragraph("0123456789"));
  let paragraph = new Paragraph("0123456789");
  paragraph.addIntoParent(article);
  paragraph.changeCharDecorate("color", "red", 1, 5);
  // paragraph.addText("abcd");
  paragraph.addChildren(
    new InlineImage(
      "http://blog.acohome.cn/content/images/size/w100/2019/10/zebra.png"
    )
  );
  paragraph.addText("1234");
  // let paragraph2 = new Paragraph();
  // paragraph2.addIntoParent(article);
  // paragraph2.addText("abcd1234");

  // article.addChildren(new Paragraph());
  // article.addChildren(
  //   new Media(
  //     ComponentType.image,
  //     "http://blog.acohome.cn/content/images/size/w100/2019/10/zebra.png"
  //   )
  // );
  return article;
}
