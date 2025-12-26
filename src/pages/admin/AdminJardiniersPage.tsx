import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Jardinier, Parcelle, SecteurParcelle } from '../../types';

type SortKey = 'nom' | 'numero_parcelle' | 'email' | 'telephone' | 'annee_naissance' | 'statut';

type SortDir = 'asc' | 'desc';

const AdminJardiniersPage: React.FC = () => {
  const [jardiniers, setJardiniers] = useState<Jardinier[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [confirmContact, setConfirmContact] = useState<
    | { kind: 'tel' | 'email'; value: string; nom: string | null }
    | null
  >(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [numeroParcelle, setNumeroParcelle] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState('');
  const [statut, setStatut] = useState<'' | 'actif' | 'retraite'>('');

  const [isParcelleDropdownOpen, setIsParcelleDropdownOpen] = useState(false);
  const parcelleDropdownRef = useRef<HTMLDivElement | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('nom');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fetchJardiniers = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('jardiniers')
      .select('*');

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setJardiniers((data as Jardinier[]) || []);
    setLoading(false);
  };

  const fetchParcelles = async () => {
    const { data, error: fetchError } = await supabase.from('parcelles').select('*');
    if (fetchError) {
      console.error('Erreur chargement parcelles :', fetchError.message);
      return;
    }
    setParcelles((data as Parcelle[]) || []);
  };

  useEffect(() => {
    fetchJardiniers();
    fetchParcelles();
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!parcelleDropdownRef.current) return;
      if (!parcelleDropdownRef.current.contains(target)) {
        setIsParcelleDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNom('');
    setNumeroParcelle('');
    setEmail('');
    setTelephone('');
    setAnneeNaissance('');
    setStatut('');
    setError(null);
    setSuccess(null);
  };

  const startEdit = (jardinier: Jardinier) => {
    setEditingId(jardinier.id);
    setNom(jardinier.nom || '');
    setNumeroParcelle(jardinier.numero_parcelle !== null && jardinier.numero_parcelle !== undefined ? String(jardinier.numero_parcelle) : '');
    setEmail(jardinier.email || '');
    setTelephone(jardinier.telephone || '');
    setAnneeNaissance(
      jardinier.annee_naissance !== null && jardinier.annee_naissance !== undefined ? String(jardinier.annee_naissance) : ''
    );
    setStatut(jardinier.statut || '');

    setIsParcelleDropdownOpen(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const secteurLabel = (value: SecteurParcelle | null) => {
    if (!value) return '';
    if (value === 'siege') return 'Secteur Siège';
    if (value === 'clos_jacquet') return 'Secteur Clos Jacquet';
    if (value === 'digue_sud') return 'Secteur Digue Sud';
    if (value === 'digue_nord') return 'Secteur Digue Nord';
    return 'Secteur Nord';
  };

  const parcelleOptionLabel = (p: Parcelle) => {
    const parts: string[] = [];
    if (p.numero_parcelle !== null && p.numero_parcelle !== undefined) parts.push(String(p.numero_parcelle));
    if (p.surface_m2 !== null && p.surface_m2 !== undefined) parts.push(`${p.surface_m2} m²`);
    if (p.secteur) parts.push(secteurLabel(p.secteur));
    return parts.join(' - ');
  };

  const parcellesDisponibles = useMemo(() => {
    const assigned = new Set(
      jardiniers
        .filter((j) => j.id !== editingId)
        .map((j) => j.numero_parcelle)
        .filter((n): n is number => n !== null && n !== undefined)
    );

    return parcelles
      .filter((p) => p.numero_parcelle !== null && p.numero_parcelle !== undefined)
      .filter((p) => !assigned.has(p.numero_parcelle as number))
      .sort((a, b) => Number(a.numero_parcelle) - Number(b.numero_parcelle));
  }, [parcelles, jardiniers, editingId]);

  const parcellesDisponiblesFiltrees = useMemo(() => {
    const q = numeroParcelle.trim();
    if (!q) return parcellesDisponibles;
    return parcellesDisponibles.filter((p) => String(p.numero_parcelle ?? '').startsWith(q));
  }, [numeroParcelle, parcellesDisponibles]);

  const currentEditingNumeroParcelle = useMemo(() => {
    if (!editingId) return null;
    const found = jardiniers.find((j) => j.id === editingId);
    return found?.numero_parcelle ?? null;
  }, [editingId, jardiniers]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedJardiniers = useMemo(() => {
    const list = [...jardiniers];

    const compare = (a: Jardinier, b: Jardinier) => {
      const dir = sortDir === 'asc' ? 1 : -1;

      if (sortKey === 'numero_parcelle' || sortKey === 'annee_naissance') {
        const va = Number(a[sortKey] ?? 0);
        const vb = Number(b[sortKey] ?? 0);
        return (va - vb) * dir;
      }

      const sa = String(a[sortKey] ?? '').toLocaleLowerCase();
      const sb = String(b[sortKey] ?? '').toLocaleLowerCase();
      return sa.localeCompare(sb, 'fr') * dir;
    };

    return list.sort(compare);
  }, [jardiniers, sortKey, sortDir]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const numeroParcelleValue = numeroParcelle.trim() ? Number(numeroParcelle) : null;
    if (numeroParcelle.trim() && Number.isNaN(numeroParcelleValue)) {
      setError('Le numéro de parcelle doit être un nombre.');
      return;
    }

    if (numeroParcelleValue !== null && numeroParcelleValue !== undefined) {
      const existsInParcelles = parcelles.some((p) => p.numero_parcelle === numeroParcelleValue);
      const isAvailable = parcellesDisponibles.some((p) => p.numero_parcelle === numeroParcelleValue);
      const isCurrentEditing = currentEditingNumeroParcelle === numeroParcelleValue;

      if (!existsInParcelles) {
        setError('Cette parcelle n’existe pas dans la liste des parcelles.');
        return;
      }

      if (!isAvailable && !isCurrentEditing) {
        setError('Cette parcelle est déjà attribuée à un autre jardinier.');
        return;
      }
    }

    const anneeNaissanceValue = anneeNaissance.trim() ? Number(anneeNaissance) : null;
    if (anneeNaissance.trim() && Number.isNaN(anneeNaissanceValue)) {
      setError("L'année de naissance doit être un nombre.");
      return;
    }

    const payload = {
      nom: nom.trim() || null,
      numero_parcelle: numeroParcelleValue,
      email: email.trim() || null,
      telephone: telephone.trim() || null,
      annee_naissance: anneeNaissanceValue,
      statut: statut || null,
    };

    if (editingId) {
      const { error: updateError } = await supabase.from('jardiniers').update(payload).eq('id', editingId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess('Jardinier mis à jour.');
    } else {
      const { error: insertError } = await supabase.from('jardiniers').insert([payload]);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setSuccess('Jardinier ajouté.');
    }

    await fetchJardiniers();
    await fetchParcelles();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);

    const { error: deleteError } = await supabase.from('jardiniers').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess('Jardinier supprimé.');
    setConfirmDeleteId(null);
    await fetchJardiniers();
    await fetchParcelles();
    if (editingId === id) {
      resetForm();
    }
  };

  const handleUnassignParcelle = async (jardinier: Jardinier) => {
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from('jardiniers')
      .update({ numero_parcelle: null })
      .eq('id', jardinier.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (editingId === jardinier.id) {
      setNumeroParcelle('');
    }

    setSuccess('Parcelle retirée du jardinier.');
    await fetchJardiniers();
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const normalizeTel = (value: string) => value.trim().replace(/[^\d+]/g, '');

  const confirmAndTriggerContact = (kind: 'tel' | 'email', value: string, nomJardinier: string | null) => {
    if (!value?.trim()) return;
    setConfirmContact({ kind, value: value.trim(), nom: nomJardinier });
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des jardiniers</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">{editingId ? 'Modifier un jardinier' : 'Ajouter un jardinier'}</h2>

        {error && <p className="text-red-600 font-medium">{error}</p>}
        {success && <p className="text-green-700 font-medium">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Numéro de parcelle</label>
            <div ref={parcelleDropdownRef} className="relative">
              <input
                className="w-full border px-3 py-2 rounded pr-10"
                value={numeroParcelle}
                onChange={(e) => {
                  setNumeroParcelle(e.target.value);
                  setIsParcelleDropdownOpen(true);
                }}
                onFocus={() => setIsParcelleDropdownOpen(true)}
                placeholder="Ex: 12"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setIsParcelleDropdownOpen((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-neutral-600 hover:text-neutral-800"
                aria-label="Ouvrir la liste des parcelles"
              >
                <span className="text-lg leading-none">▾</span>
              </button>

              {isParcelleDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded shadow max-h-60 overflow-auto">
                  {parcellesDisponiblesFiltrees.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-neutral-500">Aucune parcelle disponible</div>
                  ) : (
                    parcellesDisponiblesFiltrees.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100"
                        onClick={() => {
                          setNumeroParcelle(p.numero_parcelle !== null && p.numero_parcelle !== undefined ? String(p.numero_parcelle) : '');
                          setIsParcelleDropdownOpen(false);
                        }}
                      >
                        {parcelleOptionLabel(p)}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Téléphone"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Année de naissance</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={anneeNaissance}
              onChange={(e) => setAnneeNaissance(e.target.value)}
              placeholder="Ex: 1975"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={statut}
              onChange={(e) => setStatut(e.target.value as '' | 'actif' | 'retraite')}
            >
              <option value="">-- Aucun --</option>
              <option value="actif">Actif</option>
              <option value="retraite">Retraité</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </button>

          {editingId && (
            <button onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
              Annuler
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste des jardiniers</h2>

        {loading ? (
          <p className="text-neutral-500">Chargement...</p>
        ) : sortedJardiniers.length === 0 ? (
          <p className="text-neutral-500">Aucun jardinier enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('nom')}>Nom{sortIndicator('nom')}</button>
                  </th>
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('numero_parcelle')}>
                      Parcelle{sortIndicator('numero_parcelle')}
                    </button>
                  </th>
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('email')}>Email{sortIndicator('email')}</button>
                  </th>
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('telephone')}>
                      Téléphone{sortIndicator('telephone')}
                    </button>
                  </th>
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('annee_naissance')}>
                      Naissance{sortIndicator('annee_naissance')}
                    </button>
                  </th>
                  <th className="py-2 pr-4">
                    <button className="font-semibold" onClick={() => toggleSort('statut')}>
                      Statut{sortIndicator('statut')}
                    </button>
                  </th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedJardiniers.map((jardinier) => (
                  <tr key={jardinier.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">{jardinier.nom ?? ''}</td>
                    <td className="py-2 pr-4">{jardinier.numero_parcelle ?? ''}</td>
                    <td className="py-2 pr-4">
                      {jardinier.email ? (
                        <button
                          type="button"
                          className="text-blue-700 hover:underline"
                          onClick={() => confirmAndTriggerContact('email', jardinier.email as string, jardinier.nom)}
                        >
                          {jardinier.email}
                        </button>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {jardinier.telephone ? (
                        <button
                          type="button"
                          className="text-blue-700 hover:underline"
                          onClick={() => confirmAndTriggerContact('tel', jardinier.telephone as string, jardinier.nom)}
                        >
                          {jardinier.telephone}
                        </button>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="py-2 pr-4">{jardinier.annee_naissance ?? ''}</td>
                    <td className="py-2 pr-4">
                      {jardinier.statut === 'actif' ? 'Actif' : jardinier.statut === 'retraite' ? 'Retraité' : ''}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-4">
                        <button onClick={() => startEdit(jardinier)} className="text-blue-600 text-sm hover:underline">
                          Modifier
                        </button>
                        {jardinier.numero_parcelle !== null && jardinier.numero_parcelle !== undefined && (
                          <button
                            onClick={() => {
                              const ok = window.confirm(
                                `Retirer la parcelle ${jardinier.numero_parcelle} de ${jardinier.nom ?? 'ce jardinier'} ?`
                              );
                              if (ok) handleUnassignParcelle(jardinier);
                            }}
                            className="text-orange-600 text-sm hover:underline"
                          >
                            Retirer parcelle
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDeleteId(jardinier.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmation</h2>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce jardinier ? Cette action est irréversible.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-neutral-400 text-white rounded hover:bg-neutral-500"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirmation</h2>
            <p className="mb-6">
              {confirmContact.kind === 'tel'
                ? `Appeler${confirmContact.nom ? ` ${confirmContact.nom}` : ''} au ${confirmContact.value} ?`
                : `Écrire${confirmContact.nom ? ` à ${confirmContact.nom}` : ''} (${confirmContact.value}) ?`}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmContact(null)}
                className="px-4 py-2 bg-neutral-400 text-white rounded hover:bg-neutral-500"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (confirmContact.kind === 'tel') {
                    const tel = normalizeTel(confirmContact.value);
                    if (tel) window.location.href = `tel:${tel}`;
                  } else {
                    window.location.href = `mailto:${confirmContact.value}`;
                  }
                  setConfirmContact(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJardiniersPage;
