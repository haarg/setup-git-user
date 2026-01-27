export const getUserInfo = async function ({ token, user, app, jwt, noreply }) {
  if ((app && (jwt || user))
    || (jwt && (app || user))
    || (user && (app || jwt))
  ) {
    throw new Error('Only one of app, user, or jwt can be set!');
  }

  if (jwt) {
    const resp = await fetch('https://api.github.com/app', {
      headers: {
        'Accept':               'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization':        `Bearer ${jwt}`,
      },
    });
    const slug = resp.json().slug;

    if (!slug) {
      throw new Error('Unable to find app!');
    }
  }
  else if (app) {
    const slug = app.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    user = `${slug}[bot]`;
  }
  else if (!user) {
    throw new Error('app, user, or jwp must be specified!');
  }

  const token_header = token ? {
    Authorization: `token ${token}`,
  } : {};

  const resp = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
    headers: {
      'Accept':               'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...token_header,
    },
  });

  const user_resp_data = await resp.json();
  const user_data = {
    login: user,
    id:    user_resp_data.id,
    email: user_resp_data.email,
  };
  if (!user_resp_data.id) {
    throw new Error('Unable to find user!');
  }
  if (!user_data.email || noreply) {
    user_data.email = `${user_resp_data.id}+${user}@users.noreply.github.com`;
  }
  if (user_resp_data.name) {
    user_data.name = user_resp_data.name;
  }
  return user_data;
};
