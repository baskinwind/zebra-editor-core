import Character from "../components/character";
import Collection from "../components/collection";

export const inParagraph = (
  key: string,
  component: Collection<any>,
  start: number,
  end: number = start
) => {
  if (key.length === 1) {
    component.addChildren(new Character(key), start);
    return;
  }
  if (key === "Backspace") {
    if (start === end) {
      start = start - 1;
    }
    component.removeChildren(start, end - start);
    return;
  }
  if (key === "Enter") {
  }
};

export const inImage = (key: string, component: Collection<any>) => {
  if (key === "Backspace") {
    component.removeSelf();
    let dom = document.getElementById(component.id);
    dom?.remove();
    return;
  }
};
