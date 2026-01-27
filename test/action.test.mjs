import { describe, it } from 'mocha';
import { expect } from 'chai';

import { dirname, join as joinPath } from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

import esmock from 'esmock';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockAction = async (module) => {
  let outputs;
  let inputs;
  let failed;
  const actionConfig = yaml.load(await fs.readFile(joinPath(__dirname, '../action.yml'), 'utf8'));

  const getInput = (key, { required } = {}) => {
    const inputConfig = actionConfig.inputs[key];
    if (!inputConfig) {
      throw new Error(`invalid input ${key}`);
    }
    if (Object.hasOwn(inputs, key)) {
      return inputs[key];
    }
    else if (required) {
      throw new Error(`input ${key} is required but was not provided!`);
    }
    else if (Object.hasOwn(inputConfig, 'default')) {
      const def = inputConfig['default'];
      if (typeof def === 'string') {
        return def.replace(/\$\{\{.*?\}\}/g, '');
      }
      return def;
    }
    else {
      return '';
    }
  };

  const main = await esmock(module, {
    '@actions/core': {
      getInput:        (key, ...rest) => (getInput(key, ...rest) || '').trim(),
      getBooleanInput: (key, ...rest) => {
        const value = getInput(key, ...rest);
        if (value === true || value === false) {
          return value;
        }
        else if (value === 'true' || value === 'True' || value === 'TRUE') {
          return true;
        }
        else if (value === 'false' || value === 'False' || value === 'FALSE') {
          return false;
        }
        else {
          throw new Error(`invalid value for ${key}`);
        }
      },
      getMultilineInput: (key, ...rest) => (getInput(key, ...rest) || '').split(/\n/).map(t => t.trim()),
      setOutput:         (key, value) => { outputs[key] = value; },
      setFailed:         (message) => { failed = message; },
    },
  });
  return async (input) => {
    outputs = {};
    inputs = input;
    failed = undefined;
    await main();
    if (failed) {
      throw new Error(failed);
    }
    return {
      outputs,
    };
  };
};

const main = await mockAction('../src/main.mjs');

describe('GitHub action', function () {
  it('works with user', async function () {
    const { outputs } = await main({
      'user':           'haarg',
      'config-global':  false,
      'config-local':   false,
      'always-noreply': true,
    });
    expect(outputs).to.include({
      'user-email': '50029+haarg@users.noreply.github.com',
      'user-id':    50029,
      'user-login': 'haarg',
    });
  });
});
