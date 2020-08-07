import path from 'path';

const cwd = process.cwd();

export const paths = {
  appDir: path.join(__dirname, '../template/docs'),
  appSrc: path.join(__dirname, '../template/docs'),
  appIndexJs: path.join(__dirname, '../template/docs/index'),
  appPublic: path.join(__dirname, '../template/docs/public'),
  appIndexHtml: path.join(__dirname, '../template/docs/index.html'),
  appDocs: path.join(cwd, 'docs'),
  appDist: path.join(cwd, 'site')
};
