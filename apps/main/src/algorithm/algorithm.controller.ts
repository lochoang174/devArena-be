import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AlgorithmService } from './algorithm.service';
import { CreateAlgorithmDto } from './dto/createAlgorithm.dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { Public, Roles } from '@app/common';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private readonly algorithmService: AlgorithmService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  create(@Body() createAlgorithmDto: CreateAlgorithmDto) {
    return this.algorithmService.create(createAlgorithmDto);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  update(
    @Param("id") id: string,
    @Body() updateAlgorithmDto: Partial<CreateAlgorithmDto>,
  ) {
    return this.algorithmService.update(id, updateAlgorithmDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  delete(@Param("id") id: string) {
    return this.algorithmService.delete(id);
  }

  @Get()
  @Public()
  findAll() {
    return this.algorithmService.findAll();
  }

  @Public()
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.algorithmService.findById(id);
  }

  @Get("user/:userId")
  @Roles(["admin", "client"])
  async findAllByUser(
    @Param("userId") userId: string
  ) {
    try {
      return await this.algorithmService.findAllByUser(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND); // Or use BAD_REQUEST based on the error type
    }
  }
}
