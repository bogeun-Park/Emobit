import './App.css';
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import Layout from './components/Layout';
import NoLayout from './components/NoLayout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          {routes
            .filter(route => route.withLayout !== false)
            .map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
        </Route>
        
        <Route element={<NoLayout />}>
          {routes
          .filter(route => route.withLayout === false)
          .map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}
        </Route>        
      </Routes>
    </AuthProvider>
  );
}

export default App;
