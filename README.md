# EAV Kivumu Student Management System

**Live site (open this to use the system):** https://gentil270.github.io/Student--management-/

A student records system for EAV Kivumu: register students, browse the list,
search as you type, open a student's details, and delete a record.

## Features

| # | Feature | How it works |
|---|---------|--------------|
| 1 | Register students | Registration form with validation |
| 2 | Display students | Dynamic list rendered with `map()` |
| 3 | Search students | Debounced search (400 ms) across name, reg no, email, course |
| 4 | Delete students | Delete button with confirmation |
| 5 | View registration form | Show / hide the form |
| 6 | Keyboard shortcuts | `Ctrl+K` search, `Ctrl+N` new student, `Esc` close |
| 7 | View student details | Details dialog |
| 8 | Nested clicks | Event bubbling with `stopPropagation()` |
| 9 | Prevent repeated actions | Submission protection + duplicate reg-no / email checks |

## React concepts demonstrated

- Controlled components
- Dynamic lists and `map()`
- Debouncing
- Event handling and `filter()`
- Form events
- Custom Hooks (`useDebounce`, `useKeyboardShortcuts`, `useStudents`)
- Passing arguments to handlers
- Event bubbling

## Running it locally

```sh
npm install
npm run dev
```

The app reads and writes student records through a hosted database, so the
sample records and anything you register are shared by everyone using the site.

## Repository layout

- `src/` — the application (React + TanStack Start, Tailwind CSS)
- `src/routes/index.tsx` — the whole screen: form, list, search, details dialog
- `src/hooks/use-students.ts` — the three custom hooks
- `gh-pages` branch — the built copy that GitHub Pages serves
