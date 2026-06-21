// dto/filter-gathering.dto.ts
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
  // 💡 URL 쿼리 파라미터가 콤마(,)나 단일 값으로 들어올 때 배열로 안전하게 변환
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value] : [],
  )
  types?: string[]; // ['거리순', '오늘 열리는'] 등

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
