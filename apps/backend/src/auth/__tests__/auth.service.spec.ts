import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const mockJwt = {
    sign: jest.fn(),
  };

  beforeEach(() => {
    service = new AuthService(mockPrisma as any, mockJwt as any);
  });

  describe('validateUser', () => {
    it('should return user without passwordHash when valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'admin',
        passwordHash: '$2b$10$hashedpassword',
        nombre: 'Admin',
        rol: 'ADMIN',
        estado: true,
      });
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.validateUser('admin', 'password');
      expect(result).toBeDefined();
      expect(result?.username).toBe('admin');
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser('wrong', 'pass');
      expect(result).toBeNull();
    });
  });
});