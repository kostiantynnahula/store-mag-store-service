import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const storesList = [
    {
      name: 'SmartFun',
      address: 'SmartFun Address',
    },
    {
      name: 'Klass Traktora Aram',
      address: 'Klass Traktora Aram Address',
    },
    {
      name: 'Privoz',
      address: 'Privoz Address',
    },
    {
      name: 'Klass Rogan',
      address: 'Klass Rogan Address',
    },
    {
      name: 'Klass Prolet Aram',
      address: 'Klass Prolet Aram Address',
    },
    {
      name: 'Zhukova',
      address: 'Zhukova Address',
    },
    {
      name: 'TRK Mobilochka',
      address: 'TRK Mobilochka Address',
    },
    {
      name: 'Prolet 1/20',
      address: 'Prolet 1/20 Address',
    },
    {
      name: 'Klass Haharina',
      address: 'Klass Haharina Address',
    },
    {
      name: 'Chudo HTZ',
      address: 'Chudo HTZ Address',
    },
    {
      name: 'Klass Trakrobudivnykiv',
      address: 'Klass Trakrobudivnykiv Address',
    },
  ];

  const existed = await prisma.store.findMany();

  if (existed.length) {
    console.log('Stores already seeded');
    return;
  }

  const list = await prisma.store.createMany({
    data: storesList,
    skipDuplicates: true,
  });

  console.log({ list });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
