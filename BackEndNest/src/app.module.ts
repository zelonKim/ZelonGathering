import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { GatheringsModule } from './gatherings/gatherings.module';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    GatheringsModule,
    ChatsModule,
  ],
})
export class AppModule {}
