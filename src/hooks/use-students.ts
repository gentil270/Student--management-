import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Student = Tables<"students">;
export type NewStudent = TablesInsert<"students">;

/** Custom hook: debounce any value. */
export function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Custom hook: global keyboard shortcuts (Ctrl+K, Ctrl+N, Escape). */
export function useKeyboardShortcuts(handlers: { onSearch: () => void; onNew: () => void; onEscape: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "k") { e.preventDefault(); handlers.onSearch(); }
      else if ((e.ctrlKey || e.metaKey) && k === "n") { e.preventDefault(); handlers.onNew(); }
      else if (e.key === "Escape") handlers.onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}

/** Custom hook: students CRUD backed by the database. */
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setStudents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load().catch(() => setLoading(false)); }, [load]);

  const add = async (s: NewStudent) => {
    const { data, error } = await supabase.from("students").insert(s).select().single();
    if (error) throw error;
    setStudents((prev) => [data, ...prev]);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  return { students, loading, add, remove };
}
