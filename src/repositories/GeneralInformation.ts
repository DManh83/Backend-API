import GeneralInformationModel from '../models/GeneralInformation';

class GeneralInformationRepository {
  async getByBabyBookId(babyBookId: string) {
    return GeneralInformationModel.findOne({
      where: { babyBookId },
    });
  }
}

export default new GeneralInformationRepository();
