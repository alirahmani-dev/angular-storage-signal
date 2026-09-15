import {
  DestroyRef,
  WritableSignal,
  assertInInjectionContext,
  effect,
  inject,
  signal,
} from '@angular/core';

export interface StorageSignalOptions<T> {
  storage?: Storage;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function storageSignal<T>(
  key: string,
  initialValue: T,
  options: StorageSignalOptions<T> = {}
): WritableSignal<T> {
  assertInInjectionContext(storageSignal);

  const destroyRef = inject(DestroyRef);
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize =
    options.deserialize ?? ((value: string) => JSON.parse(value) as T);

  let storage = options.storage;

  if (!storage && typeof window !== 'undefined') {
    try {
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
  }

  const readValue = (): T => {
    if (!storage) {
      return initialValue;
    }

    try {
      const value = storage.getItem(key);
      return value === null ? initialValue : deserialize(value);
    } catch {
      return initialValue;
    }
  };

  const state = signal(readValue());

  effect(() => {
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, serialize(state()));
    } catch {
      return;
    }
  });

  if (storage && typeof window !== 'undefined') {
    const listener = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== storage) {
        return;
      }

      try {
        state.set(
          event.newValue === null
            ? initialValue
            : deserialize(event.newValue)
        );
      } catch {
        state.set(initialValue);
      }
    };

    window.addEventListener('storage', listener);

    destroyRef.onDestroy(() => {
      window.removeEventListener('storage', listener);
    });
  }

  return state;
}
