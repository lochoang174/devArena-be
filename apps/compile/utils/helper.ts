// helper.ts
import { CompileResult } from "@app/common";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { Subscriber } from "rxjs";





const checkThreadSleep = (code: string): boolean => {
  const threadSleepPattern = /Thread\.sleep\((\d+)\)/g;
  let match;
  while ((match = threadSleepPattern.exec(code)) !== null) {
    const sleepTime = parseInt(match[1], 10);
    if (sleepTime >= 1000) {
      return false;
    }
  }
  return true;
};

// Helper function to prepare directories
async function prepareDirectory(baseDir: string, subPath: string): Promise<string> {
  const dir = path.resolve(baseDir, subPath);
  await fs.mkdir(dir, { recursive: true, mode: 0o777 });
  return dir;
}

interface CompileConfig {
  fileName: string;
  dockerImage: string;
  compileCommand: string;
  runCommand: string;
}

function getLanguageConfig(language: string): CompileConfig {
  switch (language) {
    case 'java':
      return {
        fileName: 'Solution.java',
        dockerImage: 'openjdk:11',
        compileCommand: 'javac -encoding UTF8 Solution.java',
        runCommand: 'java Solution'
      };
    case 'cpp':
      return {
        fileName: 'solution.cpp',
        dockerImage: 'gcc:latest',
        compileCommand: 'g++ -o solution solution.cpp -std=c++17',
        runCommand: './solution'
      };
    case 'c':
      return {
        fileName: 'solution.c',
        dockerImage: 'gcc:latest',
        compileCommand: 'gcc -o solution solution.c',
        runCommand: './solution'
      };
    default:
      throw new Error('Unsupported language');
  }
}

async function compileAndRun(
  code: string,
  input: string,
  language: string,
  tempDir: string,
  isUser: boolean = false,
  subscriber?: Subscriber<CompileResult>,
  testCaseIndex?: number
): Promise<string> {
  const config = getLanguageConfig(language);
  const filePath = path.join(tempDir, config.fileName);
  const inputFile = path.join(tempDir, "input.txt");

  await Promise.all([
    fs.writeFile(filePath, code, "utf8"),
    fs.writeFile(inputFile, input, "utf8")
  ]);

  return new Promise<string>((resolve, reject) => {
    const process = spawn("sh", ["-c", `
      CID=$(docker create \
        --memory 100m \
        --memory-swap 100m \
        --cpus 1 \
        --security-opt label=disable \
        ${config.dockerImage} \
        sh -c 'cd /workspace && \
               ${config.compileCommand} && \
               timeout 30s ${config.runCommand} < input.txt') > /dev/null 2>&1 &&
      docker cp "${tempDir}/." "$CID:/workspace/" > /dev/null 2>&1 &&
      docker start -a $CID &&
      EXIT_CODE=$?;
      docker rm -f $CID > /dev/null 2>&1 || true;
      exit $EXIT_CODE
    `]);

    let output = "";
    let errorOutput = "";
    let timer: NodeJS.Timeout | null = null;
    let isCompleted = false;
    let hasReceivedOutput = false;

    const isSystemOutput = (str: string): boolean => {
      if (/^[a-f0-9]{64}$/.test(str.trim())) return true;
      if (/^(?:\d+\s+)+\d+$/.test(str.trim())) return true;
      return false;
    };

    const complete = (error?: Error) => {
      if (isCompleted) return;
      isCompleted = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      process.stdout.removeListener("data", outputHandler);
      process.stderr.removeListener("data", errorHandler);
      if (error) {
        if (isUser && subscriber && typeof testCaseIndex === 'number') {
          subscriber.next({
            LogRunCode: {
              chunk: error.message,
              testCaseIndex,
            },
          });
        }
        reject(error);
      } else {
        if (!hasReceivedOutput) {
          const noRes = "no response";
          if (isUser && subscriber && typeof testCaseIndex === 'number') {
            subscriber.next({
              LogRunCode: {
                chunk: noRes,
                testCaseIndex,
              },
            });
          }
          resolve(noRes);
        } else {
          resolve(output);
        }
      }
    };

    const outputHandler = (data: Buffer) => {
      const chunk = data.toString();
      output += chunk;
      hasReceivedOutput = true;

      if (isUser && subscriber && typeof testCaseIndex === 'number') {
        subscriber.next({
          LogRunCode: {
            chunk,
            testCaseIndex,
          },
        });
      }

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        complete();
      }, 1000);
    };

    const errorHandler = (data: Buffer) => {
      const errorChunk = data.toString();
      if (!isSystemOutput(errorChunk)) {
        errorOutput += errorChunk;
      }
    };

    process.stdout.on("data", outputHandler);
    process.stderr.on("data", errorHandler);

    const overallTimeout = setTimeout(() => {
      complete(new Error("Overall execution timeout"));
    }, 35000);

    const noOutputTimeout = setTimeout(() => {
      if (!hasReceivedOutput && !isCompleted) {
        complete();
      }
    }, 31000);

    process.on("close", (code) => {
      clearTimeout(overallTimeout);
      clearTimeout(noOutputTimeout);

      if (code === 124) {
        complete(new Error("Execution timeout"));
      } else if (code !== 0) {
        let errorMsg = `Compilation/Execution failed (code ${code})`;
        if (errorOutput) {
          errorMsg += `: ${errorOutput}`;
        }
        complete(new Error(errorMsg));
      } else if (errorOutput && !hasReceivedOutput) {
        complete(new Error(`Execution error: ${errorOutput}`));
      } else {
        complete();
      }
    });

    // Handle process errors
    process.on("error", (error) => {
      complete(new Error(`Process error: ${error.message}`));
    });
  });
}

export {


  checkThreadSleep,
  compileAndRun
};
