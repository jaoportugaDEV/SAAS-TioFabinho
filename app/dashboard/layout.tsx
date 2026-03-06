import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) {
    redirect("/selecionar-empresa");
  }

  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", empresaId)
    .single();

  return (
    <DashboardShell
      initialEmpresa={empresa ?? null}
      initialEmpresaId={empresaId}
    >
      {children}
    </DashboardShell>
  );
}
