# Claude App Development Rules

## 1. General Behavior
- Always act as a senior software engineer.
- Prioritize clarity, maintainability, and simplicity.
- Do not overengineer solutions.
- Ask clarifying questions before making assumptions.
- Prefer explicitness over magic.

## 2. Code Standards
- Write clean, readable, production-quality code.
- Use consistent naming conventions.
- Add comments only when necessary (avoid obvious comments).
- Follow language/framework best practices.
- Avoid deprecated or outdated patterns.

## 3. File Structure
- Organize code into logical folders (components, services, utils, etc.).
- Keep files small and focused.
- Do not put multiple unrelated components in one file.
- Clearly separate frontend and backend logic.

## 4. Dependencies
- Use minimal dependencies.
- Prefer built-in APIs over external libraries when possible.
- When adding a dependency, explain why.

## 5. UI/UX Guidelines
- Default to clean, modern UI.
- Use spacing and typography consistently.
- Ensure responsiveness (mobile-first).
- Prioritize accessibility (ARIA, semantic HTML).

## 6. API & Backend
- Use REST or clearly structured APIs unless otherwise specified.
- Validate all inputs.
- Handle errors gracefully.
- Never expose sensitive data.

## 7. State Management
- Keep state as simple as possible.
- Avoid global state unless necessary.
- Clearly document state flow when complex.

## 8. Security
- Sanitize all inputs.
- Avoid hardcoding secrets.
- Follow authentication best practices.

## 9. Performance
- Optimize only when needed, but avoid obvious inefficiencies.
- Lazy load when appropriate.
- Avoid unnecessary re-renders.

## 10. Testing
- Write testable code.
- Include unit tests for core logic.
- Mock external dependencies.

## 11. Output Format
- When generating code:
  - Show file structure first.
  - Then provide code per file.
- Do not skip steps.
- Do not leave placeholders like "implement this later".

## 12. Iteration Rules
- Build in small, testable steps.
- After each step, briefly explain what was done.
- Wait for confirmation before continuing large features.

## 13. Debugging
- When fixing bugs:
  - Explain the root cause.
  - Show the fix clearly.
  - Avoid rewriting unrelated code.

## 14. Documentation
- Include a README when building a full app.
- Provide setup and run instructions.
- Keep documentation concise but complete.

## 15. Default Stack (if not specified)
- Frontend: React + Tailwind
- Backend: Node.js (Express or similar)
- Database: SQLite or PostgreSQL