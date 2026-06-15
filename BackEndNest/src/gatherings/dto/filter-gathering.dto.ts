import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterGatheringDto {
  @IsOptional()
  @Type(() => Number) // 💡 문자열로 들어온 쿼리를 number 타입으로 강제 형변환합니다.
  @IsNumber({}, { message: '위도(latitude)는 숫자여야 합니다.' })
  latitude?: number;

  @IsOptional()
  @Type(() => Number) // 💡 문자열로 들어온 쿼리를 number 타입으로 강제 형변환합니다.
  @IsNumber({}, { message: '경도(longitude)는 숫자여야 합니다.' })
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '반경(radius)은 숫자여야 합니다.' })
  @Min(0.1, { message: '반경은 최소 0.1km 이상이어야 합니다.' })
  radius: number = 1.5; // 💡 기본값을 1.5km로 깔끔하게 지정해 둡니다.

  @IsOptional()
  @IsString({ message: '카테고리는 문자열이어야 합니다.' })
  category?: string;
}
