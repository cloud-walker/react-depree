import React from 'react'

const DepsContext = React.createContext(new Map())

/**
 * @typedef {[any, Object]} Deps
 * @param {Object} props
 * @param {Deps[]} props.depsMap
 */
export const DepsProvider = ({depsMap, ...props}) => {
  if (!depsMap || !depsMap.length) {
    throw new Error('DepsProvider is useless without a depsMap')
  }

  const value = React.useMemo(() => new Map(depsMap), [depsMap])

  return React.createElement(DepsContext.Provider, {...props, value})
}

export const provideDeps = realDeps => {
  const useDeps = function () {
    const depsMap = React.useContext(DepsContext)
    const fakeDeps = depsMap.get(this)
    if (!fakeDeps) {
      return realDeps
    }

    const realKeys = Object.keys(realDeps)
    const fakeKeys = Object.keys(fakeDeps)
    const sanitizedFakeDeps = fakeKeys
      .filter(key => !!fakeDeps[key])
      .reduce((acc, val) => ({...acc, [val]: fakeDeps[val]}), {})

    if (fakeKeys.length != realKeys.length) {
      throw new Error(`You are not declaring all the dependencies for the reference ${
        this.name
      }, 
please pass a falsy value if you don't need to mock some of them.

real deps: [${realKeys.toString()}]
fake deps: [${fakeKeys.toString()}]`)
    }

    return {
      ...realDeps,
      ...sanitizedFakeDeps,
    }
  }

  return useDeps
}
