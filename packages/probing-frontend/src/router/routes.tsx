import type { LangCode } from '@/types/commons.types'
import type { InferRouteKey } from '@pagopa/interop-fe-commons'
import { InteropRouterBuilder } from '@pagopa/interop-fe-commons'
import { createBrowserRouter } from 'react-router-dom'
import RoutesWrapper from './RoutesWrapper'
import { MonitoringEServicesList } from '@/pages/MonitoringEServicesListPage/MonitoringEServicesList.page'
import { LoginPage } from '@/pages/LoginPage/Login.Page'
import { FirstAccessPage } from '@/pages/FirstAccessPage/FirstAccess.Page'
import { RecoverPasswordPage } from '@/pages/RecoverPasswordPage/RecoverPassword.Page'
import { SuccessPage } from '@/pages/SuccessPage/Success.Page'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const { routes, reactRouterDOMRoutes, hooks, components, utils } = new InteropRouterBuilder<
  LangCode,
  'admin'
>({
  languages: ['it', 'en'],
})
  .addRoute({
    key: 'MONITORING_E_SERVICE_LIST',
    path: '/monitoraggio',
    element: <MonitoringEServicesList />,
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
    path: '/ripristino-password',
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
    path: '/recupera-password',
    element: <RecoverPasswordPage />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'EMAIL_SENT',
    path: '/email-inviata',
    element: <SuccessPage parent={'EMAIL_SENT'} />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'PASSWORD_UPDATED',
    path: '/password-aggiornata',
    element: <SuccessPage parent={'PASSWORD_UPDATED'} />,
    public: true,
    authLevels: ['admin'],
  })
  .addRoute({
    key: 'NOT_FOUND',
    path: '/not-found',
    element: <NotFoundPage />,
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
    { path: '/', element: <components.Redirect to="MONITORING_E_SERVICE_LIST" /> },
    { path: '/ripristino-password', element: <components.Redirect to="CREATE_PASSWORD" /> },
    { path: '/*', element: <components.Redirect to="MONITORING_E_SERVICE_LIST" /> },
  ],
  { basename: '/' }
)
