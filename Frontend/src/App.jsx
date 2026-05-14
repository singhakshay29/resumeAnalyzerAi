

import {RouterProvider} from "react-router-dom";
import "./style.scss";
import routes from "./routes";

function App() {
  return <><RouterProvider router={routes} /></>;
}

export default App;
