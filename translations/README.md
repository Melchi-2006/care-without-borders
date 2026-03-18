# Translations Directory

This directory contains all multilingual translation files for the Care Without Borders application.

## Files

### en.json
English translations for all application text.

### ta.json
Tamil (தமிழ்) translations for all application text.

### hi.json
Hindi (हिन्डी) translations for all application text.

## Structure

Each translation file follows this nested JSON structure:

```json
{
  "brand": {
    "name": "...",
    "tagline": "...",
    "icon": "..."
  },
  "navigation": {
    "login": "...",
    "register": "...",
    ...
  },
  "buttons": {
    "submit": "...",
    "cancel": "...",
    ...
  },
  ...
}
```

## Accessing Translations

### From HTML
```html
<h1 data-i18n="brand.name">Care Without Borders</h1>
<button data-i18n="buttons.login">Login</button>
```

### From JavaScript
```javascript
const title = i18n.t('brand.name');
const button = i18n.t('buttons.login');
```

## Adding New Translations

1. **Add to all three files** (en.json, ta.json, hi.json)
2. **Use consistent key naming**
3. **Test in both HTML and JavaScript**

Example of adding "New Feature" section:

```json
{
  "newFeature": {
    "title": "New Feature Title",
    "description": "Feature description",
    "button": "Activate Feature"
  }
}
```

Then use:
```html
<h2 data-i18n="newFeature.title">New Feature Title</h2>
<p data-i18n="newFeature.description">Feature description</p>
<button data-i18n="newFeature.button">Activate Feature</button>
```

## Translation Guidelines

- **Consistency**: Use same terminology across all languages
- **Context**: Keep translations concise but meaningful
- **Formatting**: Maintain JSON structure exactly
- **Unicode**: Tamil and Hindi require proper Unicode support (UTF-8)
- **Special Characters**: Don't escape HTML entities

## Current Translation Categories

1. **brand** - Application branding
2. **navigation** - Menu and navigation items
3. **buttons** - Button labels
4. **sections** - Section headings (hero, stats, features)
5. **auth** - Authentication forms
6. **patient** - Patient panel
7. **doctor** - Doctor panel
8. **chatbot** - AI chatbot interface
9. **medicine** - Medicine finder
10. **messages** - User messages and notifications
11. **validation** - Form validation messages
12. **settings** - Settings and preferences

## Loading Translations

Translations are automatically loaded by `js/i18n.js` on page load:

1. ✅ Fetch all translation files
2. ✅ Parse JSON
3. ✅ Store in memory
4. ✅ Apply to DOM elements with `data-i18n`
5. ✅ Dispatch `i18nReady` event

## Fallback Behavior

- If a key is missing, falls back to **English**
- If translation key not found, displays the **key name** itself
- No error thrown - graceful degradation

## Performance Notes

- All translations loaded **once** on page load
- Language switching is **instant** (no network requests)
- Minimal memory footprint (typical ~50KB all languages combined)
- No external dependencies required

## Verification

To verify translation files are valid:

1. Open browser DevTools (F12)
2. Check Console tab for any errors
3. Look for: `✓ Loaded [language] translations`
4. Test language switcher in navbar

## Maintenance

When updating translations:

1. Edit the JSON file
2. Verify valid JSON syntax
3. Test in browser
4. No server restart needed (use cache-bust if needed)

## Language Codes

- `en` = English
- `ta` = Tamil
- `hi` = Hindi

Use these codes with:
- `i18n.setLanguage('ta')`
- `i18n.getLanguage()`
- API language headers

---

For setup and usage instructions, see:
- [MULTILINGUAL_GUIDE.md](../MULTILINGUAL_GUIDE.md)
- [MULTILINGUAL_IMPLEMENTATION_EXAMPLES.md](../MULTILINGUAL_IMPLEMENTATION_EXAMPLES.md)
