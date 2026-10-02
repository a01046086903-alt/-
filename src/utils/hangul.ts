// Hangul utility functions for Middle School Korean Crossword

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ',
  'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ',
  'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * Extracts Korean initial consonants (초성) from a word
 * e.g., "구개음화" -> "ㄱㄱㅇㅎ", "반어법" -> "ㅂㅇㅂ"
 */
export function getChosung(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Hangul Syllable Unicode range: 0xAC00 ~ 0xD7A3 (44032 ~ 55203)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const chosungIndex = Math.floor((code - 0xac00) / (21 * 28));
      result += CHOSUNG[chosungIndex];
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Checks if a character is a valid complete Korean syllable
 */
export function isHangulSyllable(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

/**
 * Checks if input is Korean jamo or syllable
 */
export function isKoreanChar(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0xac00 && code <= 0xd7a3) || // Syllables
    (code >= 0x3131 && code <= 0x318e)    // Jamo
  );
}

/**
 * Disassembles a complete Hangul syllable into [cho, jung, jong]
 */
export function disassembleHangul(char: string): [string, string, string] | null {
  if (!char || char.length !== 1) return null;
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;

  const base = code - 0xac00;
  const jongIdx = base % 28;
  const jungIdx = Math.floor((base - jongIdx) / 28) % 21;
  const choIdx = Math.floor(base / (21 * 28));

  return [CHOSUNG[choIdx], JUNGSUNG[jungIdx], JONGSUNG[jongIdx]];
}

/**
 * Assembles cho, jung, jong into a Hangul syllable
 */
export function assembleHangul(cho: string, jung: string, jong: string = ''): string {
  const choIdx = CHOSUNG.indexOf(cho);
  const jungIdx = JUNGSUNG.indexOf(jung);
  const jongIdx = JONGSUNG.indexOf(jong);

  if (choIdx === -1 || jungIdx === -1) return '';
  const finalJongIdx = jongIdx === -1 ? 0 : jongIdx;

  const unicode = 0xac00 + (choIdx * 21 * 28) + (jungIdx * 28) + finalJongIdx;
  return String.fromCharCode(unicode);
}
