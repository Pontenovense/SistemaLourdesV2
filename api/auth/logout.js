import { supabaseAdmin } from '../_supabase.js';

export default async function handler(req, res) {
  // Apenas método POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar se há token de autorização no header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Fazer logout (invalidar sessão)
    const { error } = await supabaseAdmin.auth.signOut(token);

    if (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, consideramos logout bem-sucedido
    }

    res.status(200).json({ message: 'Logout realizado com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
