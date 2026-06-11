import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

const projectRoot = process.cwd()
const appRoot = join(projectRoot, 'app')
const normalizePath = (fileName) => fileName.replaceAll('\\', '/')
const virtualFileName = normalizePath(join(projectRoot, '.tabler-icon-typecheck.ts'))

const sourceFiles = []
const declarationFiles = []

const collectFiles = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(fullPath)
      continue
    }

    if (entry.name.endsWith('.vue') || entry.name.endsWith('.ts')) sourceFiles.push(fullPath)
    if (entry.name.endsWith('.d.ts')) declarationFiles.push(fullPath)
  }
}

collectFiles(appRoot)

const importPattern = /@tabler\/icons-vue\/dist\/esm\/icons\/[^'"]+\.mjs/g
const imports = new Set()

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(importPattern)) imports.add(match[0])
}

if (imports.size === 0) {
  throw new Error('No Tabler deep icon imports found to typecheck.')
}

const virtualSource = [...imports]
  .map((specifier, index) => `import Icon${index} from '${specifier}'\nvoid Icon${index}`)
  .join('\n')

const compilerOptions = {
  allowSyntheticDefaultImports: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  noImplicitAny: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ESNext,
  types: [],
}

const host = ts.createCompilerHost(compilerOptions)
const readFile = host.readFile.bind(host)
const fileExists = host.fileExists.bind(host)

host.fileExists = (fileName) => normalizePath(fileName) === virtualFileName || fileExists(fileName)
host.readFile = (fileName) => {
  if (normalizePath(fileName) === virtualFileName) return virtualSource
  return readFile(fileName)
}

const roots = [virtualFileName, ...declarationFiles.filter((file) => existsSync(file))]
const program = ts.createProgram(roots, compilerOptions, host)
const diagnostics = ts.getPreEmitDiagnostics(program)

if (diagnostics.length > 0) {
  const formatted = diagnostics
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      if (!diagnostic.file || diagnostic.start === undefined) return `TS${diagnostic.code}: ${message}`

      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      return `${relative(projectRoot, diagnostic.file.fileName)}:${line + 1}:${character + 1} TS${diagnostic.code}: ${message}`
    })
    .join('\n')

  throw new Error(formatted)
}

console.log(`Typed ${imports.size} Tabler deep icon imports.`)
