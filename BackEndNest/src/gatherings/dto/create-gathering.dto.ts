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
  @IsNotEmpty({ message: '소모임 제목을 입력해주세요.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: '소모임 설명을 입력해주세요.' })
  description!: string;

  @IsNotEmpty({ message: '소모임 카테고리를 선택해주세요.' })
  category!: GatheringCategory;

  @IsEnum(GatheringCategory, {
    message: '올바른 소모임 카테고리를 선택해주세요.',
  })

  @IsInt()
  @Min(2, { message: '소모임 정원은 최소 2명 이상이어야 합니다.' })
  @IsNotEmpty({ message: '소모임 정원을 입력해주세요.' })
  maxParticipants!: number;

  @IsString()
  @IsNotEmpty({ message: '소모임 장소를 입력해주세요.' })
  gatheringPlace!: string;

  @IsNumber({}, { message: '위도는 숫자 형식이어야 합니다.' })
  @IsNotEmpty({ message: '위도를 설정해주세요' })
  @Min(33.09, { message: '올바른 위도 범위를 설정해주세요.' })
  @Max(38.76, { message: '올바른 위도 범위를 설정해주세요.' })
  latitude!: number;

  @IsNumber({}, { message: '경도는 숫자 형식이어야 합니다.' })
  @IsNotEmpty({ message: '경도를 설정해주세요' })
  @Min(124.17, { message: '올바른 경도 범위를 설정해주세요.' })
  @Max(131.88, { message: '올바른 경도 범위를 설정해주세요.' })
  longitude!: number;

  @IsEnum(District, { message: '올바른 소모임 지역을 선택해주세요.' })
  @IsNotEmpty({ message: '소모임 지역을 선택해주세요.' })
  district!: District;

  @IsEnum(Day, { each: true, message: '올바른 모임 요일을 선택해주세요.' })
  @IsNotEmpty({ message: '모임 요일을 선택해주세요.' })
  gatheringDay!: Day[];

  @IsEnum(Time, { each: true, message: '올바른 모임 시간대를 선택해주세요.' })
  @IsNotEmpty({ message: '모임 시간대를 선택해주세요.' })
  gatheringTime!: Time[];
}
