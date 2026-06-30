# AI usage notes

This document is an honest account of how AI assistance (Claude and GPT) was used to build this project, what was kept, what was changed by hand, and the tradeoffs involved.

## How AI was used

The project was developed with an AI pair-programming workflow: I described the requirements and architecture, the AI scaffolded files, and every step was compiled, linted, tested and run before moving on. Nothing was accepted blindly — the working flow was **generate → verify → adjust**.

### AI-generated (then reviewed)

- Initial scaffolding of both apps: `package.json`, `tsconfig`, ESLint/Prettier configs, Vite/Nest config.
- Boilerplate-heavy files: DTOs, Mongoose schema, module wiring, route guards, reusable UI components.
- First drafts of the `AuthService`, JWT strategy, Axios instance and `AuthProvider`.
- Dockerfiles, `docker-compose.yml`, the GitHub Actions workflow, and this documentation.
- Unit tests for the auth service (backend) and validation schemas (frontend).

### Written / corrected manually

- **Architecture decisions** — module boundaries (`auth` vs `users`) and the overall authentication architecture were reviewed and refined rather than accepted as initially generated.
- **Authentication strategy** — after reviewing the initial implementation, I requested a more production-oriented authentication flow. The final implementation uses a short-lived access token together with a refresh token stored in an **HttpOnly, Secure cookie**, providing a better balance between security and user experience than the original AI suggestion.
- **Reusable Button component** — the initial implementation relied on simple conditional styling. I requested a refactor into a scalable, variant-based component supporting `primary`, `secondary`, `outline`, and `danger` variants, making it easier to extend while following clean code principles.
- **Frontend UX review** — after testing the application, I noticed that invalid login attempts resulted in a JSON parsing error instead of a meaningful authentication message. I asked the AI to investigate the issue, improve error handling, and review the overall frontend UX, resulting in better validation feedback, loading states, disabled button behavior, dark mode improvements, and general UI polishing.
- **Security-sensitive flow logic** — refresh-token handling, cookie flags (`HttpOnly`/`Secure`/`SameSite`), authentication flow, and protected routes were reviewed manually rather than trusted as generated.
- **Type-level fixes** that the AI's first drafts got wrong, caught by the compiler:
  - JWT `expiresIn` typing clash with `@nestjs/jwt`'s `StringValue` — required an explicit cast.
  - Vite/Vitest type conflict from Vitest bundling its own Vite copy — fixed by aligning Vitest to v3 (Vite 6 peer).
  - Frontend `tsconfig` project-references setup and `@types/node` for `vite.config.ts`.

- **Security review tweaks** — ensuring the password field is never selected, using a single generic auth-failure message to avoid user enumeration, and confirming the error filter hides internal details on 500s.

## Prompts that worked best

- **Requirements-first, constraints explicit:** stating "production-ready, clean architecture, do not over-engineer" up front kept the output appropriately scoped.
- **"Verify before continuing":** instructing the AI to actually run typecheck/lint/build/tests after each chunk surfaced issues immediately instead of at the end.
- **Naming the exact stack and versions** reduced churn — the AI produced configs that matched the intended toolchain rather than a generic guess.
- **Asking for the smallest reasonable abstraction** (e.g. "a thin HashingService") produced testable seams without unnecessary complexity.
- **Requesting code reviews** as if performed by a senior engineer helped improve architecture, security, and maintainability rather than only generating code.

## Tradeoffs

- **Short-lived access token + HttpOnly refresh token** — chosen as a better balance between security and user experience while keeping the implementation appropriate for the scope of the assignment.
- **Validation duplicated client/server** — intentional: the server is the source of truth, the client mirror is purely for UX. The small duplication is preferable to sharing a package for a take-home of this size.
- **Test depth** — unit tests cover the core auth logic and validation rather than aiming for full coverage, to stay within a few hours.

## Lessons learned

- AI is fastest at boilerplate and configuration but most error-prone exactly where the type system is subtle (third-party generic types, tooling version interplay). A strict compiler is the best safety net — it caught every AI mistake here.
- Forcing a "compile and run after each step" loop turns AI output from plausible-looking into actually-correct, and is far cheaper than debugging a large generated blob at the end.
- Keeping architectural ownership human-side (boundaries, security posture, UX decisions, component design, and project scope) while delegating repetitive work to AI produced the best balance of speed and quality.
