# Translation for MacHelper

Translate selected text and look up a word in its sentence with the AI service
configured in MacHelper. Choose a target language and edit the two prompts in
the tool's settings. Translation displays a read-only result.

Translation requires MacHelper 4.5 or later. Localized settings labels require
MacHelper 6.2 or later. See the [tool guide](MacHelperExtension/README.md) for
word lookup, prompt editing, and text-selection support.

## Install from source

In MacHelper, open **Settings → Extensions → Install Source…** and select the
[MacHelperExtension](MacHelperExtension/) folder. Review the permissions and
enable the tool. MacHelper copies the source into its editable installation.
For a marketplace installation, open **Settings → Extensions → Marketplace…**.

## Build and test

```sh
python3 scripts/build-package.py
node --test tests/*.test.cjs
```

These commands use Python 3 and Node.js 18+ standard libraries. They work
offline from a copy of this repository. To install the ZIP in `dist/`, extract
it and select the folder that contains `extension.json` in MacHelper. The
tests exercise the JavaScript commands and prompts with a fixture AI
provider. Use installed MacHelper for the floating toolbar and real provider.

`MacHelperExtension/` contains the extension manifest, script, editable
prompts, settings schema, localizations, and discovery metadata. Its
`marketplace/` folder supplies the listing artwork and localized previews.
The ZIP contains the files MacHelper imports.

## Publish a new version

Bump `MacHelperExtension/extension.json` and the version in the package README.
Run the tests, build the package, and commit the reviewed source. Register the
GitHub link to `MacHelperExtension/` at that exact commit using the
[Extension Market publisher instructions](https://github.com/bosstwobread/LocalAIBaseTools/blob/main/ExtensionMarket-website/README.md#publish-a-tool).
The publisher builds the install inventory and the discovery listing from the
commit.

See the [MacHelper extension guide](https://github.com/bosstwobread/LocalAIBaseTools/blob/main/AI_EXTENSION_GUIDE.md)
for the JavaScript API and permissions. The MIT license is in [LICENSE](LICENSE).
