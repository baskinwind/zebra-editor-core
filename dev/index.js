import "../src/default.scss";
import "./operator";

import mount from "../src/util/mount";
import createByRaw from "../src/util/create-by-raw";
import Article from "../src/components/article";
import Title from "../src/components/title";
import Media from "../src/components/media";
import ComponentType from "../src/const/component-type";
import Paragraph from "../src/components/paragraph";
import InlineImage from "../src/components/inline-image";
import List from "../src/components/list";
import Table from "../src/components/table";
import Code from "../src/components/code";

let pledge = [
  "Night gathers, and now my watch begins.",
  "It shall not end until my death.",
  "I shall take no wife, hold no lands, father no children.",
  "I shall wear no crowns and win no glory.",
  "I shall live and die at my post.",
  "I am the sword in the darkness.",
  "I am the watcher on the walls.",
  "I am the fire that burns against the cold, the light that brings the dawn, the horn that wakes the sleepers, the shield that guards the realms of men.",
  "I pledge my life and honor to the Night's Watch, for this night and all the nights to come."
];

let pledgeCn = [
  "长夜将至，我从今开始守望。",
  "至死方休！",
  "不娶妻、不封地、不生子。",
  "不戴宝冠，不争荣宠。",
  "尽忠职守，生死於斯。",
  "我是黑暗中的利剑。",
  "是长城中的守卫。",
  "是抵御寒冷的烈焰，破晓时分的光线，唤醒死者的号角，守护王国的铁卫。",
  "我将生命与荣耀献给守夜人，今夜如此，夜夜皆然。"
];

let article = new Article();
article.add(new Title("h1", "A Song of Ice and Fire"));
article.add(new Title("h2", "冰与火之歌"));

article.add(new Title("h3", "图片"));
article.add(
  new Media('image', "https://blogcdn.acohome.cn/demo-draft-1.jpg")
);

article.add(new Title("h3", "列表"));
let ol = new List("ol", [
  "权力的游戏",
  "列王的纷争",
  "冰雨的风暴",
  "群鸦的盛宴",
  "魔龙的狂舞"
]);
ol.addInto(article);

let ul = new List("ul", [
  "琼恩·雪诺",
  "丹妮莉丝·坦格利安",
  "艾莉亚·史塔克",
  "提利昂·兰尼斯特"
]);
ul.addInto(article);

article.add(new Title("h3", "段落"));
pledge.forEach((item) => {
  article.add(new Paragraph(item));
});

pledgeCn.forEach((item) => {
  article.add(new Paragraph(item));
});

article.add(new Title("h3", "图文混排"));
let para = new Paragraph("");
para.add(
  new InlineImage(
    "http://cdn.acohome.cn/1.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);
para.addText("Valar Morghulis");
para.add(
  new InlineImage(
    "http://cdn.acohome.cn/2.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);
para.addText("凡人皆有一死");
para.addInto(article);
para.add(
  new InlineImage(
    "http://cdn.acohome.cn/3.png?imageMogr2/auto-orient/thumbnail/x20"
  )
);

article.add(new Title("h3", "表格"));
let table = new Table(3, 3, [
  ["表头一", "表头二", "表头三"],
  ["1-1", "1-2", "1-3"],
  ["2-1", "2-2", "2-3"],
  ["3-1", "3-2", "3-3"]
]);
table.addInto(article);

let code = new Code(`function greeter(user) {
    return \`Hello, \${user}. welcome to zebra-draft.\`;
}

let user = "acccco";

document.body.innerHTML = greeter(user);
`);
code.addInto(article);

window.article = article;

window.clearArticle = () => {
  let dom = document.getElementById("root");
  dom.innerHTML = "";
};

window.showRaw = (raw) => {
  let article = createByRaw(raw);
  mount("root", article);
};

mount("root", article);

export default article;
