import ComponentMap from "../const/component-map";

const createByRaw = (raw: any) => {
  if (!raw.type) return;
  let creator = ComponentMap[raw.type];
  return creator.create(raw);
};

export default createByRaw;