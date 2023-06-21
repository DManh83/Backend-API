import { Request, Response } from 'express';

import NotFoundError from '../common/errors/types/NotFoundError';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import { UpdateBirthdayParams, updateGeneralInformationParams } from '../interfaces/GeneralInformation';
import BabyBookModel from '../models/BabyBook';
import GeneralInformationRepository from '../repositories/GeneralInformation';
import { generalInformationSerializer } from '../serializers/generalInformationSerializer';
import GeneralInformationServices from '../services/GeneralInformation';

class GeneralInformationController extends GeneralInformationServices {
  public getGeneralInformation = async (req: Request, res: Response) => {
    const { babyBookId } = req.query;
    let generalInformation = await GeneralInformationRepository.getByBabyBookId(babyBookId as string);

    if (!generalInformation) {
      await withTransaction(async (trans) => {
        generalInformation = await this.createNew(babyBookId as string, trans);
      });
    }

    response.success(res, generalInformationSerializer(generalInformation));
  };

  public updateBirthday = async (req: Request<{}, {}, UpdateBirthdayParams>, res: Response) => {
    const { babyBookId, birthday, deleteRelatedRecord } = req.body;
    const existedBabyBook = await BabyBookModel.findOne({ where: { id: babyBookId } });

    if (!existedBabyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const existedInformation = await GeneralInformationRepository.getByBabyBookId(babyBookId);
    if (!existedInformation) {
      throw new NotFoundError(messages.generalInformation.notFound);
    }

    await withTransaction(async (trans) => {
      await this.updateBirthdayService(existedInformation, birthday, !!deleteRelatedRecord, req.user, trans);
    });

    response.success(res);
  };

  public updateGeneralInformation = async (req: Request<{}, {}, updateGeneralInformationParams>, res: Response) => {
    const { babyBookId } = req.body;
    const existedBabyBook = await BabyBookModel.findOne({ where: { id: babyBookId } });

    if (!existedBabyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const existedInformation = await GeneralInformationRepository.getByBabyBookId(babyBookId);
    if (!existedInformation) {
      throw new NotFoundError(messages.generalInformation.notFound);
    }

    if (req.body.fileName) {
      req.body.idSticker = req.body.fileName;
    }

    await withTransaction(async (trans) => {
      await this.update(existedInformation, req.body, req.user, trans);
    });

    response.success(res, generalInformationSerializer(existedInformation));
  };
}

export default new GeneralInformationController();
