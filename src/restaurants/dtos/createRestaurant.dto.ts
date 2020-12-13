import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// @InputType() //하나의 object를 argument로서 graphql에 전달하기 위한 용도로 활용
@ArgsType() // 분리된 값들을 Graphql argument로 전달해 줄 수 있도록 해줌
export class CreateRestaurantDTO {
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
