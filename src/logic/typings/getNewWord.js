// @flow

export default function getNewWord(words: string[], wordsLen: number) {
  const i = Math.floor(Math.random() * wordsLen);
  return words[i];
}
