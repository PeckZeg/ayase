import { VueInstance, VueKey } from '@ayase/vc-util/lib/types';
import { VNode } from 'vue';

export type RenderIconType = VNode | ((props: any) => VNode);

export interface MenuInfo {
  key: VueKey;
  keyPath: VueKey[];
  item: VueInstance;
  domEvent: MouseEvent;
}

export interface SelectInfo extends MenuInfo {
  selectedKeys?: VueKey[];
}

export type SelectEventHandler = (info: SelectInfo) => void;
export type HoverEventHandler = (info: { key: VueKey; hover: boolean }) => void;
export type MenuHoverEventHandler = (info: {
  key: VueKey;
  domEvent: MouseEvent;
}) => void;
export type MenuClickEventHandler = (info: MenuInfo) => void;
export type DestroyEventHandler = (key: VueKey) => void;

export type OpenEventHandler = (
  keys:
    | VueKey[]
    | {
        key: VueKey;
        item: VueInstance;
        trigger: string;
        open: boolean;
      }
) => void;

export type MenuMode =
  | 'horizontal'
  | 'vertical'
  | 'vertical-left'
  | 'vertical-right'
  | 'inline';

export type OpenAnimation = string | Record<string, any>;

export interface MiniStore {
  getState: () => any;
  setState: (state: any) => void;
  subscribe: (listener: () => void) => () => void;
}

export type LegacyFunctionRef = (node: VueInstance) => void;

export type BuiltinPlacements = Record<string, any>;

export type TriggerSubMenuAction = 'click' | 'hover';
