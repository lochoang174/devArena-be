import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateStudyDto } from './dto/createStudy.dto';

@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {
  }
  // @Post('/')
  // @HttpCode(HttpStatus.CREATED)
  // async createStudy(createStudy: CreateStudyDto) {
  //   const newData= await  this.studyService.create(createStudy)
  //   return {data: newData};
    
  // }
  // @Get('/')
  // @HttpCode(HttpStatus.CREATED)
  // async finAllStudy() {
  //   const newData= await  this.studyService.findAll()
  //   return {data: newData};
    
  // }
}
