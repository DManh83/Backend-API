import { Request, Response } from 'express';
import path from 'path';
import env from '../../config/env';

class FileController {
  public getFile = async (req: Request, res: Response) => {
    const { userId, filename } = req.params;
    res.sendFile(path.join(`${process.cwd()}/${env.assetsPath}/${userId}`, filename));
  };

  public getStaticFile = async (req: Request, res: Response) => {
    const { filename } = req.params;
    res.sendFile(path.join(`${process.cwd()}/public`, filename));
  };
}

export default new FileController();
