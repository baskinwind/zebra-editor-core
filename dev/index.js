import "../src/default.scss";
import "./operator";

import mount from "../src/util/mount";
import Article from "../src/components/article";
import Title from "../src/components/title";
import Media from "../src/components/media";
import ComponentType from "../src/const/component-type";
import Paragraph from "../src/components/paragraph";
import InlineImage from "../src/components/inline-image";
import List, { ListItem } from "../src/components/list";
import Table from "../src/components/table";

let article = new Article();
article.addChildren(new Title("h1", "A Song of Ice and Fire"));
article.addChildren(
  new Media(ComponentType.image, "https://blogcdn.acohome.cn/demo-draft-1.jpg")
);
article.addChildren(
  new Paragraph(
    "Ser Waymar Royce was the youngest son of an ancient house with too many heirs. He was a handsome youth of eighteen, grey-eyed and graceful and slender as a knife. Mounted on his huge black destrier, the knight towered above Will and Gared on their smaller garrons."
  )
);
let paragraph = new Paragraph(
  "Ser Waymar had been a Sworn Brother of theNight’s Watch for less than half a year, but no one could say he had not prepared for his vocation."
);
paragraph.addChildren(
  new InlineImage(
    "http://cdn.acohome.cn/1.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);
paragraph.addText("Atleast insofar as his wardrobe was concerned. ");
paragraph.addIntoParent(article);

let ul = new List("ul");
ul.addChildren(new ListItem("un order list part 1"));
ul.addChildren(new ListItem("un order list part 2"));
ul.addChildren(new ListItem("un order list part 3"));
ul.addChildren(new ListItem("un order list part 4"));
ul.addChildren(new ListItem("un order list part 5"));
ul.addIntoParent(article);

let ol = new List("ol");
ol.addChildren(new ListItem("order list part 1"));
ol.addChildren(new ListItem("order list part 2"));
ol.addChildren(new ListItem("order list part 3"));
ol.addChildren(new ListItem("order list part 4"));
ol.addChildren(new ListItem("order list part 5"));
ol.addIntoParent(article);

let table = new Table(3, 4);
table.addIntoParent(article);

article.addChildren(new Paragraph());

mount("root", article);

export default article;
