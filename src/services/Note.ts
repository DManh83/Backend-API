import { random } from 'lodash';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';

import { CreateNoteParams, NoteCreation, UpdateNoteParams, UpdateTagParams } from '../interfaces/Note';
import NoteModel from '../models/Note';
import NoteTagModel from '../models/NoteTag';
import TagModel from '../models/Tag';

class NoteServices {
  public createNew = async (user: { id: string }, data: CreateNoteParams, transaction: Transaction) => {
    const noteShape: NoteCreation = {
      userId: user.id,
      ...data,
      hasTag: false,
      isDeleted: false,
      deletedAt: null,
      rawContent: JSON.parse(data.content).reduce((str, value) => `${str} ${value.text.trim()}`, ''),
    };

    const newNote = await NoteModel.create(noteShape, { transaction });

    // if (user.noteNotify) {
    //   await NotificationModel.create(
    //     {
    //       userId: user.id,
    //       babyBookId: noteShape.babyBookId,
    //       event: NotificationEvent.NOTE_CREATED,
    //       entityId: newNote.id,
    //       isSeen: false,
    //       isDeleted: false,
    //     },
    //     { transaction }
    //   );
    // }

    return newNote;
  };

  public addTagsToNote = async (tagIds: string[], noteId: string, transaction: Transaction) => {
    const existedNoteTag = await NoteTagModel.findAll({
      where: {
        noteId,
        tagId: {
          [Op.in]: tagIds,
        },
      },
    });
    const addingIds = tagIds.filter((id) => !existedNoteTag.find((noteTag) => noteTag.tagId === id));

    const newNoteTagData = addingIds.map((tagId) => ({
      id: uuidv4(),
      tagId,
      noteId,
    }));

    await NoteTagModel.bulkCreate(newNoteTagData, {
      transaction,
    });
  };

  public removeTagFromNote = async (tagIds: string[], noteIds: string[], transaction: Transaction) => {
    await NoteTagModel.destroy({
      where: {
        noteId: {
          [Op.in]: noteIds,
        },
        tagId: {
          [Op.in]: tagIds,
        },
      },
      transaction,
    });
  };

  public update = async (note: NoteModel, newData: UpdateNoteParams, transaction: Transaction) => {
    for (const [key, value] of Object.entries(newData)) {
      note[key] = value;
      if (key === 'content') {
        note.rawContent = JSON.parse(note.content).reduce((str, value) => `${str} ${value.text.trim()}`, '');
      }
    }

    return note.save({ transaction });
  };

  public updateMultiple = async (notes: NoteModel[], newData: UpdateNoteParams, transaction: Transaction) =>
    Promise.all(
      notes.map(async (note) => {
        for (const [key, value] of Object.entries(newData)) {
          note[key] = value;
          if (key === 'content') {
            note.rawContent = JSON.parse(note.content).reduce((str, value) => `${str} ${value.text.trim()}`, '');
          }
        }

        return note.save({ transaction });
      })
    );

  public updateTagInNote = async (noteId: string, newIds: string[], transaction: Transaction) => {
    const currentNoteTags = await NoteTagModel.findAll({
      where: {
        noteId,
      },
    });

    const oldNoteTags = currentNoteTags.filter((noteTag) => !newIds.find((id) => id === noteTag.tagId)).map((NoteTag) => NoteTag.id);

    const newTags = newIds
      .filter((id) => !currentNoteTags.find((noteTag) => noteTag.tagId === id))
      .map((tagId) => ({
        id: uuidv4(),
        tagId,
        noteId,
      }));

    await NoteTagModel.bulkCreate(newTags, { transaction });
    await NoteTagModel.destroy({
      where: {
        id: {
          [Op.in]: oldNoteTags,
        },
      },
      transaction,
    });
  };

  public updateTagService = async (tag: TagModel, newData: UpdateTagParams, transaction: Transaction) => {
    newData.name = newData.name.trim();
    for (const [key, value] of Object.entries(newData)) {
      tag[key] = value;
    }

    return tag.save({ transaction });
  };

  public createTag = async (name: string, userId: string, transaction: Transaction) => {
    const newTag = { name: name.trim(), type: random(4, 10), isDeleted: false, userId };

    return TagModel.create(newTag, { transaction });
  };

  public deleteTagService = async (tags: TagModel[], force: boolean, transaction: Transaction) =>
    Promise.all(tags.map(async (tag) => tag.destroy({ transaction })));

  public deleteNoteService = async (notes: NoteModel[], force: boolean, transaction: Transaction) =>
    Promise.all(
      notes.map(async (note) => {
        if (force) {
          return note.destroy({ transaction });
        }

        note.isDeleted = true;
        return note.save({ transaction });
      })
    );

  public undoNoteService = async (ids: string[], transaction: Transaction) => {
    await NoteModel.update({ isDeleted: false }, { where: { id: { [Op.in]: ids } }, transaction });
  };
}

export default NoteServices;
