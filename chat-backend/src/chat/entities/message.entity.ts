import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field()
  id: number;

  @Field()
  sender_id: string;

  @Field()
  receiver_id: string;

  @Field()
  content: string;

  @Field()
  timestamp: Date;

  @Field()
  isRead: boolean;
}
