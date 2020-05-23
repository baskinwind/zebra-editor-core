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

## 2020-05-15

### focusAt(componentId, offset)

将光标移动到某个组件的 offset 位置处。

由于 Range 只能支持选中 Node，因此需要将 offset 装换为某个具体 span 的偏移量。

1. 获取需要光标所在的 span 无内容是为父元素
2. 获取相对于改 span 的偏移量。
3. 清空 Selection 中的 Range
4. 创建 Range。
5. 设置 Range：setStart(xxx, 0) & setEnd(xxx, 偏移量)。
6. Range 闭合至终点。
7. 将该 Range 添加到 Selection 中。
8. 光标停留位置符合要求。

### Paragraph

1. 支持直接创建有内容的段落
2. 添加 addText 方法，支持在固定位置添加字符串内容
3. 添加 subParagraph 方法，将段落依据固定位置分为两个段落，并添加到父容器内
4. 添加 changeCharStyle 方法，支持修改段落内字符的样式
5. 修改 getContent 方法，支持根据字符的样式分隔字符串

### Collection

1. 优化 addChildren 实现，支持同时添加多个字组件。
2. 优化 removeChildren 实现，支持同时删除多个子组件。

### CharacterDecorate

1. 添加 isSame 实现，判断两个 CharacterDecorate 是否是一样的。

### customer

1. 添加 changeSelectionStyle，为选中的区域添加样式。

## 0516

1. 组件添加 update 方法，当组件内容发生变化时，会触发该方法。
2. 实现一个简单的事件触发器，当组价调用 update 方法时，会触发事件。
3. 处理 contenteditadble 的 keydown 事件，将需要处理的原生行为放在 selection-operator 文件夹内。
   1. on-click 当 contenteditadble 内触发点击时，需要做的行为
   2. on-keydown 当 contenteditadble 内触发 keydown 时需要的行为，目前以处理单个字符输入，Backspace，Enter（发生在同个段落内的行为），删除图片的逻辑（待完善）。
4. 优化分段 subParagraph 方法，将字符带样式转入下一个字符串
5. 统一事件触发行为，放在 event-handle 文件夹下
6. Operator（事件行为对象，在事件触发时会传入）添加 tiggerBy 属性，用于判断该修改由什么触发，inner 代表内部触发（不会触发事件）

## 0521

实现选中多行操作，删除输入等