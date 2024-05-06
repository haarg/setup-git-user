# setup-git-user

GitHub action to configure git with a name and email corresponding to a GitHub
user or app.

For users, the user's public email and name will be used by default.

For apps, or if the user's email is not public, an email of the form
`123456+user-name@users.noreply.github.com` will be used.

The email address configured should allow GitHub to link commits created to
the given user or app.

# Usage

Authenticating as an app and configuring git to use a matching user:

```yaml
  - name: Generate Auth Token
    id: app-token
    uses: actions/create-github-app-token@v1
    with:
      app-id: '123456'
      private-key: ${{ secrets.MY_GH_APP_PRIVATE_KEY_SECRET }}
  - uses: haarg/setup-git-user@v1
    with:
      app: ${{ steps.app-token.output.app-slug }}
```

Authenticating as an app and using its JWT token:
```yaml
  - name: Generate JWT and token
    id: generate-github-app-tokens
    uses: jamestrousdale/github-app-jwt-token@0.1.4
    with:
      app-id: '123456'
      private-key: ${{ secrets.MY_GH_APP_PRIVATE_KEY_SECRET }}
  - uses: haarg/setup-git-user@v1
    with:
      jwt: ${{ steps.generate-github-app-tokens.output.jwt }}
```

Configuring git with a specific user's details:

```yaml
  - uses: haarg/setup-git-user@v1
    with:
      user: haarg
```

# Inputs

One of 'user', 'app', or 'jwt' must be configured. For other inputs, see
[action.yml].

# Outputs

See [action.yml].
