import {execSync} from 'child_process'

import {buildFolder} from '../../fileBuilder.js'

export default async (options: {
  functionsPath: string
  declaration: boolean
}) => {
  const {functionsPath} = options

  const srcPath = `${functionsPath}/src`
  const distPath = `${functionsPath}/dist`

  await buildFolder(srcPath, distPath)

  if (options.declaration) {
    execSync(
      `cd ${functionsPath} && shopt -s globstar && yarn tsc src/**.ts src/**.tsx --declaration --emitDeclarationOnly --outDir dist`
    )
  }
}
