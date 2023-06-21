import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import NoteController from '../controllers/Note';
import authentication, { verifySession } from '../middlewares/authentication';
import validators from '../validators/Note';

const router = express.Router();

router.post('/tag', [authentication], validate(validators.createTag), wrapper(NoteController.createNewTag));
router.get('/tag', [authentication], validate(validators.getTagList), wrapper(NoteController.getTagList));
router.put('/tag/:id', [authentication], validate(validators.updateTag), wrapper(NoteController.updateTag));
router.delete('/tag', [authentication], validate(validators.deleteTag), wrapper(NoteController.deleteTag));

router.get('/shared', [verifySession], validate(validators.getNoteList), wrapper(NoteController.getNoteList));
router.get('/', [authentication], validate(validators.getNoteList), wrapper(NoteController.getNoteList));
router.post('/', [authentication], validate(validators.createNote), wrapper(NoteController.createNote));
router.put('/undo', [authentication], validate(validators.undoNote), wrapper(NoteController.undoNote));
router.put('/:id', [authentication], validate(validators.updateNote), wrapper(NoteController.updateNote));
router.put('/', [authentication], validate(validators.updateMultipleNote), wrapper(NoteController.updateMultipleNote));
router.delete('/', [authentication], validate(validators.deleteNote), wrapper(NoteController.deleteNote));

export default router;
