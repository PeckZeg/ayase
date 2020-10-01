import AJV from 'ajv';
import slash from 'slash2';
import { relative } from 'path';
import schema from './schema';
import { getExistFile } from './utils';
function testDefault(obj) {
  return obj.default || obj;
}
export const CONFIG_FILES = [
  '.ayaserc.js',
  '.ayaserc.jsx',
  '.ayaserc.ts',
  '.ayaserc.tsx'
];
export default function ({ cwd }) {
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false
  });
  if (configFile) {
    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
    userConfigs.forEach((userConfig) => {
      const ajv = new AJV({ allErrors: true });
      const isValid = ajv.validate(schema, userConfig);
      if (!isValid) {
        const errors = ajv.errors.map(({ dataPath, message }, index) => {
          return `${index + 1}. ${dataPath}${dataPath ? ' ' : ''}${message}`;
        });
        throw new Error(
          `
Invalid options in ${slash(relative(cwd, configFile))}

${errors.join('\n')}
`.trim()
        );
      }
    });
    return userConfig;
  } else {
    return {};
  }
}
