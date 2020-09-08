import { VNodeNormalizedChildren } from '@vue/runtime-core';
import { CSSProperties, VNode, isVNode } from 'vue';
import { VueKey } from '@ayase/vc-util/lib/types';

import isMobile from './utils/isMobile';

export function noop() {}

export function getKeyFromChildrenIndex(
  child: VNode,
  menuEventKey: VueKey,
  index: number
) {
  const prefix = menuEventKey || '';
  return child.key || `${prefix}item_${index}`;
}

export function getMenuIdFromSubMenuEventKey(eventKey: string): VueKey {
  return `${eventKey}-menu-`;
}

export function loopMenuItem(
  children: VNode[],
  cb: (node: VNode, index: number) => void
) {
  let index = -1;

  children.forEach((c) => {
    index += 1;

    if ((c?.type as any).isMenuItemGroup) {
      let menuItemGroupChildren: VNode[];

      if (c.children == null) {
        // skip...
      }

      // handle string
      else if (typeof c.children === 'string') {
        menuItemGroupChildren = [c.children as any];
      }

      // handle RawSlot
      else if (typeof (c.children as any).default === 'function') {
        menuItemGroupChildren = (c.children as any).default();
      } else if (Array.isArray(c.children)) {
        menuItemGroupChildren = c.children as any;
      }

      if (menuItemGroupChildren) {
        menuItemGroupChildren.forEach((c2) => {
          index += 1;
          cb(c2, index);
        });
      }
    } else {
      cb(c, index);
    }
  });
}

export function loopMenuItemRecursively(
  children: VNodeNormalizedChildren,
  keys: VNode['key'][],
  ret: { find: boolean }
) {
  if (!children || typeof children === 'string' || ret.find) {
    return;
  }

  if (Array.isArray(children)) {
    children.forEach((c: VNode) => {
      if (!isVNode(c)) {
        return;
      }

      const construct = c.type as {
        isSubMenu: boolean;
        isMenuItem: boolean;
        isMenuItemGroup: boolean;
      };

      if (
        !construct ||
        !(
          construct.isSubMenu ||
          construct.isMenuItem ||
          construct.isMenuItemGroup
        )
      ) {
        return;
      }

      if (keys.indexOf((c as any).key) !== -1) {
        ret.find = true;
      } else if (c.children) {
        loopMenuItemRecursively(c.children, keys, ret);
      }
    });
    return;
  }

  if (typeof (children as any).default === 'function') {
    loopMenuItemRecursively((children as any).default(), keys, ret);
  }
}

export const menuAllProps = [
  'defaultSelectedKeys',
  'selectedKeys',
  'defaultOpenKeys',
  'openKeys',
  'mode',
  'getPopupContainer',
  'onSelect',
  'onDeselect',
  'onDestroy',
  'openTransitionName',
  'openAnimation',
  'subMenuOpenDelay',
  'subMenuCloseDelay',
  'forceSubMenuRender',
  'triggerSubMenuAction',
  'level',
  'selectable',
  'multiple',
  'onOpenChange',
  'visible',
  'focusable',
  'defaultActiveFirst',
  'prefixCls',
  'inlineIndent',
  'parentMenu',
  'title',
  'rootPrefixCls',
  'eventKey',
  'active',
  'onItemHover',
  'onTitleMouseEnter',
  'onTitleMouseLeave',
  'onTitleClick',
  'popupAlign',
  'popupOffset',
  'isOpen',
  'menuItem',
  'manualRef',
  'subMenuKey',
  'disabled',
  'index',
  'isSelected',
  'store',
  'activeKey',
  'builtinPlacements',
  'overflowedIndicator',
  'motion',

  // the following keys found need to be removed from test regression
  'attribute',
  'value',
  'popupClass',
  'inlineCollapsed',
  'menu',
  'theme',
  'itemIcon',
  'expandIcon'
];

// ref: https://github.com/ant-design/ant-design/issues/14007
// ref: https://bugs.chromium.org/p/chromium/issues/detail?id=360889
// getBoundingClientRect return the full precision value, which is
// not the same behavior as on chrome. Set the precision to 6 to
// unify their behavior
export const getWidth = (elem: HTMLElement, includeMargin: boolean = false) => {
  let width =
    elem &&
    typeof elem.getBoundingClientRect === 'function' &&
    elem.getBoundingClientRect().width;

  if (width) {
    if (includeMargin) {
      const { marginLeft, marginRight } = getComputedStyle(elem);
      width += +marginLeft.replace('px', '') + +marginRight.replace('px', '');
    }

    width = +width.toFixed(6);
  }
  return width || 0;
};

export const setStyle = (
  elem: HTMLElement,
  styleProperty: keyof CSSProperties,
  value: string | number
) => {
  if (elem && typeof elem.style === 'object') {
    elem.style[styleProperty] = value;
  }
};

export const isMobileDevice = (): boolean => isMobile.any;
