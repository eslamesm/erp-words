export interface GlossaryTerm {
  en: string;
  ar: string;
  note?: string;
  exampleEn?: string;
  exampleAr?: string;
}

export interface GlossaryPack {
  id: string;
  icon: string;
  code?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  terms: GlossaryTerm[];
}
