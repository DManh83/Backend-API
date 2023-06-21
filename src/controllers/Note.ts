import { Request, Response } from 'express';
import { isEmpty } from 'lodash';

import { SharingChangeEvent } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import {
  CreateNewTagParams,
  CreateNoteParams,
  DeleteNoteParams,
  DeleteTagParams,
  GetNoteListParams,
  GetTagListParams,
  UndoNoteParams,
  UpdateMultipleNoteParams,
  UpdateNoteParams,
  UpdateTagParams,
} from '../interfaces/Note';
import SharingChangeModel from '../models/SharingChange';
import NoteRepository from '../repositories/Note';
import { noteSerializer, tagSerializer } from '../serializers/NoteSerializer';
import NoteServices from '../services/Note';

class NoteController extends NoteServices {
  public createNote = async (req: Request<{}, {}, CreateNoteParams>, res: Response) => {
    const { user, body: recordParams } = req;
    const newData = {
      babyBookId: recordParams.babyBookId,
      title: recordParams.title,
      content: recordParams.content,
      isPinned: !!recordParams.isPinned,
    };

    if (recordParams.tagIds?.length) {
      const tags = await NoteRepository.getTagByIds(recordParams.tagIds);
      if (tags.length !== recordParams.tagIds.length) {
        throw new NotFoundError(messages.tag.notFound);
      }
    }

    await withTransaction(async (trans) => {
      const note = await this.createNew(user, newData, trans);

      if (note && recordParams.tagIds) {
        await this.addTagsToNote(recordParams.tagIds, note.id, trans);
      }
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: note.babyBookId,
          event: SharingChangeEvent.CREATE_NOTE,
          to: {
            noteTitle: note.title,
          },
        });
      }
    });

    response.success(res);
  };

  public getNoteList = async (req: Request<{}, {}, {}, GetNoteListParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);
    const { session, user } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const notes = await NoteRepository.findNotesWithPagination({
      userId: user?.id || session?.userId,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(notes, noteSerializer));
  };

  public updateNote = async (req: Request<{}, {}, UpdateNoteParams>, res: Response) => {
    const { body: updateParams, user } = req;
    const { id } = req.params as { id: string };

    const existedNote = await NoteRepository.getNoteById(id);
    if (!existedNote || user.id !== existedNote.userId) throw new NotFoundError(messages.note.notFound);

    await withTransaction(async (trans) => {
      const { tagIds, ...newData } = updateParams;
      if (!isEmpty(newData)) {
        await this.update(existedNote, newData, trans);
      }

      if (tagIds) {
        await this.updateTagInNote(id, tagIds, trans);
      }
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedNote.babyBookId,
          event: SharingChangeEvent.UPDATE_NOTE,
          to: {
            total: 1,
          },
        });
      }
    });

    response.success(res);
  };

  public updateMultipleNote = async (req: Request<{}, {}, UpdateMultipleNoteParams>, res: Response) => {
    const {
      body: { ids, ...updateParams },
      user,
    } = req;

    const existedNotes = await NoteRepository.getNoteByIds(ids, user.id);
    if (existedNotes.length !== ids.length) throw new NotFoundError(messages.note.notFound);

    await withTransaction(async (trans) => {
      const { tagIds, isAddingTag, ...newData } = updateParams;
      if (!isEmpty(newData)) {
        await this.updateMultiple(existedNotes, newData, trans);
      }

      if (tagIds) {
        if (isAddingTag) {
          await Promise.all(existedNotes.map(async (note) => this.addTagsToNote(tagIds, note.id, trans)));
        } else {
          const noteIds = existedNotes.map((note) => note.id);
          await this.removeTagFromNote(tagIds, noteIds, trans);
        }
      }

      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedNotes[0].babyBookId,
          event: SharingChangeEvent.UPDATE_NOTE,
          to: {
            total: existedNotes.length,
          },
        });
      }
    });

    response.success(res);
  };

  public createNewTag = async (req: Request<{}, {}, CreateNewTagParams>, res: Response) => {
    const { user, body: tagParams } = req;

    const existedTag = await NoteRepository.findTagByName(tagParams.name, user.id);
    if (existedTag) throw new BadRequestError(messages.tag.alreadyExists);

    let newTag;

    await withTransaction(async (trans) => {
      newTag = await this.createTag(tagParams.name, user.id, trans);
    });

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: tagParams.babyBookId || null,
        event: SharingChangeEvent.CREATE_TAG,
        to: {
          tagName: tagParams.name,
        },
      });
    }

    response.success(res, tagSerializer(newTag));
  };

  public getTagList = async (req: Request<{}, {}, {}, GetTagListParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);
    const tags = await NoteRepository.findTagsWithPagination({
      userId: req.query.userId || req.user.id,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(tags, tagSerializer));
  };

  public updateTag = async (req: Request<{}, {}, UpdateTagParams>, res: Response) => {
    const { body: updateParams, user } = req;
    const { id } = req.params as { id: string };

    const existedTag = await NoteRepository.getTagById(id);
    if (!existedTag) throw new NotFoundError(messages.tag.notFound);

    const duplicatedName = await NoteRepository.findTagByName(updateParams.name, req.user.id);
    if (duplicatedName) throw new BadRequestError(messages.tag.alreadyExists);

    if (isEmpty(updateParams) || user.id !== existedTag.userId) {
      throw new BadRequestError(messages.tag.notFound);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: updateParams.babyBookId || null,
          event: SharingChangeEvent.UPDATE_TAG,
          from: {
            tagName: existedTag.name,
          },
          to: {
            tagName: updateParams.name,
          },
        });
      }
      await this.updateTagService(existedTag, updateParams, trans);
    });

    response.success(res, tagSerializer(existedTag));
  };

  public deleteNote = async (req: Request<{}, {}, {}, DeleteNoteParams>, res: Response) => {
    const deleteParams: DeleteNoteParams = parseFormData(req.query, ['force', 'ids']);
    const { user } = req;

    const notes = await NoteRepository.getNoteByIds(deleteParams.ids, req.user.id);

    if (!notes.length || notes.length !== deleteParams.ids.length) {
      throw new NotFoundError(messages.note.notFound);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: notes[0].babyBookId,
          event: SharingChangeEvent.DELETE_NOTE,
          to: {
            total: notes.length,
          },
        });
      }
      await this.deleteNoteService(notes, deleteParams.force || false, trans);
    });

    response.success(res);
  };

  public undoNote = async (req: Request<{}, {}, UndoNoteParams>, res: Response) => {
    const undoParams = req.body;
    const notes = await NoteRepository.getNoteByIds(undoParams.ids, req.user.id);

    if (notes.length !== undoParams.ids.length) {
      throw new NotFoundError(messages.note.notFound);
    }

    await withTransaction(async (trans) => {
      await this.undoNoteService(undoParams.ids, trans);
    });

    response.success(res);
  };

  public deleteTag = async (req: Request<{}, {}, {}, DeleteTagParams>, res: Response) => {
    const { user } = req;
    const deleteParams: DeleteTagParams = parseFormData(req.query, ['force', 'ids']);

    const tags = await NoteRepository.getTagByIds(deleteParams.ids, req.user.id);

    if (!tags.length || tags.length !== deleteParams.ids.length) {
      throw new NotFoundError(messages.tag.notFound);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: deleteParams.babyBookId || null,
          event: SharingChangeEvent.DELETE_TAG,
          to: {
            tagName: tags.map((t) => t.name).join(', '),
          },
        });
      }
      await this.deleteTagService(tags, deleteParams.force || false, trans);
    });

    response.success(res);
  };
}

export default new NoteController();
