import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import type { Parcelle, SecteurParcelle } from '../../types';

type SortKey = 'numero_parcelle' | 'surface_m2' | 'secteur';

type SortDir = 'asc' | 'desc';

const normalizeNumeroParcelle = (value: string) => value.trim().replace(/\s+/g, ' ');

const parseNumeroParcelleForSort = (value: string | null) => {
  const v = normalizeNumeroParcelle(value ?? '');
  const m = v.match(/^(\d+)\s*(.*)$/);
  if (!m) return { num: Number.POSITIVE_INFINITY, suffix: v.toLocaleLowerCase() };
  return { num: Number(m[1]), suffix: (m[2] ?? '').trim().toLocaleLowerCase() };
};

const SECTEURS: { value: SecteurParcelle; label: string; badgeClass: string }[] = [
  { value: 'siege', label: 'Secteur Siège', badgeClass: 'bg-blue-100 text-blue-700' },
  { value: 'clos_jacquet', label: 'Secteur Clos Jacquet', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'digue_sud', label: 'Secteur Digue Sud', badgeClass: 'bg-orange-100 text-orange-700' },
  { value: 'digue_nord', label: 'Secteur Digue Nord', badgeClass: 'bg-red-100 text-red-700' },
  { value: 'nord', label: 'Secteur Nord', badgeClass: 'bg-gray-100 text-gray-700' },
];

