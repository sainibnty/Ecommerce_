import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes/routes";
const route = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={route} />;
}

export default App;
