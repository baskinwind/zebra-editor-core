## 2020-05-13

根据鼠标的行为获取 contenteditadble 容器中的选区。

通过 getSelection 获取选区对象，标准 section 对象内容如下：

```typescript
{
  anchorNode: HTMLElement | Node | null;    // 选区开始的节点
  anchorOffset: number;                     // 开始点在节点中的位置
  focusNode: HTMLElement | Node | null;     // 选区结束的节点
  focusOffset: number;                      // 结束点在节点中的位置
  isCollapsed: boolean;                     // 选区是否是闭合的，true 为光标，false 为选区
  rangeCount: number;                       // 选区的个数
}
```

### 开始（结束）节点以及偏移量的获取

1. 通过 anchorNode 获取该内容所在的最顶级的块级内容：anchorParent。
2. 在 anchorParent 的子节点中，过滤出 anchorNode 所在节点之前的所有子节点。
3. 获取这些子节点的长度 + anchorOffset 即为开始点距离父节点开始位置的偏移量。
4. inline 的图片需要特殊处理。

### 文件

src/selection-operator/base.ts#flushRangeBase

## 2020-05-14

处理点击图片选区未选中的问题。

### 问题

在 contenteditadble 容器中直接点击图片元素各浏览器的行为不一致。

浏览器效果，以及 getSelection 获得的内容（仅截取了标准属性）。

- firefox 完美！直接选中该图片。返回：

```javascript
{
  anchorNode: '<figure id="vX9v9MpJRxY" data-type="IMAGE">',
  anchorOffset: 0,
  focusNode: '<figure id="vX9v9MpJRxY" data-type="IMAGE">',
  focusOffset: 1,
  isCollapsed: false,
  rangeCount: 1,
  type: "Range",
}
```
注：anchorNode，focusNode 为真实的节点。

- chrome 不符合预期：未选中。返回：

```javascript
{
  anchorNode: null,
  anchorOffset: 0,
  focusNode: null,
  focusOffset: 0,
  isCollapsed: true,
  rangeCount: 0,
  type: "None"
}
```

- safari 与 chrome 的效果一致。
- ie 不考虑

### 解决方案

往 firefox 靠拢，如果点击到了图片，做如下处理：

1. 创建选区对象：[Range](https://developer.mozilla.org/zh-CN/docs/Web/API/Range/Range)
2. 将点击到的图片节点放入选区对象。
3. 将 Range 放入 [window.getSelection()](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection)
4. 获取选中内容获得光标的所在位置。

兼容代码如下：

```javascript
fixImageClick(event: MouseEvent) {
  let target: HTMLElement = event.target as HTMLElement;
  if (target && target.nodeName === "IMG") {
    let section = window.getSelection();
    let range = document.createRange();
    range.selectNode(target);
    section?.addRange(range);
  }
  // ... 原本的处理逻辑
},
```