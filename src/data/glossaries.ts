import type { GlossaryPack } from "./glossary/types";
import { PACK_ROLES, PACK_ERP_MODULES, PACK_REPORTING, PACK_CONTRACTS } from "./glossary/packs-a";
import { PACK_TAX, PACK_GOVERNANCE, PACK_INFOSEC, PACK_TESTING } from "./glossary/packs-b";
import { PACK_LOGISTICS, PACK_NUMBERS, PACK_INTERVIEWS } from "./glossary/packs-c";

export type { GlossaryPack, GlossaryTerm } from "./glossary/types";

export const GLOSSARY_PACKS: GlossaryPack[] = [
  PACK_ROLES,
  PACK_ERP_MODULES,
  PACK_REPORTING,
  PACK_CONTRACTS,
  PACK_TAX,
  PACK_GOVERNANCE,
  PACK_INFOSEC,
  PACK_TESTING,
  PACK_LOGISTICS,
  PACK_NUMBERS,
  PACK_INTERVIEWS,
];
