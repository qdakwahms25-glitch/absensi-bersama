# Project Guidance

## User Preferences

- Bahasa Indonesia untuk seluruh antarmuka
- Mobile-first: tata letak nyaman di layar ponsel
- Tema hijau dan emas
- Peserta hanya menyimpan nama dan kelompok, tanpa data pribadi lain

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Enhanced Migration with check-limit=1 allows only one pending migration file; fold all new stable state into the single baseline migration and remove extra migration files.
- Motoko has no triple-quoted multiline string; author long static text as a #-concatenated chain of single-line strings with \n escapes.
- Text has no toBlob in mo:core; use Text.encodeUtf8() which returns a Blob.
- Private helper functions declared inside separate mixins collide when all mixins are included into one actor; give each mixin's private helpers domain-unique names.
- caffeineai-authorization getUserRole traps 'User is not registered' for signed-in callers not yet registered; anonymous returns #guest. Guard endpoints accordingly.
- Backend timestamps are nanosecond bigints; convert via Number(ts / 1_000_000n) before any Date operation.
- TanStack Router typed <Link> requires the target route to declare validateSearch before a search prop can be passed.
- Role gating for admin-only backend calls must key on isAdmin, not !isAnggota: ketua halaqah is neither admin nor anggota.
- Scoping a read query does not scope sibling export/report endpoints; public export funcs need the same caller-based filter or they leak the full dataset.
- Vitest vi.mock factories are hoisted; do not reference top-level variables inside them, and stub jsdom pointer-capture/object-URL APIs for Radix components.
