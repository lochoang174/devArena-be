import {
  CompileRequest,
  CompileResult,
  CompileStatus,
  TestCase,
} from "@app/common";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Readable } from "stream";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { startCompilation } from "../utils/helper";
import { RpcException } from "@nestjs/microservices";
import { Metadata } from "@grpc/grpc-js";

@Injectable()
export class CompileService {
  compile(data: CompileRequest): Observable<CompileStatus> {
    return new Observable<CompileStatus>((observer) => {
      (async () => {
        try {
          // 1. Chạy solution code để lấy đáp án
          const expectedOutputs = await this.runSolutionCode(
            data.codeSolution,
            data.testcases,
            data.language,
          ).catch((error) => {
            observer.error(
              new RpcException({
                code: 13, // INTERNAL
                message: `${error.message}`,
              }),
            );
          })
          console.log(data);
          // 2. Chạy code của người dùng và so sánh với đáp án
          for (let i = 0; i < data.testcases.length; i++) {
            try {
              const process = await startCompilation(
                data.code,
                data.testcases[i].inputs,
                data.language,
              );
              const userOutput = await this.getProcessOutput(process);

              const isCorrect = userOutput.trim() === expectedOutputs[i].trim();

              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: expectedOutputs[i].trim(),
              };

              // Push kết quả vào Observable
              observer.next(status);
            } catch (error) {
              console.log(error)
              observer.error(
                new RpcException({
                  code: 13, // INTERNAL
                  message: `${error.message}`,
                }),
              );
              return;
            }
          }

          observer.complete();
        } catch (error) {
          observer.error({ message: error.details });
        }
      })();
    });
  }

  async getProcessOutput(
    process: ChildProcessWithoutNullStreams,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let output = "";
      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        reject(new Error(data.toString()));
      });

      process.on("close", (code) => {
        if (code === 124) {
          reject(new Error(`timeout`));

        }
        if (code !== 0) {
          reject(new Error(`Error with exit code: ${code}`));
        }
        resolve(output);
      });
    });
  }

  async runSolutionCode(
    codeSolution: string,
    testCases: TestCase[],
    language: string,
  ): Promise<string[]> {
    const solutionResults: string[] = [];
    for (let i = 0; i < testCases.length; i++) {
      try {
        const process = await startCompilation(
          codeSolution,
          testCases[i].inputs,
          language,
        );
        const output = await this.getProcessOutput(process);
        solutionResults.push(output.trim());
      } catch (error) {
        throw new Error(
          error
        );
      }
    }
    return solutionResults;
  }

  submit(data: CompileRequest): Observable<CompileResult> {
    return new Observable<CompileResult>((observer) => {
      (async () => {
        try {
          let correctCount = 0; // Track correct test cases
          let totalRuntime = 0; // Track total runtime
          let totalCPUUsage = 0; // Track total CPU usage

          for (let i = 0; i < data.testcases.length; i++) {
            try {
              // Record initial CPU usage and time
              const startCpuUsage = process.cpuUsage(); // Node.js global process
              const startTime = process.hrtime(); // Node.js global process

              // Run the compilation
              const compilationProcess = await startCompilation(
                data.code,
                data.testcases[i].inputs,
                data.language,
              );
              const userOutput =
                await this.getProcessOutput(compilationProcess);
              // Record end time and CPU usage
              const endCpuUsage = process.cpuUsage(startCpuUsage); // Node.js global process
              const endTime = process.hrtime(startTime); // Node.js global process

              // Calculate runtime in milliseconds
              const runtime = endTime[0] * 1000 + endTime[1] / 1e6; // seconds to ms
              totalRuntime += runtime;

              // Calculate CPU usage in microseconds
              const cpuTime = (endCpuUsage.user + endCpuUsage.system) / 1000; // Convert to ms
              totalCPUUsage += cpuTime;

              const isCorrect =
                userOutput.trim() === data.testcases[i].output.trim();

              const status: CompileStatus = {
                testCaseIndex: i,
                isCorrect,
                output: userOutput.trim(),
                outputExpect: data.testcases[i].output.trim(),
              };

              // Push the result of this test case
              observer.next({ status });

              if (isCorrect) {
                correctCount++;
              }
            } catch (error) {
              // console.log(error);

              // throw new RpcException({
              //   code: 13, // INTERNAL
              //   message: 'Compilation Service Error',
              // });
              // observer.error({ testCaseId: i + 1, error: error });
              observer.error(
                new RpcException({
                  code: 13, // INTERNAL
                  message: `${error.message}`,
                }),
              );
              return;
            }
          }

          // Calculate score
          const totalTestCases = data.testcases.length;
          const score = (correctCount / totalTestCases) * 100;
          const result = `${correctCount}/${totalTestCases}`;

          // Return final result with performance metrics
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
          // const metadata = new Metadata();
          // metadata.set('details', error); // Thêm chi tiết lỗi vào metadata
          // throw new RpcException({
          //   code: 13, // INTERNAL
          //   message: 'Compilation Service Error',
          // });
          // observer.error({});
        }
      })();
    });
  }
}
