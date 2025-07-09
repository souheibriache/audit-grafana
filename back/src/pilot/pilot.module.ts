import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PilotStatsService } from './pilot-stats.service';
import { PilotController } from './pilot.controller';
import { PilotResolver } from './pilot.resolver';
import { PilotService } from './pilot.service';

@Module({
  providers: [PilotService, PilotResolver, PilotStatsService, PrismaService],
  controllers: [PilotController],
})
export class PilotModule {}
