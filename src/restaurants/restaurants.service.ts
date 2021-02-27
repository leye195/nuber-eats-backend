import { Injectable } from '@nestjs/common';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/createRestaurant.dto';
//import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/editRestaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/deleteRestaurant.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { AllRestaurantOutput } from './dtos/all-restaurants.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly restaurants: RestaurantRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async allRestaurants(): Promise<AllRestaurantOutput> {
    try {
      const restaurants = await this.restaurants.find({
        relations: ['category'],
      });
      return {
        ok: true,
        restaurants,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load Restaurants',
      };
    }
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      // 객체 생성
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant); // save on DB
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const { restaurantId, name } = editRestaurantInput;
      const isExist = await this.restaurants.checkExist(restaurantId);
      if (!isExist) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      //check owner
      const isOwner = await this.restaurants.checkIsOwner(restaurantId, owner);
      if (!isOwner) {
        return {
          ok: false,
          error: 'You can not edit a restaurant that you do not own',
        };
      }

      let category: Category = null;
      if (name) {
        category = await this.categories.getOrCreate(name);
      }
      await this.restaurants.save([
        {
          id: restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const isExist = await this.restaurants.checkExist(restaurantId);
      if (!isExist) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      //check owner
      const isOwner = await this.restaurants.checkIsOwner(restaurantId, owner);
      if (!isOwner) {
        return {
          ok: false,
          error: 'You can not delete a restaurant that you do not own',
        };
      }
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete Restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load Categories',
      };
    }
  }

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne(
        { slug },
        {
          relations: ['restaurants'],
        },
      );
      if (!category) {
        return {
          ok: false,
          error: 'Could not find Category',
        };
      }
      return {
        ok: true,
        category,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load Category',
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }
}
