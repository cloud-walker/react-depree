import {fromFetch} from 'rxjs/fetch'
import {switchMap} from 'rxjs/operators'
import {render} from '@testing-library/react'
import React from 'react'

import {DepsProvider, provideDeps} from './DepsContext'
import {of} from 'rxjs'

const getFilms = () =>
  fromFetch('http://localhost:3000/films').pipe(switchMap(res => res.json()))

const DummyComponent = () => {
  const [films, setFilms] = React.useState()
  const {getFilms} = DummyComponent.useDeps()

  React.useEffect(() => {
    if (!films) {
      const sub = getFilms().subscribe(setFilms)

      return () => {
        sub.unsubscribe()
      }
    }
  }, [getFilms, films])

  if (!films) {
    return <div>loading...</div>
  }

  return (
    <ul data-testid="films">
      {films.map(film => (
        <li key={film.id}>{film.title}</li>
      ))}
    </ul>
  )
}
DummyComponent.useDeps = provideDeps({
  getFilms,
})

test('it should work properly', () => {
  const {getByTestId} = render(
    <DepsProvider depsMap={{[DummyComponent]: {getFilms: () => of([])}}}>
      <DummyComponent />,
    </DepsProvider>,
  )

  expect(getByTestId('films')).toBeTruthy()
})
