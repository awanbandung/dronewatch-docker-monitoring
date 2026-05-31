import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DronesService } from './drones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('drones')
@UseGuards(JwtAuthGuard)
export class DronesController {
  constructor(private dronesService: DronesService) {}

  @Get()
  findAll() {
    return this.dronesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dronesService.findOne(id);
  }
}
