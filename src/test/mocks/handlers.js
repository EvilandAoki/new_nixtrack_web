import { graphql, http, HttpResponse } from 'msw'

// Handlers para REST API
export const restHandlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 1,
      username: 'test-user',
      email: 'test@example.com',
    })
  }),
]

// Handlers para GraphQL
export const graphqlHandlers = [
  graphql.query('GetUser', ({ variables }) => {
    return HttpResponse.json({
      data: {
        user: {
          id: variables.id,
          username: 'test-user',
          email: 'test@example.com',
          role: 'admin',
        },
      },
    })
  }),

  graphql.query('GetCatalog', () => {
    return HttpResponse.json({
      data: {
        states: [
          {
            DepartmentCode: '01',
            DepartmentName: 'Antioquia',
            PaisCode: 170,
          },
          {
            DepartmentCode: '02',
            DepartmentName: 'Cundinamarca',
            PaisCode: 170,
          },
        ],
        cities: [
          {
            CityCode: '001',
            CityName: 'Medellín',
            DepartmentCode: '01',
            PaisCode: 170,
          },
          {
            CityCode: '002',
            CityName: 'Bogotá',
            DepartmentCode: '02',
            PaisCode: 170,
          },
        ],
      },
    })
  }),

  graphql.mutation('CreateUser', ({ variables }) => {
    return HttpResponse.json({
      data: {
        createUser: {
          id: Math.random().toString(36).substr(2, 9),
          username: variables.username,
          email: variables.email,
          success: true,
        },
      },
    })
  }),
]

export const handlers = [...restHandlers, ...graphqlHandlers]
