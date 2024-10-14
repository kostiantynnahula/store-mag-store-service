import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const kafkaBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
  const kafkaGroupId = process.env.KAFKA_GROUP_ID || 'store-consumer';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'store',
          brokers: [kafkaBrokers],
        },
        consumer: {
          groupId: kafkaGroupId,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
