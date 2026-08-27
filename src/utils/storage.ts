export async function getValue<T>(key: string, defaultValue?: T): Promise<T> {
  return GM.getValue<T>(key, defaultValue as T);
}

export async function setValue(key: string, value: unknown): Promise<void> {
  return GM.setValue(key, value);
}

export function getValueSync<T>(key: string, defaultValue?: T): T {
  return GM_getValue<T>(key, defaultValue as T);
}

export function setValueSync(key: string, value: unknown): void {
  GM_setValue(key, value);
}