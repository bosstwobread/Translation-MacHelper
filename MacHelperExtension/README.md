# Translation — editable source extension

Translation 4.5.9 requires MacHelper 4.5 or later for translation, and MacHelper 6.2 or later for localized interface labels. This folder is its complete JavaScript source, manifest, settings schema, prompts, UI translations, searchable discovery metadata, and license. It needs no separate app or compiler. It requests only selection, AI, and result-panel permissions; the unused clipboard-reading declaration has been removed. Copying a finished result remains an explicit user action.

The manifest declares `assets/icon.png` as the icon for the MacHelper extension list.

MacHelper's interface language is chosen under General and is separate from this tool's target language. The extension owns `localizations.json`, which translates its description and settings labels into 13 interface languages. Prompt source files stay exactly as authored; changing the interface language never rewrites prompts or changes the target language.

Enable Translation in **MacHelper → Extensions**, then choose it from the installed list. Select text in a supported Mac app and click the floating icon. Results stream into a nearby panel; drag its header to move it without interrupting the response. Copy is available after completion. Esc, selection changes, and app switching dismiss/cancel the result.

MacHelper 6.7 can automatically copy and restore the clipboard when a recognized text-selection gesture cannot be read through Accessibility. No manual compatibility switch is needed. The host skips unsafe, stale, unreadable, or oversized cases and never copies from ordinary clicks or polling. Capture-only text supports previews and the completed result’s Copy button, without sentence context; it cannot authorize replacement by itself. Translation is read-only. Before any Copy attempt, bounded preparation checks briefly let the selection, menu, and clipboard settle. A Copy attempt is never retried. The host keeps the snapshot in memory and avoids overwriting later clipboard changes. Preservation and app coverage are best effort; clipboard-history tools may observe temporary changes. The extension has no clipboard-reading or arbitrary keyboard API.

## Edit the actual prompts

The **Translation prompt** and **Word lookup prompt** text boxes show `prompts/translate.txt` and `prompts/word-in-context.txt` directly. Save an edit to update that source file and reload the tool. Unsaved edits can be reverted. Prompts are not copied into the preferences file. Saving refuses conflicting external edits rather than overwriting them.

Each AI call sends the chosen prompt file verbatim in `systemPrompt`. MacHelper adds no translation instructions, style suffix, or action/tone wrapper to this explicit-prompt path. Selected content and settings are separate user-message data:

- Normal selections: a JSON object containing `text` and `targetLanguage`.
- One selected word: a JSON object containing `selectedWord`, `surroundingSentence`, `targetLanguage`, and localized `labels` (`meaning`, `sentence`, `word`, and `unavailable`).

The default prompts explain these data fields, treat selected content as untrusted, and request translation or word meaning. Change the prompt to change those instructions. Shared provider tools remain disabled independently of the prompt. The returned text and streamed text are displayed without extra prefixes or notes added by the tool.

There is no Writing style preset. Any desired tone or output format belongs in the prompt. Changing the target-language selector changes input data, not the prompt text.

## Selected words

One lexical word uses the supplied sentence to explain its contextual meaning, then translate the full sentence. The default word prompt requests the localized section headings from `labels`. Contractions and hyphenated words are supported. Unspaced-script selections use word segmentation when available so a whole phrase does not become a word lookup.

If context is unavailable, invalid, oversized, or unrelated to the word, `surroundingSentence` is `null`. The default prompt requests general meanings and the localized context-unavailable note without inventing a sentence. Word lookup is limited to 128 UTF-16 units; context is limited to 2,000 UTF-16 units and 8,000 UTF-8 bytes. Longer selections use ordinary translation.

## Source files and reload

- `main.js`: word detection, input-data construction, AI call, and streaming.
- `prompts/translate.txt`: complete ordinary-translation instructions.
- `prompts/word-in-context.txt`: complete word-lookup instructions.
- `settings.schema.json`: target-language choices and source-backed prompt editors.
- `extension.json`: identity, commands, runtime, and declared capabilities.
- `LICENSE`: MIT license.

**Edit Source** opens the installed working folder in VS Code when available. Saving JavaScript, prompts, or schemas starts a validated new worker generation. Invalid edits retain the last working generation, and settings remain separate from source. Explicit prompt saves also work while the tool is disabled without starting JavaScript or requesting AI.

`MacHelper.define` registers commands, `MacHelper.readText` reads frozen resources from the current generation, and `MacHelper.ai.transform` requests shared AI only during an explicit action. Its progress callback passes cumulative output to `input.reportProgress`. Cancellation, source reload, or a changed selection prevents stale output from replacing a newer result.

The marketplace catalog includes every source file with its SHA-256. Existing editable installations are not overwritten by repeat marketplace installs. Older published source versions remain available at their immutable URLs. See the [MacHelper source extension contract](https://github.com/bosstwobread/LocalAIBaseTools/blob/main/docs/Source-Extensions.md) for the format and protocol.

Public listing and search text belong in `discovery.json`, including capabilities, example needs, keywords, limitations, and translations. The Extension Market searches the lightweight catalog without downloading extension source. Its explicit AI search connects directly to the local service inside MacHelper 6.5 or later, without a browser Connector. Installed prompts and behavior remain independent. Metadata edits require a new package version when published.
