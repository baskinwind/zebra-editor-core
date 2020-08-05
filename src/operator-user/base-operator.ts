abstract class BaseOperator {
  protected constructor() {}
  abstract onBlur(event: FocusEvent): void;
  abstract onClick(event: MouseEvent): void;
  abstract onPaste(event: ClipboardEvent): void;
  abstract onCut(event: ClipboardEvent): void;
  abstract onCompositionStart(event: CompositionEvent): void;
  abstract onCompositionEnd(event: CompositionEvent): void;
  abstract onBeforeInput(event: InputEvent): void;
  abstract onInput(event: InputEvent): void;
  abstract onKeyDown(event: KeyboardEvent): void;
  abstract handleFunctionKey(event: KeyboardEvent): void;
}

export default BaseOperator;
