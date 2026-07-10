# Course notes

## Testing

- Cover the happy path first, then add one unhappy-path assertion per critical form.
- Prefer user-visible outcomes in Playwright: route changes, dialogs, toasts, and headings over implementation details.
- Keep test data deterministic by seeding local storage or using the app’s demo flow.

## Error boundaries

- Place a high-level boundary around the root app tree so one render failure becomes a recoverable fallback instead of a blank screen.
- Log the error and component stack for debugging, but keep the UI message calm and actionable.

## Code splitting

- Use React.lazy for route-level pages and any heavy dependency entry points that are not needed on the first paint.
- Wrap lazy components with Suspense and provide a light fallback so the app feels responsive during chunk loading.

## Validation

- Validate required fields on submit and surface concise feedback with toasts or inline errors.
- Keep validation rules aligned with the data model so the UI and store stay consistent.
