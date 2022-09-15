import {getApp} from '../../app.js'

export default async (options: {
  port: number
  functionsPath: string
  watch: boolean
  forkmeDaddy: string[]
}) => {
  const app = await getApp({
    functions: options.functionsPath,
    watch: options.watch
  })

  app.listen(options.port, () => {
    console.log(`GraphQL server is running on port ${options.port}.`)
  })

  if (options.forkmeDaddy.length > 0) {
    const {fork} = await import('child_process')

    options.forkmeDaddy.forEach(path => {
      console.log(`Forking ${path}...`)
      fork(path)
    })
  }
}
