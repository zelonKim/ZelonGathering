import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
  Max,
} from 'class-validator';
import { GatheringCategory, District, Time, Day } from '@prisma/client';

export class CreateGatheringDto {
  @IsString()
  @IsNotEmpty({ message: '모임 제목은 필수 입력 항목입니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '모임 설명은 필수 입력 항목입니다.' })
  description: string;

  @IsEnum(GatheringCategory, {
    message: '올바른 소모임 카테고리를 선택해주세요.',
  })
  @IsNotEmpty({ message: '카테고리는 필수 설정 항목입니다.' })
  category: GatheringCategory;

  @IsInt()
  @Min(2, { message: '최대 정원은 최소 2명 이상이어야 합니다.' })
  @IsNotEmpty({ message: '최대 정원은 필수 입력 항목입니다.' })
  maxParticipants: number;

  @IsString()
  @IsNotEmpty({ message: '모임 장소는 필수 입력 항목입니다.' })
  gatheringPlace: string;

  @IsNumber({}, { message: '위도는 올바른 숫자 형식이어야 합니다.' })
  @IsNotEmpty({ message: '장소의 위도는 필수 설정 항목입니다.' })
  @Min(33.09, { message: '올바른 대한민국의 위도 범위를 설정해주세요.' })
  @Max(38.76, { message: '올바른 대한민국의 위도 범위를 설정해주세요.' })
  latitude: number;

  @IsNumber({}, { message: '경도는 올바른 숫자 형식이어야 합니다.' })
  @IsNotEmpty({ message: '장소의 경도는 필수 설정 항목입니다.' })
  @Min(124.17, { message: '올바른 대한민국의 경도 범위를 설정해주세요.' })
  @Max(131.88, { message: '올바른 대한민국의 경도 범위를 설정해주세요.' })
  longitude: number;

  @IsEnum(District, { message: '올바른 행정구역(구/시)을 선택해주세요.' })
  @IsNotEmpty({ message: '지역은 필수 설정 항목입니다.' })
  district: District;

  @IsEnum(Day, { each: true, message: '올바른 모임 요일을 선택해주세요.' })
  @IsNotEmpty({ message: '모임 요일은 필수 설정 항목입니다.' })
  gatheringDay: Day[];

  @IsEnum(Time, { each: true, message: '올바른 모임 시간대를 선택해주세요.' })
  @IsNotEmpty({ message: '모임 시간은 필수 설정 항목입니다.' })
  gatheringTime: Time[];
}
