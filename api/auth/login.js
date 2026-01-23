import { supabaseAdmin } from '../_supabase.js';

export default async function handler(req, res) {
  // Apenas método POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Tentar fazer login com Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Buscar informações adicionais do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Retornar dados do usuário e token
    res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
