// helper.ts
import { CompileResult } from "@app/common";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { Subscriber } from "rxjs";

async function compileJava(tempDir: string, code: string): Promise<void> {
  const fileName = "Solution.java";
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, "utf8");
  console.log("temp dir: " + tempDir);
  const files = await fs.readdir(tempDir);
  console.log("\n=== Directory Contents ===");
  console.log("Directory path:", tempDir);
  console.log("Files found:", files);
  const absolutePath = path.resolve(tempDir);
  const compileProcess = spawn("sh", [
    "-c",
    `
    echo '=== Current directory contents =====' &&
    ls -la "${absolutePath}" &&
    echo '=== Starting OpenJDK container =====' &&
    CID=$(docker run -d openjdk:11 sleep infinity) &&
    echo "Container ID: $CID" &&
    echo '=== Copying file to OpenJDK container =====' &&
    docker cp "${absolutePath}/${fileName}" $CID:/Solution.java &&
    echo '=== Compiling in OpenJDK container =====' &&
    docker exec $CID sh -c 'ls -la && javac -encoding UTF8 Solution.java' &&
    echo '=== Copying compiled file back =====' &&
    docker cp $CID:/Solution.class "${absolutePath}/" &&
    echo '=== Cleaning up container =====' &&
    docker stop $CID &&
    docker rm $CID
    `,
  ]);
  let compileErrors = "";
  compileProcess.stderr.on("data", (data) => {
    compileErrors += data.toString();
  });

  await new Promise((resolve, reject) => {
    compileProcess.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.log(compileErrors);
        reject(new Error(`Java compilation failed: ${compileErrors}`));
      }
    });
  });
}
// Compile C code
async function compileC(tempDir: string, code: string): Promise<void> {
  const fileName = "solution.c";
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, "utf8");

  const compileProcess = spawn("docker", [
    "run",
    "--rm",
    "-v",
    `${tempDir}:/usr/src/app`,
    "-w",
    "/usr/src/app",
    "gcc:latest",
    "gcc",
    "-o",
    "solution",
    fileName,
  ]);

  let compileErrors = "";
  compileProcess.stderr.on("data", (data) => {
    compileErrors += data.toString();
  });

  await new Promise((resolve, reject) => {
    compileProcess.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`C compilation failed: ${compileErrors}`));
      }
    });
  });
}

// Compile C++ code
async function compileCpp(tempDir: string, code: string): Promise<void> {
  const fileName = "solution.cpp";
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, "utf8");

  const compileProcess = spawn("docker", [
    "run",
    "--rm",
    "-v",
    `${tempDir}:/usr/src/app`,
    "-w",
    "/usr/src/app",
    "gcc:latest",
    "g++",
    "-o",
    "solution",
    fileName,
  ]);

  let compileErrors = "";
  compileProcess.stderr.on("data", (data) => {
    compileErrors += data.toString();
  });

  await new Promise((resolve, reject) => {
    compileProcess.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`C++ compilation failed: ${compileErrors}`));
      }
    });
  });
}

async function getProcessOutput(
  process: ChildProcessWithoutNullStreams,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let output = "";
    let outputBuffer = "";

    process.stdout.on("data", (data) => {
      outputBuffer += data.toString();
    });

    process.stderr.on("data", (data) => {
      reject(new Error(data.toString()));
    });

    process.on("close", (code) => {
      if (code === 124) {
        reject(new Error("timeout"));
      }
      if (code !== 0) {
        reject(new Error(`Error with exit code: ${code}`));
      }
      resolve(outputBuffer);
    });
  });
}

