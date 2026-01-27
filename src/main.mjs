import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { getUserInfo } from './user-info.mjs';

async function run() {
  const inputs = {
    token:   core.getInput('token'),
    user:    core.getInput('user'),
    app:     core.getInput('app'),
    jwt:     core.getInput('jwt'),
    noreply: core.getBooleanInput('always-noreply'),
  };

  const user_info = await getUserInfo(inputs);

  core.setOutput('user-login', user_info.login);
  core.setOutput('user-name', user_info.name);
  core.setOutput('user-id', user_info.id);
  core.setOutput('user-email', user_info.email);

  core.setOutput('user-full', `${user_info.name} <${user_info.email}>`);

  if (core.getBooleanInput('config-global')) {
    await exec.exec('git', ['config', '--global', 'user.name', user_info.name]);
    await exec.exec('git', ['config', '--global', 'user.email', user_info.email]);
  }
  if (core.getBooleanInput('config-local')) {
    await exec.exec('git', ['config', 'user.name', user_info.name]);
    await exec.exec('git', ['config', 'user.email', user_info.email]);
  }
}

export default async () => {
  try {
    await run();
  }
  catch (error) {
    core.setFailed(error.message);
  }
};
