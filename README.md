# Angular Storage Signal

A type-safe Angular Signal synchronized with localStorage or sessionStorage.

## Features

- Angular Signals
- Cross-tab synchronization
- SSR-safe implementation
- Custom serialization
- Automatic cleanup
- Zero external dependencies

## Usage
```typescript
import { Component } from '@angular/core';
import { storageSignal } from './storage-signal';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
<button type="button" (click)="toggle()">
Theme: {{ theme() }}
</button>
  `,
})
export class ThemeSwitcherComponent {
  readonly theme = storageSignal<'light' | 'dark'>(
'theme',
'light'
  );

  toggle(): void {
this.theme.update(value =>
value === 'light' ? 'dark' : 'light'
);
  }
}
