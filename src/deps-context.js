import React from 'react'

const DepsContext = React.createContext(new Map())

/**
 * @typedef {[any, Object]} Deps
 * @param {Object} props
 * @param {Deps[]} props.depsMap
 */
export const DepsProvider = ({depsMap, ...props}) => {
  if (!depsMap) {
    throw new Error('DepsProvider is useless without a depsMap')
  }

  const value = React.useMemo(() => new Map(depsMap), [depsMap])

  return React.createElement(DepsContext.Provider, {...props, value})
}

export const provideDeps = realDeps => {
  const useDeps = function() {
    const depsMap = React.useContext(DepsContext)

    return {...realDeps, ...depsMap.get(this)}
  }

  return useDeps
}
