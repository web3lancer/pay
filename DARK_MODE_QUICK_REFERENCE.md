# Dark Mode Quick Reference

## TL;DR - For Developers

### Using Dark Mode in Components

**Always use Tailwind's `dark:` prefix:**

```tsx
// ✅ CORRECT
<div className="bg-white dark:bg-neutral-900 text-black dark:text-white transition-colors">
  Content
</div>

// ❌ WRONG
<div className={theme === 'dark' ? 'bg-neutral-900' : 'bg-white'}>
  Don't do this!
</div>
```

### Common Dark Mode Patterns

```tsx
// Text colors
className="text-neutral-900 dark:text-neutral-100"

// Background colors  
className="bg-neutral-50 dark:bg-ash-dark"

// Borders
className="border-neutral-200 dark:border-neutral-800"

// Shadows
className="shadow-md shadow-neutral-300/50 dark:shadow-neutral-950/50"

// Buttons
className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700"

// Smooth transitions (ALWAYS add this!)
className="transition-colors duration-300"

// Combined example
className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg transition-colors duration-300"
```

### Form Elements

```tsx
// Input
<input className="bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100" />

// Select/Dropdown
<select className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" />

// Textarea
<textarea className="bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100" />
```

### Check Theme Programmatically

```tsx
import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Switch theme
    </button>
  )
}
```

### CSS Variables (If Needed)

```css
.my-element {
  color: var(--neutral-900);
  background: var(--neutral-50);
}

/* In dark mode, these variables automatically switch values */
```

## Color Reference

| Purpose | Light | Dark |
|---------|-------|------|
| Text Primary | `text-neutral-900` | `text-neutral-100` |
| Text Secondary | `text-neutral-700` | `text-neutral-300` |
| Background | `bg-neutral-50` | `bg-ash-dark (#1A1A24)` |
| Background Secondary | `bg-neutral-100` | `bg-neutral-100` |
| Border | `border-neutral-300` | `border-neutral-700` |
| Input | `bg-neutral-50` | `bg-neutral-800` |

## Accessibility Checklist

Before shipping a component:

- [ ] Text has at least 4.5:1 contrast ratio in both modes
- [ ] Interactive elements are at least 24x24px
- [ ] No information conveyed by color alone
- [ ] Transitions respect `prefers-reduced-motion`
- [ ] Tested in both light and dark modes

## Common Mistakes to Avoid

❌ **Hardcoded colors in components**
```tsx
// Don't do this
<div style={{ backgroundColor: '#ffffff' }}>
```

❌ **Forgetting dark: prefix**
```tsx
// This doesn't work in dark mode
<div className="bg-white">
```

❌ **Missing transition**
```tsx
// Theme switch will be jarring
<div className="bg-white dark:bg-black">
```

❌ **Using CSS-in-JS for theme colors**
```tsx
// Avoid this pattern
const isDark = useTheme().theme === 'dark'
const bgColor = isDark ? '#000' : '#fff'
```

✅ **Use Tailwind utilities + dark: prefix** (Always!)

## File Organization

- **Theme config**: `tailwind.config.js`
- **CSS variables**: `src/app/globals.css`
- **Theme provider**: `src/components/ThemeProvider.tsx`
- **Toggle button**: `src/components/ThemeToggle.tsx`
- **Layout components**: `src/components/layout/`

## Getting Help

If you encounter issues:
1. Check `DARK_MODE_IMPLEMENTATION.md` for detailed docs
2. Look at `TopBar.tsx` for a complete example
3. Verify Tailwind config has `darkMode: 'class'`
4. Ensure `ThemeProvider` wraps your app
5. Check that components use `dark:` classes, not conditional logic

---

**Remember**: New pages and components automatically get dark mode support. No special setup needed!
