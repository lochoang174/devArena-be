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

// Main function to handle compilation and execution
async function startCompilation(
  code: string,
  testCase: string[],
  language: string,
): Promise<ChildProcessWithoutNullStreams> {
  try {
    const tempDir = path.join(__dirname, "../temp");
    await fs.mkdir(tempDir, { recursive: true });

    if (language === "java") {
      await compileJava(tempDir, code);
      return spawn("docker", [
        "run",
        "-i",
        "--rm",
        "--memory",
        "100m", // Giới hạn bộ nhớ container là 100MB
        "--memory-swap",
        "100m", // Không cho phép swap thêm bộ nhớ
        "--cpus",
        "1", // (Tùy chọn) Giới hạn sử dụng CPU, nếu cần
        "-v",
        `${tempDir}:/usr/src/app`, // Mount thư mục
        "-w",
        "/usr/src/app", // Thư mục làm việc trong container
        "openjdk:11", // Sử dụng image OpenJDK 11
        "timeout",
        "10s", // Giới hạn thời gian chạy là 5 giây
        "java",
        "-cp",
        ".", 
        "Solution",
        ...testCase, // Truyền các test case
      ]);
    } else if (language === "c") {
      await compileC(tempDir, code);
      return spawn("docker", [
        "run",
        "-i",
        "--rm",
        "-v",
        `${tempDir}:/usr/src/app`,
        "-w",
        "/usr/src/app",
        "gcc:latest",
        "./solution",
        ...testCase,
      ]);
    } else if (language === "cpp") {
      await compileCpp(tempDir, code);
      return spawn("docker", [
        "run",
        "-i",
        "--rm",
        "-v",
        `${tempDir}:/usr/src/app`,
        "-w",
        "/usr/src/app",
        "gcc:latest",
        "./solution",
        ...testCase,
      ]);
    } else {
      throw new Error("Unsupported language");
    }
  } catch (error) {
    throw new Error(error);
  }
}

export { compileJava, compileC, compileCpp, startCompilation };
