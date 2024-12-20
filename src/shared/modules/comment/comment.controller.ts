import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';

import {
  BaseController,
  ValidateObjectIdMiddleware,
  ValidateDTOMiddleware,
  DocumentExistsMiddleware,
  PrivateRouteMiddleware,
} from '../../../rest/index.js';
import { EHttpMethod } from '../../../rest/types/index.js';
import { COMPONENT } from '../../constants/index.js';
import { ILogger } from '../../libs/logger/types/index.js';
import { ICommentService } from './types/index.js';
import { CreateCommentDTO, CommentRDO } from './index.js';
import { fillDTO } from '../../helpers/index.js';
import { IOfferService, TParamOfferId } from '../offer/types/index.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(COMPONENT.LOGGER) protected readonly logger: ILogger,
    @inject(COMPONENT.COMMENT_SERVICE) private readonly commentService: ICommentService,
    @inject(COMPONENT.OFFER_SERVICE) private readonly offerService: IOfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController...');

    this.addRoute({
      path: '/:offerId',
      method: EHttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: EHttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDTOMiddleware(CreateCommentDTO),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
  }

  public async index({ params }: Request<TParamOfferId>, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(params.offerId);
    this.ok(res, fillDTO(CommentRDO, comments));
  }

  public async create(
    { params, body, tokenPayload }: Request<TParamOfferId, unknown, CreateCommentDTO>,
    res: Response
  ): Promise<void> {
    const result = await this.commentService.create({ ...body, authorId: tokenPayload.id}, params.offerId);
    this.created(res, fillDTO(CommentRDO, result));
  }
}
