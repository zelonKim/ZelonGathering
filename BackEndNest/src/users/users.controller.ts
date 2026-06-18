import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. 회원가입
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.usersService.signup(signupDto);
  }

  // 2. 로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.usersService.login(loginDto);
  }

  // 3. 내 정보 조회 (마이페이지)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return await this.usersService.getProfile(userId);
  }

  // 4. 프로필 수정
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: { user: { sub: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.sub;
    return await this.usersService.updateProfile(userId, updateProfileDto);
  }

  // 5. 클라우드에 이미지 업로드
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // 파일이 요청에 누락되었을 경우 가드 조치
    if (!file) {
      throw new BadRequestException('업로드할 이미지 파일이 필요합니다.');
    }

    // 서비스 로직을 통해 R2에 올리고 최종 저장된 HTTPS URL 주소를 획득합니다.
    const imageUrl = await this.usersService.uploadProfileImage(file);

    // 프론트엔드가 다음 스텝(PATCH /users/profile)에서 활용할 수 있게 URL을 그대로 리턴!
    return { imageUrl };
  }

  // 6. 매칭 알림 조회
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getMyNotifications(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub; 
    return await this.usersService.getMyNotifications(userId);
  }
}
