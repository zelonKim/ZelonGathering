import { IsString, IsNotEmpty } from 'class-validator';

export class SendChatMessagesDto {
  @IsString()
  @IsNotEmpty({ message: '메시지 내용을 입력해주세요' })
  message: string;
}
