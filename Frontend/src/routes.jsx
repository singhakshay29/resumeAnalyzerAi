import { createBrowserRouter } from "react-router-dom";

import Register from "./feature/auth/pages/Register";
import Login from "./feature/auth/pages/Login";
import Protected from "./feature/auth/components/Protected";
//import Home from "./feature/ai/pages/Home";
import Interview from "./feature/ai/pages/interview";

const dummyData = {
  matchScore: 85,
  technicalQuestions: [
    {
      question: "What is React?",
      intention: "To assess basic understanding of React.",
      answer: "React is a JavaScript library for building user interfaces."
    },
    {
      question: "Explain the virtual DOM.",
      intention: "To evaluate knowledge of React's core concepts.",
      answer: "The virtual DOM is a lightweight copy of the real DOM that React uses to optimize rendering."
    }
  ],
  behaviourQuestions: [
    {
      question: "Describe a time you worked in a team.",
      intention: "To evaluate teamwork skills.",
      answer: "I collaborated with a team to build a web application, ensuring clear communication and task delegation."
    }
  ],
  skillGaps: [
    { skill: "GraphQL", severity: "Medium" },
    { skill: "Docker", severity: "Low" }
  ]
};
const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Interview data={dummyData} />
      </Protected>
    ),
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
]);

export default routes;
