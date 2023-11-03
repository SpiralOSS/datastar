export * from './core'
export * from './dom'
export * from './types'

import { Datastar } from './core'
import { AttributePlugins } from './plugins/attributes'
import { BackendActions, BackendPlugins } from './plugins/backend'
import { HelperActions } from './plugins/helpers'
import { VisibilityPlugins } from './plugins/visibility'
import { Actions, AttributePlugin } from './types'

export function runDatastarWith(actions: Actions = {}, ...plugins: AttributePlugin[]) {
  const start = performance.now()
  const ds = new Datastar(actions, ...plugins)
  ds.run()
  const end = performance.now()
  console.log(`Datastar loaded and attached to all DOM elements in ${end - start}ms`)
  return ds
}

export function runDatastarWithAllPlugins(addedActions: Actions = {}, ...addedPlugins: AttributePlugin[]) {
  const actions: Actions = Object.assign({}, HelperActions, BackendActions, addedActions)
  const allPlugins = [...BackendPlugins, ...VisibilityPlugins, ...AttributePlugins, ...addedPlugins]
  return runDatastarWith(actions, ...allPlugins)
}
