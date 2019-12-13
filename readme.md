# 🦚 React Depree

An idea to write "side-effect free" react components, enabling clean dependency injection on every level of the components tree!

The package exposes a provider component and a hook, thats all, with these 2 constructs you can write every function component / hook without directly polluting them with side-effects!

## Usage

### Scenario

We are in a todoapp, and we want to test the whole `TodoApp` component, but because we love colocating things, the `createTodo` API call and the `CREATED TODO` tracking call are bound to the `AddTodo` component inside the react tree.

Since we are testing the `TodoApp` we can't use the react props as dependency injection mechanism, and we don't really love to use specific testing environment mocking features, as we need to mock it on our Storybook too.

### The AddTodo component

```javascript
import React from 'react'
import {provideDeps} from 'react-depree'
import {track} from 'imaginary-analytics'

export const AddTodo = ({onSuccess}) => {
  /**
   * Here we can call useDeps hook to use our
   * dependencies, normally their reference should
   * never change, so they are safe enough to use
   * inside React.useEffect or React.useMemo and so on!
   */
  const {createTodo, track} = AddTodo.useDeps()
  const [todo, setTodo] = React.useState()

  const handleSubmit = e => {
    e.preventDefault()
    createTodo(todo).then(() => {
      track({id: 'CREATED_TODO', payload: todo})
      onSuccess(todo)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        New Todo <input type="text" onChange={e => setTodo(e.target.value)} />
      </label>
      <button type="submit">Add Todo</button>
    </form>
  )
}

/**
 * We define statically the dependencies used by the component.
 *
 * provideDeps create an AddTodo.useDeps hook that
 * will retrieve the mocked dependencies during testing / stories.
 * but will leave them as-is in production!
 */
AddTodo.useDeps = provideDeps({
  createTodo: data =>
    fetch('myapi.com/todo', {method: 'POST', body: JSON.stringify(data)}).then(
      res => res.json(),
    ),
  track,
})
```

### The TodoApp integration test

```javascript
import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {DepsProvider} from 'react-depree'

import {TodoApp} from './TodoApp'

/**
 * We are using jest & testing-library as test
 * framework.
 */
test('it should work properly', () => {
  const createTodo = jest.fn(() => Promise.resolve())
  const getTodos = jest.fn(() =>
    Promise.resolve([
      {id: 'foo', todo: 'Foo', completed: false},
      {id: 'bar', todo: 'Bar', completed: true},
    ]),
  )
  const updateTodo = jest.fn(() =>
    Promise.resolve({id: 'foo', todo: 'Foo', completed: true}),
  )
  const deleteTodo = jest.fn(() => Promise.resolve({id: 'bar'}))
  const track = jest.fn()
  const {getByText, getByLabelText} = render(
    /**
     * We wrap the tree with the DepsProvider, and
     * we provide a depsMap containing the mocked
     * dependencies needed for each sub component of
     * TodoApp
     */
    <DepsProvider
      depsMap={[
        [AddTodo, {createTodo, track}],
        [TodoList, {getTodos, deleteTodo, updateTodo, track}],
      ]}
    >
      <TodoApp />
    </DepsProvider>,
  )

  /**
   * We can now write our expects in peace :D
   *
   * (TodoList expects omitted, this is just a stupid example >_<)
   */
  const input = getByLabelText('New Todo')
  const submit = getByText('Add Todo')

  fireEvent.change(input, {target: {value: 'Buy the milk'}})
  fireEvent.click(submit)

  expect(createTodo).toHaveBeenCalledWith('Buy the milk')
  expect(track).toHaveBeenCalledWith({id: 'CREATED_TODO', payload: 'baz'})
})
```

## Previous art

The idea comes from [react-magnetic-di](https://github.com/albertogasparin/react-magnetic-di) by [Alberto Gasparin](https://github.com/albertogasparin).
