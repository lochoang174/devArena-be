import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { COMPILE_PACKAGE_NAME, COMPILE_SERVICE_NAME, CompileServiceClient, Public, TestCase } from '@app/common';

@Controller('user')
export class UserController implements OnModuleInit{
  private compileService:CompileServiceClient 
  constructor(
    private readonly userService: UserService,
    @Inject(COMPILE_SERVICE_NAME) private client: ClientGrpc
  ) {}
  onModuleInit() {
    this.compileService =
      this.client.getService<CompileServiceClient>(COMPILE_SERVICE_NAME);
  }
  @Post()
  @Public()
  async create() {
    const tc: TestCase[] = [
      { inputs: ['3', '3'] }, // Đúng theo định dạng TestCase
    ];
  
    try {
      // const response = await this.compileService.testCompile({ code: "abc", testcases: tc })
      return "response";
    } catch (error) { 
      console.error('Error:', error);
      throw error; // Hoặc trả lỗi tuỳ ý
    }
  }
  

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
