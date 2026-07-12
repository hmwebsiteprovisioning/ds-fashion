# Agent Guide — ds-fashion

## Admin Panel

When working on the admin panel (`app/admin/`), follow the scoped Cursor rules in `.cursor/rules/`:

| Rule | Topic |
|------|-------|
| `admin-dashboard-philosophy.mdc` | Section I — grid, density, contextual priority |
| `admin-sidebar.mdc` | Section II — sidebar spine, grouping, active states |
| `admin-lists-tables.mdc` | Section III — list anatomy, bulk actions, empty states |
| `admin-charts.mdc` | Section IV — Recharts, line/bar chart standards |
| `admin-interaction-layers.mdc` | Section V — modals, popovers, toasts, breadcrumbs |
| `admin-master-components.mdc` | Section VI — cards, tables, tabs, inputs |
| `admin-optimistic-ui.mdc` | Section VII — optimistic mutations |
| `admin-search-index.mdc` | Search index updates for new features |

## Spec Documents

- [ADMIN_LAYOUT_SYSTEM_SPEC.md](ADMIN_LAYOUT_SYSTEM_SPEC.md) — layout tokens and components
- [COLOR_SYSTEM_SPEC.md](COLOR_SYSTEM_SPEC.md) — semantic colors
- [WHITESPACE_ANCHORING_SPEC.md](WHITESPACE_ANCHORING_SPEC.md) — surfaces and spacing

## Key Paths

- Layout components: `app/admin/components/layout/`
- Charts: `app/admin/components/charts/`
- Search index: `app/admin/lib/adminSearchIndex.ts`
- Auth layout: `app/admin/layout.tsx`
