import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './createRestaurant.dto';

//@InputType() //하나의 object를 argument로서 graphql에 전달하기 위한 용도로 활용
//@ArgsType() // 분리된 값들을 Graphql argument로 전달해 줄 수 있도록 해줌
@InputType()
class UpdateRestaurantInPutType extends PartialType(CreateRestaurantDTO) {}

@ArgsType()
export class UpdateRestaurantDTO {
  @Field(() => Number)
  id: number;

  @Field(() => UpdateRestaurantInPutType)
  data: UpdateRestaurantInPutType;
}
