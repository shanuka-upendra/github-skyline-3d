# github-skyline-3d

An interactive, zero-dependency 3D isometric GitHub contribution skyline component for React.

- **Pure CSS 3D Isometric Extrusion** — No Three.js, WebGL, or Tailwind CSS required.
- **Live GitHub Data** — Fetches public contribution activity for any GitHub username (or accepts your own `data` array).
- **Interactive Inspector** — Hover, click, or tab through any day bar, or jump between peak days.
- **5 Built-in Themes** — `emerald`, `sky`, `violet`, `amber`, `rose`, plus custom `accentColor`.
- **TypeScript Ready** — Ships with full `.d.ts` declarations and ESM/CJS builds.

## Installation

```bash
npm install github-skyline-3d
```

## Quick Start

```tsx
import { GitHubActivity3D } from 'github-skyline-3d';
import 'github-skyline-3d/styles.css';

export function App() {
  return (
    <GitHubActivity3D
      username="shanuka-upendra"
      theme="emerald"
      weeks={24}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `username` | `string` | **Required** | GitHub username to fetch contributions for |
| `weeks` | `number` | `24` | Number of recent weeks to display (`1`–`52`) |
| `theme` | `'emerald' \| 'sky' \| 'violet' \| 'amber' \| 'rose'` | `'emerald'` | Color theme preset |
| `accentColor` | `string` | `undefined` | Custom CSS color overriding the theme accent |
| `title` | `string` | `'GitHub Activity'` | Main heading text |
| `subtitle` | `string` | `undefined` | Optional eyebrow label above the title |
| `showStats` | `boolean` | `true` | Show top KPI summary stats |
| `showInspector` | `boolean` | `true` | Show the floating day inspector card |
| `showProfileLink` | `boolean` | `true` | Show the GitHub profile link |
| `data` | `ContributionDay[]` | `undefined` | Custom `{ date, count }[]` array (skips API fetch) |
| `apiUrl` | `string` | `undefined` | Custom contributions API endpoint |
| `className` | `string` | `''` | Additional CSS class for the root element |

## License

MIT © [Shanuka Upendra](https://github.com/shanuka-upendra)
