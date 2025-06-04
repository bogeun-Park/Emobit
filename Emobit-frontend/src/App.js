import './App.css';
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Layout이 필요한 페이지 */}
        <Route element={<Layout />}>
          {routes
            .filter(route => route.withLayout !== false)
            .map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
        </Route>

        {/* Layout이 필요 없는 페이지 */}
        {routes
          .filter(route => route.withLayout === false)
          .map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}
      </Routes>
    </AuthProvider>
  );
}

export default App;
