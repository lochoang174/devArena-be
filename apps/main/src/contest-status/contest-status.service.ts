import { Injectable } from '@nestjs/common';
import { CreateContestStatusDto } from './dto/create-contest-status.dto';
import { UpdateContestStatusDto } from './dto/update-contest-status.dto';

@Injectable()
export class ContestStatusService {
  create(createContestStatusDto: CreateContestStatusDto) {
    return 'This action adds a new contestStatus';
  }

  findAll() {
    return `This action returns all contestStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contestStatus`;
  }

  update(id: number, updateContestStatusDto: UpdateContestStatusDto) {
    return `This action updates a #${id} contestStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} contestStatus`;
  }
}
