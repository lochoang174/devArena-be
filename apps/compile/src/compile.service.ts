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

  checkThreadSleep,
  compileAndRun,
} from "../utils/helper";
import { RpcException } from "@nestjs/microservices";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CompileService {
  private readonly TESTCASE_MARKER = "###ENDTEST###\n";
  private readonly baseDir: string;
  private readonly tempBaseDir: string;
  private readonly solutionBaseDir: string;

  
  constructor() {
    // Đảm bảo path absolute từ root của project
    this.baseDir = '/usr/src/app';
  
  // Set correct paths under dist/apps
  this.tempBaseDir = path.join(this.baseDir, 'dist/apps/temp');
  this.solutionBaseDir = path.join(this.baseDir, 'dist/apps/solution');
  
  console.log('Base directory:', this.baseDir);
  console.log('Temp directory:', this.tempBaseDir);
  console.log('Solution directory:', this.solutionBaseDir);
    
    // Tạo thư mục khi khởi tạo service
    this.initializeDirectories();
  }
  
  private async initializeDirectories() {
    try {
      // Tạo directories với full permissions
      await fs.mkdir(this.tempBaseDir, { recursive: true, mode: 0o777 });
      await fs.mkdir(this.solutionBaseDir, { recursive: true, mode: 0o777 });
  
      // Double check permissions
      await fs.chmod(this.tempBaseDir, 0o777);
      await fs.chmod(this.solutionBaseDir, 0o777);
  
      // Verify directories được tạo và có đúng permissions
      const [tempStats, solutionStats] = await Promise.all([
        fs.stat(this.tempBaseDir),
        fs.stat(this.solutionBaseDir)
      ]);
  
      console.log('Directory status:', {
        temp: {
          exists: await fs.access(this.tempBaseDir).then(() => true).catch(() => false),
          mode: tempStats.mode.toString(8),
          path: this.tempBaseDir
        },
        solution: {
          exists: await fs.access(this.solutionBaseDir).then(() => true).catch(() => false),
          mode: solutionStats.mode.toString(8),
          path: this.solutionBaseDir
        }
      });
  
  
    } catch (error) {
      console.error('Failed to initialize directories:', {
        error,
        baseDir: this.baseDir,
        tempDir: this.tempBaseDir,
        solutionDir: this.solutionBaseDir
      });
      throw error;
    }
  }
  compile(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        const tempDir = path.resolve(this.baseDir, 'dist/apps/temp', uuidv4());
        const solutionDir = path.resolve(this.baseDir, 'dist/apps/solution', uuidv4());
        try {
          if (!checkThreadSleep(data.code)) {
            observer.error(
              new RpcException({
                code: 14,
                message: `Thread sleep must less than 1000ms`,
              }),
            );
          }
          await fs.mkdir(tempDir, { recursive: true });
          await fs.mkdir(solutionDir, { recursive: true });

          for (let i = 0; i < data.testcases.length; i++) {
            try {
            
              const testInput = data.testcases[i].inputs.join("\n") + "\n";

              // Chạy song song việc lấy output
              const [expectedOutput, userOutput] = await Promise.all([
                compileAndRun(data.codeSolution, testInput, data.language,solutionDir),
                compileAndRun(data.code, testInput, data.language,tempDir,true,observer,i)
              ]);
 

              const isCorrect = userOutput.trim() === expectedOutput.trim();
              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: expectedOutput.trim(),
              };
              // Clean up processes
              // solutionProcess.kill();
              // userProcess.kill();
              observer.next({
                status: status,
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
        } finally {
          await fs.rm(tempDir, { recursive: true, force: true });
          await fs.rm(solutionDir, { recursive: true, force: true });
        }
      })();
    });
  }

 

  submit(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        const tempDir = path.join(__dirname, "../temp", uuidv4());

        try {
          // const tempDir = path.join(__dirname, "../temp", uuidv4());
          await fs.mkdir(tempDir, { recursive: true });

          // 2. Compile user code once
          // await this.compileCode(data.code, data.language, tempDir);

          let correctCount = 0;
          let totalRuntime = 0;
          for (let i = 0; i < data.testcases.length; i++) {
            try {
              // const userProcess = await startProcess(data.language, tempDir);

              const startTime = Date.now(); // Bắt đầu đo thời gian
              const testInput = data.testcases[i].inputs.join("\n") + "\n";
              // userProcess.stdin.write(testInput);

              const userOutput = await  compileAndRun(data.code, testInput, data.language,tempDir,false,observer,i)
              
              const endTime = Date.now(); // Kết thúc đo thời gian

              const runtime = endTime - startTime; // Tính thời gian chạy (ms)
              totalRuntime += runtime;
              console.log(userOutput.trim())
              console.log(data.testcases[i].output.trim())
              const isCorrect =
                userOutput.trim() === data.testcases[i].output.trim();

              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: data.testcases[i].output.trim(),
              };

              observer.next({ status });
              // userProcess.kill();

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
            }),
          );
        } finally {
          await fs.rm(tempDir, { recursive: true, force: true });
        }
      })();
    });
  }
}
