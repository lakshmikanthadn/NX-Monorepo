import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';

export interface IPartMediumResponse {
  book?: ResponseModel.PartsMedium[];
  chapter?: ResponseModel.PartsMedium[];
  creativeWork?: ResponseModel.PartsMedium[];
  scholarlyArticle?: ResponseModel.PartsMedium[];
  set?: ResponseModel.PartsMedium[];
  collection?: ResponseModel.PartsMedium[];
  series?: ResponseModel.PartsMedium[];
}
