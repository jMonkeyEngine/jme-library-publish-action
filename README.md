# jMonkeyEngine Publish To Library Action

A github action to publish to [jMonkeyEngine Library](https://library.jmonkeyengine.org) with ease.


## Usage

There is some configuration needed to use this action, but luckily the  [library](https://library.jmonkeyengine.org) can generate most of it automatically.

First you need to either open an existing entry in edit mode

![Edit Button](screenshot/Screenshot%20from%202022-07-20%2019-00-41.png)


or create a new one 

![The New Entry Button](screenshot/Screenshot%20from%202022-07-20%2019-00-19.png)

Then in the edit page you will find this button

![Github Action Snippet Button](screenshot/Screenshot%20from%202022-07-20%2019-00-11.png)

that you can press to generate a preconfigured snippet and secret to use in your repo.








## Manual/Tweaked configuration

The GitHub importer tries its best to figure out as much as possible from the repo, however there might be some data that needs to be configured manually.

You can do that from the [library.jmonkeyengine.org](https://library.jmonkeyengine.org) web ui or by passing an `entry.json` file (built by following the [entry/set/request api](https://library.jmonkeyengine.org/apidoc/entry/set/request)) to the action using the `data` param.

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

For example, we can specify a `name` field to override the entry name on the library page:

```json
{
  "name": "something something"
}
```


Finally, to disable  the github importer entirely, you can set `fetch-repo` to `nil`. In this case only the data provided by the`entry.json` will be used.



## Advanced usage
See [action.yaml](action.yml) for a list of supported params.