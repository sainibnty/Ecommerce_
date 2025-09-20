import { Outlet } from "react-router";
import Header from "../features/header/Header";
import Container from "./components/Container";
import Footer from "./components/Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Container>
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
