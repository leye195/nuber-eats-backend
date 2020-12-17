import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //Restaurant Entity를 Repository로 inject
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
}
