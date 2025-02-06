import {
  CompileRequest,
  CompileResult,
  CompileStatus,
  LogRunCode,
  TestCase,
} from "@app/common";
import { Injectable } from "@nestjs/common";
import { Observable, Subscriber } from "rxjs";
import { ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import {
  compileC,
  compileCpp,
  compileJava,
  startProcess,
  getProcessOutput,
  checkThreadSleep,
} from "../utils/helper";
import { RpcException } from "@nestjs/microservices";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CompileService {
  private readonly TESTCASE_MARKER = "###ENDTEST###\n";

  compile(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        try {
          if(!checkThreadSleep(data.code)){
            observer.error(
              new RpcException({
                code: 14,
                message: `Thread sleep must less than 1000ms`,
              }),
            );
          }
          const tempDir = path.join(__dirname, "../temp", uuidv4());
          await fs.mkdir(tempDir, { recursive: true });

          // 1. Compile solution code once
          await this.compileCode(data.codeSolution, data.language, tempDir);

          // 2. Compile user code once
          await this.compileCode(data.code, data.language, tempDir);

          // 3. Run each test case
          for (let i = 0; i < data.testcases.length; i++) {
            try {
              const solutionProcess = await startProcess(data.language, tempDir);

              const userProcess = await startProcess(data.language, tempDir);

              // Chỉ gửi input, không gửi marker
              const testInput = data.testcases[i].inputs.join(" ") + "\n";

              // Gửi input đồng thời cho cả 2 process
              solutionProcess.stdin.write(testInput);
              userProcess.stdin.write(testInput);

              // Chạy song song việc lấy output
              const [expectedOutput, userOutput] = await Promise.all([
                this.getTestCaseOutput(solutionProcess,false,observer,i),
                this.getTestCaseOutput(userProcess,true,observer,i),
              ]); 

              const isCorrect = userOutput.trim() === expectedOutput.trim();

              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: expectedOutput.trim(),
              };
      // Clean up processes
      solutionProcess.kill();
      userProcess.kill();
              observer.next({
                status:status
              });
            } catch (error) {
              observer.error(
                new RpcException({
                  code: 13,
                  message: `${error.message}`,
                }),
              );
              return;
            }
          }

    

          observer.complete();
        } catch (error) {
          observer.error(
            new RpcException({
              code: 13,
              message: `${error.message}`,
            }),
          );
        }
      })();
    });
  }

  private async compileCode(
    code: string,
    language: string,
    tempDir: string,
  ): Promise<void> {
    switch (language) {
      case "java":
        await compileJava(tempDir, code);
        break;
      case "c":
        await compileC(tempDir, code);
        break;
      case "cpp":
        await compileCpp(tempDir, code);
        break;
      default:
        throw new Error("Unsupported language");
    }
  }

  private async getTestCaseOutput(
    process: ChildProcessWithoutNullStreams,
    isUser:boolean,
    subscriber:Subscriber<CompileResult>,
    testCaseIndex:number
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let output = "";
      let timer: NodeJS.Timeout | null = null;

      const completeOutput = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        process.stdout.removeListener("data", outputHandler);
        resolve(output);
      };

      const outputHandler = (data: Buffer) => {
        output += data.toString();
        if(isUser){
          // console.log("output", data.toString());
          subscriber.next({
              LogRunCode:{
                chunk: data.toString(),
                testCaseIndex:testCaseIndex
              }
          })
        }
        // Reset timer mỗi khi nhận được data mới
        if (timer) {
          clearTimeout(timer);
        }

        // Đợi 100ms sau chunk cuối cùng để kết thúc
        timer = setTimeout(() => {
          completeOutput();
        }, 1000);
      };

      // Xử lý lỗi
      process.stderr.on("data", (data) => {
        if (timer) {
          clearTimeout(timer);
        }
        reject(new Error(data.toString()));
      });

      process.stdout.on("data", outputHandler);
    });
  }

  submit(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        try {
          const tempDir = path.join(__dirname, "../temp", uuidv4());
          await fs.mkdir(tempDir, { recursive: true });
  
          // 2. Compile user code once
          await this.compileCode(data.code, data.language, tempDir);
  
          let correctCount = 0;
          let totalRuntime = 0;
  
          for (let i = 0; i < data.testcases.length; i++) {
            try {
              const userProcess = await startProcess(data.language, tempDir);
  
              const startTime = Date.now(); // Bắt đầu đo thời gian
              const testInput = data.testcases[i].inputs.join(" ") + "\n";
              userProcess.stdin.write(testInput);
  
              const userOutput = await this.getTestCaseOutput(userProcess, false, observer, i);
              const endTime = Date.now(); // Kết thúc đo thời gian
  
              const runtime = endTime - startTime; // Tính thời gian chạy (ms)
              totalRuntime += runtime;
  
              const isCorrect = userOutput.trim() === data.testcases[i].output.trim();
  
              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: data.testcases[i].output.trim(),

              };
  
              observer.next({ status });
              userProcess.kill();
  
              if (isCorrect) {
                correctCount++;
              }
            } catch (error) {
              observer.error(
                new RpcException({
                  code: 13,
                  message: `${error.message}`,
                })
              );
              return;
            }
          }
  
          const totalTestCases = data.testcases.length;
          const score = (correctCount / totalTestCases) * 100;
          const result = `${correctCount}/${totalTestCases}`;
  
          observer.next({
            finalResult: {
              result,
              score,
              status: score === 100 ? 200 : 400,
              totalRuntime: totalRuntime, // Tổng thời gian chạy
            },
          });
  
          observer.complete();
        } catch (error) {
          observer.error(
            new RpcException({
              code: 13,
              message: `${error.message}`,
            })
          );
        }
      })();
    });
  }
  
}
