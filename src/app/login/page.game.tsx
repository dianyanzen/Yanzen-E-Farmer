import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm lanHttpOrigin={process.env.GAME_HTTP_LOGIN_ORIGIN ?? ""} />;
}
