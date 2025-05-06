import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('persistence_messages')
export class PersistenceMessage {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  sender_id: string;

  @Field()
  @Column()
  receiver_id: string;

  @Field()
  @Column()
  content: string;

  @Field()
  @CreateDateColumn()
  timestamp: Date;

  @Field()
  @Column({ default: false })
  isRead: boolean;
}
