import {of, interval} from 'rxjs'
import {render, screen} from '@testing-library/react'
import React from 'react'
import ReactDOM from 'react-dom'

import {DepsProvider, provideDeps} from './deps-context'

const getThing = () => of('foo')

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {error: false}
  }
  componentDidCatch(err, info) {
    this.setState({error: true})
    this.props.onCatch(err, info)
  }
  render() {
    if (this.state.error) {
      return this.props.fallback || null
    }

    return this.props.children
  }
}

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
  render(
    <DepsProvider depsMap={[[DummyComponent, {getThing: () => of('bar')}]]}>
      <DummyComponent />,
    </DepsProvider>,
  )

  expect(screen.getByText('bar')).toBeTruthy()
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

test('it should throw if no deps covered', () => {
  jest.spyOn(console, 'error')
  console.error.mockImplementation(() => {})
  let errorMessage = null
  const onCatch = err => (errorMessage = err.message)

  render(
    <ErrorBoundary onCatch={onCatch}>
      <DepsProvider depsMap={[[DummyComponent, {}]]}>
        <DummyComponent />
      </DepsProvider>
    </ErrorBoundary>,
  )

  expect(errorMessage).toMatchInlineSnapshot(`
    "You are not declaring all the dependencies for the reference DummyComponent, 
    please pass a falsy value if you don't need to mock some of them.

    real deps: [getThing]
    fake deps: []"
  `)

  console.error.mockRestore()
})

test('it should render normally with DepsProvider', () => {
  render(<DummyComponent />)
})
