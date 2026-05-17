import { RouterProvider } from "react-router-dom";
import "./style.scss";
import routes from "./routes";
import { AuthProvider } from "./feature/auth/auth.context";
import { InterviewProvider } from "./feature/ai/interview.context";

function App() {
  return (
    <>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={routes} />
        </InterviewProvider>
      </AuthProvider>
    </>
  );
}

export default App;
