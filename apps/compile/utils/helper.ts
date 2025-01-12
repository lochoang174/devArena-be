import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
// import * as pidusage from 'pidusage'; // For versions that do not support default export
// async function monitorProcessCpu(pid: number): Promise<{ cpu: number; runtime: number }> {
//   const startStats = await pidusage(pid); // Correct usage
//   const startTime = process.hrtime();
//   console.log("d")
//   // Wait for the process to complete
//   await new Promise<void>((resolve) => {
//     const interval = setInterval(async () => {
//       try {
//         const stats = await pidusage(pid);
//         if (!stats) {
//           clearInterval(interval);
//           resolve();
//         }
//       } catch (error) {
//         clearInterval(interval);
//         resolve();
//       }
//     }, 100);
//   });
//   console.log("d")

//   const endStats = await pidusage(pid);
//   const endTime = process.hrtime(startTime);

//   const cpu = endStats.cpu - startStats.cpu; // CPU usage difference
//   const runtime = endTime[0] * 1000 + endTime[1] / 1e6; // Time difference in milliseconds

//   return { cpu, runtime };
// }

// Compile Java code
async function compileJava(tempDir: string, code: string): Promise<void> {
  const fileName = 'Solution.java';
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, 'utf8');

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
    fileName,
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
        reject(new Error(`Java compilation failed: ${compileErrors}`));
      }
    });
  });
}

// Compile C code
async function compileC(tempDir: string, code: string): Promise<void> {
  const fileName = 'solution.c';
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, 'utf8');

  const compileProcess = spawn('docker', [
    'run',
    '--rm',
    '-v',
    `${tempDir}:/usr/src/app`,
    '-w',
    '/usr/src/app',
    'gcc:latest',
    'gcc',
    '-o',
    'solution',
    fileName,
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
        reject(new Error(`C compilation failed: ${compileErrors}`));
      }
    });
  });
}

// Compile C++ code
async function compileCpp(tempDir: string, code: string): Promise<void> {
  const fileName = 'solution.cpp';
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, code, 'utf8');

  const compileProcess = spawn('docker', [
    'run',
    '--rm',
    '-v',
    `${tempDir}:/usr/src/app`,
    '-w',
    '/usr/src/app',
    'gcc:latest',
    'g++',
    '-o',
    'solution',
    fileName,
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
        reject(new Error(`C++ compilation failed: ${compileErrors}`));
      }
    });
  });
}

// Main function to handle compilation and execution
async function startCompilation(
  code: string,
  testCase: string[],
  language: string
): Promise<ChildProcessWithoutNullStreams> {
  try {
    const tempDir = path.join(__dirname, '../temp');
    await fs.mkdir(tempDir, { recursive: true });

    if (language === 'java') {
      await compileJava(tempDir, code);
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
        ...testCase,
      ]);
    } else if (language === 'c') {
      await compileC(tempDir, code);
      return spawn('docker', [
        'run',
        '-i',
        '--rm',
        '-v',
        `${tempDir}:/usr/src/app`,
        '-w',
        '/usr/src/app',
        'gcc:latest',
        './solution',
        ...testCase,
      ]);
    } else if (language === 'cpp') {
      await compileCpp(tempDir, code);
      return spawn('docker', [
        'run',
        '-i',
        '--rm',
        '-v',
        `${tempDir}:/usr/src/app`,
        '-w',
        '/usr/src/app',
        'gcc:latest',
        './solution',
        ...testCase,
      ]);
    } else {
      throw new Error('Unsupported language');
    }
  } catch (error) {
    throw new Error(`Compilation Service Error: ${error.message}`);
  }
}




export { compileJava, compileC, compileCpp, startCompilation };
