import type { BlockType } from './types';

export const STORAGE_KEY = 'codex-notion-documents';

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraph',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  'bulleted-list': 'Bulleted List',
  'numbered-list': 'Numbered List',
  todo: 'To-do',
  quote: 'Quote',
  code: 'Code',
};
