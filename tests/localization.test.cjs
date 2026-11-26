const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const folder = path.resolve(process.env.MACHELPER_PACKAGE_DIR || path.join(__dirname, '../MacHelperExtension'));
const languages = new Set(['en', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ar', 'hi', 'ru', 'it']);

function readJSON(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(folder, relativePath), 'utf8'));
}

test('the extension provides every display label and selection command title in all 13 languages', () => {
  const manifest = readJSON('extension.json');
  const { translations } = readJSON(manifest.localizations);
  const { fields } = readJSON(manifest.settingsSchema);
  const required = [
    manifest.summary,
    ...fields.map(field => field.label),
    ...manifest.commands.map(command => command.title)
  ];

  assert.deepEqual(new Set(Object.keys(translations)), languages);
  for (const [language, strings] of Object.entries(translations)) {
    for (const label of required) {
      assert.ok(typeof strings[label] === 'string' && strings[label].trim(),
        `Missing ${language} translation for "${label}"`);
    }
  }
});
