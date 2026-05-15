import { createBrowserRouter } from "react-router-dom";

import Register from "./feature/auth/pages/Register";
import Login from "./feature/auth/pages/Login";
import Protected from "./feature/auth/components/Protected";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <h2>Home Page</h2>
      </Protected>
    ),
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
]);

export default routes;
