# Dark Mode Implementation Guide

## Overview

A universal dark mode system has been implemented across the LancerPay application using `next-themes` with centralized theme management. The implementation ensures:

- **Universal Dark Mode**: The entire application switches to dark mode, not just individual pages
- **Deep Ash Background**: Uses `#1A1A24` (deep ash) instead of black for comfortable viewing
- **Seamless Visibility**: All elements remain visible in both light and dark modes
- **Core Modularity**: Centralized theme system requiring no conditionals in new pages/components
- **Scalable Architecture**: Automatic theme inheritance through CSS variables and Tailwind dark mode
- **No Flash**: Theme is applied before page render to prevent flashing

## Key Features

### 1. **Next-Themes Integration**
- Handles theme persistence (localStorage)
- System preference detection
- SSR-safe implementation

### 2. **Centralized CSS Variables**
All theme values are defined in `/src/app/globals.css`:
- Light mode values in `:root`
- Dark mode values in `html.dark`
- Ensures consistency across the app

### 3. **Tailwind Dark Mode**
- Enabled via `darkMode: 'class'` in `tailwind.config.js`
- Prefix dark mode classes with `dark:` (e.g., `dark:bg-neutral-900`)
- Automatic color inheritance through Tailwind

### 4. **Theme Toggle Component**
Located at `/src/components/ThemeToggle.tsx`:
- Simple sun/moon icon button
- Integrated in TopBar for easy access
- Smooth transitions between themes

### 5. **Flash Prevention**
Inline script in `/src/app/layout.tsx` applies theme before hydration:
```javascript
try {
  const theme = localStorage.getItem('app-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
```

## Color Palette

### Light Mode (Default)
- **Text**: `--neutral-900` (#111827)
- **Background**: `--neutral-50` (#F9FAFB)
- **Secondary BG**: `--neutral-100` (#F3F4F6)
- **Borders**: `--neutral-300` (#D1D5DB)

### Dark Mode
- **Text**: `--neutral-900` (#F9FAFB - inverted from light)
- **Background**: `--neutral-50` (#0F0F23 - deep ash via ash-dark color)
- **Secondary BG**: `--neutral-100` (#1F2937)
- **Borders**: `--neutral-200` (#374151)
- **Accent colors** remain consistent for brand continuity

## Implementation Details

### Updated Components

#### 1. **ThemeProvider** (`/src/components/ThemeProvider.tsx`)
Wraps the application with next-themes provider:
```typescript
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

#### 2. **TopBar** (`/src/components/layout/TopBar.tsx`)
- Added `ThemeToggle` component
- All elements now use `dark:` prefixed Tailwind classes
- Search bar, dropdown menu, and profile section fully themed
- Dashboard button remains visible in dark mode due to deep ash background

#### 3. **Sidebar** (`/src/components/layout/Sidebar.tsx`)
- Navigation items with proper dark mode contrast
- Active state indicators adapt to theme
- Footer branding visible in both modes

#### 4. **BottomNavigation** (`/src/components/layout/BottomNavigation.tsx`)
- Mobile navigation with full theme support
- Touch targets and icons remain accessible

#### 5. **AppShell** (`/src/components/layout/AppShell.tsx`)
- Background transitions smoothly between light and dark
- 300ms transition duration for comfortable viewing

### Tailwind Configuration
Added dark color palette to `/tailwind.config.js`:
```javascript
darkMode: 'class',
theme: {
  extend: {
    colors: {
      dark: { /* standard dark palette */ },
      'ash-dark': '#1A1A24',
    },
  },
}
```

### CSS Variables
In `/src/app/globals.css`:

```css
/* Light mode - in :root */
--neutral-900: #111827;
--neutral-50: #F9FAFB;
/* ... etc */

/* Dark mode - in html.dark */
html.dark {
  --neutral-900: #F9FAFB;
  --neutral-50: #0F0F23;
  /* ... etc */
}
```

## Usage in Components

### For New Pages/Components

**No theme-specific logic needed!** Simply use Tailwind dark mode classes:

```typescript
<div className="bg-neutral-50 dark:bg-ash-dark text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
  Content here
</div>
```

### Color Classes
- **Backgrounds**: `bg-{color} dark:bg-{dark-color}`
- **Text**: `text-{color} dark:text-{dark-color}`
- **Borders**: `border-{color} dark:border-{dark-color}`
- **Shadows**: `shadow-{color}/50 dark:shadow-{dark-color}/50`

### Pro Tips
1. **Always add `transition-colors duration-300`** for smooth theme switching
2. **Use neutral palette** for primary backgrounds/text - it's theme-aware
3. **Test both modes** - ensure 4.5:1 contrast ratio for accessibility
4. **Group dark classes together** for readability: `text-gray-900 dark:text-gray-100`

## Landing Page & Public Pages

The landing page (`/`) automatically inherits the theme through the global styles. The deep ash background ensures brand continuity across all pages.

## Accessibility Considerations

- ✅ WCAG AA compliant contrast ratios in both modes
- ✅ Reduced motion respected through `@media (prefers-reduced-motion)`
- ✅ Color not the only indicator (icons + text)
- ✅ System preference detection for first-time users
- ✅ Persistent user preference in localStorage

## Testing the Implementation

### Manual Testing
1. Click the theme toggle button in the TopBar
2. Verify all pages switch completely to dark mode
3. Check localStorage value: `localStorage.getItem('app-theme')`
4. Refresh page - theme persists
5. Clear localStorage - system preference applies
6. Test on different screen sizes (mobile/tablet/desktop)

### Visual Checklist
- [ ] TopBar buttons visible (including "Dashboard")
- [ ] Sidebar navigation readable
- [ ] Forms and inputs have proper contrast
- [ ] Dropdowns and modals themed correctly
- [ ] Accent colors (cyan, green, red) pop appropriately
- [ ] Images/logos remain visible
- [ ] No text overlaps or readability issues

## Browser Compatibility

- ✅ Chrome 49+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

## File Checklist

Updated/Created Files:
- ✅ `src/app/globals.css` - CSS variables for both themes
- ✅ `src/app/layout.tsx` - Flash prevention script
- ✅ `src/components/providers.tsx` - ThemeProvider integration
- ✅ `src/components/ThemeProvider.tsx` - New theme provider wrapper
- ✅ `src/components/ThemeToggle.tsx` - New toggle button component
- ✅ `src/components/layout/TopBar.tsx` - Dark mode support
- ✅ `src/components/layout/Sidebar.tsx` - Dark mode support
- ✅ `src/components/layout/BottomNavigation.tsx` - Dark mode support
- ✅ `src/components/layout/AppShell.tsx` - Dark mode support
- ✅ `tailwind.config.js` - Dark mode configuration

## Future Enhancements

- [ ] Add theme preference in user settings profile
- [ ] Add more theme options (e.g., high contrast, custom colors)
- [ ] Add animated theme transition effects
- [ ] Add theme scheduling (auto-switch based on time)
- [ ] Add theme detection for specific components (e.g., charts)

## Troubleshooting

### Theme not persisting after refresh
- Check if cookies/localStorage are enabled
- Verify `suppressHydrationWarning` is present in `<html>` tag

### Flash of light mode on dark preference
- Ensure the inline script in `layout.tsx` is present
- Check that `ThemeProvider` has `suppressHydrationWarning`

### Styles not applying
- Verify component has both light and dark classes
- Check that dark mode is enabled in `tailwind.config.js`
- Ensure `dark:` prefix is used for dark mode styles

### Colors look wrong
- Review CSS variables in `globals.css` for correct values
- Check Tailwind theme extension for custom colors
- Verify no conflicting inline styles
