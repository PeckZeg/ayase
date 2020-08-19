import _ from 'lodash';

export const pascalCase: (string?: string) => string = _.flow([
  _.camelCase,
  _.upperFirst
]);

export function toEmitsList(...listeners: string[]) {
  return listeners.reduce<string[]>((acc, name) => {
    name = name.replace(/^on/, '');

    acc.push(_.camelCase(name), _.kebabCase(name));

    return acc;
  }, []);
}
