import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getUserInfo } from '../src/user-info.mjs';

describe('getUserInfo', function () {
  it('gets user info', async function () {
    const user_info = await getUserInfo({
      user:    'haarg',
      noreply: true,
    });
    expect(user_info).to.include({
      email: '50029+haarg@users.noreply.github.com',
      id:    50029,
      login: 'haarg',
    });
  });
});
