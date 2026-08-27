export function waitForElement(
  selector: string,
  timeout: number = 10000,
  interval: number = 500
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = (): void => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };

    check();
  });
}

export function waitForElementInParent(
  parent: Element,
  selector: string,
  timeout: number = 10000,
  interval: number = 500
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = (): void => {
      const el = parent.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };

    check();
  });
}

export function on(
  element: Element | Document,
  event: string,
  selector: string | null,
  handler: EventListener
): void {
  if (selector) {
    element.addEventListener(event, (e) => {
      const target = e.target as Element;
      if (target && target.matches(selector)) {
        handler.call(target, e);
      }
    });
  } else {
    element.addEventListener(event, handler);
  }
}

export function isElementLoaded(selector: string): boolean {
  return document.querySelector(selector) !== null;
}

export function safeQuerySelector<T extends Element>(
  parent: Element | Document,
  selector: string
): T | null {
  return parent.querySelector<T>(selector);
}

export function safeQuerySelectorAll<T extends Element>(
  parent: Element | Document,
  selector: string
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}