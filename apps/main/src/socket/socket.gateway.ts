import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { Server, Socket } from 'socket.io';
import { ExerciseService } from '../exercise/exercise.service';
import { StudyService } from '../study/study.service';
import { COMPILE_SERVICE_NAME, CompileServiceClient, TestCase } from '@app/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Testcase } from '../schemas/testcase.schema';
import { ExerciseStatusService } from '../exercise-status/exercise-status.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],

  
})
export class SocketGateway implements OnGatewayConnection,OnModuleInit  {
  @WebSocketServer() server: Server;
  private compileService:CompileServiceClient

  constructor(
    private readonly socketService: SocketService,
    private studyService:StudyService,
    private exerciseService: ExerciseService,
    private exerciseStatusService: ExerciseStatusService,
    @Inject(COMPILE_SERVICE_NAME) private client: ClientGrpc
    
  
  ) {}
  onModuleInit() {
    this.compileService =
      this.client.getService<CompileServiceClient>(COMPILE_SERVICE_NAME);
  }
  // This method is called when a new user connects
  handleConnection(client: Socket) {
    console.log('A new user connected:', client.id);


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
    @SubscribeMessage('register')
    handleRegister(
      @MessageBody() data: { uniqueId: string },
      @ConnectedSocket() client: Socket,
    ) {
      console.log(`User registered with uniqueId: ${data.uniqueId}`);
  
      // Associate the client with their uniqueId
      client.data.uniqueId = data.uniqueId;
      this.socketService.associateClientWithUniqueId(client.id, data.uniqueId);
  
      // (Optional) Send response back to client
      client.emit('registered', { message: 'User registered successfully' });
    }

  // This is an example of handling a custom message from a client
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket): void {
    console.log('Received message from client:', message);
    this.server.emit('message', { clientId: client.id, message });
  }
  @SubscribeMessage('compile2')
  async compile2(
    @MessageBody() data: { code: string; testCases: string[][], exerciseId: string },
    @ConnectedSocket() client: Socket,

  ){
    const compileRequest = {
      code: data.code,
      codeSolution: await this.getSolutionCode(data.exerciseId),
      testcases: data.testCases.map((inputs) => ({ inputs })),
    };
  
    const stream = this.compileService.runCompile(compileRequest);
  
    stream.subscribe({
      next: (status) => {
        client.emit('output', status); // Truyền kết quả về client qua socket
      },
      error: (err) => {
        console.log(err)
        client.emit('error', { message: err.message });
      },
      complete: () => {
        client.emit('completed', 'Biên dịch hoàn tất tất cả test cases');
      },
    });

  }
  @SubscribeMessage('submit')
  async submit(
    @MessageBody() data: { code: string, exerciseId: string, userId: string },
    @ConnectedSocket() client: Socket,

  ){
    const tc= await this.exerciseService.findTestcaseById(data.exerciseId)
    const payload:TestCase[]=tc.map((ele,i)=>{
      const temp = ele.input.map((e) => {
        // Lấy giá trị trong object (giả sử bạn có một object với giá trị cần lấy)
        return Object.values(e).map(val => String(val)); // Chuyển đổi tất cả giá trị thành string
      }).flat();
        return {
          // inputs: temp as string[][],
          // output: ele.output,
          output:  ele.output,
          inputs: temp
        }

    })
    const codeSolution = await this.getSolutionCode(data.exerciseId)
    const stream = this.compileService.runSubmit({
      testcases:payload,
      code: data.code,
      codeSolution,
    });
  
    stream.subscribe({
      next: (res) => {
        if(res.status){
          client.emit('output_submit', res.status); // Truyền kết quả về client qua socket

        }else{
          const {result,score,status}=res.finalResult
          if(status===200){
            console.log(status)

            this.exerciseStatusService.updateStatusAndSubmission(data.userId,data.exerciseId,"completed",data.code,result,score,"successfully")
          }else{
            this.exerciseStatusService.updateStatusAndSubmission(data.userId,data.exerciseId,"in-progress",data.code,result,score,"failed")
 
          }
        }
      },
      error: (err) => {
        console.log(err)
        client.emit('error', { message: err.message });
      },
      complete: () => {
        client.emit('completed', 'Biên dịch hoàn tất tất cả test cases');
      },
    });

  }
}
