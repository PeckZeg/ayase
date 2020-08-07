import path from 'path';
import fs from 'fs';

const cwd = process.cwd();

function replacePath(pathname: any) {
  if (pathname.node.source && /\/lib\//.test(pathname.node.source.value)) {
    const esModule = pathname.node.source.value.replace('/lib/', '/es/');
    const esPath = path.dirname(path.join(cwd, `node_modules/${esModule}`));
    if (fs.existsSync(esPath)) {
      console.log(
        `[es build] replace ${pathname.node.source.value} with ${esModule}`
      );
      pathname.node.source.value = esModule;
    }
  }
}

export default function replaceLib() {
  return {
    visitor: {
      ImportDeclaration: replacePath,
      ExportNamedDeclaration: replacePath
    }
  };
}
