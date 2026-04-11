import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UploadPage from '../pages/upload/UploadPage';
import MyDocuments from '../pages/documents/MyDocuments';
import SearchPage from '../pages/search/SearchPage';
import ProfilePage from '../pages/profile/ProfilePage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <MyDocuments />,
            },
            {
                path: '/my-documents',
                element: <MyDocuments />,
            },
            {
                path: '/upload',
                element: <UploadPage />,
            },
            {
                path: '/search',
                element: <SearchPage />,
            },
            {
                path: '/profile',
                element: <ProfilePage />,
            },
        ],
    },
]);

export default router;
