import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { SendChatMessagesDto } from './dto/send-chat-messages.dto';
import { GetChatMessagesDto } from './dto/get-chat-messages.dto';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // 1. 소모임방에서 메시지 보내기
  @Post('public/:gatheringId')
  async sendPublicMessage(
    @Param('gatheringId') gatheringId: string,
    @Req() req: { user: { sub: string } },
    @Body() dto: SendChatMessagesDto,
  ) {
    return await this.chatsService.savePublicMessage(
      gatheringId,
      req.user.sub,
      dto,
    );
  }

  // 2. 소모임방의 대화 내역 조회하기
  @Get('public/:gatheringId')
  async getPublicMessages(@Param('gatheringId') gatheringId: string) {
    return await this.chatsService.getPublicMessages(gatheringId);
  }

  //////////////////////////////////////////////////////

  // 3. 상대방 유저ID로 1:1 채팅방 개설 및 접속하기
  @Post('private/room/:partnerUserId')
  async openPrivateChatRoom(
    @Param('partnerUserId') partnerUserId: string,
    @Req() req: { user: { sub: string } },
  ) {
    return await this.chatsService.getOrCreatePrivateChatRoom(
      req.user.sub,
      partnerUserId,
    );
  }

  // 4. 내가 참여 중인 모든 1:1 채팅방 리스트 가져오기
  @Get('private/rooms')
  async getMyChatRooms(@Req() req: { user: { sub: string } }) {
    return await this.chatsService.getMyPrivateChatRooms(req.user.sub);
  }

  // 5. 특정 1:1 채팅방에 DM 전송하기
  @Post('private/message/:roomId')
  async sendPrivateMessage(
    @Param('roomId') roomId: string,
    @Req() req: { user: { sub: string } },
    @Body() dto: SendChatMessagesDto,
  ) {
    return await this.chatsService.savePrivateMessage(
      roomId,
      req.user.sub,
      dto,
    );
  }

  // 6. 특정 1:1 채팅방 과거 대화 내역 조회하기
  @Get('private/messages/:roomId')
  async getPrivateMessages(
    @Param('roomId') roomId: string,
    @Req() req: { user: { sub: string } },
    @Query() dto: GetChatMessagesDto,
  ) {
    return await this.chatsService.getPrivateMessages(
      roomId,
      req.user.sub,
      dto,
    );
  }
}
