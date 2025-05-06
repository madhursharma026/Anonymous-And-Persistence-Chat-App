import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceMessage } from './entities/persistence-chat.entity';
import { PersistenceChatsResolver } from './persistence-chats.resolver';
import { PersistenceChatsService } from './persistence-chats.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersistenceMessage])],
  providers: [PersistenceChatsService, PersistenceChatsResolver],
})
export class PersistenceChatsModule {}
