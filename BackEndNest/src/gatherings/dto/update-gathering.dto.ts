import { PartialType } from '@nestjs/mapped-types';
import { CreateGatheringDto } from './create-gathering.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum GatheringStatus {
  RECRUITING = 'RECRUITING',
  FULL = 'FULL',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export class UpdateGatheringDto extends PartialType(CreateGatheringDto) {
  @IsOptional()
  @IsEnum(GatheringStatus, { message: '올바른 소모임 상태값이 아닙니다.' })
  status?: GatheringStatus;
}
