import { supabaseAsset } from "./supabase-storage";

export const IMAGES = {
  agency: supabaseAsset("landing/agency-workspace.jpg"),
  branding: supabaseAsset("portfolio/branding-design.jpg"),
  social: supabaseAsset("portfolio/social-media.jpg"),
  webdev: supabaseAsset("portfolio/web-development.jpg"),
  photo: supabaseAsset("portfolio/photo.jpg"),
  content: supabaseAsset("portfolio/content-marketing.jpg"),
  woman: supabaseAsset("avatars/woman.jpg"),
  man: supabaseAsset("avatars/man.jpg"),
  restaurant: supabaseAsset("portfolio/restaurant.jpg"),
  logoHorizontalRoxo: supabaseAsset("logos/logo_horizontal_mn_roxo_escuro_fundo_branco.png"),
  logoHorizontalPreto: supabaseAsset("logos/logo_horizontal_mn_preto_fundo_branco.png"),
  logoHorizontalAzul: supabaseAsset("logos/logo_hotizontal_mn_azul_noturno__com_fundo_branco.png"),
  logoVerticalBrancoRoxo: supabaseAsset("logos/logo_vertical_mn_branco_fundo_roxo_escuro.png"),
  logoVerticalAzul: supabaseAsset("logos/logo_vertical_mn_azul_noturno__com_fundo_branco.png"),
  iconeRoxoClaro: supabaseAsset("logos/icone_mn_roxo_claro_fundo_branco.png"),
  iconePreto: supabaseAsset("logos/icone_mn_preto_fundo_branco.png"),
  iconeBrancoPreto: supabaseAsset("logos/icone_mn_branco_fundo_preto.png"),
  iconeBrancoAzul: supabaseAsset("logos/icone_mn_branco_fundo_mn_azul_noturno__com__fundo_branco.png"),
};