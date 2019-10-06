import React from 'react'

const DepsContext = React.createContext({})

export const DepsProvider = ({depsMap, ...props}) => {
  if (!depsMap) {
    throw new Error('DepsProvider is useless without a depsMap')
  }

  return React.createElement(DepsContext.Provider, {...props, value: depsMap})
}

export const provideDeps = realDeps => {
  const useDeps =
    process.env.NODE_ENV == 'production'
      ? () => realDeps
      : function() {
          const depsMap = React.useContext(DepsContext)

          return {...realDeps, ...depsMap[this]}
        }

  return useDeps
}
