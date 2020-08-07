import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

interface IGetExistsFile {
  cwd: string;
  files: string[];
  returnRelative?: boolean;
}

export function log(...data: any[]) {
  console.log('🦄', '', chalk.cyan.underline('ayase'), '', ...data);
}

export function getExistsFile(opts: IGetExistsFile) {
  const { cwd, files, returnRelative } = opts;

  for (const file of files) {
    const absFilePath = path.join(cwd, file);

    if (fs.existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}
