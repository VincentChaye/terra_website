import { LoginScreen } from "./components/LoginScreen";
import { Shell } from "./components/Shell";
import { useSession } from "./lib/session";

export default function App() {
  const { session, login, logout } = useSession();

  if (session === undefined) return <p className="centered">Chargement…</p>;
  if (session === null) return <LoginScreen onLogin={login} />;
  return <Shell session={session} onLogout={() => void logout()} />;
}
