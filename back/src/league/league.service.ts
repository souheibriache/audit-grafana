import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  League,
  CreateLeagueInput,
  GetLeagueInput,
  DeleteLeagueInput,
  UpdateLeagueInput,
  JoinLeagueInput,
} from './league.graphmodel';
import { UUID } from 'crypto';

@Injectable()
export class LeagueService {
  constructor(private prisma: PrismaService) {}

  async createLeague(
    createLeagueInput: CreateLeagueInput,
    userId: string,
  ): Promise<League> {
    // Generate a random 8-character alphanumeric join code
    const generateUniqueJoinCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    let joinCode = generateUniqueJoinCode();

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const league = await prisma.league.create({
          data: {
            name: createLeagueInput.name,
            private: createLeagueInput.private ?? false,
            joinCode: joinCode,
          },
        });

        const userLeague = await prisma.userLeague.create({
          data: {
            userId: userId,
            leagueId: league.id,
            isAdmin: true,
          },
          include: {
            user: true,
          },
        });

        return {
          id: league.id as any,
          name: league.name,
          private: league.private,
          joinCode: league.joinCode,
          avatar: null,
          admin: {
            id: userLeague.user.id as UUID,
            clerkId: userLeague.user.clerkId,
            username: userLeague.user.username,
            firstName: userLeague.user.firstName,
            lastName: userLeague.user.lastName,
            email: userLeague.user.email,
            password: '',
            leagues: [],
          },
          members: [
            {
              id: userLeague.user.id as UUID,
              clerkId: userLeague.user.clerkId,
              username: userLeague.user.username,
              firstName: userLeague.user.firstName,
              lastName: userLeague.user.lastName,
              email: userLeague.user.email,
              password: '',
              leagues: [],
            },
          ],
        };
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('joinCode')) {
        throw new Error(
          'Failed to generate a unique join code. Please try again.',
        );
      }
      throw error;
    }
  }

  async getAllLeagues(): Promise<League[]> {
    const leagues = await this.prisma.league.findMany({
      include: {
        avatar: true,
        UserLeague: {
          include: {
            user: true,
          },
        },
      },
    });

    return leagues.map((league) => {
      // Trouver l'utilisateur admin parmi les UserLeague
      const adminUserLeague = league.UserLeague.find((ul) => ul.isAdmin);

      return {
        id: league.id as any,
        name: league.name,
        private: league.private,
        joinCode: league.joinCode,
        avatar: league.avatar
          ? {
              id: league.avatar.id as UUID,
              url: league.avatar.picture,
            }
          : null,
        // Définir l'administrateur si trouvé
        admin: adminUserLeague?.user
          ? {
              id: adminUserLeague.user.id as UUID,
              clerkId: adminUserLeague.user.clerkId,
              username: adminUserLeague.user.username,
              firstName: adminUserLeague.user.firstName,
              lastName: adminUserLeague.user.lastName,
              email: adminUserLeague.user.email,
              password: '',
              leagues: [],
            }
          : null,
        members: league.UserLeague.map((userLeague) => ({
          id: userLeague.user.id as UUID,
          clerkId: userLeague.user.clerkId,
          username: userLeague.user.username,
          firstName: userLeague.user.firstName,
          lastName: userLeague.user.lastName,
          email: userLeague.user.email,
          password: '',
          leagues: [],
        })),
      };
    });
  }

  async joinLeague(
    joinLeagueInput: JoinLeagueInput,
    userId: string,
  ): Promise<League> {
    const { leagueId, joinCode } = joinLeagueInput;

    // 1. Vérifier que l'ID de la league est fourni
    if (!leagueId) {
      throw new BadRequestException('League ID is required');
    }

    // 2. Trouver la league avec l'ID fourni
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        avatar: true,
        UserLeague: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    if (league.private) {
      if (!joinCode) {
        throw new BadRequestException(
          'Join code is required for private leagues',
        );
      }

      if (joinCode !== league.joinCode) {
        throw new BadRequestException('Invalid join code for this league');
      }
    }

    const existingMembership = await this.prisma.userLeague.findFirst({
      where: {
        userId: userId,
        leagueId: league.id,
      },
    });

    if (existingMembership) {
      throw new BadRequestException('You are already a member of this league');
    }

    try {
      await this.prisma.userLeague.create({
        data: {
          userId: userId,
          leagueId: league.id,
          isAdmin: false,
        },
      });

      const updatedLeague = await this.prisma.league.findUnique({
        where: { id: league.id },
        include: {
          avatar: true,
          UserLeague: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        id: updatedLeague.id as any,
        name: updatedLeague.name,
        private: updatedLeague.private,
        joinCode: updatedLeague.joinCode,
        avatar: updatedLeague.avatar
          ? {
              id: updatedLeague.avatar.id as UUID,
              url: updatedLeague.avatar.picture,
            }
          : null,
        admin: updatedLeague.UserLeague.find((ul) => ul.isAdmin)?.user
          ? {
              id: updatedLeague.UserLeague.find((ul) => ul.isAdmin).user
                .id as UUID,
              username: updatedLeague.UserLeague.find((ul) => ul.isAdmin).user
                .username,
              clerkId: updatedLeague.UserLeague.find((ul) => ul.isAdmin).user
                .clerkId,
              email: updatedLeague.UserLeague.find((ul) => ul.isAdmin).user
                .email,
              password: '',
              leagues: [],
            }
          : null,
        members: updatedLeague.UserLeague.map((userLeague) => ({
          id: userLeague.user.id as UUID,
          clerkId: userLeague.user.clerkId,
          username: userLeague.user.username,
          firstName: userLeague.user.firstName,
          lastName: userLeague.user.lastName,
          email: userLeague.user.email,
          password: '',
          leagues: [],
        })),
      };
    } catch (error) {
      throw new Error(`Failed to join league: ${error.message}`);
    }
  }

  async getLeague(getLeagueInput: GetLeagueInput): Promise<League> {
    const { id, name } = getLeagueInput;

    // Construire la condition de recherche
    const whereCondition: any = {};
    if (id) whereCondition.id = id;
    if (name) whereCondition.name = name;

    // Rechercher la league
    const league = await this.prisma.league.findFirst({
      where: whereCondition,
      include: {
        avatar: true,
        UserLeague: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!league) {
      throw new NotFoundException('League not found');
    }

    // Trouver l'administrateur
    const adminUserLeague = league.UserLeague.find((ul) => ul.isAdmin);

    // Retourner le résultat formaté
    return {
      id: league.id as any,
      name: league.name,
      private: league.private,
      joinCode: league.joinCode,
      avatar: league.avatar
        ? {
            id: league.avatar.id as UUID,
            url: league.avatar.picture,
          }
        : null,
      admin: adminUserLeague?.user
        ? {
            id: adminUserLeague.user.id as UUID,
            username: adminUserLeague.user.username,
            clerkId: adminUserLeague.user.clerkId,
            email: adminUserLeague.user.email,
            password: '',
            leagues: [],
          }
        : null,
      members: league.UserLeague.map((userLeague) => ({
        id: userLeague.user.id as UUID,
        clerkId: userLeague.user.clerkId,
        username: userLeague.user.username,
        firstName: userLeague.user.firstName,
        lastName: userLeague.user.lastName,
        email: userLeague.user.email,
        password: '',
        leagues: [],
      })),
    };
  }

  async deleteLeague(
    leagueId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    // 1. Vérifier que la league existe
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        UserLeague: {
          where: { isAdmin: true },
          include: { user: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    // 2. Vérifier que l'utilisateur est admin de cette league
    const isAdmin = league.UserLeague.some((ul) => ul.userId === userId);

    if (!isAdmin) {
      throw new BadRequestException(
        'Only the league admin can delete the league',
      );
    }

    try {
      // 3. Utiliser une transaction pour supprimer la league et toutes ses relations
      await this.prisma.$transaction(async (prisma) => {
        // Supprimer d'abord les relations UserLeague
        await prisma.userLeague.deleteMany({
          where: { leagueId: leagueId },
        });

        // Supprimer ensuite les avatars associés (si votre modèle les gère)
        if (league.avatarId) {
          await prisma.avatar.delete({
            where: { id: league.avatarId },
          });
        }

        // Supprimer finalement la league
        await prisma.league.delete({
          where: { id: leagueId },
        });
      });

      return {
        success: true,
        message: `League "${league.name}" successfully deleted`,
      };
    } catch (error) {
      throw new Error(`Failed to delete league: ${error.message}`);
    }
  }
}
