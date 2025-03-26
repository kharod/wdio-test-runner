import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

export interface TestFile {
  filePath: string;
  relativePath: string;
  specs: string[];
}

export class TestDiscovery {
  private testPattern: string;
  private baseDir: string;
  private excludePatterns: string[];

  constructor(
    baseDir: string = process.cwd(), 
    testPattern: string = '**/*.spec.{js,ts}',
    excludePatterns: string[] = ['**/node_modules/**']
  ) {
    this.baseDir = baseDir;
    this.testPattern = testPattern;
    this.excludePatterns = excludePatterns;
  }

  /**
   * Find all test files in the project
   */
  async findTestFiles(): Promise<TestFile[]> {
    try {
      const files = await glob(this.testPattern, { 
        cwd: this.baseDir,
        ignore: this.excludePatterns
      });
      
      const testFiles: TestFile[] = [];
      
      for (const file of files) {
        const filePath = path.join(this.baseDir, file);
        const specs = await this.extractTestSpecs(filePath);
        
        testFiles.push({
          filePath,
          relativePath: file,
          specs
        });
      }
      
      return testFiles;
    } catch (error) {
      console.error('Error finding test files:', error);
      return [];
    }
  }

  /**
   * Extract test descriptions from a file
   */
  private async extractTestSpecs(filePath: string): Promise<string[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Match describe and it blocks - this is a simple regex and might need adjustments
      // based on how tests are written
      const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
      const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]/g;
      
      const specs: string[] = [];
      
      let match;
      while ((match = describeRegex.exec(content)) !== null) {
        specs.push(match[1]);
      }
      
      while ((match = itRegex.exec(content)) !== null) {
        specs.push(match[1]);
      }
      
      return specs;
    } catch (error) {
      console.error(`Error extracting specs from ${filePath}:`, error);
      return [];
    }
  }
} 