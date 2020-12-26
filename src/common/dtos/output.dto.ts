import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutPut {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  ok: boolean;
}
