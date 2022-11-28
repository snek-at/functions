import fs from 'fs'
import path from 'path'

import {transformFile} from '@swc/core'

import {replaceAll} from '../utils.js'

export const buildFile = async (filePath: string, outputFilePath: string) => {
  const extname = path.extname(filePath)

  const {code} = await transformFile(filePath, {})

  // regex replace `import {fn} from './factory'` to `import {fn} from './factory.js'`
  const transformedCode = replaceAll(
    replaceAll(code, `"./factory"`, `"./factory.js"`),
    `'./factory'`,
    `'./factory.js'`
  )

  let newFilePath = outputFilePath

  // change file extension to .js if it's a .ts file
  if (extname === '.ts') {
    newFilePath = newFilePath.replace(/\.ts$/, '.js')
  }

  // write code to output file
  await fs.promises.writeFile(newFilePath, transformedCode, 'utf8')
}

export const buildFolder = async (
  folderPath: string,
  outputFolderPath: string,
  originFolderPath: string = folderPath
) => {
  // clear output folder if it exists else create it
  try {
    await fs.promises.rm(outputFolderPath, {recursive: true})
  } catch {}

  try {
    await fs.promises.mkdir(outputFolderPath, {recursive: true})
  } catch {}

  for (const file of await fs.promises.readdir(folderPath)) {
    const fullPath = path.join(folderPath, file)
    const lstat = await fs.promises.lstat(fullPath)

    const isDirectory = lstat.isDirectory()

    if (isDirectory) {
      await buildFolder(
        fullPath,
        path.join(outputFolderPath, file),
        originFolderPath
      )
    } else {
      const filePath = path.resolve(folderPath, file)
      const outputFilePath = path.join(outputFolderPath, file)

      // Build only .ts and .js files
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
        await buildFile(fullPath, outputFilePath)
      } else {
        try {
          await fs.promises.copyFile(filePath, outputFilePath)
        } catch (err) {
          console.error(err)
          console.warn(`Could not copy ${filePath} to ${outputFilePath}`)
        }
      }
    }
  }
}
