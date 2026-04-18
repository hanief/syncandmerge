# Engineering Best Practice

## Tech Stacks

- React: https://react.dev
- Vite: https://vite.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/home
- Zustand: https://pmndrs.github.io/zustand
- React Query: https://tanstack.com/query/latest/docs/framework/react/overview

## Do this

- Always refer to official documentation on how to use a technology
- Clean architecture and code quality
- Loading and error state handling
- UX for sync flow and conflict resolution
- Readability and consistency — visual polish is secondary
- No comments needed. Make variable, function, code naming easy to understand. Remove all comments except in complex and difficult part of the code.

## Engineering Principles

1. DRY (Don't Repeat Yourself)

- Centralize Knowledge: Move shared logic, business rules, or configuration into a single, authoritative module.
- Avoid Data Duplication: Ensure state and database schemas have one source of truth to prevent synchronization bugs and "split-brain" states.
- Balance Abstraction: Apply the "Rule of Three"—only abstract code once it has been repeated three times to avoid premature, incorrect abstractions.

2. YAGNI (You Ain't Gonna Need It)

- Solve the Current Problem: Implement only what is required for the active user story or ticket; ignore "future-proofing" for hypothetical features.
- Avoid Speculative Genericism: Do not build complex, generic frameworks for simple, specific use cases.
- Minimize Code Surface: Every line of code is a liability; keep the codebase lean to reduce the area where bugs can hide.

3. SOLID Principles

- Single Responsibility: Ensure every class or function has one, and only one, reason to change.
- Open-Closed: Design modules to be open for extension (via interfaces or inheritance) but closed for modification of existing, tested logic.
- Liskov Substitution: Guarantee that any subclass or implementation can be used in place of its parent type without breaking the system.
- Interface Segregation: Split large, "fat" interfaces into smaller, specific ones so clients only depend on the methods they actually use.
- Dependency Inversion: Depend on abstractions (interfaces) rather than concrete implementations to decouple high-level policy from low-level details.

4. TDD (Test-Driven Development)

- Red-Green-Refactor: Always write a failing test first, write the minimum code to make it pass, and then clean up the implementation.
- Tests as Documentation: Treat the test suite as the primary source of truth for how the code is intended to behave.
- Granular Feedback: Keep the test cycle short (seconds or minutes) to catch logic errors immediately after they are introduced.

5. Broken Windows

- Zero Tolerance for Cruft: Fix misleading comments, unused variables, and compiler warnings the moment you encounter them.
- Prevent Cultural Decay: Address small "hacks" immediately to prevent a mindset where low-quality code becomes the team standard.
- Maintain Pattern Consistency: If you find a section of code that deviates from the project's standards, bring it back into alignment or refactor the area.

6. Orthogonality

- Isolate Side Effects: Ensure that a change in one module (e.g., the database layer) does not require changes in unrelated modules (e.g., the UI).
- Independent Components: Design systems as a collection of self-contained, "pluggable" components with narrow, well-defined APIs.
- Mock-Friendly Design: Orthogonal code is easier to unit test because you can isolate components without needing to instantiate the entire system.

7. Boy Scout Rule

- Leave It Better: Perform minor cleanups—renaming variables, extracting long methods, or updating documentation—in every file you touch.
- Incremental Improvement: Focus on making the codebase 1% better with every pull request rather than waiting for a massive "cleanup sprint."
- Contextual Focus: Limit cleanups to the scope of your current task to keep code reviews focused and manageable.

8. Refactoring

- Behavioral Integrity: Use automated tests to verify that internal code changes have not altered the external output or side effects.
- Small Steps: Break large architectural shifts into a series of tiny, verifiable transformations.
- Prioritize Readability: Refactor specifically to make the code more expressive and easier for the next developer to understand.

9. Evolutionary Architecture

- Defer Commitments: Postpone architectural decisions (like specific database engines or frameworks) until the last responsible moment.
- Design for Reversibility: Choose patterns that allow you to change your mind later with minimal cost (e.g., using the Strategy pattern).
- Fitness Functions: Use automated tools to enforce architectural constraints, such as preventing circular dependencies between packages.

10. KISS (Keep It Simple, Stupid)

- Avoid "Clever" Code: If a logic block requires a mental "deep dive" to understand, it is likely too complex and should be simplified.
- Favor Transparency over Abstraction: Use straightforward language features unless a complex design pattern is strictly necessary.
- Optimize for Maintenance: Write code that is easy to debug and modify, even if it requires a few more lines of text.

11. Continuous Integration (CI)

- Frequent Merges: Integrate code into the main branch daily to avoid the "merge hell" of long-lived feature branches.
- Automated Validation: Every commit must trigger an automated build and test suite to provide an immediate "go/no-go" signal.
- Fast Feedback Loop: Optimize the pipeline to ensure developers know within minutes if their change broke a core system.

12. Tell, Don't Ask

- Encapsulate Logic: Instead of querying an object's state to make a decision, tell the object what you want it to do and let it manage its own state.
- Avoid Anemic Models: Move business logic into the domain objects that own the data, rather than having "dumb" data objects and "smart" services.
- Reduce Coupling: This prevents external modules from needing intimate knowledge of an object's internal structure.

13. Fail Fast

- Immediate Validation: Check for invalid inputs, nulls, or out-of-range values at the very beginning of a function.
- Visible Errors: Use exceptions or clear error types rather than returning "magic numbers" (like -1) or failing silently.
- Prevent State Corruption: Stop execution as soon as an unexpected state is detected to avoid writing bad data to the database.

14. Least Surprise

- Follow Conventions: Adhere to established naming patterns (e.g., is... for booleans) and project-specific file structures.
- Predictable APIs: Ensure functions do exactly what their names suggest without "hidden" side effects like logging to a database inside a getter.
- Standard Tooling: Use industry-standard libraries and methods for common tasks (e.g., date parsing) rather than rolling custom, idiosyncratic logic.

## Frontend Standards

Comprehensive Type Safety: Define explicit interfaces or types for all component props, state, and function parameters, strictly prohibiting the use of any to ensure the compiler catches potential runtime errors before deployment.

Functional Components and Hooks: Prioritize functional components over class-based structures and utilize the standard Hooks API (useState, useEffect, useContext) to manage component lifecycles and state in a predictable, modern manner.

Component Composition: Build complex user interfaces by nesting small, single-purpose components and utilizing the children prop, which reduces deep "prop drilling" and makes the UI more flexible and reusable.

Custom Hooks for Logic Reuse: Extract complex or repetitive logic—such as API interactions, form management, or browser event listeners—into custom hooks to decouple business logic from UI representation and adhere to the DRY principle.

State Management Strategy: Use local useState for UI-only state and implement specialized libraries like Zustand or TanStack Query for global or server-synchronized data to maintain a clear and predictable data flow.

Server State Synchronization: Leverage tools like React Query or SWR to handle caching, background synchronization, and loading/error states, effectively moving complex data-fetching logic out of the component’s useEffect blocks.

Strategic Performance Optimization: Apply React.memo, useCallback, and useMemo judiciously to prevent expensive re-renders in complex component trees, while avoiding premature optimization in simpler parts of the application.

Testing and Quality Assurance: Implement unit tests for business logic and integration tests for component behavior using Vitest/Jest and React Testing Library to verify that the UI functions correctly from the user's perspective.

Accessibility (a11y) Integration: Utilize semantic HTML elements (e.g., <nav>, <main>, <button>) and appropriate ARIA attributes to ensure the application is fully navigable and usable for individuals using assistive technologies.

Robust Error Handling: Wrap critical component trees in Error Boundaries to catch unexpected JavaScript errors, preventing the entire application from crashing and providing a graceful fallback UI to the user.

Discriminated Unions for Complex State: Use TypeScript’s discriminated unions to model state that can exist in multiple distinct modes (e.g., Loading, Success, Error), ensuring that data properties are only accessible when the state is valid.

Consistent File and Folder Structure: Organize the codebase by feature or domain (e.g., a features/ directory containing related components, hooks, and types) to improve discoverability and scalability as the project grows.

Security Best Practices: Sanitize all user-generated content and avoid using dangerouslySetInnerHTML to protect the application against Cross-Site Scripting (XSS) and other common web vulnerabilities.

Prop Naming Conventions: Maintain a consistent naming standard, such as prefixing event handler props with on (e.g., onSelect) and the internal implementation functions with handle (e.g., handleSelect), to improve code readability.
