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

  // 1. 소모임 단체 메시지 전송
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

  // 2. 단체 채팅방 메시지 조회
  @Get('public/:gatheringId')
  async getPublicMessages(@Param('gatheringId') gatheringId: string) {
    return await this.chatsService.getPublicMessages(gatheringId);
  }

  // 3. DM 채팅방 개설 
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

  // 4. DM 채팅방 조회
  @Get('private/rooms')
  async getMyChatRooms(@Req() req: { user: { sub: string } }) {
    return await this.chatsService.getMyPrivateChatRooms(req.user.sub);
  }

  // 5. DM 전송
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

  // 6. DM 채팅방 메시지 조회
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
