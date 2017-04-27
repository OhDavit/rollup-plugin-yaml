"use strict";

import * as YAML from 'yamljs';
import toSource from 'tosource';
import {createFilter, makeLegalIdentifier} from 'rollup-pluginutils';

const ext = /\.ya?ml$/;
const parser = require('swagger-parser');

export default function yaml(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'yaml',
    transform (yaml, id) {
      return new Promise((resolve, reject) => {
          parser.dereference(yaml)
          .then((api) => {
          if (!ext.test(id)) return resolve(null);
      if (!filter(id)) return resolve(null);

      var data = YAML.parse(api);
      var keys = Object.keys(data).filter(function (key) {
        return key === makeLegalIdentifier(key);
      });

      var code = "var data = " + (toSource(data)) + ";\n\n";

      var exports = ['export default data;'].concat(
        keys.map(function (key) {
          return ("export var " + key + " = data." + key + ";");
        })
      ).join('\n');

      return resolve({
        code: code + exports,
        map: {mappings: ''}
      })
    }).catch(() => {
        resolve(null);
    });
    });
    }
  };
}
