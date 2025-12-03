"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Download } from "lucide-react";
import Image from "next/image";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary";

interface GaleriaFotosProps {
  festaId: string;
}

interface Foto {
  id: string;
  foto_url: string;
  uploaded_at: string;
}

export function GaleriaFotos({ festaId }: GaleriaFotosProps) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadFotos();
  }, [festaId]);

  const loadFotos = async () => {
    try {
      const { data, error } = await supabase
        .from("festa_fotos")
        .select("*")
        .eq("festa_id", festaId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setFotos(data || []);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        // Validar
        const validation = validateImageFile(file, 10);
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        // Upload para Cloudinary
        const folder = `tio-fabinho/festas/${festaId}`;
        const imageUrl = await uploadImageToCloudinary(file, folder);

        // Salvar URL no banco Supabase
        const { error: dbError } = await supabase
          .from("festa_fotos")
          .insert([{ festa_id: festaId, foto_url: imageUrl }]);

        if (dbError) throw dbError;
      }

      await loadFotos();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload das fotos. Verifique sua conexão e tente novamente.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Deseja excluir esta foto?")) return;

    try {
      // Deletar do banco Supabase
      const { error } = await supabase
        .from("festa_fotos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Nota: As imagens no Cloudinary podem ser mantidas ou deletadas manualmente
      // O Cloudinary Free tier tem 25GB de espaço, suficiente para muitos anos
      // Se necessário, pode-se implementar delete via API route no futuro

      setFotos(fotos.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      alert("Erro ao excluir foto");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Carregando galeria...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          type="file"
          id={`upload-fotos-${festaId}`}
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor={`upload-fotos-${festaId}`}>
          <Button
            type="button"
            disabled={uploading}
            onClick={() => document.getElementById(`upload-fotos-${festaId}`)?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : "Adicionar Fotos"}
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Selecione múltiplas fotos (máx 10MB cada)
        </p>
      </div>

      {/* Galeria */}
      {fotos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Nenhuma foto adicionada ainda</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <Card key={foto.id} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={foto.foto_url}
                  alt="Foto da festa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(foto.foto_url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(foto.id, foto.foto_url)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

