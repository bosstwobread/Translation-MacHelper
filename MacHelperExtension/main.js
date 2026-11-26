// This is the complete editable behavior of the Translation tool.
// Save this file to reload only Translation; MacHelper stays running.
const wordLabels = {
  "zh-CN": {meaning: "此处词义", sentence: "整句翻译", word: "词义", unavailable: "未能读取上下文句子，无法确定该词在当前语境中的具体含义。"},
  "zh-TW": {meaning: "此處詞義", sentence: "整句翻譯", word: "詞義", unavailable: "無法讀取上下文句子，因此無法確定這個詞在目前語境中的具體含義。"},
  en: {meaning: "Word meaning in this context", sentence: "Full sentence translation", word: "Word meaning", unavailable: "The surrounding sentence is unavailable, so the meaning in this specific context cannot be confirmed."},
  ja: {meaning: "この文での語の意味", sentence: "文全体の翻訳", word: "語の意味", unavailable: "前後の文を取得できないため、この文脈での具体的な意味は確認できません。"},
  ko: {meaning: "이 문맥에서의 단어 뜻", sentence: "전체 문장 번역", word: "단어 뜻", unavailable: "주변 문장을 읽을 수 없어 이 문맥에서의 정확한 뜻은 확인할 수 없습니다."},
  fr: {meaning: "Sens du mot dans ce contexte", sentence: "Traduction de la phrase complète", word: "Sens du mot", unavailable: "La phrase de contexte n’est pas accessible ; le sens précis dans ce contexte ne peut pas être confirmé."},
  de: {meaning: "Wortbedeutung in diesem Zusammenhang", sentence: "Übersetzung des ganzen Satzes", word: "Wortbedeutung", unavailable: "Der umgebende Satz ist nicht verfügbar; die genaue Bedeutung in diesem Zusammenhang lässt sich daher nicht bestätigen."},
  es: {meaning: "Significado de la palabra en este contexto", sentence: "Traducción de la oración completa", word: "Significado de la palabra", unavailable: "La oración de contexto no está disponible, por lo que no se puede confirmar el significado específico en este contexto."},
  pt: {meaning: "Significado da palavra neste contexto", sentence: "Tradução da frase completa", word: "Significado da palavra", unavailable: "A frase de contexto não está disponível; não é possível confirmar o significado específico neste contexto."},
  it: {meaning: "Significato della parola in questo contesto", sentence: "Traduzione della frase completa", word: "Significato della parola", unavailable: "La frase di contesto non è disponibile; non è possibile confermare il significato preciso in questo contesto."}
};

function normalizedWord(value) {
  return value.normalize("NFC").replace(/[\u2019\u02bc]/g, "'").replace(/[\u2010\u2011]/g, "-").toLowerCase();
}

function segmentedWords(value) {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      return Array.from(new Intl.Segmenter(undefined, {granularity: "word"}).segment(value))
        .filter(part => part.isWordLike).map(part => part.segment);
    }
  } catch (_) { /* Unsupported segmentation falls back conservatively below. */ }
  return null;
}

function usesSpacelessScript(value) {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Lao}\p{Script=Myanmar}\p{Script=Khmer}]/u.test(value);
}

function isSingleWord(value) {
  if (value.length > 128) return false;
  // U+02BC is a Unicode Letter, but here it is an internal apostrophe connector,
  // not enough by itself to turn punctuation into a lexical word.
  const normalized = value.normalize("NFC").replace(/\u02bc/g, "'");
  if (!/\p{L}/u.test(normalized) || !/^[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\-\u2010\u2011][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*$/u.test(normalized)) return false;
  if (!usesSpacelessScript(normalized)) return true;
  // Avoid treating an entire unspaced-script phrase as one lexical word.
  if (Array.from(normalized).length > 8) return false;
  const words = segmentedWords(normalized);
  return words ? words.length === 1 && words[0] === normalized : Array.from(normalized).length === 1;
}

function hasValidSentenceSize(value) {
  if (!value || value.length > 2000 || value.includes("\0")) return false;
  let bytes = 0;
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code >= 0xd800 && code <= 0xdfff) return false;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes > 8000) return false;
  }
  return true;
}

function sentenceForWord(value, selectedWord) {
  if (typeof value !== "string") return null;
  const sentence = value.trim();
  if (!hasValidSentenceSize(sentence)) return null;
  const wanted = normalizedWord(selectedWord);
  const normalized = sentence.normalize("NFC");
  const words = segmentedWords(normalized);
  if (words && words.some(word => normalizedWord(word) === wanted)) return sentence;
  // Spaceless scripts may attach grammatical particles to a selected lexical
  // stem (for example Korean 준비 in 준비가). The selected word was already
  // segmented above; its literal presence is valid context without spaces.
  if (usesSpacelessScript(selectedWord)) return normalizedWord(normalized).includes(wanted) ? sentence : null;
  // Quotes and punctuation may surround the selected word. Matching complete
  // tokens prevents a substring such as "he" in "the" becoming fake context.
  const tokens = normalized.match(/[\p{L}\p{M}\p{N}]+(?:['’\u02bc\-\u2010\u2011][\p{L}\p{M}\p{N}]+)*/gu) || [];
  return tokens.some(word => normalizedWord(word) === wanted) ? sentence : null;
}

MacHelper.define({
  commands: {
    async translate(input) {
      const settings = input.settings || {};
      const targetLanguage = settings.targetLanguage || "zh-CN";
      const selectedWord = typeof input.text === "string" ? input.text.trim() : "";
      const wordMode = isSingleWord(selectedWord);
      const sentence = wordMode ? sentenceForWord(input.sentence, selectedWord) : null;
      const labels = wordLabels[targetLanguage] || wordLabels.en;
      // The complete instruction is the editable source file, sent verbatim.
      // Language, selected text, context, and labels remain separate input data.
      const prompt = MacHelper.readText(wordMode ? "prompts/word-in-context.txt" : "prompts/translate.txt");
      const data = wordMode
        ? {selectedWord, surroundingSentence: sentence, targetLanguage, labels}
        : {text: input.text, targetLanguage};
      const response = await MacHelper.ai.transform({
        action: "translate",
        text: JSON.stringify(data),
        targetLanguage,
        model: "", // Use MacHelper's shared provider/model choice.
        systemPrompt: prompt
      }, partial => input.reportProgress({
        text: partial.text,
        title: "Translation"
      }));
      return {text: response.text, title: "Translation"};
    }
  }
});
