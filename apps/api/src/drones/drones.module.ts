import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drone } from '../entities/drone.entity';
import { DronesService } from './drones.service';
import { DronesController } from './drones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Drone])],
  providers: [DronesService],
  controllers: [DronesController],
})
export class DronesModule {}
