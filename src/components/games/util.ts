import { WORDS } from "@/data/words";
import type { Word } from "@/types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// كلمات صالحة للّعب (بمعنى عربي واضح ومعرّف).
export function playableWords(): Word[] {
  return WORDS.filter((w) => w.arabic.trim().length > 0 && w.english.trim().length > 1);
}

export function scramble(word: string): string[] {
  const letters = word.split("");
  if (letters.length < 2) return letters;
  let out = shuffle(letters);
  let guard = 0;
  while (out.join("") === word && guard++ < 8) out = shuffle(letters);
  return out;
}
