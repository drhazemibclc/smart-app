/**
 * Example: Testing Service Layer Logic
 *
 * This approach tests business logic separately from tRPC routers,
 * avoiding complex import chains and making tests more focused.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Example service function (you would import from your actual service)
const userService = {
  async getUserById(db: any, userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  },

  async updateUser(db: any, userId: string, data: any) {
    return await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true
      }
    });
  },

  async getUserClinics(db: any, userId: string) {
    const memberships = await db.clinicMember.findMany({
      where: { userId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return memberships.map((m: any) => ({
      ...m.clinic,
      role: m.role
    }));
  }
};

describe('userService', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      clinicMember: {
        findMany: vi.fn()
      }
    };
  });

  describe('getUserById', () => {
    it('returns user by id', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'DOCTOR'
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockDb, 'user-1');

      expect(result).toEqual(mockUser);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
    });

    it('returns null when user not found', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById(mockDb, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates user data', async () => {
      const updateData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const updatedUser = {
        id: 'user-1',
        ...updateData
      };

      mockDb.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(mockDb, 'user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true
        }
      });
    });

    it('handles database errors', async () => {
      mockDb.user.update.mockRejectedValue(new Error('Database error'));

      await expect(userService.updateUser(mockDb, 'user-1', { name: 'Test' })).rejects.toThrow('Database error');
    });
  });

  describe('getUserClinics', () => {
    it('returns user clinics with roles', async () => {
      const mockMemberships = [
        {
          clinic: {
            id: 'clinic-1',
            name: 'Clinic A',
            email: 'clinica@example.com'
          },
          role: 'DOCTOR'
        },
        {
          clinic: {
            id: 'clinic-2',
            name: 'Clinic B',
            email: 'clinicb@example.com'
          },
          role: 'STAFF'
        }
      ];

      mockDb.clinicMember.findMany.mockResolvedValue(mockMemberships);

      const result = await userService.getUserClinics(mockDb, 'user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'clinic-1',
        name: 'Clinic A',
        role: 'DOCTOR'
      });
      expect(mockDb.clinicMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    it('returns empty array when user has no clinics', async () => {
      mockDb.clinicMember.findMany.mockResolvedValue([]);

      const result = await userService.getUserClinics(mockDb, 'user-1');

      expect(result).toEqual([]);
    });
  });
});
