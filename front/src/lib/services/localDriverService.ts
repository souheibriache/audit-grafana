import { DriverStats } from "../types/drivers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";

export interface LocalPilotStats {
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

export const localDriverService = {
  async getAllDriversStats(): Promise<DriverStats[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pilots/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LocalPilotStats[] = await response.json();

      // Convertir le format local vers le format attendu par le frontend
      return data.map((pilot) => ({
        driverId: pilot.id,
        name: pilot.name,
        team: pilot.team,
        stats: {
          previousRaces: pilot.stats.previousRaces,
          averagePosition: pilot.stats.averagePosition,
          teamPerformance: 0, // À calculer si nécessaire
          points: pilot.stats.points,
          wins: pilot.stats.wins,
          podiums: pilot.stats.podiums,
          fastestLaps: pilot.stats.fastestLaps,
        },
      }));
    } catch (error) {
      console.error("Error fetching drivers stats from local API:", error);
      throw error;
    }
  },

  async getDriverStats(driverId: string): Promise<DriverStats> {
    try {
      const allDrivers = await this.getAllDriversStats();
      const driver = allDrivers.find((d) => d.driverId === driverId);

      if (!driver) {
        throw new Error(`Driver ${driverId} not found`);
      }

      return driver;
    } catch (error) {
      console.error(`Error fetching stats for driver ${driverId}:`, error);
      throw error;
    }
  },
};
