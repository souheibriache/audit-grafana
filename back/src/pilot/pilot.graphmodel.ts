import { Field, ObjectType } from '@nestjs/graphql';
import { UUID } from 'crypto';
import { PilotTeam } from 'src/pilotteam/pilotteam.graphmodel';

@ObjectType()
export class Pilot {
  @Field((type) => String)
  id: UUID;

  @Field()
  name: string;

  @Field({ nullable: true })
  picture: string;

  @Field({ nullable: true })
  acronym: string;

  @Field((type) => [PilotTeam], { nullable: true })
  pilotTeams: PilotTeam[];
}
