import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export interface PilotStats {
  id: string;
  name: string;
  team: string;
  picture?: string;
  acronym?: string;
  stats: {
    points: number;
    wins: number;
    podiums: number;
    averagePosition: number;
    fastestLaps: number;
    previousRaces: number[];
  };
}

@Injectable()
export class PilotStatsService {
  constructor(private prisma: PrismaService) {}

  async getAllPilotsStats(): Promise<PilotStats[]> {
    // Récupérer tous les pilotes avec leurs équipes actuelles
    const pilots = await this.prisma.pilot.findMany({
      include: {
        PilotTeam: {
          where: {
            year: '2025',
          },
          include: {
            team: true,
          },
        },
        GrandPrixRanking: {
          include: {
            grandPrix: true,
          },
          orderBy: {
            grandPrix: {
              date: 'desc',
            },
          },
        },
      },
    });

    const statsPromises = pilots.map((pilot) =>
      this.calculatePilotStats(pilot),
    );
    return Promise.all(statsPromises);
  }

  private async calculatePilotStats(pilot: any): Promise<PilotStats> {
    const currentTeam = pilot.PilotTeam[0]?.team?.name || 'Unknown Team';

    // Calculer les statistiques à partir des classements
    const rankings = pilot.GrandPrixRanking || [];
    const positions = rankings
      .map((r: any) => r.position)
      .filter((p: number) => p > 0);

    const points = rankings.reduce((sum: number, r: any) => {
      // Calculer les points selon le système F1 (1er=25, 2ème=18, etc.)
      const position = r.position;
      if (position === 1) return sum + 25;
      if (position === 2) return sum + 18;
      if (position === 3) return sum + 15;
      if (position === 4) return sum + 12;
      if (position === 5) return sum + 10;
      if (position === 6) return sum + 8;
      if (position === 7) return sum + 6;
      if (position === 8) return sum + 4;
      if (position === 9) return sum + 2;
      if (position === 10) return sum + 1;
      return sum;
    }, 0);

    const wins = rankings.filter((r: any) => r.position === 1).length;
    const podiums = rankings.filter(
      (r: any) => r.position >= 1 && r.position <= 3,
    ).length;
    const averagePosition =
      positions.length > 0
        ? positions.reduce((sum: number, pos: number) => sum + pos, 0) /
          positions.length
        : 0;

    return {
      id: pilot.id,
      name: pilot.name,
      team: currentTeam,
      picture: pilot.picture,
      acronym: pilot.acronym,
      stats: {
        points,
        wins,
        podiums,
        averagePosition: Math.round(averagePosition * 100) / 100,
        fastestLaps: 0, // À implémenter si vous avez ces données
        previousRaces: positions.slice(0, 5), // 5 dernières courses
      },
    };
  }
}
