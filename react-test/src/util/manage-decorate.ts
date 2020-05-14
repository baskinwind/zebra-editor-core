const store: { [key: string]: any } = {};

export function saveDecorate(decorate: any) {
  store[decorate.id] = decorate;
}

export function getDecorateById(id: string) {
  return store[id];
}
