import { PluginPass as LegacyPluginPass } from '@babel/core';

export interface PluginPass extends LegacyPluginPass {
  set: (key: any, val: any) => void;
  get: <T>(key: any) => T;
}
