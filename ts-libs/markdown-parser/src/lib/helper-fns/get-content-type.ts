import { MarkdownContentType } from '../models';

export function getContentType(line: string): MarkdownContentType {
  const trimmedLine = line.trimStart();
  if (trimmedLine.startsWith('#')) {
    return 'section';
  }

  return 'paragraph';
}