# Safari Address Bar Color Demo

Live demo: https://ionutale.github.io/demo-safari-address-bar-color-change

This SvelteKit demo showcases dynamic coloring of Safari/WebKit status and navigation bars using the `theme-color` meta tag and the page `background-color`. It includes two modes:
- Synced: both bars follow the section color smoothly.
- Split: status bar follows the top-of-screen element, while the navigation bar follows the bottom, using an IntersectionObserver trick.

## Develop

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
pnpm preview
```

## Deploy (GitHub Pages)

Push to `main`. A GitHub Actions workflow builds the site and publishes the `build/` output to Pages at the URL above. The SvelteKit base path is configured for `/demo-safari-address-bar-color-change`.
