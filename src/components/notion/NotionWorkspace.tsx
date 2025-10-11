'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ToolbarButton } from './ToolbarButton';
import { BLOCK_LABELS, STORAGE_KEY } from './constants';
import type { Block, BlockType, Document } from './types';
import {
  createDefaultBlock,
  createDefaultDocument,
  findAncestor,
  getBlockById,
  isNodeWithinTag,
  placeCaretAtEnd,
  unwrapCodeElement,
} from './utils';

export function NotionWorkspace() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [inlineState, setInlineState] = useState({
    bold: false,
    italic: false,
    underline: false,
    code: false,
  });
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Document[];
        if (Array.isArray(parsed) && parsed.length) {
          setDocuments(parsed);
          setActiveId(parsed[0]?.id ?? null);
          setHydrated(true);
          return;
        }
      } catch {
        // ignore corrupt payloads
      }
    }

    const initialDoc = createDefaultDocument();
    setDocuments([initialDoc]);
    setActiveId(initialDoc.id);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents, hydrated]);

  const activeDocument = useMemo(() => {
    if (!documents.length) {
      return undefined;
    }
    if (!activeId) {
      return documents[0];
    }
    return documents.find((doc) => doc.id === activeId) ?? documents[0];
  }, [activeId, documents]);

  useEffect(() => {
    if (!documents.length) {
      return;
    }
    if (!activeId || !documents.some((doc) => doc.id === activeId)) {
      setActiveId(documents[0].id);
    }
  }, [activeId, documents]);

  const setBlockRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      blockRefs.current[id] = node;
    } else {
      delete blockRefs.current[id];
    }
  }, []);

  const focusBlock = useCallback((blockId: string) => {
    requestAnimationFrame(() => {
      const node = blockRefs.current[blockId];
      if (node) {
        node.focus();
        placeCaretAtEnd(node);
      }
    });
  }, []);

  const updateDocument = useCallback(
    (docId: string, updater: (doc: Document) => Document) => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== docId) {
            return doc;
          }
          const next = updater(doc);
          return { ...next, updatedAt: Date.now() };
        }),
      );
    },
    [],
  );

  const createDocument = useCallback(() => {
    const doc = createDefaultDocument();
    setDocuments((prev) => [doc, ...prev]);
    setActiveId(doc.id);
  }, []);

  const deleteDocument = useCallback(
    (docId: string) => {
      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.id !== docId);
        if (!filtered.length) {
          const nextDoc = createDefaultDocument();
          setActiveId(nextDoc.id);
          return [nextDoc];
        }
        if (docId === activeId) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      if (!activeDocument) {
        return;
      }
      const title = value.trim().length ? value : 'Untitled';
      updateDocument(activeDocument.id, (doc) => ({ ...doc, title }));
    },
    [activeDocument, updateDocument],
  );

  const handleBlockChange = useCallback(
    (blockId: string, html: string) => {
      if (!activeDocument) {
        return;
      }
      updateDocument(activeDocument.id, (doc) => ({
        ...doc,
        blocks: doc.blocks.map((block) =>
          block.id === blockId ? { ...block, html } : block,
        ),
      }));
    },
    [activeDocument, updateDocument],
  );

  const insertBlockAfter = useCallback(
    (blockId: string, type?: BlockType) => {
      if (!activeDocument) {
        return;
      }
      const block = createDefaultBlock(
        type ?? getBlockById(activeDocument, blockId)?.type ?? 'paragraph',
      );
      updateDocument(activeDocument.id, (doc) => {
        const index = doc.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) {
          return doc;
        }
        const blocks = [...doc.blocks];
        blocks.splice(index + 1, 0, block);
        return { ...doc, blocks };
      });
      focusBlock(block.id);
    },
    [activeDocument, focusBlock, updateDocument],
  );

  const removeBlock = useCallback(
    (blockId: string, fallbackFocus?: string) => {
      if (!activeDocument) {
        return;
      }
      updateDocument(activeDocument.id, (doc) => {
        if (doc.blocks.length === 1) {
          return doc;
        }
        const blocks = doc.blocks.filter((block) => block.id !== blockId);
        return { ...doc, blocks };
      });
      if (fallbackFocus) {
        focusBlock(fallbackFocus);
      }
    },
    [activeDocument, focusBlock, updateDocument],
  );

  const handleToggleTodo = useCallback(
    (blockId: string) => {
      if (!activeDocument) {
        return;
      }
      updateDocument(activeDocument.id, (doc) => ({
        ...doc,
        blocks: doc.blocks.map((block) =>
          block.id === blockId ? { ...block, checked: !block.checked } : block,
        ),
      }));
    },
    [activeDocument, updateDocument],
  );

  const changeBlockType = useCallback(
    (blockId: string, type: BlockType) => {
      if (!activeDocument) {
        return;
      }
      updateDocument(activeDocument.id, (doc) => ({
        ...doc,
        blocks: doc.blocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                type,
                checked: type === 'todo' ? Boolean(block.checked) : undefined,
              }
            : block,
        ),
      }));
      focusBlock(blockId);
    },
    [activeDocument, focusBlock, updateDocument],
  );

  const addBlockAtEnd = useCallback(
    (type: BlockType) => {
      if (!activeDocument) {
        return;
      }
      const block = createDefaultBlock(type);
      updateDocument(activeDocument.id, (doc) => ({
        ...doc,
        blocks: [...doc.blocks, block],
      }));
      focusBlock(block.id);
    },
    [activeDocument, focusBlock, updateDocument],
  );

  const refreshInlineState = useCallback(() => {
    if (typeof document === 'undefined') {
      return;
    }
    try {
      const selection = document.getSelection();
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const code =
        isNodeWithinTag(selection?.anchorNode ?? null, 'CODE') ||
        isNodeWithinTag(selection?.focusNode ?? null, 'CODE');
      const nextState = {
        bold: Boolean(bold),
        italic: Boolean(italic),
        underline: Boolean(underline),
        code,
      };
      setInlineState((prev) =>
        prev.bold === nextState.bold &&
        prev.italic === nextState.italic &&
        prev.underline === nextState.underline &&
        prev.code === nextState.code
          ? prev
          : nextState,
      );
    } catch {
      // Some browsers throw when queryCommandState is unsupported
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const handler = () => {
      refreshInlineState();
    };
    document.addEventListener('selectionchange', handler);
    return () => {
      document.removeEventListener('selectionchange', handler);
    };
  }, [refreshInlineState]);

  useEffect(() => {
    refreshInlineState();
  }, [refreshInlineState, focusedBlockId]);

  const handleBlockFocus = useCallback(
    (blockId: string) => {
      setFocusedBlockId(blockId);
      refreshInlineState();
    },
    [refreshInlineState],
  );

  const applyInlineFormat = useCallback(
    (command: 'bold' | 'italic' | 'underline') => {
      if (typeof document === 'undefined') {
        return;
      }
      document.execCommand(command, false);
      requestAnimationFrame(refreshInlineState);
    },
    [refreshInlineState],
  );

  const applyInlineCode = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    const existing =
      findAncestor(range.commonAncestorContainer, 'CODE') ??
      findAncestor(selection.anchorNode, 'CODE') ??
      findAncestor(selection.focusNode, 'CODE');
    if (existing) {
      unwrapCodeElement(existing);
      requestAnimationFrame(refreshInlineState);
      return;
    }
    if (range.collapsed) {
      return;
    }
    const selectedText = range.toString();
    const codeNode = document.createElement('code');
    codeNode.textContent = selectedText;
    range.deleteContents();
    range.insertNode(codeNode);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.setStartAfter(codeNode);
    nextRange.collapse(true);
    selection.addRange(nextRange);
    requestAnimationFrame(refreshInlineState);
  }, [refreshInlineState]);

  const applyBlockWrap = useCallback(
    (type: BlockType) => {
      const targetId = focusedBlockId;
      if (targetId) {
        changeBlockType(targetId, type);
        return;
      }
      addBlockAtEnd(type);
    },
    [addBlockAtEnd, changeBlockType, focusedBlockId],
  );

  const insertSiblingBlock = useCallback(
    (type: BlockType) => {
      const targetId = focusedBlockId;
      if (targetId) {
        insertBlockAfter(targetId, type);
        return;
      }
      addBlockAtEnd(type);
    },
    [addBlockAtEnd, focusedBlockId, insertBlockAfter],
  );

  if (!activeDocument) {
    return null;
  }

  const focusedBlockType = focusedBlockId
    ? (getBlockById(activeDocument, focusedBlockId)?.type ?? null)
    : null;

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col rounded-lg border border-border bg-background shadow-sm md:flex-row">
      <aside className="flex w-full flex-shrink-0 flex-col border-b border-border md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Documents
          </h2>
          <Button
            onClick={createDocument}
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-medium"
          >
            New Page
          </Button>
        </div>
        <div className="space-y-1 px-3 pb-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                doc.id === activeDocument.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveId(doc.id)}
                className="flex-1 truncate text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                {doc.title}
              </button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Delete “${doc.title || 'Untitled'}”? This cannot be undone.`,
                  );
                  if (confirmed) {
                    deleteDocument(doc.id);
                  }
                }}
                className="ml-2 h-7 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex w-full flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-4">
          <Input
            value={activeDocument.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Untitled"
            className="w-full max-w-sm border-none bg-transparent px-0 text-2xl font-semibold shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value={
                focusedBlockId
                  ? (getBlockById(activeDocument, focusedBlockId)?.type ?? 'paragraph')
                  : 'paragraph'
              }
              onChange={(event) =>
                focusedBlockId &&
                changeBlockType(focusedBlockId, event.target.value as BlockType)
              }
              className="h-8 w-40 border-border bg-card text-xs"
            >
              {Object.entries(BLOCK_LABELS).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </Select>
            <ToolbarButton
              label="Bold"
              onClick={() => applyInlineFormat('bold')}
              active={inlineState.bold}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              onClick={() => applyInlineFormat('italic')}
              active={inlineState.italic}
            >
              I
            </ToolbarButton>
            <ToolbarButton
              label="Underline"
              onClick={() => applyInlineFormat('underline')}
              active={inlineState.underline}
            >
              U
            </ToolbarButton>
            <ToolbarButton
              label="Inline Code"
              onClick={applyInlineCode}
              active={inlineState.code}
            >
              {'</>'}
            </ToolbarButton>
            <ToolbarButton
              label="Quote Block"
              onClick={() => applyBlockWrap('quote')}
              active={focusedBlockType === 'quote'}
            >
              ❝
            </ToolbarButton>
            <ToolbarButton
              label="Bulleted List"
              onClick={() => applyBlockWrap('bulleted-list')}
              active={focusedBlockType === 'bulleted-list'}
            >
              •
            </ToolbarButton>
            <ToolbarButton
              label="Numbered List"
              onClick={() => applyBlockWrap('numbered-list')}
              active={focusedBlockType === 'numbered-list'}
            >
              1.
            </ToolbarButton>
            <ToolbarButton
              label="To-do"
              onClick={() => applyBlockWrap('todo')}
              active={focusedBlockType === 'todo'}
            >
              ☑
            </ToolbarButton>
            <ToolbarButton
              label="Code Block"
              onClick={() => applyBlockWrap('code')}
              active={focusedBlockType === 'code'}
            >
              {'{ }'}
            </ToolbarButton>
            <Button
              onClick={() => insertSiblingBlock('paragraph')}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
            >
              + Block
            </Button>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            {activeDocument.blocks.map((block, index) => {
              const numberedIndex =
                block.type === 'numbered-list'
                  ? activeDocument.blocks
                      .slice(0, index)
                      .filter((candidate) => candidate.type === 'numbered-list').length +
                    1
                  : 0;
              return (
                <BlockEditor
                  key={block.id}
                  block={block}
                  numberedIndex={numberedIndex}
                  onInput={handleBlockChange}
                  onToggleTodo={handleToggleTodo}
                  onFocus={handleBlockFocus}
                  onEnter={(event) => {
                    event.preventDefault();
                    const newType =
                      block.type === 'bulleted-list' ||
                      block.type === 'numbered-list' ||
                      block.type === 'todo'
                        ? block.type
                        : 'paragraph';
                    insertBlockAfter(block.id, newType);
                  }}
                  onDelete={() => {
                    const fallback =
                      activeDocument.blocks[index - 1]?.id ??
                      activeDocument.blocks[index + 1]?.id;
                    removeBlock(block.id, fallback);
                  }}
                  registerRef={(node) => setBlockRef(block.id, node)}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function BlockEditor({
  block,
  numberedIndex,
  onInput,
  onToggleTodo,
  onFocus,
  onEnter,
  onDelete,
  registerRef,
}: {
  block: Block;
  numberedIndex: number;
  onInput: (blockId: string, html: string) => void;
  onToggleTodo: (blockId: string) => void;
  onFocus: (blockId: string) => void;
  onEnter: (event: KeyboardEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  registerRef: (node: HTMLDivElement | null) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const setEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      registerRef(node);
    },
    [registerRef],
  );

  useEffect(() => {
    const node = editorRef.current;
    if (!node) {
      return;
    }
    const nextHtml = block.html?.length ? block.html : '<br />';
    if (node.innerHTML !== nextHtml) {
      node.innerHTML = nextHtml;
    }
  }, [block.html]);

  const wrapperClasses = useMemo(() => {
    switch (block.type) {
      case 'heading1':
        return 'text-3xl font-semibold';
      case 'heading2':
        return 'text-2xl font-semibold';
      case 'heading3':
        return 'text-xl font-semibold';
      case 'quote':
        return 'border-l-2 border-border pl-4 italic text-muted-foreground';
      case 'code':
        return 'rounded-lg bg-muted px-4 py-3 font-mono text-sm whitespace-pre-wrap';
      default:
        return 'text-base';
    }
  }, [block.type]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (block.type !== 'code' && event.key === 'Enter' && !event.shiftKey) {
        onEnter(event);
        return;
      }
      if (event.key === 'Backspace') {
        const content = event.currentTarget.textContent ?? '';
        if (!content.trim().length) {
          event.preventDefault();
          onDelete();
        }
      }
    },
    [block.type, onDelete, onEnter],
  );

  const sharedProps = {
    ref: setEditorRef,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: (event: FormEvent<HTMLDivElement>) =>
      onInput(block.id, (event.currentTarget as HTMLDivElement).innerHTML),
    onFocus: () => onFocus(block.id),
    onKeyDown: handleKeyDown,
    'data-placeholder': block.type === 'paragraph' ? 'Type / for commands' : undefined,
  } as const;

  if (block.type === 'todo') {
    return (
      <label className="group relative flex items-start gap-3 rounded-md px-3 py-1.5 hover:bg-muted/60">
        <Checkbox
          checked={Boolean(block.checked)}
          onChange={() => onToggleTodo(block.id)}
          className="mt-1"
        />
        <div className="w-full">
          <div
            {...sharedProps}
            className="w-full outline-none"
            style={{
              textDecoration: block.checked ? 'line-through' : undefined,
              opacity: block.checked ? 0.6 : 1,
            }}
          />
        </div>
      </label>
    );
  }

  return (
    <div className="group relative flex items-start gap-3">
      <div
        className={cn(
          'mt-2 flex h-5 w-5 flex-shrink-0 items-center justify-center text-xs text-muted-foreground transition-opacity',
          block.type === 'bulleted-list' || block.type === 'numbered-list'
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100',
        )}
      >
        {block.type === 'bulleted-list'
          ? '•'
          : block.type === 'numbered-list'
            ? `${numberedIndex}.`
            : '⋮'}
      </div>
      <div
        {...sharedProps}
        className={`w-full rounded-md px-3 py-1.5 outline-none transition-colors hover:bg-muted/60 focus:bg-muted/60 ${wrapperClasses}`}
      />
    </div>
  );
}
