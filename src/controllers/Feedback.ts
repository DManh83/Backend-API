import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { parseFormData } from '../common/helpers/convert';

import { PaginationParams } from '../common/helpers/pagination/types';
import { getPaginateOptions, paginationSerializer } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import { CreateFeedbackParams, FeedbackAttributes, FeedbackCreation } from '../interfaces/Feedback';
import FeedbackModel from '../models/Feedback';
import { feedbackSerializer } from '../serializers/feedbackSeriallizer';

class FeedbackController {
  public getFeedbackList = async (req: Request<{}, {}, {}, PaginationParams>, res: Response) => {
    const params = parseFormData(req.query, []) as PaginationParams;
    const paginateOptions = getPaginateOptions(params);
    const feedbackCond: WhereOptions<FeedbackAttributes> = {};

    if (params.searchValue) {
      feedbackCond.email = { [Op.iLike]: `%${params.searchValue}%` };
    }

    const feedbacks = await withPaginate<FeedbackModel>(FeedbackModel)({
      ...paginateOptions,
      where: { ...feedbackCond },
    });

    response.success(res, paginationSerializer(feedbacks, feedbackSerializer));
  };

  public createFeedback = async (req: Request<{}, {}, CreateFeedbackParams>, res: Response) => {
    const { body: params } = req;

    await withTransaction(async (trans) => {
      const feedBack: FeedbackCreation = {
        ...params,
      };
      await FeedbackModel.create(feedBack, { transaction: trans });
    });

    response.success(res);
  };
}

export default new FeedbackController();
