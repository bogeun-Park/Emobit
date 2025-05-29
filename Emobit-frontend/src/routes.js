import NotFoundPage from "./pages/NotFound/NotFoundPage";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import RegisterSucess from "./pages/Login/RegisterSucess";
import BoardPage from "./pages/Board/BoardPage";
import BoardCreate from "./pages/Board/BoardCreate";
import BoardRead from "./pages/Board/BoardRead";
import BoardUpdate from "./pages/Board/BoardUpdate";
import ProfilePage from "./pages/Profile/ProfilePage";

const routes = [
    { path: "*", element: <NotFoundPage /> },
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/login/register", element: <RegisterPage /> },
    { path: "/login/register/sucess", element: <RegisterSucess /> },
    { path: "/board", element: <BoardPage /> },
    { path: "/board/create", element: <BoardCreate /> },
    { path: "/board/read/:boardId", element: <BoardRead /> },
    { path: "/board/update/:boardId", element: <BoardUpdate /> },
    { path: "/:username", element: <ProfilePage /> },
];

export default routes;