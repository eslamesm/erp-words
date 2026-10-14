"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { useT } from "@/hooks/useT";

export default function GamesPage() {
  const { t } = useT();
  return <ComingSoon icon="🎮" title={t("nav.games")} />;
}
