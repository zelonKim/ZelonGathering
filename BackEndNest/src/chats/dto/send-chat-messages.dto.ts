import { IsString, IsNotEmpty } from 'class-validator';

export class SendChatMessagesDto {
  @IsString()
  @IsNotEmpty({ message: '메시지 내용은 비어있을 수 없습니다.' })
  message: string;
}
