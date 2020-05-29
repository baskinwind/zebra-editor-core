import mount from "./util/mount";
import Article from "./components/article";
import Title from "./components/title";
import Media from "./components/media";
import ComponentType from "./const/component-type";
import Paragraph from "./components/paragraph";
import InlineImage from "./components/inline-image";
import List, { ListItem } from "./components/list";

let article = new Article();
article.addChildren(new Title("h3", "A Song of Ice and Fire"));
article.addChildren(
  new Media(ComponentType.image, "https://blogcdn.acohome.cn/demo-draft-1.jpg")
);
article.addChildren(
  new Paragraph(
    "Ser Waymar Royce was the youngest son of an ancient house with too many heirs. He was ahandsome youth of eighteen, grey-eyed and graceful and slender as a knife. Mounted on his hugeblack destrier, the knight towered above Will and Gared on their smaller garrons. He wore blackleather boots, black woolen pants, black moleskin gloves, and a fine supple coat of gleaming blackringmail over layers of black wool and boiled leather. Ser Waymar had been a Sworn Brother of theNight’s Watch for less than half a year, but no one could say he had not prepared for his vocation. Atleast insofar as his wardrobe was concerned."
  )
);
article.addChildren(
  new Paragraph(
    "His cloak was his crowning glory; sable, thick and black and soft as sin. “Bet he killed them allhimself, he did,” Gared told the barracks over wine, “twisted their little heads off, our mightywarrior.” They had all shared the laugh."
  )
);
let paragraph = new Paragraph("InlineImage ");
paragraph.addChildren(
  new InlineImage(
    "http://cdn.acohome.cn/1.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);
paragraph.addText(" InlineImage");
paragraph.addIntoParent(article);

let ul = new List("ul");
ul.addChildren(new ListItem("unorder list part 1"));
ul.addChildren(new ListItem("unorder list part 2"));
ul.addChildren(new ListItem("unorder list part 3"));
ul.addChildren(new ListItem("unorder list part 4"));
ul.addChildren(new ListItem("unorder list part 5"));
ul.addIntoParent(article);

let ol = new List("ol");
ol.addChildren(new ListItem("order list part 1"));
ol.addChildren(new ListItem("order list part 2"));
ol.addChildren(new ListItem("order list part 3"));
ol.addChildren(new ListItem("order list part 4"));
ol.addChildren(new ListItem("order list part 5"));
ol.addIntoParent(article);

mount("root", article);
