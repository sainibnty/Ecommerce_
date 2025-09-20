import MainLayout from "../layout/MainLayout";
import HomePage from "../pages/HomePage";
import Login from "../pages/LoginPage";
import Register from "../pages/RegisterPage";

// export const routes = [
//   {
//     path: "/",
//     children: [
//       {
//         element: <MainLayout />,
//         children: [{ index: true, element: <HomePage /> }],
//       },
//       {
//         path: "login",
//         Component: Login,
//       },
//       {
//         path: "signup",
//         Component: Register,
//       },
//     ],
//   },
// ];
export const routes = [
  {
    path: "/", // base path
    children: [
      {
        element: <MainLayout />, 
        children: [{ index: true, element: <HomePage /> }],
      },
      {
        path: "login",
        element: <Login />, 
      },
      {
        path: "signup",
        element: <Register />, 
      },
    ],
  },
];