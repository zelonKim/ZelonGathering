import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Day } from '@prisma/client';

export class FilterGatheringDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value] : [],
  )
  types?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value] : [],
  )
  categories?: string[];

  @IsOptional()
  @IsEnum(Day)
  clientDay?: Day;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  longitude?: number;
}
