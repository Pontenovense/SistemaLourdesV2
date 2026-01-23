import { supabaseAdmin } from '../_supabase.js';

export default async function handler(req, res) {
  // Apenas método GET é permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar se há token de autorização no header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar informações adicionais do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Sessão válida
    res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
