import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CreatePersistenceMessageInput } from './dto/create-persistence-chat.input';
import { PersistenceMessage } from './entities/persistence-chat.entity';
import { PersistenceChatsService } from './persistence-chats.service';

@Resolver(() => PersistenceMessage)
export class PersistenceChatsResolver {
  constructor(private readonly chatService: PersistenceChatsService) {}

  @Mutation(() => PersistenceMessage)
  async sendMessage(
    @Args('createMessageInput')
    createMessageInput: CreatePersistenceMessageInput,
  ): Promise<PersistenceMessage> {
    return this.chatService.createMessage(createMessageInput);
  }

  @Mutation(() => PersistenceMessage)
  async markAsRead(
    @Args('messageId') messageId: number,
  ): Promise<PersistenceMessage> {
    return this.chatService.markAsRead(messageId);
  }

  @Subscription(() => PersistenceMessage, {
    filter: (payload, variables) => {
      const { messageSent } = payload;
      return (
        (messageSent.sender_id === variables.sender_id &&
          messageSent.receiver_id === variables.receiver_id) ||
        (messageSent.sender_id === variables.receiver_id &&
          messageSent.receiver_id === variables.sender_id)
      );
    },
  })
  messageSent(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ) {
    return this.chatService.getPubSub().asyncIterableIterator('messageSent');
  }

  @Subscription(() => PersistenceMessage, {
    filter: (payload, variables) => {
      const { messageRead } = payload;
      return (
        (messageRead.sender_id === variables.sender_id &&
          messageRead.receiver_id === variables.receiver_id) ||
        (messageRead.sender_id === variables.receiver_id &&
          messageRead.receiver_id === variables.sender_id)
      );
    },
  })
  messageRead(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ) {
    return this.chatService.getPubSub().asyncIterableIterator('messageRead');
  }

  @Query(() => [PersistenceMessage])
  async getMessages(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ): Promise<PersistenceMessage[]> {
    return this.chatService.getMessages(sender_id, receiver_id);
  }

  @Mutation(() => Boolean)
  async loginUser(
    @Args('userId') userId: string,
    @Args('partnerId') partnerId: string,
  ): Promise<boolean> {
    await this.chatService.loginUser(userId, partnerId);
    return true;
  }
}
