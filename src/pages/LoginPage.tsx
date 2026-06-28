import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import SEO from '../components/SEO';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const success = await login(email, password);

    if (success) {
      navigate('/admin');
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center">
      <SEO
        title="Connexion Admin | SJOV | Société des Jardins Ouvriers de Villeurbanne"
        description="Page de connexion sécurisée pour les administrateurs de la Société des Jardins Ouvriers de Villeurbanne (SJOV)."
        keywords="connexion SJOV, administration SJOV, Société des Jardins Ouvriers de Villeurbanne, accès administrateur, Villeurbanne, 69100"
      />
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="h-20 w-20 mx-auto flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <Lock size={40} />
            </div>
            <h1 className="font-heading font-bold text-3xl mt-4 mb-2">Connexion à l'administration</h1>
            <p className="text-neutral-600">
              Accédez à l'espace administrateur pour gérer le contenu du site
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="bg-error-50 text-error-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-between gap-4">
                <Link to="/" className="btn-secondary w-full text-center">
                  Annuler
                </Link>
                <button type="submit" className="btn-primary w-full">
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
