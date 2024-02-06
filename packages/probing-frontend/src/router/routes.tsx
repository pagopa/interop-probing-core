import type { LangCode } from '@/types/commons.types'
import type { InferRouteKey } from '@pagopa/interop-fe-commons'
import { InteropRouterBuilder } from '@pagopa/interop-fe-commons'
import { createBrowserRouter } from 'react-router-dom'
import RoutesWrapper from './RoutesWrapper'
import { HomePage } from '@/pages/HomePage/Home.page'
import { LoginPage } from '@/pages/LoginPage/Login.Page'
import { FirstAccessPage } from '@/pages/FirstAccessPage/FirstAccess.Page'
import { RecoverPasswordPage } from '@/pages/RecoverPasswordPage/RecoverPassword.Page'

export const { routes, reactRouterDOMRoutes, hooks, components, utils } = new InteropRouterBuilder<
  LangCode,
  'admin'
>({
  languages: ['it', 'en'],
})
  .addRoute({
    key: 'HOME',
    path: '/home',
    element: <HomePage />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'LOGIN',
    path: '/login',
    element: <LoginPage />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'RESTORE_PASSWORD',
    path: '/ripristino-password/:code/:username',
    element: <FirstAccessPage isRecover={true} />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'CREATE_PASSWORD',
    path: '/creazione-password',
    element: <FirstAccessPage />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'RECOVER_PASSWORD',
    path: '/recover-password',
    element: <RecoverPasswordPage />,
    public: true,
    authLevels: ['admin'],
  })
  .build()
export type RouteKey = InferRouteKey<typeof routes>

export const router = createBrowserRouter(
  [
    {
      element: <RoutesWrapper />,
      children: reactRouterDOMRoutes,
    },
    { path: '/', element: <components.Redirect to="HOME" /> },
    { path: '/*', element: <components.Redirect to="HOME" /> },
  ],
  { basename: '/' }
)
