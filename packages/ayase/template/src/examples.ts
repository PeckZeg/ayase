import path from 'path';

// @ts-ignore
const context = require.context('@/examples', false, /\.vue$/);

export default context
  .keys()
  .map((component) => [
    path.basename(component, path.extname(component)),
    context(component).default
  ]) as [string, any][];
