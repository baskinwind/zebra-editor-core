import { getDefaultComponentFactory } from "../src";

let factory = getDefaultComponentFactory();
let article = factory.buildArticle();

const createArticle = (factory) => {
  let article = factory.buildArticle();

  let pledge = [
    "Night gathers, and now my watch begins.",
    "It shall not end until my death.",
    "I shall take no wife, hold no lands, father no children.",
    "I shall wear no crowns and win no glory.",
    "I shall live and die at my post.",
    "I am the sword in the darkness.",
    "I am the watcher on the walls.",
    "I am the fire that burns against the cold, the light that brings the dawn, the horn that wakes the sleepers, the shield that guards the realms of men.",
    "I pledge my life and honor to the Night's Watch, for this night and all the nights to come.",
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
    "我将生命与荣耀献给守夜人，今夜如此，夜夜皆然。",
  ];

  factory.buildHeading("h1", "A Song of Ice and Fire").addInto(article);
  factory.buildHeading("h2", "冰与火之歌").addInto(article);

  factory.buildHeading("h3", "图片").addInto(article);

  factory.buildMedia("image", "https://zebrastudio.tech/img/demo/img-1.jpg").addInto(article);

  factory.buildHeading("h3", "代码块").addInto(article);
  factory.buildCode(`document.body.innerHTML = greeter(user);`, "javascript").addInto(article);

  factory.buildHeading("h3", "列表").addInto(article);
  factory
    .buildList("ol", ["权力的游戏", "列王的纷争", "冰雨的风暴", "群鸦的盛宴", "魔龙的狂舞"])
    .addInto(article);

  factory
    .buildList("ul", ["琼恩·雪诺", "丹妮莉丝·坦格利安", "艾莉亚·史塔克", "提利昂·兰尼斯特"])
    .addInto(article);

  factory.buildHeading("h3", "段落").addInto(article);
  pledge.forEach((item) => {
    factory.buildParagraph(item).addInto(article);
  });

  pledgeCn.forEach((item) => {
    factory.buildParagraph(item).addInto(article);
  });

  factory.buildHeading("h3", "图文混排").addInto(article);

  let para = factory.buildParagraph("");
  factory.buildInlineImage("https://zebrastudio.tech/img/demo/emoji-1.png").addInto(para);
  para.addText(" Valar Morghulis ");
  factory.buildInlineImage("https://zebrastudio.tech/img/demo/emoji-2.png").addInto(para);
  para.addText(" 凡人皆有一死 ");
  factory.buildInlineImage("https://zebrastudio.tech/img/demo/emoji-3.png").addInto(para);
  para.addInto(article);

  factory.buildHeading("h3", "表格").addInto(article);
  factory
    .buildTable(
      3,
      3,
      ["表头一", "表头二", "表头三"],
      [
        ["1-1", "1-2", "1-3"],
        ["2-1", "2-2", "2-3"],
        ["3-1", "3-2", "3-3"],
      ],
    )
    .addInto(article);

  factory.buildParagraph().addInto(article);

  return article;
};

export default createArticle;
