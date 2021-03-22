import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutPut } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantInput {
  @Field(() => Number)
  id: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutPut {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
