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
import MessagePage from "./pages/Message/MessagePage";
import SearchPage from "./pages/Board/SearchPage";

const routes = [
    { path: "*", element: <NotFoundPage /> },
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage />, withLayout: false },
    { path: "/login/register", element: <RegisterPage />, withLayout: false },
    { path: "/login/register/success", element: <RegisterSucess />, withLayout: false },
    { path: "/board", element: <BoardPage /> },
    { path: "/board/create", element: <BoardCreate /> },
    { path: "/board/read/:boardId", element: <BoardRead /> },
    { path: "/board/update/:boardId", element: <BoardUpdate /> },
    { path: "/message/:chatRoomId?", element: <MessagePage /> },
    { path: "/search/:keyword", element: <SearchPage /> },
    { path: "/:username", element: <ProfilePage /> },
];

export default routes;