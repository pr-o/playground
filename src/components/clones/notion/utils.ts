import type { Block, BlockType, Document } from './types';

export function placeCaretAtEnd(node?: HTMLDivElement | null) {
  if (!node) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function getBlockById(doc: Document, blockId: string) {
  return doc.blocks.find((block) => block.id === blockId);
}

export function isNodeWithinTag(node: Node | null, tag: string): boolean {
  if (!node) {
    return false;
  }
  if (node instanceof HTMLElement && node.tagName.toLowerCase() === tag.toLowerCase()) {
    return true;
  }
  return isNodeWithinTag(node.parentNode, tag);
}

export function findAncestor(node: Node | null, tag: string): HTMLElement | null {
  if (!node) {
    return null;
  }
  if (node instanceof HTMLElement && node.tagName.toLowerCase() === tag.toLowerCase()) {
    return node;
  }
  return findAncestor(node.parentNode, tag);
}

export function unwrapCodeElement(codeNode: HTMLElement) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const parent = codeNode.parentNode;
  if (!parent) {
    return;
  }
  const selection = window.getSelection();
  const range = document.createRange();
  const fragment = document.createDocumentFragment();
  while (codeNode.firstChild) {
    fragment.appendChild(codeNode.firstChild);
  }
  parent.replaceChild(fragment, codeNode);
  if (selection) {
    selection.removeAllRanges();
    range.selectNodeContents(parent);
    range.collapse(false);
    selection.addRange(range);
  }
}

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export function createDefaultBlock(type: BlockType = 'paragraph'): Block {
  return {
    id: createId(),
    type,
    html: '',
    checked: type === 'todo' ? false : undefined,
  };
}

export function createDefaultDocument(): Document {
  const block = createDefaultBlock();
  return {
    id: createId(),
    title: 'Untitled',
    blocks: [block],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
