import Auth from "./pages/Auth";
import MainPage from "./pages/MainPage";


import { LOGIN_ROUTE, REGISTRATION_ROUTE, SEARCH_PAGE_ROUTE, PROFILE_PAGE_ROUTE, CHATS_PAGE_ROUTE } from "./utils/consts";

export const authRoutes = [
    {
        path: PROFILE_PAGE_ROUTE,
        Component: MainPage
    },
    {
        path: SEARCH_PAGE_ROUTE,
        Component: MainPage
    },
    {
        path: CHATS_PAGE_ROUTE,
        Component: MainPage
    }
   
]


export const publicRoutes = [
    {
        path:LOGIN_ROUTE,
        Component: Auth
    },
    {
        path:REGISTRATION_ROUTE,
        Component: Auth
    }
]