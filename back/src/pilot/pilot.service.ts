import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PilotService {
  constructor(private prisma: PrismaService) {}

  async getAllPilots() {
    return this.prisma.pilot.findMany({
      include: {
        PilotTeam: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async getPilotById(id: UUID) {
    return this.prisma.pilot.findUnique({
      where: { id },
      include: {
        PilotTeam: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async getPilotsWithCurrentTeam() {
    const pilots = await this.prisma.pilot.findMany({
      include: {
        PilotTeam: {
          where: {
            year: '2025', // Année actuelle
          },
          include: {
            team: true,
          },
        },
      },
    });

    return pilots.map((pilot) => ({
      ...pilot,
      currentTeam: pilot.PilotTeam[0]?.team || null,
    }));
  }
}
