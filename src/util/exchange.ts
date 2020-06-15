import List from "../components/list";
import Title from "../components/title";
import Paragraph from "../components/paragraph";
import Code from "../components/code";
import exchangeComponent from "../selection-operator/exchange-component";

type exchangeType = 'paragraph' | 'title' | 'list' | "code";

const classMap = {
  paragraph: Paragraph,
  title: Title,
  list: List,
  code: Code
};

const exchange = (type: exchangeType, args: any[]) => {
  exchangeComponent(classMap[type] || Paragraph, args);
};

export default exchange;