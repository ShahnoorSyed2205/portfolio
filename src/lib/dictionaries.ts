import type { Locale } from "@/i18n/config";
import { en, type Dict } from "@/i18n/en";
import { ar } from "@/i18n/ar";

const dictionaries: Record<Locale, Dict> = { en, ar };

export const getDict = (locale: Locale): Dict => dictionaries[locale];
