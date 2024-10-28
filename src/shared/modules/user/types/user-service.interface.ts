import { DocumentType } from '@typegoose/typegoose';

import { CreateUserDTO, UserEntity } from '../index.js';
import { OfferEntity } from '../../offer/offer.entity.js';

export interface IUserService {
  create(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>>;
  getFavorites(userId: string): Promise<DocumentType<OfferEntity[]> | null>;
  addFavorite(userId: string, offerId: string): Promise<DocumentType<UserEntity> | null>;
  deleteFavorite(userId: string, offerId: string): Promise<DocumentType<UserEntity> | null>;
}