const AdminParcellesPage: React.FC = () => {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [numeroParcelle, setNumeroParcelle] = useState('');
  const [surfaceM2, setSurfaceM2] = useState('');
  const [secteur, setSecteur] = useState<SecteurParcelle | ''>('');

  const [sortKey, setSortKey] = useState<SortKey>('numero_parcelle');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fetchParcelles = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('parcelles')
      .select('*');

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setParcelles((data as Parcelle[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchParcelles();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNumeroParcelle('');
    setSurfaceM2('');
    setSecteur('');
    setError(null);
    setSuccess(null);
  };

  const startEdit = (parcelle: Parcelle) => {
    setEditingId(parcelle.id);
    setNumeroParcelle(parcelle.numero_parcelle !== null && parcelle.numero_parcelle !== undefined ? String(parcelle.numero_parcelle) : '');
    setSurfaceM2(parcelle.surface_m2 !== null && parcelle.surface_m2 !== undefined ? String(parcelle.surface_m2) : '');
    setSecteur((parcelle.secteur as SecteurParcelle) || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedParcelles = useMemo(() => {
    const list = [...parcelles];

    const compare = (a: Parcelle, b: Parcelle) => {
      const dir = sortDir === 'asc' ? 1 : -1;

      if (sortKey === 'surface_m2') {
        const va = Number(a[sortKey] ?? 0);
        const vb = Number(b[sortKey] ?? 0);
        return (va - vb) * dir;
      }

      if (sortKey === 'numero_parcelle') {
        const pa = parseNumeroParcelleForSort(a.numero_parcelle);
        const pb = parseNumeroParcelleForSort(b.numero_parcelle);
        if (pa.num !== pb.num) return (pa.num - pb.num) * dir;
        return pa.suffix.localeCompare(pb.suffix, 'fr') * dir;
      }

      const sa = String(a[sortKey] ?? '').toLocaleLowerCase();
      const sb = String(b[sortKey] ?? '').toLocaleLowerCase();
      return sa.localeCompare(sb, 'fr') * dir;
    };

    return list.sort(compare);
  }, [parcelles, sortKey, sortDir]);

  const parcellesStats = useMemo(() => {
    const totalM2 = parcelles
      .map((p) => p.surface_m2)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
      .reduce((sum, v) => sum + v, 0);

    const totalAvecSurface = parcelles
      .map((p) => p.surface_m2)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).length;

    const avgM2Global = totalAvecSurface ? totalM2 / totalAvecSurface : null;

    const bySecteur = SECTEURS.map((s) => {
      const list = parcelles.filter((p) => p.secteur === s.value);
      const count = list.length;
      const surfaces = list
        .map((p) => p.surface_m2)
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
      const sumM2 = surfaces.reduce((sum, v) => sum + v, 0);
      const countAvecSurface = surfaces.length;
      const avgM2 = countAvecSurface ? sumM2 / countAvecSurface : null;
      return { ...s, count, avgM2 };
    });

    return { totalM2, bySecteur, avgM2Global };
  }, [parcelles]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const numeroParcelleValue = normalizeNumeroParcelle(numeroParcelle);

    const surfaceM2Value = surfaceM2.trim() ? Number(surfaceM2) : null;
    if (surfaceM2.trim() && Number.isNaN(surfaceM2Value)) {
      setError('La surface (m²) doit être un nombre.');
      return;
    }

    const payload = {
      numero_parcelle: numeroParcelleValue ? numeroParcelleValue : null,
      surface_m2: surfaceM2Value,
      secteur: secteur || null,
    };

    if (editingId) {
      const { error: updateError } = await supabase.from('parcelles').update(payload).eq('id', editingId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess('Parcelle mise à jour.');
    } else {
      const { error: insertError } = await supabase.from('parcelles').insert([payload]);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setSuccess('Parcelle ajoutée.');
    }

    await fetchParcelles();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);

    const { data: parcelleData, error: parcelleError } = await supabase
      .from('parcelles')
      .select('numero_parcelle')
      .eq('id', id)
      .maybeSingle();

    if (parcelleError) {
      setError(parcelleError.message);
      return;
    }

    const numero = (parcelleData as { numero_parcelle: string | null } | null)?.numero_parcelle ?? null;

    if (numero !== null && numero !== undefined) {
      const { error: unassignError } = await supabase
        .from('jardiniers')
        .update({ numero_parcelle: null })
        .eq('numero_parcelle', numero);

      if (unassignError) {
        setError(unassignError.message);
        return;
      }
    }

    const { error: deleteError } = await supabase.from('parcelles').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess('Parcelle supprimée.');
    setConfirmDeleteId(null);
    await fetchParcelles();
    if (editingId === id) {
      resetForm();
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? '▲' : '▼';
  };

  const secteurBadge = (value: SecteurParcelle | null) => {
    if (!value) return null;
    const found = SECTEURS.find((s) => s.value === value);
    return found ? found : null;
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des parcelles</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">{editingId ? 'Modifier une parcelle' : 'Ajouter une parcelle'}</h2>

        {error && <p className="text-red-600 font-medium">{error}</p>}
        {success && <p className="text-green-700 font-medium">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Numéro de parcelle</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={numeroParcelle}
              onChange={(e) => setNumeroParcelle(e.target.value)}
              placeholder="Ex: 12 bis"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Surface (m²)</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={surfaceM2}
              onChange={(e) => setSurfaceM2(e.target.value)}
              placeholder="Ex: 80"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Secteur</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={secteur}
              onChange={(e) => setSecteur(e.target.value as SecteurParcelle | '')}
            >
              <option value="">-- Aucun --</option>
              {SECTEURS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste des parcelles</h2>

        {loading ? (
          <p className="text-neutral-500">Chargement...</p>
        ) : sortedParcelles.length === 0 ? (
          <p className="text-neutral-500">Aucune parcelle enregistrée.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="text-sm font-semibold text-neutral-800">M² totaux exploités</div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">{Math.round(parcellesStats.totalM2)}</div>
                </div>
                <div className="border-t border-neutral-200 p-4">
                  <div className="text-sm font-semibold text-neutral-800">Moyenne m² / parcelle</div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">
                    {parcellesStats.avgM2Global === null ? '—' : Math.round(parcellesStats.avgM2Global)}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-neutral-800 mb-2">Parcelles par secteur</div>
                <div className="space-y-2">
                  {parcellesStats.bySecteur.map((s) => (
                    <div key={s.value} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${s.badgeClass}`}>{s.label}</span>
                      <span className="text-sm font-semibold text-neutral-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-neutral-800 mb-2">Moyenne m² / secteur</div>
                <div className="space-y-2">
                  {parcellesStats.bySecteur.map((s) => (
                    <div key={s.value} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${s.badgeClass}`}>{s.label}</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {s.avgM2 === null ? '—' : Math.round(s.avgM2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('numero_parcelle')}
                    >
                      <span className="leading-none">
                        <span className="hidden md:inline">Parcelle</span>
                        <span className="md:hidden">N°</span>
                      </span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('numero_parcelle') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('surface_m2')}
                    >
                      <span className="leading-none">M²</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('surface_m2') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-0 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('secteur')}
                    >
                      <span className="leading-none">Secteur</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('secteur') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2">
                    <span className="font-semibold inline-flex items-center gap-1 leading-none">
                      <span className="leading-none">Actions</span>
                      <span className="w-3 text-[10px] leading-none" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedParcelles.map((parcelle) => {
                  const badge = secteurBadge(parcelle.secteur);
                  return (
                    <tr key={parcelle.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 md:pr-4 font-medium text-gray-900">{parcelle.numero_parcelle}</td>
                      <td className="py-2 pr-2 md:pr-4">{parcelle.surface_m2}</td>
                      <td className="py-2 pr-0 md:pr-4">
                        {badge ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1 md:gap-4">
                          <button
                            type="button"
                            onClick={() => startEdit(parcelle)}
                            className="p-1.5 text-blue-600 hover:text-blue-800"
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(parcelle.id)}
                            className="p-1.5 text-red-600 hover:text-red-800"
                            aria-label="Supprimer"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmation</h2>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette parcelle ? Cette action est irréversible.</p>
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
    </div>
  );
};

export default AdminParcellesPage;
