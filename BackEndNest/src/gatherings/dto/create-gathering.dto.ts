import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateGatheringDto {
  @IsString()
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '모임 설명은 필수 입력 항목입니다.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: '카테고리는 필수 입력 항목입니다.' })
  category: string;

  @IsInt()
  @Min(2, { message: '최대 정원은 최소 2명 이상이어야 합니다.' })
  maxParticipants: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty({ message: '만남 장소 이름은 필수 입력 항목입니다.' })
  locationName: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다. (ISO8601)' })
  gatheringAt: string;
}
