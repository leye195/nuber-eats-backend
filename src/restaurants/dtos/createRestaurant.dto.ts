import { ArgsType, Field } from '@nestjs/graphql';

// @InputType() //하나의 object를 argument로서 graphql에 전달하기 위한 용도로 활용
@ArgsType() // 분리된 값들을 Graphql argument로 전달해 줄 수 있도록 해줌
export class CreateRestaurantDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => Boolean)
  isVegan: boolean;

  @Field(() => String)
  ownerName: string;
}
