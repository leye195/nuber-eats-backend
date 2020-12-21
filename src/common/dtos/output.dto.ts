import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationOutPut {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  ok: boolean;
}
