import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  IntroductionBackgroundStyle,
  IntroductionCallToAction,
} from './models';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'pj-ui-page-introduction',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex min-h-screen flex-col items-start"
      [attr.style]="backgroundStyle()"
    >
      <div
        class="main-colors m-5 items-center rounded border-2 bg-opacity-50 p-12"
      >
        <h1 class="mb-8 justify-start text-3xl font-bold">{{ title() }}</h1>
        @for (paragraph of paragraphs(); track paragraph) {
          <p class="mb-6 text-xl">{{ paragraph }}</p>
        }
        @if (callToActions().length > 0) {
          <div class="actions mt-8 flex flex-col gap-4">
            @for (action of callToActions(); track action.label) {
              <a
                href="#"
                class="pj-button {{ action.type || 'primary' }} text-center"
                (click)="action.onClick($event)"
              >
                {{ action.label }}
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageIntroductionComponent {
  private readonly _defaultStyle: IntroductionBackgroundStyle = {
    url: '/assets/intro_background.webp',
    size: 'cover',
    repeat: 'no-repeat',
    position: 'top',
  };

  title = input('👋 Hi there!');
  style = input<IntroductionBackgroundStyle | undefined>({});
  paragraphs = input<string[]>([]);
  actions = input<
    IntroductionCallToAction | IntroductionCallToAction[] | undefined
  >();

  backgroundStyle = computed(() => {
    const style = this.style();
    if (!style) {
      return '';
    }

    const styleStrings = Object.entries(this._defaultStyle).reduce(
      (acc: string[], [key, defaultValue]) => {
        let styleKey: string = key;
        let value: string =
          style[key as keyof IntroductionBackgroundStyle] ?? defaultValue ?? '';
        if (key === 'url') {
          value = `url("${style.url || value}")`;
          styleKey = 'image';
        }

        acc.push(`background-${styleKey}:${value}`);
        return acc;
      },
      [],
    );
    return styleStrings.join(';');
  });
  callToActions = computed(() => {
    const actions = this.actions();
    if (!actions) {
      return [];
    }

    return Array.isArray(actions) ? actions : [actions];
  });
}