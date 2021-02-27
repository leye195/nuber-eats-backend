import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPut } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class CategoryInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutPut {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
