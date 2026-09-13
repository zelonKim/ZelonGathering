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
import { GatheringStatus } from '@prisma/client';

@Controller('gatherings')
@UseGuards(JwtAuthGuard)
export class GatheringsController {
  constructor(private readonly gatheringsService: GatheringsService) {}

  // 1. 소모임 개설
  @Post()
  async createGathering(
    @Req() req: { user: { sub: string } },
    @Body() createDto: CreateGatheringDto,
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.createGathering(hostId, createDto);
  }

  // 2. 소모임 전체 조회
  @Get()
  async findAllGathering(@Query() dto: FilterGatheringDto) {
    return await this.gatheringsService.findAllGathering(dto);
  }

  // 3. 소모임 상세 조회
  @Get(':id')
  async findOneGathering(@Param('id') id: string) {
    return await this.gatheringsService.findOneGathering(id);
  }

  // 4. 소모임 참여 신청
  @Post(':id/join')
  async joinGathering(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user.sub;
    return await this.gatheringsService.joinGathering(id, userId);
  }

  // 5. 소모임 참여 취소
  @Delete(':id/leave')
  async leaveGathering(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    return await this.gatheringsService.leaveGathering(id, userId);
  }

  // 6. 소모임 상태 변경
  @Patch(':id')
  async updateStatusGathering(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
    @Body('status') status: GatheringStatus,
  ) {
    const hostId = req.user.sub;
    return await this.gatheringsService.updateStatusGathering(id, hostId, status);
  }

  // 7. 소모임 삭제
  @Delete(':id')
  async removeGathering(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    const hostId = req.user.sub;
    return await this.gatheringsService.removeGathering(id, hostId);
  }

  // 8. 소모임 신청자 조회
  @Get(':id/participants')
  async getParticipants(
    @Param('id') id: string,
  ) {
    return await this.gatheringsService.getParticipants(id);
  }

  // 9. 소모임 참여 승인/거절
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
