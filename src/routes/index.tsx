import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDebounce, useKeyboardShortcuts, useStudents, type Student } from "@/hooks/use-students";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EAV Kivumu Student Management System" },
      { name: "description", content: "Register, view, search and delete EAV Kivumu student records." },
      { property: "og:title", content: "EAV Kivumu Student Management System" },
      { property: "og:description", content: "Register, view, search and delete EAV Kivumu student records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const COURSES = ["Software Development", "Networking", "Accounting", "Electrical Technology", "Building Construction"];
const EMPTY = { reg_number: "", full_name: "", email: "", phone: "", course: COURSES[0] as string, gender: "Female" };

function Index() {
  const { students, loading, add, remove } = useStudents();
  const [form, setForm] = useState(EMPTY); // controlled form state
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 400);

  const shortcuts = useMemo(() => ({
    onSearch: () => searchRef.current?.focus(),
    onNew: () => { setShowForm(true); setTimeout(() => document.getElementById("full_name")?.focus(), 0); },
    onEscape: () => { setSelected(null); setQuery(""); },
  }), []);
  useKeyboardShortcuts(shortcuts);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.full_name, s.reg_number, s.email, s.course].some((v) => v.toLowerCase().includes(q)));
  }, [students, debounced]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return; // submission protection
    const reg = form.reg_number.trim().toUpperCase();
    const email = form.email.trim().toLowerCase();
    if (!reg || !form.full_name.trim() || !email) { toast.error("Fill in all required fields"); return; }
    if (students.some((s) => s.reg_number.toUpperCase() === reg)) { toast.error("Registration number already exists"); return; }
    if (students.some((s) => s.email.toLowerCase() === email)) { toast.error("Email already registered"); return; }
    setSubmitting(true);
    try {
      await add({ ...form, reg_number: reg, email, full_name: form.full_name.trim() });
      toast.success("Student registered");
      setForm(EMPTY);
    } catch (err) {
      toast.error((err as Error).message.includes("duplicate") ? "Duplicate student record" : "Could not save student");
    } finally {
      setSubmitting(false);
    }
  };

  // Passing arguments + stopPropagation: delete button inside a clickable card
  const handleDelete = async (e: MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await remove(id); toast.success(`${name} deleted`); if (selected?.id === id) setSelected(null); }
    catch { toast.error("Could not delete student"); }
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">EAV Kivumu</p>
            <h1 className="text-4xl font-extrabold">Student Management System</h1>
          </div>
          <div className="flex gap-2 text-xs opacity-90">
            <Kbd>Ctrl K</Kbd> search <Kbd>Ctrl N</Kbd> new <Kbd>Esc</Kbd> close
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Register student</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? "Hide" : "Show"}</Button>
          </div>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Full name *" id="full_name" name="full_name" value={form.full_name} onChange={handleChange} />
              <Field label="Registration no. *" id="reg_number" name="reg_number" placeholder="EAV/2026/004" value={form.reg_number} onChange={handleChange} />
              <Field label="Email *" id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Field label="Phone" id="phone" name="phone" value={form.phone} onChange={handleChange} />
              <label className="block text-sm font-semibold">Course
                <select name="course" value={form.course} onChange={handleChange} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2">
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <fieldset className="text-sm font-semibold">Gender
                <div className="mt-1 flex gap-4 font-normal">
                  {["Female", "Male"].map((g) => (
                    <label key={g} className="flex items-center gap-1">
                      <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} /> {g}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving…" : "Register student"}</Button>
            </form>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Students <span className="text-muted-foreground">({filtered.length})</span></h2>
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, reg no, course…  (Ctrl+K)"
              className="w-full max-w-xs rounded-md border border-input bg-card px-3 py-2 text-sm" />
          </div>
          {loading ? <p className="text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No students found.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((s) => (
                <li key={s.id} onClick={() => setSelected(s)}
                  className="cursor-pointer rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.reg_number}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={(e) => handleDelete(e, s.id, s.full_name)}>Delete</Button>
                  </div>
                  <p className="mt-3 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{s.course}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (<>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selected.full_name}</DialogTitle>
              <DialogDescription>{selected.reg_number}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <dt className="text-muted-foreground">Email</dt><dd>{selected.email}</dd>
              <dt className="text-muted-foreground">Phone</dt><dd>{selected.phone || "—"}</dd>
              <dt className="text-muted-foreground">Course</dt><dd>{selected.course}</dd>
              <dt className="text-muted-foreground">Gender</dt><dd>{selected.gender || "—"}</dd>
              <dt className="text-muted-foreground">Registered</dt><dd>{new Date(selected.created_at).toLocaleDateString()}</dd>
            </dl>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return <kbd className="rounded border border-primary-foreground/40 px-1.5 py-0.5 font-mono">{children}</kbd>;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-semibold">{label}
      <input {...props} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-normal" />
    </label>
  );
}
