import { PaginationParams } from '../common/helpers/pagination/types';

export interface NoteAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  title?: string;
  content: string;
  rawContent?: string;
  isPinned?: boolean;
  hasTag: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  note_tag?: NoteTagAttributes[];
}

export interface CreateNoteParams {
  title?: string;
  content: string;
  babyBookId: string;
  tagIds?: string[];
  isPinned?: boolean;
}

export type NoteCreation = Omit<NoteAttributes, 'id'>;

export interface TagAttributes {
  id: string;
  userId?: string;
  name: string;
  type: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TagCreation = Omit<TagAttributes, 'id'>;

export interface NoteTagAttributes {
  id: string;
  noteId: string;
  tagId: string;
  createdAt?: Date;
  updatedAt?: Date;
  tag?: TagAttributes;
}

export type NoteTagCreation = Omit<NoteTagAttributes, 'id'>;

export interface GetNoteListParams extends PaginationParams {
  isDeleted?: boolean;
  babyBookId?: string;
}

export interface GetTagListParams extends PaginationParams {
  userId?: string;
  isDeleted?: boolean;
}

export interface UpdateNoteParams {
  isPinned?: string;
  title?: string;
  content?: string;
  tagIds?: string[];
}

export interface UpdateMultipleNoteParams {
  ids: string[];
  isPinned?: string;
  title?: string;
  content?: string;
  tagIds?: string[];
  isAddingTag?: boolean;
}

export interface CreateNewTagParams {
  name: string;
  babyBookId?: string;
}

export interface UpdateTagParams {
  name?: string;
  babyBookId?: string;
}

export interface DeleteTagParams {
  ids?: string[];
  babyBookId?: string;
  force?: boolean;
}

export interface DeleteNoteParams {
  ids?: string[];
  force?: boolean;
}

export interface UndoNoteParams {
  ids: string[];
}
