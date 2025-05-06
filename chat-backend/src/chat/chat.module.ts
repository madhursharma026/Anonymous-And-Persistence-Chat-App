import { Module } from '@nestjs/common';
import { AnonymousChatResolver } from './chat.resolver';
import { AnonymousChatService } from './chat.service';

@Module({
  providers: [AnonymousChatService, AnonymousChatResolver],
})
export class ChatModule {}
