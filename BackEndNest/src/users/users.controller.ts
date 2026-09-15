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
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile';
import type { Express } from 'express';
import 'multer';

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

  // 프로필 보기
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.usersService.getUserProfileById(id);
  }

  // 3. 나의 프로필 조회
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return await this.usersService.getProfile(userId);
  }

  // 4. 프로필 정보 수정
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: { user: { sub: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.sub;
    return await this.usersService.updateProfile(userId, updateProfileDto);
  }

  // 5. 프로필 이미지 업로드
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('업로드할 이미지 파일이 필요합니다.');
    }
    const imageUrl = await this.usersService.uploadProfileImage(file);
    return { imageUrl };
  }

  // 6. 알림 조회
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getMyNotifications(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return await this.usersService.getMyNotifications(userId);
  }

  // 7. 알림 삭제
  @UseGuards(JwtAuthGuard)
  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    return await this.usersService.deleteNotification(id);
  }

  // 8. 나의 채팅방 조회
  @UseGuards(JwtAuthGuard)
  @Get('chats')
  async getMyChats(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return await this.usersService.getMyChats(userId);
  }
}
