import dayjs from 'dayjs';

import env from '../../config/env';
import { NoteAttributes, TagAttributes } from '../interfaces/Note';

export const noteSerializer = (note: NoteAttributes) => ({
  id: note.id,
  babyBookId: note.babyBookId,
  title: note.title,
  content: note.content,
  isPinned: note.isPinned,
  hasTag: note.hasTag,
  isDeleted: note.isDeleted,
  destroyAt: note.isDeleted ? dayjs(note.deletedAt).add(Number(env.healthRetentionPeriod), 'days') : null,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
  tags: note.note_tag?.map((noteTag) => tagSerializer(noteTag.tag)) || [],
});

export const tagSerializer = (tag: TagAttributes) => ({
  id: tag.id,
  userId: tag.userId,
  name: tag.name,
  type: tag.type,
  isDeleted: tag.isDeleted,
  createdAt: tag.createdAt,
  updatedAt: tag.updatedAt,
});
