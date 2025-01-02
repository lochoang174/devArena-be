import { Injectable } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class SocketService {
  private executions: Map<string, any> = new Map();  // Map to track executions by uniqueId
  private clients: Map<string, string> = new Map();   // Map to track client uniqueId

  async startCompilation(code: string, uniqueId: string, testCase: string[]) {
    try {
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });
  
      const filePath = path.join(tempDir, 'Main.java');
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
        'Main.java',
      ]);
  
      let compileErrors = '';
      compileProcess.stderr.on('data', (data) => {
        compileErrors += data.toString();
      });
  
      await new Promise((resolve, reject) => {
        compileProcess.on('close', async (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`Compilation failed: ${compileErrors}`));
          }
        });
      });
  
      // Chạy chương trình Java với testCase
      const runProcess = spawn('docker', [
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
        'Main',
        ...testCase, // Truyền testCase làm đối số đầu vào
      ]);
  
      return runProcess; // Trả về process để tiếp tục lắng nghe trong handleCompile
    } catch (error) {
      console.error('Service Error:', error);
      throw error;
    }
  }
  

  // Stop a specific execution by uniqueId
 
  
  async stopExecution(uniqueId: string) {
    const execution = this.executions.get(uniqueId);
    if (execution && execution.process) {
      execution.process.kill();  // Kill the running process
      this.removeExecutionState(uniqueId);  // Remove from map
    }
  }

  // Method to remove the execution state from the map
  removeExecutionState(uniqueId: string) {
    this.executions.delete(uniqueId);  // Remove execution by uniqueId
  }

  // Get output for a specific execution by uniqueId
  getExecutionOutput(uniqueId: string): { output: string; errors: string , process: ChildProcessWithoutNullStreams} {
      const execution = this.executions.get(uniqueId);
      if (execution) {
      return {
        output: execution.output,
        errors: execution.errors,
        process: execution.process
      };
    }
    return { output: '', errors: '', process: null };  // Return empty if no execution found
  }

  // Get the current state for a specific execution by uniqueId
  getExecutionState(uniqueId: string): { output: string; errors: string  , process: ChildProcessWithoutNullStreams} {
    const execution = this.executions.get(uniqueId);
      if (execution) {
        return {
        output: execution.output,
        errors: execution.errors,
        process: execution.process
      };
    }
    return { output: '', errors: '', process: null };  // Return empty if no execution found
  }

  // Associate a client with a uniqueId
  associateClientWithUniqueId(socketId: string, uniqueId: string) {
    this.clients.set(socketId, uniqueId);
  }

  // Retrieve the uniqueId for a specific client (socketId)
  getUniqueIdForClient(socketId: string): string | undefined {
    return this.clients.get(socketId);
  }
}
