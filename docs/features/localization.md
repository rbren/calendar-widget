# Localization

The calendar uses the browser's `Intl.DateTimeFormat` API for all text formatting, so it works with any locale supported by the runtime.

## Setting a locale

Pass a [BCP 47 language tag](https://www.ietf.org/rfc/bcp/bcp47.txt) to the `locale` prop:

```tsx
<CalendarWidget value={date} onChange={setDate} locale="fr-FR" />
```

This affects:

- **Month/year label** — e.g. `"mars 2026"` instead of `"March 2026"`
- **Weekday headers** — e.g. `"lun."`, `"mar."`, `"mer."` instead of `"Mon"`, `"Tue"`, `"Wed"`

## Changing the first day of the week

Many locales expect weeks to start on Monday. Use the `weekStartsOn` prop:

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  locale="de-DE"
  weekStartsOn={1}  // Monday
/>
```

`weekStartsOn` accepts values `0` (Sunday) through `6` (Saturday).

## Examples

| Locale | `locale` | `weekStartsOn` | Month label | Weekday headers |
|--------|----------|-----------------|-------------|-----------------|
| US English | `"en-US"` | `0` | March 2026 | Sun, Mon, Tue… |
| French | `"fr-FR"` | `1` | mars 2026 | lun., mar., mer.… |
| Japanese | `"ja-JP"` | `0` | 2026年3月 | 日, 月, 火… |
| Arabic (Egypt) | `"ar-EG"` | `6` | مارس ٢٠٢٦ | سبت, أحد, اثنين… |

## Default behavior

When `locale` is omitted, the browser's default locale is used (typically derived from the operating system or browser language settings).
