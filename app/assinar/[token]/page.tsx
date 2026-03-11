import { getContratoPorToken } from "@/app/actions/contratos";
import { AssinarPorLink } from "@/components/contratos/assinar-por-link";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AssinarContratoPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getContratoPorToken(token);

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link inválido ou expirado</h1>
          <p className="text-gray-600">{result.error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Solicite um novo link ao buffet responsável pelo seu evento.
          </p>
        </div>
      </div>
    );
  }

  return <AssinarPorLink token={token} data={result.data} />;
}
