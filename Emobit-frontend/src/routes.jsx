import NotFoundPage from "./pages/NotFound/NotFoundPage";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import RegisterSucess from "./pages/Login/RegisterSucess";
import BoardPage from "./pages/Board/BoardPage";
import Create from "./pages/Board/Create";

const routes = [
    { path: "*", element: <NotFoundPage /> },
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/login/register", element: <RegisterPage /> },
    { path: "/login/register/sucess", element: <RegisterSucess /> },
    { path: "/board", element: <BoardPage /> },
    { path: "/board/create", element: <Create /> }
];

export default routes;