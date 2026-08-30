import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CarFront, Mail, Lock } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

function Login() {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    const result = await login(
      email.trim(),
      password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      <Card className="w-full max-w-md">

        {/* HEADER */}

        <CardHeader className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#30AFFF]/10">
            <CarFront
              size={30}
              className="text-[#30AFFF]"
            />
          </div>

          <CardTitle className="mt-4 text-2xl">
            Welcome Back
          </CardTitle>

          <p className="text-sm text-slate-500">
            Login to continue renting cars
          </p>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="pl-10"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="pl-10"
                />

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN */}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#30AFFF] text-white hover:bg-[#239fe5]"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>

          </form>

          {/* REGISTER */}

          <p className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-[#30AFFF] hover:underline"
            >
              Register
            </Link>

          </p>

        </CardContent>

      </Card>

    </main>
  );
}

export default Login;