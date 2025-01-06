import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { Server, Socket } from 'socket.io';
import { ExerciseService } from '../exercise/exercise.service';
import { StudyService } from '../study/study.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],

  
})
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly socketService: SocketService,
    private studyService:StudyService
  
  ) {}

  // This method is called when a new user connects
  handleConnection(client: Socket) {
    console.log('A new user connected:', client.id);


  }

  
@SubscribeMessage('compile')
async handleCompile(
  @MessageBody() data: { code: string; testCases: string[][], exerciseId: string },
  @ConnectedSocket() client: Socket,
) {
  const uniqueId = "client.data.uniqueId";
  // if (!uniqueId) {
  //   client.emit('error', 'UniqueId is required for compilation');
  //   return;
  // }

  try {
    // Bước 1: Lấy mã giải pháp
    const codeSolution = await this.getSolutionCode(data.exerciseId);
    
    // Bước 2: Chạy mã giải pháp và lấy kết quả mong đợi
    const solutionResults = await this.runSolutionCode(codeSolution, data.testCases, client);

    // Bước 3: Chạy mã người dùng và so sánh kết quả
    await this.runUserCode(data.code, data.testCases, solutionResults, client);
    
    // Thông báo hoàn thành
    client.emit('completed', 'Biên dịch hoàn tất tất cả test cases');
  } catch (error) {
    console.error(error);
    client.emit('error', `Lỗi trong quá trình biên dịch: ${error.message}`);
  }
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

// Hàm chạy mã giải pháp và lấy kết quả stdout
async runSolutionCode(codeSolution: string, testCases: string[][], client: Socket): Promise<string[]> {
  const solutionResults: string[] = [];
  for (let i = 0; i < testCases.length; i++) {
    try {
      const process = await this.socketService.startCompilation(codeSolution, testCases[i]);
      const output = await this.getProcessOutput(process);
      solutionResults.push(output);
    } catch (error) {
      client.emit('error', { testCaseId: i + 1, error: error.message });
      throw error;
    }
  }
  return solutionResults;
}

// Hàm chạy mã người dùng và so sánh kết quả
async runUserCode(userCode: string, testCases: string[][], solutionResults: string[], client: Socket): Promise<void> {
  for (let i = 0; i < testCases.length; i++) {
    try {
      const process = await this.socketService.startCompilation(userCode, testCases[i]);
      const userOutput = await this.getProcessOutput(process);

      // So sánh kết quả và emit
      const outputExpect = solutionResults[i];
      const isCorrect = userOutput === outputExpect;
      client.emit('output', {
        testCaseIndex: i,
        isCorrect,
        output: userOutput,
        outputExpect,
      });
    } catch (error) {
      client.emit('error', { testCaseId: i + 1, error: error.message });
      throw error;
    }
  }
}

// Hàm lấy output từ process (stdout)
async getProcessOutput(process: any): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      reject(new Error(data.toString()));
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Lỗi với mã thoát: ${code}`));
      }
      resolve(output);
    });
  });
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
  ){
    const codeSolution = await this.getSolutionCode(data.exerciseId);
    console.log(data.testCases)
    console.log(codeSolution)
  }

}
