import {of} from 'rxjs'
import {render} from '@testing-library/react'
import React from 'react'
import ReactDOM from 'react-dom'

import {DepsProvider, provideDeps} from './deps-context'

const getThing = () => of('foo')

const DummyComponent = () => {
  const [thing, setThing] = React.useState()
  const {getThing} = DummyComponent.useDeps()

  React.useEffect(() => {
    if (!thing) {
      const sub = getThing().subscribe(setThing)

      return () => {
        sub.unsubscribe()
      }
    }
  }, [getThing, thing])

  if (!thing) {
    return <div>loading...</div>
  }

  return <output>{thing}</output>
}
DummyComponent.useDeps = provideDeps({
  getThing,
})

test('it should work properly', () => {
  const {getByText} = render(
    <DepsProvider depsMap={[[DummyComponent, {getThing: () => of('bar')}]]}>
      <DummyComponent />,
    </DepsProvider>,
  )

  expect(getByText('bar')).toBeTruthy()
})

test('it should throw if no depsMap given', () => {
  jest.spyOn(console, 'error')
  console.error.mockImplementation(() => {})

  expect(() => {
    const div = document.createElement('div')
    ReactDOM.render(
      <DepsProvider>
        <DummyComponent />
      </DepsProvider>,
      div,
    )
    ReactDOM.unmountComponentAtNode(div)
  }).toThrow()
  console.error.mockRestore()
})
