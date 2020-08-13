import gulpTs, { Settings as GulpTsSettings } from 'gulp-typescript';
import getBabelConfig from './getBabelConfig';
import * as babel from '@babel/core';
import through from 'through2';
import signale from 'signale';
import gulpIf from 'gulp-if';
import ts from 'typescript';
import rimraf from 'rimraf';
import vfs from 'vinyl-fs';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

interface IBabelOpts {
  cwd: string;
  type: 'esm' | 'cjs';
  importLibToEs?: boolean;
  log: (...data: any[]) => void;
}

interface ITransformOpts {
  type: 'esm' | 'cjs';
  file: {
    contents: string;
    path: string;
  };
}

function parseTsconfig(file: string) {
  const readFile = (file: string) => fs.readFileSync(file, 'utf8');
  const result = ts.readConfigFile(file, readFile);

  if (result.error) {
    return;
  }

  return result.config;
}

function getTsconfigCompilerOptions(file: string): GulpTsSettings {
  const config = parseTsconfig(file);
  return config ? config.compilerOptions : {};
}

function getTSConfig(cwd: string, rootPath?: string) {
  const tsconfigPath = path.join(cwd, 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    return getTsconfigCompilerOptions(tsconfigPath);
  }

  if (rootPath && fs.existsSync(path.join(rootPath, 'tsconfig.json'))) {
    return getTsconfigCompilerOptions(path.join(rootPath, 'tsconfig.json'));
  }

  return getTsconfigCompilerOptions(
    path.join(__dirname, '../template/tsconfig.json')
  );
}

function isTsFile(file: string) {
  return /\.tsx?/.test(file) && !file.endsWith('.d.ts');
}

function isTransform(file: string) {
  return /\.jsx?$/.test(file) && !file.endsWith('.d.ts');
}

export default async function (opts: IBabelOpts) {
  const { cwd, type, importLibToEs, log } = opts;

  const srcPath = path.join(cwd, 'src');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = path.join(cwd, targetDir);

  log(chalk.gray(`Clean ${targetDir} directory`));
  rimraf.sync(targetPath);

  function transform(opts: ITransformOpts) {
    const { file, type } = opts;

    const [babelOpts, isBrowser] = getBabelConfig({
      target: 'browser',
      type,
      typescript: true,
      runtimeHelpers: true
    });

    if (importLibToEs && type === 'esm') {
      babelOpts.plugins.push(require.resolve('../lib/importLibToEs'));
    }

    const relFile = file.path.replace(`${cwd}/`, '');
    log(
      `Transform to ${chalk.blue(type)} for ${chalk[
        isBrowser ? 'yellow' : 'blue'
      ](relFile)}`
    );

    return babel.transform(file.contents, {
      ...babelOpts,
      filename: file.path
    }).code;
  }

  function createStream(patterns: string[]) {
    const tsConfig = getTSConfig(cwd);

    return vfs
      .src(patterns, { allowEmpty: true, base: srcPath })
      .pipe(gulpIf((file) => isTsFile(file.path), gulpTs(tsConfig)))
      .pipe(
        gulpIf(
          (file) => isTransform(file.path),
          through.obj((file, env, cb) => {
            try {
              file.contents = Buffer.from(transform({ type, file }));
              file.path = file.path.replace(path.extname(file.path), '.js');
              cb(null, file);
            } catch (err) {
              signale.error(`Compiled faild: ${file.path}`);
              console.log(err);
              cb(null);
            }
          })
        )
      )
      .pipe(vfs.dest(targetPath));
  }

  return new Promise((resolve) => {
    const patterns = [
      path.join(srcPath, '**/*'),
      `!${path.join(srcPath, '**/fixtures{,/**}')}`,
      `!${path.join(srcPath, '**/demos{,/**}')}`,
      `!${path.join(srcPath, '**/tests{,/**}')}`,
      `!${path.join(srcPath, '**/*.mdx')}`,
      `!${path.join(srcPath, '**/*.md')}`,
      `!${path.join(srcPath, '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)')}`
    ];

    createStream(patterns).on('end', () => {
      resolve();
    });
  });
}
