import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { StudyModule } from "../study/study.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { COMPILE_SERVICE_NAME } from "@app/common";
import { join } from "path";
import { ExerciseStatusModule } from "../exercise-status/exercise-status.module";
import { AlgorithmModule } from "../algorithm/algorithm.module";
import { CourseStatusModule } from "../course-status/course-status.module";

@Module({
  providers: [SocketGateway, SocketService],
  imports: [
    StudyModule,
    ExerciseStatusModule,
    AlgorithmModule,
    CourseStatusModule,
    ClientsModule.register([
      {
        name: COMPILE_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: "compile",
          protoPath: join(__dirname, "../../../proto/compile.proto"), // Đường dẫn đúng
          url: 'compile:5000', // Quan trọng: Listen trên tất cả interfaces
          
        },
      },
    ]),
  ],
})
export class SocketModule { }
