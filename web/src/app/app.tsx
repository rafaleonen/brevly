import { Outlet } from "react-router";

export function App() {
  return (
    <main className="h-dvh bg-gray-200 overflow-hidden">
      <Outlet />
    </main>
  );
}
