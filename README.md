# jMonkeyEngine Publish To Library Action

A github action to publish to [jMonkeyEngine Library](https://library.jmonkeyengine.org) with ease.


## Usage

### 1. Create the credentials
Log In to [library.jmonkeyengine.org ](https://library.jmonkeyengine.org), open the user area, scroll down and create a new `Auth Key` for GitHub Actions, like in the screenshot below

![1](screenshot/Screenshot%20from%202022-06-30%2015-19-11.png)

- **UserID**: fixed and is the ID of your account
- **AuthID**: an unique alpha-numeric string that represent the key, like an username
- **AuthKey**: a randomly generated passphrase 
- **Description** " an arbitrary text to remind what the key was made for, you can write whaterver you want or leave it empty
- **IPs**: CSV whitelist of  ips that can use this Auth Key. Leave it empty to allow all.

Save somewhere the `UserID`, `AuthID` and `AuthKey` values as you will need them in the next step. Then click the **+** button.


### 2. Add the secrets to the repo
You need to add the credentials to your github repo as secrets (see [Encrypted secrets
](https://docs.github.com/en/actions/security-guides/encrypted-secrets)).

Create the following secrets using the values obtained in the previous step:
- LIBRARY_USER_ID = UserID
- LIBRARY_AUTH_ID = AuthID
- LIBRARY_AUTH_KEY = AuthKey


### 3. Add to Github Actions workflow
Append this snippet to your workflow yaml to update the library on every new release

```yaml
      - name: Publish to jMonkeyEngine Library
        if: github.event_name == 'release'
        uses: jMonkeyEngine/jme-library-publish-action@1.0
        with:
          userId: ${{ secrets.LIBRARY_USER_ID }}
          authId: ${{ secrets.LIBRARY_AUTH_ID }}
          authKey: ${{ secrets.LIBRARY_AUTH_KEY }}
          token: ${{ secrets.GITHUB_TOKEN }}
```
By default this action will use the Github Importer to figure out most of the data by itself. 


### 4. Manual/Tweaked configuration
The GitHub importer tries its best to figure out as much as possible from the repo, however there might be some data that needs to be configured manually.

You can do that from the [library.jmonkeyengine.org](https://library.jmonkeyengine.org) web ui or by passing an `entry.json` file (built by following the [entry/set/request api](https://library.jmonkeyengine.org/apidoc/entry/set/request)) to the action using the `data` param.


For example, let's say we want to enable `funding` for our entry.
To do that we need to add an `entry.json` file to our repo, with the following content:
```json
{
    "funding": true
}
```

and then set the action as follows:
```yaml
      - name: Publish to jMonkeyEngine Library
        if: github.event_name == 'release'
        uses: jMonkeyEngine/jme-library-publish-action@1.0
        with:
          userId: ${{ secrets.LIBRARY_USER_ID }}
          authId: ${{ secrets.LIBRARY_AUTH_ID }}
          authKey: ${{ secrets.LIBRARY_AUTH_KEY }}
          token: ${{ secrets.GITHUB_TOKEN }}
          data: "./entry.json"
```

additionally we can use `entry.json` to override the data imported by the github importer.

For example, we can specify a `name` field to override the entry name on the library page.


Finally, if we can set `fetch-repo` to `nil` to disable the Github Importer entirely and use only the data from the provided `entry.json`.

## Advanced usage
See [action.yaml](action.yml) for a list of supported params.
