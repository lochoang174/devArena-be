// helper.ts
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";



async function compileJava(tempDir: string, code: string): Promise<void> {
  // Trong container, /usr/src/app/dist được mount từ ./dist trên host
  // Vì vậy chỉ cần lấy phần path sau dist/
  const containerDistPath = '/usr/src/app/dist/';
  const relativePathAfterDist = tempDir.slice(tempDir.indexOf(containerDistPath) + containerDistPath.length);
  
  // Host path sẽ là dist/<relative-path>
  const hostTempDir = path.join('dist', relativePathAfterDist);
  const fileName = "Solution.java";
  const filePath = path.join(hostTempDir, fileName);

  console.log('Starting compilation process with:');
  console.log('Container path:', tempDir);
  console.log('Extracted relative path:', relativePathAfterDist);
  console.log('Host mount path:', hostTempDir);
  console.log('Final file path:', filePath);

  try {
    // Create directory on host mounted volume
    await fs.mkdir(hostTempDir, { recursive: true, mode: 0o777 });
    
    // Write file to mounted volume
    await fs.writeFile(filePath, code);
    await fs.chmod(filePath, 0o666);
    
    // Verify file exists
    const fileExists = await fs.access(filePath)
      .then(() => true)
      .catch(() => false);
    
    if (!fileExists) {
      throw new Error(`Failed to create file at ${filePath}`);
    }

    console.log('File created successfully at:', filePath);
    const fileContents = await fs.readFile(filePath, 'utf8');
    console.log('File contents:', fileContents.substring(0, 100) + '...');

    // Verify mount using relative host path
    const verifyMount = spawn("docker", [
      "run",
      "--rm",
      "-v", `${hostTempDir}:/workspace:rw`,
      "ubuntu:latest",
      "ls", "-la", "/workspace"
    ]);
    
    let verifyOutput = "";
    let verifyError = "";
    
    verifyMount.stdout.on("data", (data) => {
      const message = data.toString().trim();
      verifyOutput += message + "\n";
      console.log("[Mount Verify][stdout]:", message);
    });
    
    verifyMount.stderr.on("data", (data) => {
      const message = data.toString().trim();
      verifyError += message + "\n";
      console.log("[Mount Verify][stderr]:", message);
    });
    
    console.log("[Mount Verify] Executing command:", 
      `docker run --rm -v ${hostTempDir}:/workspace:rw ubuntu:latest ls -la /workspace`
    );

    // Compile using relative host path for volume mount
    const compileProcess = spawn("docker", [
      "run",
      "--rm",
      "-v", `${hostTempDir}:/workspace:rw`,
      "-w", "/workspace",
      "--user", "root",
      "openjdk:11",
      "sh",
      "-c",
      `
      set -ex
      # Debug information
      pwd
      ls -la
      
      # Verify file exists and is readable
      cat Solution.java
      
      # Compile with verbose output
      javac -verbose -d /workspace Solution.java
      
      # Verify compilation result
      ls -la
      `
    ]);

    let output = "";
    let errorOutput = "";

    compileProcess.stdout.on("data", (data) => {
      const message = data.toString().trim();
      output += message + "\n";
      console.log("[Compile][stdout]:", message);
    });

    compileProcess.stderr.on("data", (data) => {
      const message = data.toString().trim();
      errorOutput += message + "\n";
      console.log("[Compile][stderr]:", message);
    });

    return new Promise((resolve, reject) => {
      compileProcess.on("close", (code) => {
        if (code === 0) {
          console.log('[Compile] Successfully completed');
          resolve();
        } else {
          const fullError = `Compilation failed with code ${code}\nSTDOUT:\n${output}\nSTDERR:\n${errorOutput}`;
          console.error("[Compile] Failed:", fullError);
          reject(new Error(fullError));
        }
      });
    });
  } catch (error) {
    console.error('Compilation process failed:', error);
    throw error;
  } finally {
    // Log final directory state
    try {
      const finalContents = await fs.readdir(hostTempDir);
      console.log('Final directory contents:', finalContents);
    } catch (error) {
      console.error('Failed to read final directory state:', error);
    }
  }
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
    console.log("start process")
    if (language === "java") {
      return spawn("docker", [
          "run",
          "-i",
          "--rm",
          "--memory", "100m",
          "--memory-swap", "100m",
          "--cpus", "1",
          // Thêm quyền và SELinux context
          "-v", `${tempDir}:/usr/src/app:rw,Z`,
          "-w", "/usr/src/app",

          // Security options
          "--security-opt", "label=disable",
          // Thêm capabilities nếu cần
          "--cap-add=SYS_ADMIN",
          "openjdk:11",
          "timeout",
          "30s",
          "java",
          "-cp",
          ".",
          "Solution"
      ]);
  } else if (language === "c") {
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
        "./solution"
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
        "./solution"
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
export { compileJava, compileC, compileCpp, startProcess, getProcessOutput, checkThreadSleep };
