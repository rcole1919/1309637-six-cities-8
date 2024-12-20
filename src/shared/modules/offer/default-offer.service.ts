import { DocumentType, types } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { inject, injectable } from 'inversify';

import { IOfferService } from './types/index.js';
import {
  CreateOfferDTO,
  UpdateOfferDTO,
  populateAuthor,
  populateComments,
  getIsFavorite,
} from './index.js';
import { COMPONENT, DEFAULT_OFFER_COUNT, MAX_PREMIUM_NUMBER } from '../../constants/index.js';
import { ILogger } from '../../libs/logger/types/index.js';
import { ECity, ESortType } from '../../types/index.js';
import { OfferEntity } from './offer.entity.js';
import { CommentEntity } from '../comment/comment.entity.js';

@injectable()
export class DefaultOfferService implements IOfferService {
  constructor(
    @inject(COMPONENT.LOGGER) private readonly logger: ILogger,
    @inject(COMPONENT.OFFER_MODEL) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(COMPONENT.COMMENT_MODEL) private readonly commentModel: types.ModelType<CommentEntity>,
  ) {}

  public async exists(documentId: string): Promise<boolean> {
    return this.offerModel
      .exists({_id: documentId}).then(((resolve) => !!resolve));
  }

  public async create(dto: CreateOfferDTO): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result;
  }

  public async findById(offerId: string, userId: string): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .aggregate([
        { $match: { '_id': new Types.ObjectId(offerId) } },
        ...populateComments,
        ...populateAuthor,
        ...getIsFavorite(userId, offerId),
      ])
      .exec();

    return result[0] || null;
  }

  public async find(count: number, userId: string): Promise<DocumentType<OfferEntity>[]> {
    const limit = count || DEFAULT_OFFER_COUNT;

    const result = await this.offerModel
      .aggregate([
        ...populateComments,
        ...getIsFavorite(userId),
        { $sort: { createdAt: ESortType.Desc } },
        { $limit: limit },
      ])
      .exec();

    return result;
  }

  public async findPremium(city: ECity, userId: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .aggregate([
        { $match: {
          city,
          isPremium: true,
        } },
        ...populateComments,
        ...getIsFavorite(userId),
        { $sort: { createdAt: ESortType.Desc } },
        { $limit: MAX_PREMIUM_NUMBER },
      ]);
  }

  public async updateById(offerId: string, _userId: string, dto: UpdateOfferDTO): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true });
  }

  public async deleteById(offerId: string, _userId: string): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndDelete(offerId)
      .exec();

    await this.commentModel
      .deleteMany({ offerId: new Types.ObjectId(offerId) })
      .exec();

    return result;
  }

  public async isOwnOffer(offerId: string, userId: string): Promise<boolean> {
    const offer = await this.offerModel.findOne({ _id: offerId });

    return offer?.authorId?.toString() === userId;
  }
}
