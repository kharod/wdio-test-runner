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
  private wdioPath: string | undefined;

  constructor(
    baseDir: string = process.cwd(), 
    testPattern: string = '**/*.{spec,test}.{js,ts}',
    excludePatterns: string[] = ['**/node_modules/**'],
    wdioPath?: string
  ) {
    this.baseDir = baseDir;
    this.testPattern = testPattern;
    this.excludePatterns = excludePatterns;
    this.wdioPath = wdioPath;
  }

  /**
   * Find all test files in the project
   */
  async findTestFiles(): Promise<TestFile[]> {
    try {
      // First check if we should use a specific wdio directory
      let searchDir = this.baseDir;
      
      if (this.wdioPath && fs.existsSync(path.join(this.baseDir, this.wdioPath))) {
        // If the wdio directory exists, use it as the base for searching
        searchDir = path.join(this.baseDir, this.wdioPath);
      } else {
        // If wdio path is not specified or doesn't exist, try some common test directories
        const commonTestDirs = ['test', 'tests', 'e2e', 'integration', 'specs'];
        
        for (const dir of commonTestDirs) {
          const testDir = path.join(this.baseDir, dir);
          if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
            searchDir = testDir;
            break;
          }
        }
      }
      
      // Add tests folder to the pattern if it's not already included
      let searchPattern = this.testPattern;

      const files = await glob(searchPattern, { 
        cwd: searchDir,
        ignore: this.excludePatterns,
        absolute: false
      });
      
      const testFiles: TestFile[] = [];
      
      for (const file of files) {
        const filePath = path.join(searchDir, file);
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
      const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]/g;
      
      const specs: string[] = [];
      
      let match;
      while ((match = describeRegex.exec(content)) !== null) {
        specs.push(match[1]);
      }
      
      while ((match = itRegex.exec(content)) !== null) {
        specs.push(match[1]);
      }
      
      while ((match = testRegex.exec(content)) !== null) {
        specs.push(match[1]);
      }
      
      return specs;
    } catch (error) {
      console.error(`Error extracting specs from ${filePath}:`, error);
      return [];
    }
  }
} 