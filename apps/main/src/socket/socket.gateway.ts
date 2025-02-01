import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { SocketService } from "./socket.service";
import { CreateSocketDto } from "./dto/create-socket.dto";
import { UpdateSocketDto } from "./dto/update-socket.dto";
import { Server, Socket } from "socket.io";
import { ExerciseService } from "../exercise/exercise.service";
import { StudyService } from "../study/study.service";
import {
  COMPILE_SERVICE_NAME,
  CompileResult,
  CompileServiceClient,
  CompileStatus,
  CurrentUser,
  IUser,
  TestCase,
} from "@app/common";
import { Inject, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Testcase } from "../schemas/testcase.schema";
import { ExerciseStatusService } from "../exercise-status/exercise-status.service";
import { CreateExerciseStatusDto } from "../exercise-status/dto/create-exercise-status.dto";
import e from "express";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
})
export class SocketGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer() server: Server;
  private compileService: CompileServiceClient;
  private userExecutionMap = new Map<
    string,
    {
      sockets: Set<string>;
      testcases: { exerciseId: string; testcaseIndex: number; value: any }[];
    }
  >();
  constructor(
    private studyService: StudyService,
    private exerciseService: ExerciseService,
    private exerciseStatusService: ExerciseStatusService,
    @Inject(COMPILE_SERVICE_NAME) private client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.compileService =
      this.client.getService<CompileServiceClient>(COMPILE_SERVICE_NAME);
  }
  // This method is called when a new user connects
  handleConnection(client: Socket) {
    console.log("A new user connected:", client.id);
  }

  // Hàm lấy mã giải pháp
  async getSolutionCode(exerciseId: string): Promise<string> {
    try {
      return await this.studyService.findSolutionCode(exerciseId);
    } catch (error) {
      // client.emit('error', `Không tìm thấy solution code: ${error.message}`);
      throw error;
    }
  }

  // Register a user with a uniqueId
  // @SubscribeMessage("register")
  // handleRegister(
  //   @MessageBody() data: { uniqueId: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   console.log(`User registered with uniqueId: ${data.uniqueId}`);

  //   // Associate the client with their uniqueId
  //   client.data.uniqueId = data.uniqueId;

  //   // (Optional) Send response back to client
  //   client.emit("registered", { message: "User registered successfully" });
  // }

  @SubscribeMessage("register")
  handleRegister(
    @MessageBody() data: { uniqueId: string; exerciseId: string },
    @ConnectedSocket() client: Socket,
  ) {

    // Gán uniqueId cho client
    client.data.uniqueId = data.uniqueId;

    // Nếu user chưa tồn tại trong map, khởi tạo mới
    if (!this.userExecutionMap.has(data.uniqueId)) {
      this.userExecutionMap.set(data.uniqueId, {
        sockets: new Set(),
        testcases: [],
      });
    }

    const userExecution = this.userExecutionMap.get(data.uniqueId);

    // Thêm socketId mới vào danh sách sockets của user
    userExecution.sockets.add(client.id);

    // Tìm testcase có exerciseId khớp và index cao nhất
   
    console.log(this.userExecutionMap)
    // Gửi lại testcase mới nhất nếu có
    if (userExecution.testcases) {
      console.log("second")
      console.log(userExecution.sockets)
      client.emit("restoreExecution", userExecution.testcases);
    }

    // Cập nhật lại map
    this.userExecutionMap.set(data.uniqueId, userExecution);

    // Thông báo đăng ký thành công
    client.emit("registered", { message: "User registered successfully" });
  }
  handleDisconnect(client: Socket) {
    console.log(`User ${client.id} disconnected`);
    // this.userExecutionMap.forEach((execution, userId) => {
    //   execution.sockets.delete(client.id);
    //   if (execution.sockets.size === 0) {
    //     console.log(`Removing user ${userId} from map because no sockets left`);
    //     this.userExecutionMap.delete(userId);
    //   }
    // });
  }
  
  // This is an example of handling a custom message from a client
  @SubscribeMessage("sendMessage")
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log("Received message from client:", message);
    this.server.emit("message", { clientId: client.id, message });
  }

  @SubscribeMessage("compile")
  async compile2(
    @MessageBody()
    data: {
      code: string;
      testCases: string[][];
      exerciseId: string;
      language: string;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = data.userId;
      if (!userId) {
        throw new Error("User information is missing");
      }
      const compileRequest = {
        code: data.code,
        codeSolution: await this.getSolutionCode(data.exerciseId),
        testcases: data.testCases.map((inputs) => ({ inputs })),
        language: data.language,
      };

      if (
        !(await this.exerciseStatusService.checkExist(userId, data.exerciseId))
      ) {
        const createExerciseStatusDto: CreateExerciseStatusDto = {
          userId: userId,
          exerciseId: data.exerciseId,
          submission: [],
        };

        await this.exerciseStatusService.create(createExerciseStatusDto);
      }

      const stream = this.compileService.runCompile(compileRequest);

      stream.subscribe({
        // next: (res) => {
        //   if (res.status) {
        //     client.emit("output", res.status);
        //   } else if (res.LogRunCode) {
        //     client.emit("output_compile", res.LogRunCode);
        //   }
        // },
        next: (res) => {
          if (!this.userExecutionMap.has(userId)) {
            this.userExecutionMap.set(userId, {
              sockets: new Set(),
              testcases: [],
            });
          }
  
          const userExecution = this.userExecutionMap.get(userId);
          console.log(userExecution)
          if (res.LogRunCode) {
            const index = res.LogRunCode.testCaseIndex;
            
            // Tìm testcase hiện tại trong array
            const existingTestcaseIndex = userExecution.testcases.findIndex(
              tc => tc.exerciseId === data.exerciseId && tc.testcaseIndex === index
            );
  
            if (existingTestcaseIndex === -1) {
              // Nếu chưa có, thêm mới
              userExecution.testcases.push({
                exerciseId: data.exerciseId,
                testcaseIndex: index,
                value: res.LogRunCode.chunk,
              });
            } else {
              // Nếu đã có, update value
              userExecution.testcases[existingTestcaseIndex].value += res.LogRunCode.chunk;
            }
  
            // Đảm bảo array được sắp xếp theo testcaseIndex
            userExecution.testcases.sort((a, b) => a.testcaseIndex - b.testcaseIndex);
          }
          // userExecution.sockets.forEach((socketId) => {
          //   const socket = this.server.sockets.sockets.get(socketId);
          //   if (socket) {
             
          //     if (res.status) {
          //       socket.emit("output", res.status);
          //     } else if (res.LogRunCode) {
          //       socket.emit("output_compile", res.LogRunCode);
          //     }
          //   }
          // });
          console.log(userExecution.sockets)
          this.server.to([...userExecution.sockets]).emit(
            res.status ? 'output' : 'output_compile',
            res.status || res.LogRunCode
          );
          this.userExecutionMap.set(userId, userExecution);
        },
        error: (err) => {
          client.emit("error", { message: err.details });
        },
        complete: () => {
          const userExecution = this.userExecutionMap.get(userId);
          if (userExecution) {
            // Lọc bỏ testcases thuộc exerciseId hiện tại
            userExecution.testcases = userExecution.testcases.filter(tc => tc.exerciseId !== data.exerciseId);
        
            // Cập nhật lại userExecutionMap
            this.userExecutionMap.set(userId, userExecution);
          }
          console.log(this.userExecutionMap)
          client.emit(
            "completed",
            `Biên dịch hoàn tất tất cả test cases cho user ${userId}`,
          );
        },
      });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("submit")
  async submit(
    @MessageBody()
    data: {
      code: string;
      exerciseId: string;
      userId: string;
      language: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const tc = await this.exerciseService.findTestcaseById(data.exerciseId);
    const payload: TestCase[] = tc.map((ele, i) => {
      const temp = ele.input
        .map((e) => {
          // Lấy giá trị trong object (giả sử bạn có một object với giá trị cần lấy)
          return Object.values(e).map((val) => String(val)); // Chuyển đổi tất cả giá trị thành string
        })
        .flat();
      return {
        // inputs: temp as string[][],
        // output: ele.output,
        output: ele.outputExpected,
        inputs: temp,
      };
    });
    const codeSolution = await this.getSolutionCode(data.exerciseId);
    const stream = this.compileService.runSubmit({
      testcases: payload,
      code: data.code,
      codeSolution,
      language: data.language,
    });
    const arrayStatus: CompileStatus[] = [];
    stream.subscribe({
      next: async (res) => {
        if (res.status) {
          console.log("res.status", res.status);
          arrayStatus.push(res.status);
        } else {
          const { result, score, status } = res.finalResult;

          if (status === 200) {
            const compareTime = await this.exerciseStatusService.compareRuntime(
              data.exerciseId,
              res.finalResult.totalRuntime,
            );
            this.exerciseStatusService.updateStatusAndSubmission(
              data.userId,
              data.exerciseId,
              "completed",
              data.code,
              "accepted",
              "",
              result,
              res.finalResult.totalRuntime,
              compareTime,
            );
            client.emit("complete_submit", {
              ...res.finalResult,
              compareTime: compareTime,
            }); // Truyền kết quả về client qua socket
          } else {
            const testcaseIncorrect = tc.find((ele, index) =>
              arrayStatus.some(
                (arrayStatus) =>
                  arrayStatus.testCaseIndex === index && !arrayStatus.isCorrect,
              ),
            );

            const testcase = {
              ...testcaseIncorrect,
              output: arrayStatus.find((arrayStatus) => !arrayStatus.isCorrect)
                .output,
              outputExpected: testcaseIncorrect.outputExpected,
            };
            this.exerciseStatusService.updateStatusAndSubmission(
              data.userId,
              data.exerciseId,
              "in-progress",
              data.code,
              "wrong answer",
              "",
              result,
              res.finalResult.totalRuntime,
              0,
              testcase,
            );
            client.emit("complete_submit", {
              ...res.finalResult,
              testcase,
            });
          }
        }
      },
      error: (error) => {
        this.exerciseStatusService.updateStatusAndSubmission(
          data.userId,
          data.exerciseId,
          "in-progress",
          data.code,
          "compile error",
          error.details,
          `0/${tc.length}`,
        );
        client.emit("error", { message: error.details });
      },
    });
  }
}
