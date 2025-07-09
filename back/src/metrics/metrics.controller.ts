import { Controller, Get, Response } from '@nestjs/common';
import { register } from 'prom-client';
import { Public } from '../decorators/public.decorator'; // Adjust path as needed

@Controller('metrics')
export class MetricsController {
  @Get()
  @Public()
  async getMetrics(@Response() res) {
    try {
      const metrics = await register.metrics();
      res.set('Content-Type', register.contentType);
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error generating metrics');
    }
  }
}