// Start process after compilation
async function startProcess(
  language: string,
  tempDir: string,
): Promise<ChildProcessWithoutNullStreams> {
  try {
    console.log("start process");
    if (language === "java") {
      return spawn("sh", ["-c", `
        CID=$(docker create --memory 100m --memory-swap 100m --cpus 1 --security-opt label=disable --cap-add=SYS_ADMIN openjdk:11 sleep infinity) &&
        docker start $CID &&
        docker exec $CID mkdir -p /workspace &&
        docker cp "${tempDir}/Solution.class" $CID:/workspace/ &&
        docker exec -i $CID timeout 30s java -cp /workspace Solution;
        EXIT_CODE=$?;
        docker rm -f $CID;
        exit $EXIT_CODE
        `]);
    }
    else if (language === "c") {
      return spawn("docker", [
        "run",
        "-i",
        "--rm",
        "--memory",
        "100m",
        "--memory-swap",
        "100m",
        "--cpus",
        "1",
        "-v",
        `${tempDir}:/usr/src/app`,
        "-w",
        "/usr/src/app",
        "gcc:latest",
        "timeout",
        "30s",
        "./solution",
      ]);
    } else if (language === "cpp") {
      return spawn("docker", [
        "run",
        "-i",
        "--rm",
        "--memory",
        "100m",
        "--memory-swap",
        "100m",
        "--cpus",
        "1",
        "-v",
        `${tempDir}:/usr/src/app`,
        "-w",
        "/usr/src/app",
        "gcc:latest",
        "timeout",
        "30s",
        "./solution",
      ]);
    }
    throw new Error("Unsupported language");
  } catch (error) {
    throw new Error(error);
  }
}
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

async function compileAndRunJava(
  code: string, 
  input: string, 
  tempDir: string, 
  isUser: boolean = false,
  subscriber?: Subscriber<CompileResult>,
  testCaseIndex?: number
): Promise<string> {
  const fileName = "Solution.java";
  const filePath = path.join(tempDir, fileName);
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
        openjdk:11 \
        sh -c 'cd /workspace && \
               javac -encoding UTF8 Solution.java && \
               timeout 30s java Solution < input.txt') &&
      docker cp "${tempDir}/." "$CID:/workspace/" &&
      docker start -a $CID;
      EXIT_CODE=$?;
      docker rm -f $CID 2>/dev/null || true;
      exit $EXIT_CODE
    `]);

    let output = "";
    let errorOutput = "";
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
      const chunk = data.toString();
      output += chunk;

      if (isUser && subscriber && typeof testCaseIndex === 'number') {
        subscriber.next({
          LogRunCode: {
            chunk,
            testCaseIndex,
          },
        });
      }

      // Reset timer when new data arrives
      if (timer) {
        clearTimeout(timer);
      }

      // Wait 1000ms after the last chunk to complete
      timer = setTimeout(() => {
        completeOutput();
      }, 1000);
    };

    process.stdout.on("data", outputHandler);

    process.stderr.on("data", (data) => {
      if (timer) {
        clearTimeout(timer);
      }
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      if (timer) {
        clearTimeout(timer);
      }

      if (code === 124) {
        reject(new Error("Execution timeout"));
      } else if (code !== 0) {
        reject(new Error(`Compilation/Execution failed (code ${code}): ${errorOutput}`));
      } else {
        completeOutput();
      }
    });
  });
}
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
    let hasReceivedOutput = false;

    const isSystemOutput = (str: string): boolean => {
      if (/^[a-f0-9]{64}$/.test(str.trim())) return true;
      if (/^(?:\d+\s+)+\d+$/.test(str.trim())) return true;
      return false;
    };

    const completeOutput = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      process.stdout.removeListener("data", outputHandler);
     
      // Nếu không có output nào được nhận
      if (!hasReceivedOutput) {
        let noRes: string ="no response"
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
    };

    const outputHandler = (data: Buffer) => {
      const chunk = data.toString();

      if (true) {
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
      }

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        completeOutput();
      }, 1000);
    };

    process.stdout.on("data", outputHandler);

    process.stderr.on("data", (data) => {
      if (timer) {
        clearTimeout(timer);
      }
      const errorChunk = data.toString();
      if (!isSystemOutput(errorChunk)) {
        errorOutput += errorChunk;
      }
    });

    // Thêm timeout tổng thể để xử lý trường hợp không có output
    const globalTimeout = setTimeout(() => {
      if (!hasReceivedOutput) {
        completeOutput();
      }
    }, 31000); // Đặt thời gian lớn hơn timeout của lệnh (30s)

    process.on("close", (code) => {
      clearTimeout(globalTimeout);
      
      if (timer) {
        clearTimeout(timer);
      }

      if (code === 124) {
        reject(new Error("Execution timeout"));
      } else if (code !== 0) {
        reject(new Error(`Compilation/Execution failed (code ${code}): ${errorOutput}`));
      } else {
        completeOutput();
      }
    });
  });
}


export {
  compileJava,
  compileC,
  compileCpp,
  startProcess,
  getProcessOutput,
  checkThreadSleep,
  compileAndRunJava,
  compileAndRun
};
