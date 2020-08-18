window.requestAnimationFrame = (func) => {
  window.setTimeout(func, 16);
};
