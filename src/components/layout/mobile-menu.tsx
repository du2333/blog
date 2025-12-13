import TechButton from "@/components/ui/tech-button";
import { Link } from "@tanstack/react-router";
import { Disc, LogIn, LogOut, UserCog, UserIcon, X } from "lucide-react";

interface MobileMenuProps {
  navOptions: {
    label: string;
    to: string;
    id: string;
    color: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    image?: string | null;
    role?: string | null;
  };
  logout: () => Promise<void>;
  onOpenProfile: () => void;
}

export function MobileMenu({
  navOptions,
  isOpen,
  onClose,
  user,
  logout,
  onOpenProfile,
}: MobileMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none delay-200"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      <div
        className={`
              absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-zzz-dark border-l-2 border-zzz-lime 
              flex flex-col shadow-[-20px_0_50px_rgba(204,255,0,0.1)]
              transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)
              ${isOpen ? "translate-x-0" : "translate-x-full"}
          `}
      >
        <div className="flex items-center justify-between p-6 border-b border-zzz-gray bg-zzz-black relative overflow-hidden shrink-0 h-20">
          <div
            className={`absolute inset-0 bg-zzz-lime transition-transform duration-700 ease-out ${
              isOpen
                ? "translate-x-full opacity-0 delay-100"
                : "-translate-x-full opacity-50"
            }`}
          ></div>
          <span className="font-mono text-zzz-lime text-xs tracking-[0.2em] uppercase relative z-10 flex items-center gap-2">
            <div
              className={`w-2 h-2 bg-zzz-lime rounded-full ${
                isOpen ? "animate-pulse" : ""
              }`}
            ></div>
            System_Nav
          </span>
          <button
            onClick={onClose}
            className="text-white hover:text-black p-2 relative z-10 group overflow-hidden border border-transparent hover:border-zzz-lime transition-all"
          >
            <div className="absolute inset-0 bg-zzz-lime translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
            <X size={24} className="relative z-10" />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center px-10 gap-10 bg-[radial-gradient(circle_at_top_right,#1a1a1a_0%,transparent_40%)] overflow-y-auto relative z-10">
          {navOptions.map((item, idx) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={onClose}
              className={`
                              text-4xl font-black font-sans uppercase text-white text-left flex items-center gap-6 group transition-all duration-300
                              ${
                                isOpen
                                  ? "translate-x-0 opacity-100"
                                  : "translate-x-10 opacity-0"
                              }
                          `}
              style={{ transitionDelay: `${150 + idx * 100}ms` }}
            >
              <span
                className={`w-1 h-1 bg-${item.color} group-hover:h-8 group-hover:w-2 transition-all duration-300`}
              ></span>
              <span
                className={`group-hover:text-${item.color} transition-colors`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {/* Mobile specific admin link if logged in AND ADMIN */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              onClick={onClose}
              className={`
                              text-4xl font-black font-sans uppercase text-white text-left flex items-center gap-6 group transition-all duration-300
                              ${
                                isOpen
                                  ? "translate-x-0 opacity-100"
                                  : "translate-x-10 opacity-0"
                              }
                          `}
              style={{ transitionDelay: "350ms" }}
            >
              <span className="w-1 h-1 bg-zzz-cyan group-hover:h-8 group-hover:w-2 transition-all duration-300"></span>
              <span className="group-hover:text-zzz-cyan transition-colors">
                HDD_SYSTEM
              </span>
            </Link>
          )}
        </div>

        <div className="absolute bottom-32 -left-16 text-zzz-gray/5 pointer-events-none z-0">
          <Disc size={300} className="animate-[spin_10s_linear_infinite]" />
        </div>

        <div className="p-8 border-t border-zzz-gray bg-zzz-black relative shrink-0 z-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-stripe-pattern opacity-20"></div>
          {user ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  onOpenProfile();
                  onClose();
                }}
                className="w-full flex items-center gap-3 bg-zzz-dark/50 p-2 border border-transparent hover:border-zzz-lime transition-all group text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 border border-zzz-lime p-0.5 bg-zzz-dark shrink-0 clip-corner-tl flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <UserIcon size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-gray-500 truncate">
                    PROXY_ID: {user.name}
                  </div>
                  <div className="text-[10px] font-mono text-zzz-lime flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-zzz-lime rounded-full animate-pulse"></div>
                    ONLINE {user.role === "admin" && " [ADMIN]"}
                  </div>
                </div>
                <UserCog
                  size={16}
                  className="text-gray-600 group-hover:text-zzz-lime transition-colors"
                />
              </button>
              <TechButton
                className="w-full justify-center"
                onClick={() => {
                  logout();
                  onClose();
                }}
                icon={<LogOut size={16} />}
              >
                TERMINATE_SESSION
              </TechButton>
            </div>
          ) : (
            <Link to="/login" onClick={onClose}>
              <TechButton
                className="w-full justify-center"
                variant="primary"
                icon={<LogIn size={16} />}
              >
                ESTABLISH_CONNECTION
              </TechButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
