import { LinksPage } from "@/pages/links";
import { NotFoundPage } from "@/pages/not-found";
import { RedirectPage } from "@/pages/redirect";
import "@/shared/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { App } from "./app";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <LinksPage /> },
      { path: "/redirect", element: <RedirectPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
