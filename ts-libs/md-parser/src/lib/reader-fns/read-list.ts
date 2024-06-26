import { lineHasContentType, provideRegexTools } from '../helper-fns';

import { ReadResult } from '../_models';
import { readParagraph } from './read-paragraph';

/**
 * Reads a list from the provided markdown lines.
 * @param lines The markdown lines to read.
 * @param start The line index to start reading.
 * @returns The read list and the last line index read.
 */
export function readList(lines: string[], start: number): ReadResult<'list'> {
  if (!lineHasContentType('list', lines[start])) {
    throw new Error(`Line "${lines[start]}" is not a list`);
  }

  const tools = provideRegexTools('list');
  let regexMatch = lines[start].match(tools.regex);
  if (!regexMatch) {
    throw new Error(`Could not match list element in line "${lines[start]}"`);
  }

  const { content: list } = tools.contentFn(regexMatch);
  if (!list.rawValue) {
    throw new Error(
      `Could not create list from "${lines[start]}", no raw value found.`,
    );
  }

  const listValues: string[] = [list.rawValue];
  let currentLineIdx = start + 1;
  for (; currentLineIdx < lines.length; currentLineIdx++) {
    regexMatch = lines[currentLineIdx].match(tools.regex);
    if (!regexMatch) {
      break;
    }

    const { content: nextList } = tools.contentFn(regexMatch);
    if (nextList.indent !== list.indent) {
      currentLineIdx--;
      break; // next list item is not at the same indent level
    }

    if (nextList.rawValue) {
      listValues.push(nextList.rawValue);
    }
  }

  list.items = listValues
    .map((v) => readParagraph([v], 0))
    .map(({ result }) => result);
  delete list.rawValue;

  return {
    result: list,
    lastLineIndex: currentLineIdx,
  };
}
