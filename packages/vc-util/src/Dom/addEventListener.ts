// TODO: support `Window`
export default function addEventListenerWrap<
  K extends keyof HTMLElementEventMap
>(
  target: HTMLElement,
  eventType: K,
  callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  option?: boolean | AddEventListenerOptions
) {
  if (target.addEventListener) {
    target.addEventListener<K>(eventType, callback, option);
  }

  return {
    remove: () => {
      if (target.removeEventListener) {
        target.removeEventListener<K>(eventType, callback);
      }
    }
  };
}
