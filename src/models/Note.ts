import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NoteAttributes, NoteCreation } from '../interfaces/Note';
import NoteTagModel from './NoteTag';

class NoteModel extends Model<NoteAttributes | NoteCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare title?: string;
  declare content: string;
  declare rawContent: string;
  declare isPinned: boolean;
  declare hasTag: boolean;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

NoteModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(),
    },
    content: {
      type: DataTypes.TEXT({
        length: 'tiny',
      }),
      allowNull: false,
    },
    rawContent: {
      type: DataTypes.TEXT({
        length: 'tiny',
      }),
      field: 'raw_content',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_pinned',
    },
    hasTag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'has_tag',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    deletedAt: {
      type: DataTypes.DATE(),
      field: 'deleted_at',
    },
  },
  {
    tableName: 'note',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NoteModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

NoteModel.hasMany(NoteTagModel, { foreignKey: 'note_id', onDelete: 'CASCADE', hooks: true, as: 'note_tag' });

export default NoteModel;
