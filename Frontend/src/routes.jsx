import { createBrowserRouter } from "react-router-dom";

import Register from "./feature/auth/pages/Register";
import Login from "./feature/auth/pages/Login";

const routes = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

export default routes;
