"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { afterLoginSetEmpresa } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Email ou senha incorretos");
        return;
      }

      if (data.session) {
        const { redirectTo } = await afterLoginSetEmpresa();
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" data-page="login">
      {/* Coluna esquerda: marca (desktop) / bloco superior (mobile) */}
      <div className="bg-[#1a3c34] flex flex-col items-center justify-center px-6 py-12 md:min-h-screen md:w-[45%] md:py-16">
        <div className="w-full max-w-[280px] md:max-w-[320px]">
          <Image
            src="/logo-buffet-facil.png"
            alt="Buffet Fácil"
            width={320}
            height={160}
            className="object-contain w-full h-auto"
            priority
          />
        </div>
        <p className="mt-8 text-center text-white/90 text-sm md:text-base max-w-xs">
          Sua gestão de festas e buffets em um só lugar.
        </p>
      </div>

      {/* Coluna direita: formulário */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f6f4] p-4 md:p-8">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-[#2d2d2d]">
              Buffet Fácil
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Entre com sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2d2d2d]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="focus-visible:ring-2 focus-visible:ring-[#b85238] focus-visible:ring-offset-2 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2d2d2d]">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="focus-visible:ring-2 focus-visible:ring-[#b85238] focus-visible:ring-offset-2 border-gray-200"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#b85238] hover:bg-[#a04832] text-white transition-colors"
                disabled={loading}
                size="lg"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
