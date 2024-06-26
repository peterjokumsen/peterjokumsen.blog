import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TransformArticleContentPipe } from './transform-article-content.pipe';

describe(TransformArticleContentPipe.name, () => {
  let pipe: TransformArticleContentPipe;
  let domSanitizer: Partial<jest.Mocked<DomSanitizer>>;

  beforeEach(() => {
    domSanitizer = {
      sanitize: jest.fn().mockImplementation((_, v) => v),
      bypassSecurityTrustHtml: jest
        .fn()
        .mockImplementation((v) => v as SafeHtml),
    };

    TestBed.configureTestingModule({
      providers: [
        // keep split
        { provide: DomSanitizer, useValue: domSanitizer },
        TransformArticleContentPipe,
      ],
    });

    pipe = TestBed.inject(TransformArticleContentPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    let result: string | SafeHtml;

    describe('when value is regular string', () => {
      beforeEach(() => {
        result = pipe.transform('value');
      });

      it('should return value', () => {
        expect(pipe.transform('value')).toEqual('value');
      });

      it('should not use sanitizer', () => {
        expect(domSanitizer.sanitize).not.toHaveBeenCalled();
      });
    });

    describe('when value is undefined', () => {
      it('should return empty string', () => {
        expect(pipe.transform(undefined)).toEqual('');
      });
    });

    describe('when value is array', () => {
      it('should join array with space', () => {
        expect(pipe.transform(['value', 'value'])).toEqual('value value');
      });
    });

    describe('when value has link markdown', () => {
      beforeEach(() => {
        result = pipe.transform('Hello to [value](#)');
      });

      it('should return value with anchor tag', () => {
        expect(result).toEqual('Hello to <a href="#" class="link">value</a>');
      });

      it('should sanitize url', () => {
        expect(domSanitizer.sanitize).toHaveBeenCalledWith(
          SecurityContext.URL,
          '#',
        );
      });

      it('should bypass security for anchor tag', () => {
        expect(domSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
          'Hello to <a href="#" class="link">value</a>',
        );
      });
    });

    describe('when multiple links in content', () => {
      beforeEach(() => {
        result = pipe.transform(
          'Hello to [first link](#) and [second link](https://website.com)',
        );
      });

      it('should return value with anchor tags', () => {
        expect(result).toEqual(
          'Hello to <a href="#" class="link">first link</a> and <a href="https://website.com" target="_blank" class="link">second link</a>',
        );
      });
    });

    describe('when value has image markdown', () => {
      beforeEach(() => {
        result = pipe.transform('![alt text](/image.jpg)');
      });

      it('should return value with img tag', () => {
        expect(result).toEqual(
          '<img srcSet="/image.jpg" alt="alt text" class="image" />',
        );
      });

      it('should sanitize image source', () => {
        expect(domSanitizer.sanitize).toHaveBeenCalledWith(
          SecurityContext.URL,
          '/image.jpg',
        );
      });
    });
  });
});
