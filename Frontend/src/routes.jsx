import { createBrowserRouter } from "react-router-dom";

import Register from "./feature/auth/pages/Register";
import Login from "./feature/auth/pages/Login";
import Protected, {ProtectedLayout} from "./feature/auth/components/Protected";
import Home from "./feature/ai/pages/Home";
import Interview from "./feature/ai/pages/Interview";
import Reports from "./feature/ai/pages/Reports";

const routes = createBrowserRouter([
  {
    element: (
      <Protected>
        <ProtectedLayout />
      </Protected>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/interview/:id",
        element: <Interview />,
      },
      {
        path: "/reports",
        element: <Reports />, 
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
]);

export default routes;
