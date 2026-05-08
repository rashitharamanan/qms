import Navbar from "../components/common/Navbar";
import { Link, useParams } from "react-router-dom";
import AIChatBot from "../components/common/AIChatBot";

export default function MainLayout({ children }) {
  const { id } = useParams(); // Capture shopId if present in URL

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="pt-[62px] flex-1">{children}</main>
      <footer className="py-6 text-center border-t border-slate-200/60 bg-slate-50">
        <div className="flex items-center justify-center gap-4 text-sm font-bold text-slate-400">
          <p>© {new Date().getFullYear()} QueueMS. All rights reserved.</p>
          <span>•</span>
          <Link to="/contact" className="hover:text-purple-600 transition-colors">Contact Us</Link>
        </div>
      </footer>
      <AIChatBot shopId={id} />
    </div>
  );
}