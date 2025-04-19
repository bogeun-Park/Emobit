import './App.css';
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {routes.map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
