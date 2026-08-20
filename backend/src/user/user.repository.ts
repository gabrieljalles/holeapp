import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService){}

    async findByMatricula(matricula: string): Promise<User | null>{
        return this.prisma.user.findUnique({
            where: { matricula}
        });
    }

    async findById(id: string): Promise<User | null>{
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null>{
        return this.prisma.user.findUnique({
            where: { email }
        });
    }

    async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
        return this.prisma.user.create({
            data
        })
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>{
        return this.prisma.user.update({
            where: {id},
            data
        })
    }

    async deleteUserByMatricula(matricula: string): Promise<User>{
        return this.prisma.user.delete({
            where: {matricula}
        })
    }

    async deleteUserById(id: string): Promise<User>{
        return this.prisma.user.delete({
            where: {id}
        })
    }

    async findAll(): Promise<User[]>{
        return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findByCreatedBy(creatorId: string): Promise<User[]>{
        return this.prisma.user.findMany({
            where: { createdByUserId: creatorId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Usuários reparadores — usado pra montar o multi-select de atribuição de zona de trabalho.
    async findRepairers() {
        return this.prisma.user.findMany({
            where: { role: Role.REPAIRER },
            select: { id: true, matricula: true, fullName: true, role: true, imgUserPath: true },
            orderBy: { fullName: 'asc' },
        });
    }

    // Valida em lote um payload de userIds (ex.: atribuição de zona) sem N+1.
    async findByIds(ids: string[]): Promise<User[]> {
        if (ids.length === 0) return [];
        return this.prisma.user.findMany({ where: { id: { in: ids } } });
    }

    async updateLocation(id: string, lat: number, lng: number): Promise<User>{
        return this.updateUser(id, { lastLat: lat, lastLng: lng, lastSeenAt: new Date() });
    }

    // Só quem ainda tem ping dentro da janela de visibilidade (sinceCutoff), excluindo
    // quem está pedindo — o admin nunca vê a própria posição nessa listagem.
    async findLocationsForMap(excludingUserId: string, sinceCutoff: Date) {
        return this.prisma.user.findMany({
            where: {
                id: { not: excludingUserId },
                lastSeenAt: { not: null, gte: sinceCutoff },
            },
            select: {
                id: true,
                fullName: true,
                imgUserPath: true,
                lastLat: true,
                lastLng: true,
                lastSeenAt: true,
            },
        });
    }
}