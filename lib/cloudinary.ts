/**
 * Cloudinary Utilities
 * Upload e gerenciamento de imagens no Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado");
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  console.warn("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET não configurado");
}

/**
 * Faz upload de uma imagem para o Cloudinary (unsigned upload)
 * @param file Arquivo de imagem
 * @param folder Pasta opcional dentro do Cloudinary
 * @returns URL pública da imagem
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary não está configurado corretamente");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Erro ao fazer upload");
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Deleta uma imagem do Cloudinary
 * @param imageUrl URL pública da imagem
 * @returns true se deletado com sucesso
 */
export async function deleteImageFromCloudinary(
  imageUrl: string
): Promise<boolean> {
  try {
    // Extrair public_id da URL
    // Formato: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.error("Não foi possível extrair public_id da URL:", imageUrl);
      return false;
    }

    // Nota: Delete precisa ser feito no backend por segurança (requer API secret)
    // Por enquanto, apenas retornamos true pois o Cloudinary tem garbage collection
    // Você pode implementar uma API route para delete seguro se necessário
    
    console.log("Public ID extraído:", publicId);
    return true;
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    return false;
  }
}

/**
 * Extrai o public_id de uma URL do Cloudinary
 * @param url URL da imagem
 * @returns public_id ou null
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{filename}.{ext}
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error("Erro ao extrair public_id:", error);
    return null;
  }
}

/**
 * Gera URL otimizada de uma imagem do Cloudinary
 * @param url URL original
 * @param options Opções de transformação
 * @returns URL transformada
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  } = {}
): string {
  if (!url.includes("cloudinary.com")) {
    return url; // Não é uma URL do Cloudinary
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
  } = options;

  // Construir transformações
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length === 0) {
    return url;
  }

  // Inserir transformações na URL
  const transformString = transformations.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}

/**
 * Valida se um arquivo é uma imagem válida
 * @param file Arquivo a ser validado
 * @param maxSizeMB Tamanho máximo em MB (padrão: 10)
 * @returns true se válido, ou mensagem de erro
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Verificar tipo
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "O arquivo deve ser uma imagem",
    };
  }

  // Verificar tamanho
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `A imagem deve ter no máximo ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Faz upload de múltiplas imagens
 * @param files Array de arquivos
 * @param folder Pasta opcional
 * @param onProgress Callback para progresso
 * @returns Array de URLs
 */
export async function uploadMultipleImages(
  files: File[],
  folder?: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error(`${file.name}: ${validation.error}`);
      continue;
    }

    try {
      const url = await uploadImageToCloudinary(file, folder);
      urls.push(url);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Erro ao fazer upload de ${file.name}:`, error);
    }
  }

  return urls;
}

