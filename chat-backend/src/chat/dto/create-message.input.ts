import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field()
  @IsNotEmpty()
  sender_id: string;

  @Field()
  @IsNotEmpty()
  receiver_id: string;

  @Field()
  @IsNotEmpty()
  content: string;
}
