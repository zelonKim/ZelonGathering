import { Module } from '@nestjs/common';
import { GatheringsService } from './gatherings.service';
import { GatheringsController } from './gatherings.controller';

@Module({
  controllers: [GatheringsController],
  providers: [GatheringsService],
})
export class GatheringsModule {}
