import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GatheringsService } from './gatherings.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { FilterGatheringDto } from './dto/filter-gathering.dto';

@Controller('gatherings')
export class GatheringsController {
  constructor(private readonly gatheringsService: GatheringsService) {}

  // 1. 소모임 개설
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: { user: { sub: string } },
    @Body() createDto: CreateGatheringDto,
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.create(hostId, createDto);
  }

  // 2. 소모임 조회
  @Get()
  async findAll(@Query() dto: FilterGatheringDto) {
    return await this.gatheringsService.findAll(dto);
  }

  // 3. 소모임 상세 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.gatheringsService.findOne(id);
  }

  // 4-1. 소모임 참여 신청
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async toggleJoin(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    return await this.gatheringsService.join(id, userId);
  }

  // 4-2. 소모임 참여 취소
  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  async leaveGathering(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    return await this.gatheringsService.leave(id, userId);
  }

  // 5. 소모임 상태 변경 (방장 전용)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
    @Body('status') status: string,
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.updateStatus(id, hostId, status);
  }

  // 6. 소모임 삭제 (방장 전용)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    const hostId = req.user.sub;
    return await this.gatheringsService.remove(id, hostId);
  }

  // 7. [방장 전용] 소모임 신청자 명단 및 상태 조회
  @UseGuards(JwtAuthGuard)
  @Get(':id/participants')
  async getParticipants(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.getParticipants(id, hostId);
  }

  // 8. [방장 전용] 소모임 참여 신청 승인/거절 처리
  @UseGuards(JwtAuthGuard)
  @Patch(':id/participants')
  async reviewParticipant(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
    @Body('userId') userId: string,
    @Body('status') status: 'ACCEPTED' | 'REJECTED',
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.reviewParticipant(
      id,
      hostId,
      userId,
      status,
    );
  }
}
