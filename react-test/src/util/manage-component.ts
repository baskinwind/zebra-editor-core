const store: { [key: string]: any } = {};

export function saveComponent(component: any) {
  store[component.id] = component;
}

export function getComponentById(id: string) {
  return store[id];
}
