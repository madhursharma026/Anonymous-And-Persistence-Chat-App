import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { CreatePersistenceMessageInput } from './dto/create-persistence-chat.input';
import { PersistenceMessage } from './entities/persistence-chat.entity';

const pubSub = new PubSub();

@Injectable()
export class PersistenceChatsService {
  private activeSessions: Map<string, Set<string>> = new Map();

  constructor(
    @InjectRepository(PersistenceMessage)
    private messageRepository: Repository<PersistenceMessage>,
  ) {}

  async createMessage(
    createMessageInput: CreatePersistenceMessageInput,
  ): Promise<PersistenceMessage> {
    const message = this.messageRepository.create(createMessageInput);
    await this.messageRepository.save(message);
    pubSub.publish('messageSent', { messageSent: message });
    return message;
  }

  async getMessages(
    sender_id: string,
    receiver_id: string,
  ): Promise<PersistenceMessage[]> {
    return this.messageRepository.find({
      where: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
      order: { timestamp: 'ASC' },
    });
  }

  getPubSub(): PubSub {
    return pubSub;
  }

  async markAsRead(messageId: number): Promise<PersistenceMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    message.isRead = true;
    await this.messageRepository.save(message);

    pubSub.publish('messageRead', { messageRead: message });
    return message;
  }

  async loginUser(userId: string, partnerId: string): Promise<void> {
    if (
      this.activeSessions.has(userId) &&
      !this.activeSessions.get(userId)?.has(partnerId)
    ) {
      throw new Error(`${userId} is already in a session with someone else.`);
    }

    if (
      this.activeSessions.has(partnerId) &&
      !this.activeSessions.get(partnerId)?.has(userId)
    ) {
      throw new Error(
        `${partnerId} is already in a session with someone else.`,
      );
    }

    if (!this.activeSessions.has(userId)) {
      this.activeSessions.set(userId, new Set());
    }
    if (!this.activeSessions.has(partnerId)) {
      this.activeSessions.set(partnerId, new Set());
    }

    this.activeSessions.get(userId)?.add(partnerId);
    this.activeSessions.get(partnerId)?.add(userId);
  }
}
