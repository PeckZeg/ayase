import _ from 'lodash';

export const pascalCase: (string?: string) => string = _.flow([
  _.camelCase,
  _.upperFirst
]);
