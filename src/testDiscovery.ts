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
  private wdioPath: string;

  constructor(
    baseDir: string = process.cwd(), 
    testPattern: string = '**/*.{spec,test}.{js,ts}',
    excludePatterns: string[] = ['**/node_modules/**'],
    wdioPath: string = 'integration/wdio'
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
      // First check if we're already in the wdio directory
      let searchDir = this.baseDir;
      const wdioDir = path.join(this.baseDir, this.wdioPath);
      
      if (fs.existsSync(wdioDir)) {
        // If the wdio directory exists, use it as the base for searching
        searchDir = wdioDir;
      }
      
      // Add tests folder to the pattern if it's not already included
      let searchPattern = this.testPattern;
      if (!searchPattern.includes('tests/') && !searchPattern.startsWith('tests')) {
        // Support both direct tests folder and nested folders
        searchPattern = `{tests/**,**}/` + searchPattern;
      }

      const files = await glob(searchPattern, { 
        cwd: searchDir,
        ignore: this.excludePatterns
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