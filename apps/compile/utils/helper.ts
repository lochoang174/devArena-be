// helper.ts
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

// Compile Java code
async function compileJava(tempDir: string, code: string): Promise<void> {
  const fileName = "Solution.java";
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, "utf8");

  const compileProcess = spawn("docker", [
    "run",
    "--rm",
    "-v",
    `${tempDir}:/usr/src/app`,
    "-w",
    "/usr/src/app",
    "openjdk:11",
    "javac",
    "-encoding",
    "UTF8",
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
    if (language === "java") {
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

export { compileJava, compileC, compileCpp, startProcess, getProcessOutput };