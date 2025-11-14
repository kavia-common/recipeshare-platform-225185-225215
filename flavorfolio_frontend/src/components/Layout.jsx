import React from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="page">
      <Navbar />
      <div className="container">{children}</div>
    </div>
  );
}
