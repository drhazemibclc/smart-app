import 'dotenv/config';

import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from './src/generated/prisma/client';
import { generateId } from './src/lib/id';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL ?? ''
}).$extends(withAccelerate());

async function main() {
  const user = await prisma.user.create({
    data: {
      id: generateId(),
      name: 'Alice',
      email: 'alice@prisma.io',
      password: 'HealthF26'
    }
  });

  console.log(user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
