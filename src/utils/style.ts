export function injectStyle(css: string): void {
  GM_addStyle(css);
}

export function injectStyleFromModules(styles: Record<string, string>): void {
  Object.values(styles).forEach((css) => {
    GM_addStyle(css);
  });
}