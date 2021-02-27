import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPut } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutPut {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
