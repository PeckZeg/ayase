import { ComponentPublicInstance, RendererElement, VNode } from 'vue';

export type ClassList = string | object | Array<ClassList>;

export type EventHandler<E extends Event> = (event: E) => void;
export type ClipboardEventHandler = EventHandler<ClipboardEvent>;
export type CompositionEventHandler = EventHandler<CompositionEvent>;
export type DragEventHandler = EventHandler<DragEvent>;
export type FocusEventHandler = EventHandler<FocusEvent>;
export type KeyboardEventHandler = EventHandler<KeyboardEvent>;
export type MouseEventHandler = EventHandler<MouseEvent>;
export type TouchEventHandler = EventHandler<TouchEvent>;
export type PointerEventHandler = EventHandler<PointerEvent>;
export type UIEventHandler = EventHandler<UIEvent>;
export type WheelEventHandler = EventHandler<WheelEvent>;
export type AnimationEventHandler = EventHandler<AnimationEvent>;
export type TransitionEventHandler = EventHandler<TransitionEvent>;

export type VueKey = NonNullable<VNode['key']>;

export type VueInstance = ComponentPublicInstance<any> | RendererElement;
