import { Expose, Type } from 'class-transformer';
import { EFacilities, EHousing, TCoords } from '../../../types/index.js';
import { UserRDO } from '../../user/index.js';

export class FullOfferRDO {
  @Expose({ name: '_id' })
  public id!: string;

  @Expose()
  public createdAt!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public city!: string;

  @Expose()
  public previewImagePath!: string;

  @Expose()
  public photos!: string[];

  @Expose()
  public isPremium!: boolean;

  // TODO in next module
  // @Expose()
  // public isFavorite!: boolean;

  @Expose()
  public housingType!: EHousing;

  @Expose()
  public roomsNumber!: number;

  @Expose()
  public visitorsNumber!: number;

  @Expose()
  public price!: number;

  @Expose()
  public facilities!: EFacilities;

  @Expose()
  public coords!: TCoords;

  @Expose()
  @Type(() => UserRDO)
  public author!: UserRDO;
}
