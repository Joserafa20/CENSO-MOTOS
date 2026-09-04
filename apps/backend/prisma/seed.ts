import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const saltRounds = 10;

  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      nombre: 'Administrador',
      documento: '00000000',
      username: adminUsername,
      passwordHash,
      rol: 'ADMIN',
      estado: true,
    },
  });

  console.log(`✅ Admin user created/found: ${adminUser.username} (id: ${adminUser.id})`);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
