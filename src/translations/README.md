# Translation System

This directory contains the translation files and utilities for the application.

## Directory Structure

- `languages/`: Contains language-specific translations (e.g. `fa.js` for Persian)
- `contexts/`: Reserved for context-specific translations (if needed in the future)
- `useTranslation.js`: Hook for accessing translations

## How to Use

### Import the Translation Hook

```jsx
import { useTranslation } from '@/translations/useTranslation'
```

### Use Translations in a Component

```jsx
const MyComponent = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

## Adding New Translations

All translations are stored in the language files in the `languages` directory. To add new translations, edit the appropriate language file.

Example: Adding a new translation to `fa.js`:

```js
// Persian (Farsi) translations
const fa = {
  // ... existing translations

  // Add a new section or extend an existing one
  newSection: {
    title: 'عنوان جدید',
    description: 'توضیحات جدید'
  }
}
```

## Translation Keys Convention

Translation keys follow a nested structure for organization:

- `common`: For common UI elements (buttons, labels, etc.)
- `sidebar`: For sidebar menu items
- `navbar`: For navigation bar items
- `profile`: For profile page elements
- `settings`: For settings page elements
- `auth`: For authentication-related elements
- `messages`: For notifications and alerts

When adding new translations, follow this structure or create a new section as appropriate.
