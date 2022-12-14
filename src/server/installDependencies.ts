import {execSync} from 'child_process'
import {readPackageJson, writePackageJson} from './utils.js'

export function installDependencies(
  dependencies: string[],
  options: {
    cwd: string
  }
) {
  function addDependencies() {
    const packageJson = readPackageJson(options.cwd)

    const dependenciesString = dependencies.join(' ')

    const sfDependencies = packageJson.sfDependencies || {}
    const sfDependenciesNames = Object.keys(sfDependencies)

    const sfDependenciesString = sfDependenciesNames
      .map(dependency => `${dependency}@${sfDependencies[dependency]}`)
      .join(' ')

    if (sfDependenciesString || dependenciesString) {
      const newDependenciesString = dependenciesString.concat(
        ' ',
        sfDependenciesString
      )

      // Install dependencies and sfDependencies
      execSync(`yarn add --ignore-scripts ${newDependenciesString}`, {
        stdio: 'inherit',
        cwd: options.cwd
      })
    }
    return {sfDependenciesNames, sfDependencies}
  }

  function moveDependenciesInPackageJson(
    sfDependenciesNames: string[],
    sfDependencies: any
  ) {
    const packageJson = readPackageJson(options.cwd)

    const dependenciesNames = dependencies.map(dependency => {
      const parts = dependency.split('@')

      if (dependency.startsWith('@')) {
        // Remove all after second @
        return parts.slice(0, 2).join('@')
      }

      return parts[0]
    }) as string[]

    const newDependenciesNames = dependenciesNames
      .concat(sfDependenciesNames)
      .filter((dependency, index, array) => array.indexOf(dependency) === index)

    // Move dependencies that are in packageJson.dependencies to packageJson.sfDependencies
    const dependenciesToMove = Object.keys(packageJson.dependencies).filter(
      dependency => {
        return newDependenciesNames.includes(dependency)
      }
    )

    for (const dependency of dependenciesToMove) {
      sfDependencies[dependency] = packageJson.dependencies[dependency]
      delete packageJson.dependencies[dependency]
    }

    packageJson.sfDependencies = sfDependencies

    writePackageJson(packageJson, options.cwd)
  }

  const {sfDependenciesNames, sfDependencies} = addDependencies()

  moveDependenciesInPackageJson(sfDependenciesNames, sfDependencies)
}
