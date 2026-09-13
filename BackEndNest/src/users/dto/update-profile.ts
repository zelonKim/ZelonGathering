import { 
  IsOptional, 
  IsString, 
  IsInt, 
  IsEnum, 
  IsArray, 
  Min, 
  Max 
} from 'class-validator';
import { Day, District, GatheringCategory, Mbti, Time } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  favorite?: string;

  @IsOptional()
  @IsString()
  hate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsEnum(Mbti)
  mbti?: Mbti;

  @IsOptional()
  @IsArray()
  @IsEnum(GatheringCategory, { each: true })
  preferCategory?: GatheringCategory[];

  @IsOptional()
  @IsArray()
  @IsEnum(District, { each: true })
  preferDistrict?: District[];

  @IsOptional()
  @IsArray()
  @IsEnum(Day, { each: true })
  preferDay?: Day[];

  @IsOptional()
  @IsArray()
  @IsEnum(Time, { each: true })
  preferTime?: Time[];

  @IsOptional()
  @IsString()
  profileImg?: string;
}