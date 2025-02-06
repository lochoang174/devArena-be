import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseFilters,
  HttpStatus,
} from "@nestjs/common";
import { ContestDescriptionService } from "./contest-description.service";
import { CreateContestDescriptionDto } from "./dto/create-contest-description.dto";
import { UpdateContestDescriptionDto } from "./dto/update-contest-description.dto";
import { RolesGuard } from "../auth/guards/role.guard";
import { CustomException, Roles } from "@app/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import * as path from "path";
import { diskStorage } from "multer";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

@Controller("contest-description")
export class ContestDescriptionController {
  constructor(
    private readonly contestDescriptionService: ContestDescriptionService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "../../../apps/main/uploads/contests", // Directory to save the uploaded images
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new CustomException(
              "Chỉ chấp nhận file ảnh có định dạng jpg, jpeg, png, gif",
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createContestDescriptionDto: CreateContestDescriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createContestDescriptionDto.image = file.filename; // Save file path in DTO
    }
    return this.contestDescriptionService.create(createContestDescriptionDto);
  }

  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  @Get()
  findAll() {
    return this.contestDescriptionService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contestDescriptionService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateContestDescriptionDto: UpdateContestDescriptionDto,
  ) {
    return this.contestDescriptionService.update(
      id,
      updateContestDescriptionDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contestDescriptionService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Patch(":id/publish")
  publish(@Param("id") id: string) {
    return this.contestDescriptionService.publish(id);
  }

  @Get("/status/:status")
  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  findByStatus(@Param("status") status: string) {
    return this.contestDescriptionService.findByStatus(status);
  }
}
