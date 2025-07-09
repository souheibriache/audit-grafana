import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { PilotStatsService } from './pilot-stats.service';

@ApiTags('Pilots')
@Controller('pilots')
export class PilotController {
  constructor(private readonly pilotStatsService: PilotStatsService) {}

  @Get('stats')
  @Public()
  @ApiOperation({
    summary: 'Get all pilots statistics',
    description:
      'Retrieve statistics for all pilots including points, wins, podiums, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pilots statistics retrieved successfully',
  })
  async getAllPilotsStats() {
    return this.pilotStatsService.getAllPilotsStats();
  }
}
