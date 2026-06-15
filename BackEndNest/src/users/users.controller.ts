import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
}
