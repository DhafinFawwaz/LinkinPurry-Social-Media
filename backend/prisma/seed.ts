import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

const defaultPhotoPath = '/uploads/img/jobseeker_profile.svg';

async function main() {
    // await prisma.user.deleteMany();
    // await prisma.feed.deleteMany();
    // await prisma.chat.deleteMany();
    // await prisma.connectionRequest.deleteMany();
    // await prisma.connection.deleteMany();
    // await prisma.pushSubscription.deleteMany();
    await prisma.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "feed" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "chat" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "connection_request" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "connection" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "push_subscriptions" RESTART IDENTITY CASCADE;`


    // hawk tuah
    const userCount = 500; // users
    const feedsPerUser = 20; // feeds per user
    const chatsPerUser = 20; // chats per user
    const connectionsPerUser = 200; // connections per user (approximately)
    const requestsPerUser = 200; // connection requests per user (setelah filter akan jauh lebih sedikit)
  
    const uniqueFirstNames = faker.helpers.uniqueArray(faker.person.firstName, userCount*2);
    const usersData = await Promise.all(
        Array.from({ length: userCount }).map(async (e, i) => {
            const saltRound = 10;
            // const password = "password123";
            const password = `password${i+1}`;
            const hashedPassword = await bcrypt.hash(password, saltRound);
            // const firstName = uniqueFirstNames.pop()! + "_" + i; // faker.helpers.uniqueArray is probably bugged
            const firstName = `user${i+1}wbd`; // faker.helpers.uniqueArray is probably bugged
            const lastName = faker.person.lastName();
            const fullName = `${firstName} ${lastName}`;
            const email = faker.internet.email({
                firstName: firstName,
                lastName: lastName,
            });

            return {
                username: firstName,
                email: email,
                password_hash: hashedPassword,
                full_name: fullName,
                work_history: faker.lorem.paragraph(),
                skills: faker.lorem.words(5),
                profile_photo_path: defaultPhotoPath,
            };
        })
    );
    const users = await prisma.user.createMany({ data: usersData });
    console.log(`Created ${users.count} users`);
  
    const createdUsers = await prisma.user.findMany();
  
    const feedsData = createdUsers.flatMap((user) =>
      Array.from({ length: feedsPerUser }).map(() => ({
        content: faker.lorem.sentences(),
        user_id: user.id,
        created_at: faker.date.recent({
          days: 30,
        }).toISOString(),

      }))
    );
    const feeds = await prisma.feed.createMany({ data: feedsData });
    console.log(`Created ${feeds.count} feeds`);
  
    const chatsData = createdUsers.flatMap((user) =>
      Array.from({ length: chatsPerUser }).map(() => {
        const recipient = faker.helpers.arrayElement(
          createdUsers.filter((u) => u.id !== user.id)
        );
        return {
          from_id: user.id,
          to_id: recipient.id,
          message: faker.lorem.sentence(),
        };
      })
    );
    const chats = await prisma.chat.createMany({ data: chatsData });
    console.log(`Created ${chats.count} chats`);

    const connectionsData = createdUsers.flatMap((user) =>
      Array.from({ length: Math.ceil(connectionsPerUser / 2) }).flatMap(() => {
        const connection = faker.helpers.arrayElement(
          createdUsers.filter((u) => u.id !== user.id)
        );
        return [
          // Jika A ada connection ke B, maka B juga ada connection ke A
          {from_id: user.id, to_id: connection.id,},
          {from_id: connection.id, to_id: user.id,},
        ];
      })
    );
    const connectionsDataUnique = connectionsData.filter((connection, index, self) => index === self.findIndex((t) => t.from_id === connection.from_id && t.to_id === connection.to_id)) // remove duplicate
    const connections = await prisma.connection.createMany({ data: connectionsDataUnique });
    console.log(`Created ${connections.count} connections`);

    const requestsData = createdUsers.flatMap((user) =>
      Array.from({ length: requestsPerUser }).map(() => {
        const recipient = faker.helpers.arrayElement(
          createdUsers.filter((u) => u.id !== user.id)
        );
        return {
          from_id: user.id,
          to_id: recipient.id,
        };
      })
    );
    const requestsDataUnique = requestsData.filter((request, index, self) => {
      if (self.some((t, i) => i < index && t.from_id === request.to_id && t.to_id === request.from_id)) return false; // Jika A ada request ke B, maka B tidak ada request ke A
      if (connectionsDataUnique.some((t) => t.from_id === request.from_id && t.to_id === request.to_id)) return false; // Jika A ada connection ke B, maka A tidak ada request ke B
      return index === self.findIndex((t) => t.from_id === request.from_id && t.to_id === request.to_id); // remove duplicate
    });
    const connectionRequests = await prisma.connectionRequest.createMany({ data: requestsDataUnique });
    console.log(`Created ${connectionRequests.count} connection requests`);
  
    console.log('Seeding completed.');
}
  

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })