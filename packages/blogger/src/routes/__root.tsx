import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { tw } from '../tw'

export const Route = createRootRoute({
    component: RootComponent,
})

const nav = tw.style({
    backgroundColor: 'bg-white',
    paddingX: 'px-4',
    paddingY: 'py-2',
    borderBottomWidth: 'border-b',
    borderColor: 'border-gray-100',
    display: 'flex',
    flexDirection: 'flex-row',
    justifyContent: 'justify-between',
    alignItems: 'items-center',
    height: 'h-10', // iframe height calculation
})

function RootComponent() {
    return (
        <>
            <div className={nav.class}>
                <Link
                    to="/"
                    activeProps={{
                        className: 'underline',
                    }}
                    activeOptions={{ exact: true }}
                >
                    Home
                </Link>{' '}
                <Link
                    to="/preview"
                    activeProps={{
                        className: 'underline',
                    }}
                >
                    Preview
                </Link>
                <Link
                    to="/settings"
                    activeProps={{
                        className: 'underline',
                    }}
                >
                    Settings
                </Link>
            </div>
            <hr />
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
        </>
    )
}
