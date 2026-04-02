import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Main } from "./components/Main";
import { QRScanner } from "./components/QRScanner";
import { ProductDetail } from "./components/ProductDetail";
import { TaskStatus } from "./components/TaskStatus";
import { Inventory } from "./components/Inventory";
import { RobotDisplay } from "./components/RobotDisplay";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: "/scan",
    element: (
      <ProtectedRoute>
        <QRScanner />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product/:id",
    element: (
      <ProtectedRoute>
        <ProductDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <TaskStatus />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/robot-display",
    Component: RobotDisplay,
  },
]);