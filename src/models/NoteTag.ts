import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NoteTagAttributes, NoteTagCreation } from '../interfaces/Note';

import TagModel from './Tag';

class NoteTagModel extends Model<NoteTagAttributes | NoteTagCreation> {
  declare id: string;
  declare noteId: string;
  declare tagId: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

NoteTagModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    noteId: {
      type: DataTypes.UUID,
      field: 'note_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'tag_id',
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'note_tag',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NoteTagModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

NoteTagModel.belongsTo(TagModel, { foreignKey: 'tag_id', as: 'tag' });
TagModel.hasMany(NoteTagModel, { foreignKey: 'tag_id', onDelete: 'CASCADE', hooks: true, as: 'tag' });

export default NoteTagModel;
