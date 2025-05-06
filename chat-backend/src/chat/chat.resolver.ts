import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AnonymousChatService } from './chat.service';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './entities/message.entity';

@Resolver(() => Message)
export class AnonymousChatResolver {
  constructor(private readonly anonymousChatService: AnonymousChatService) {}

  @Mutation(() => Message)
  async sendAnonymousMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
  ): Promise<Message> {
    return this.anonymousChatService.createAnonymousMessage(createMessageInput);
  }

  @Mutation(() => Message)
  async markAnonymousMessageAsRead(
    @Args('messageId') messageId: number,
  ): Promise<Message> {
    return this.anonymousChatService.markAnonymousMessageAsRead(messageId);
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      const { anonymousMessageSent } = payload;
      return (
        (anonymousMessageSent.sender_id === variables.sender_id &&
          anonymousMessageSent.receiver_id === variables.receiver_id) ||
        (anonymousMessageSent.sender_id === variables.receiver_id &&
          anonymousMessageSent.receiver_id === variables.sender_id)
      );
    },
  })
  anonymousMessageSent(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ) {
    return this.anonymousChatService
      .getPubSub()
      .asyncIterableIterator('anonymousMessageSent');
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      const { anonymousMessageRead } = payload;
      return (
        (anonymousMessageRead.sender_id === variables.sender_id &&
          anonymousMessageRead.receiver_id === variables.receiver_id) ||
        (anonymousMessageRead.sender_id === variables.receiver_id &&
          anonymousMessageRead.receiver_id === variables.sender_id)
      );
    },
  })
  anonymousMessageRead(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ) {
    return this.anonymousChatService
      .getPubSub()
      .asyncIterableIterator('anonymousMessageRead');
  }

  @Query(() => [Message])
  async getAnonymousMessages(
    @Args('sender_id') sender_id: string,
    @Args('receiver_id') receiver_id: string,
  ): Promise<Message[]> {
    return this.anonymousChatService.getAnonymousMessages(
      sender_id,
      receiver_id,
    );
  }

  @Mutation(() => Boolean)
  async loginAnonymousUser(
    @Args('userId') userId: string,
    @Args('partnerId') partnerId: string,
  ): Promise<boolean> {
    await this.anonymousChatService.loginAnonymousUser(userId, partnerId);
    return true;
  }

  @Mutation(() => Boolean)
  async logoutAnonymousUser(@Args('userId') userId: string): Promise<boolean> {
    await this.anonymousChatService.logoutAnonymousUser(userId);
    return true;
  }

  @Subscription(() => String)
  anonymousUserLoggedOut(@Args('userId') userId: string) {
    return this.anonymousChatService
      .getPubSub()
      .asyncIterableIterator('anonymousUserLoggedOut');
  }
}
