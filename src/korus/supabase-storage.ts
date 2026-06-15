import { apiUrl, getAccessToken } from "./api-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "korus-assets";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function getSupabasePublicUrl(path: string) {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

export function supabaseAsset(path: string) {
  return getSupabasePublicUrl(path);
}

// O upload passa pela API (autenticada por JWT), que usa a service role no
// servidor. A chave secreta do Supabase nunca vai para o navegador.
export async function uploadImageToSupabase(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("A imagem precisa ter até 5MB.");
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("Faça login para enviar imagens.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const response = await fetch(apiUrl("/uploads/imagem"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!response.ok) {
    let detalhe = "Não foi possível salvar a imagem.";
    try {
      const erro = await response.json();
      if (typeof erro.detail === "string") detalhe = erro.detail;
    } catch {
      // mantém a mensagem padrão
    }
    throw new Error(detalhe);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
