---
paths: ["src/**/*.{tsx,jsx}"]
description: Tailwind CSS and tailwind-variants styling conventions
---

- Tailwind CSS utility classes only; never hardcode HEX colors
- Use `dark:` prefix for dark mode variants
- Extract reusable styles with `tv()` from tailwind-variants when 3+ elements share the same classes
- Use array format in `tv({ base: [...] })` to group related classes
