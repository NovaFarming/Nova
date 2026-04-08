# Contributing

## Local Setup

```bash
bun install
cp .env.example .env
bun run dev
```

## Contribution Rules

- keep route-model changes separate from presentation and prompt changes
- update tests when net APR decomposition or allocation caps change
- keep the docs focused on keepable carry, not headline APR

## Pull Request Notes

- explain which route filter or allocation rule changed
- include a sample allocation plan when behavior changes
- update the runbook if operator workflow changed
