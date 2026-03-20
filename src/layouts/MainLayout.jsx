import Navbar from "../components/common/Navbar";
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}