import { CompileRequest, CompileStatus, TestCase } from '@app/common';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Readable } from 'stream';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CompileService {
  compile(data: CompileRequest): Observable<CompileStatus> {
    return new Observable<CompileStatus>((observer) => {
      (async () => {
        try {
          // 1. Chạy solution code để lấy đáp án
          const expectedOutputs = await this.runSolutionCode(data.codeSolution, data.testcases);

          // 2. Chạy code của người dùng và so sánh với đáp án
          for (let i = 0; i < data.testcases.length; i++) {
            try {
              const process = await this.startCompilation(data.code, data.testcases[i].inputs);
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
              observer.error({ testCaseId: i + 1, error: error.message });
              return;
            }
          }

          observer.complete();
        } catch (error) {
          observer.error({ message: error.message });
        }
      })();
    });
  }

  async startCompilation(code: string, testCase: string[]): Promise<ChildProcessWithoutNullStreams> {
    try {
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });

      const filePath = path.join(tempDir, 'Solution.java');
      await fs.writeFile(filePath, code, 'utf8');

      // Biên dịch Java
      const compileProcess = spawn('docker', [
        'run',
        '--rm',
        '-v',
        `${tempDir}:/usr/src/app`,
        '-w',
        '/usr/src/app',
        'openjdk:11',
        'javac',
        '-encoding',
        'UTF8',
        'Solution.java',
      ]);

      let compileErrors = '';
      compileProcess.stderr.on('data', (data) => {
        compileErrors += data.toString();
      });

      await new Promise((resolve, reject) => {
        compileProcess.on('close', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`Compilation failed: ${compileErrors}`));
          }
        });
      });

      // Chạy chương trình Java với testCase
      return spawn('docker', [
        'run',
        '-i',
        '--rm',
        '-v',
        `${tempDir}:/usr/src/app`,
        '-w',
        '/usr/src/app',
        'openjdk:11',
        'java',
        '-cp',
        '.',
        'Solution',
        ...testCase, // Truyền testCase làm đối số đầu vào
      ]);
    } catch (error) {
      throw new Error(`Compilation Service Error: ${error.message}`);
    }
  }

  async getProcessOutput(process: ChildProcessWithoutNullStreams): Promise<string> {
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
          reject(new Error(`Error with exit code: ${code}`));
        }
        resolve(output);
      });
    });
  }

  async runSolutionCode(codeSolution: string, testCases: TestCase[]): Promise<string[]> {
    const solutionResults: string[] = [];
    for (let i = 0; i < testCases.length; i++) {
      try {
        const process = await this.startCompilation(codeSolution, testCases[i].inputs);
        const output = await this.getProcessOutput(process);
        solutionResults.push(output.trim());
      } catch (error) {
        throw new Error(`Solution code failed for test case ${i + 1}: ${error.message}`);
      }
    }
    return solutionResults;
  }
}
