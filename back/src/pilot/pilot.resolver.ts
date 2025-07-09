import { Args, Query, Resolver } from '@nestjs/graphql';
import { UUID } from 'crypto';
import { Pilot } from './pilot.graphmodel';
import { PilotService } from './pilot.service';

@Resolver(() => Pilot)
export class PilotResolver {
  constructor(private pilotService: PilotService) {}

  @Query(() => [Pilot])
  async getAllPilots() {
    return this.pilotService.getAllPilots();
  }

  @Query(() => Pilot, { nullable: true })
  async getPilotById(@Args('id', { type: () => String }) id: UUID) {
    return this.pilotService.getPilotById(id);
  }

  @Query(() => [Pilot])
  async getPilotsWithCurrentTeam() {
    return this.pilotService.getPilotsWithCurrentTeam();
  }
}
