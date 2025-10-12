export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulleted-list'
  | 'numbered-list'
  | 'todo'
  | 'quote'
  | 'code';

export type Block = {
  id: string;
  type: BlockType;
  html: string;
  checked?: boolean;
};

export type Document = {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
};
