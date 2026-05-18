import { createBrowserRouter } from "react-router-dom";

import Register from "./feature/auth/pages/Register";
import Login from "./feature/auth/pages/Login";
import Protected from "./feature/auth/components/Protected";
import Home from "./feature/ai/pages/Home";
import Interview from "./feature/ai/pages/interview";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home/>
      </Protected>
    ),
  },
  {path: "/interview/:id", element: <Protected><Interview/></Protected>},
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
]);

export default routes;
