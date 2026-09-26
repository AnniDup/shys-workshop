/*
  Build internal links through this, never by hand.
  It adds the base path (/shys-workshop) while on GitHub Pages.
  When the site moves to its own domain, remove `base` from astro.config.mjs
  and every link follows automatically.

  url('/')                  -> /shys-workshop/
  url('/games')             -> /shys-workshop/games
  url('games/vault-88')     -> /shys-workshop/games/vault-88
*/
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}

// True when the current page is at or below `path`. Used for nav highlighting.
export function isCurrent(current: URL, path: string): boolean {
  const target = url(path).replace(/\/$/, '');
  const here = current.pathname.replace(/\/$/, '');
  return here === target || here.startsWith(`${target}/`);
}
