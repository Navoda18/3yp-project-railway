import { createHashRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/pages/Home";
import Architecture from "./components/pages/Architecture";
import TechStack from "./components/pages/TechStack";
import Budget from "./components/pages/Budget";
import Team from "./components/pages/Team";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "architecture", Component: Architecture },
      { path: "tech-stack", Component: TechStack },
      { path: "budget", Component: Budget },
      { path: "team", Component: Team },
    ],
  },
]);
