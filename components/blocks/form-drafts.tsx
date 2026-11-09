"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "@/lib/cards/forms/fields";

type DraftContextValue = {
  drafts: Record<string, Answers>;
  setDraft(formId: string, answers: Answers | undefined): void;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function FormDraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, Answers>>({});
  const setDraft = useCallback((formId: string, answers: Answers | undefined) => {
    setDrafts((current) => {
      if (answers === current[formId]) return current;
      if (answers === undefined) {
        if (!(formId in current)) return current;
        const next = { ...current };
        delete next[formId];
        return next;
      }
      return { ...current, [formId]: answers };
    });
  }, []);
  const value = useMemo(() => ({ drafts, setDraft }), [drafts, setDraft]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

/** An optional in-memory draft for forms mounted below a CardPlayer. */
export function useFormDraft(formId: string): readonly [Answers | undefined, (answers: Answers | undefined) => void] {
  const context = useContext(DraftContext);
  const write = context?.setDraft;
  const set = useCallback((answers: Answers | undefined) => write?.(formId, answers), [write, formId]);
  return [context?.drafts[formId], set];
}
