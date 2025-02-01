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
} from "../utils/helper";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class CompileService {
  private readonly TESTCASE_MARKER = "###ENDTEST###\n";

  compile(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        try {
          const tempDir = path.join(__dirname, "../temp");
          await fs.mkdir(tempDir, { recursive: true });

          // 1. Compile solution code once
          await this.compileCode(data.codeSolution, data.language, tempDir);
          const solutionProcess = await startProcess(data.language, tempDir);

          // 2. Compile user code once
          await this.compileCode(data.code, data.language, tempDir);
          const userProcess = await startProcess(data.language, tempDir);

          // 3. Run each test case
          for (let i = 0; i < data.testcases.length; i++) {
            try {
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

          // Clean up processes
          solutionProcess.kill();
          userProcess.kill();

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
          console.log("output", data.toString());
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
          const tempDir = path.join(__dirname, "../temp");
          await fs.mkdir(tempDir, { recursive: true });

          let correctCount = 0;
          let totalRuntime = 0;
          let totalCPUUsage = 0;

          // Compile user code once
          await this.compileCode(data.code, data.language, tempDir);
          const process = await startProcess(data.language, tempDir);

          for (let i = 0; i < data.testcases.length; i++) {
            try {
              const startCpuUsage = process.cpuUsage();
              const startTime = process.hrtime();

              // Chỉ gửi input, không gửi marker
              const testInput = data.testcases[i].inputs.join(" ") + "\n";
              process.stdin.write(testInput);
              const userOutput = await this.getTestCaseOutput(process);

              const endCpuUsage = process.cpuUsage(startCpuUsage);
              const endTime = process.hrtime(startTime);

              const runtime = endTime[0] * 1000 + endTime[1] / 1e6;
              totalRuntime += runtime;

              const cpuTime = (endCpuUsage.user + endCpuUsage.system) / 1000;
              totalCPUUsage += cpuTime;

              const isCorrect =
                userOutput.trim() === data.testcases[i].output.trim();

              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: data.testcases[i].output.trim(),
              };

              observer.next({ status });

              if (isCorrect) {
                correctCount++;
              }
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

          process.kill();

          const totalTestCases = data.testcases.length;
          const score = (correctCount / totalTestCases) * 100;
          const result = `${correctCount}/${totalTestCases}`;

          observer.next({
            finalResult: {
              result,
              score,
              status: score === 100 ? 200 : 400,
              totalRuntime: totalRuntime,
            },
          });

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
}
