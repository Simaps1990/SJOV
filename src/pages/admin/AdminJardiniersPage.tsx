import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link2Off, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import type { Jardinier, Parcelle, SecteurParcelle } from '../../types';

type SortKey = 'nom' | 'numero_parcelle' | 'email' | 'telephone' | 'anciennete' | 'annee_naissance' | 'statut';

type SortDir = 'asc' | 'desc';

type ProgressRingProps = {
  percent: number;
  size?: number;
  stroke?: number;
  className?: string;
};

const ProgressRing: React.FC<ProgressRingProps> = ({ percent, size = 52, stroke = 6, className }) => {
  const pct = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className={className}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          opacity={0.15}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-neutral-800">{Math.round(pct)}%</span>
      </div>
    </div>
  );
};

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
  const [anciennete, setAnciennete] = useState('');
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
    setAnciennete('');
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
    setAnciennete(jardinier.anciennete !== null && jardinier.anciennete !== undefined ? String(jardinier.anciennete) : '');
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

  const normalizeNumeroParcelle = (value: string) => value.trim().replace(/\s+/g, ' ');

  const parseNumeroParcelleForSort = (value: string | null) => {
    const v = normalizeNumeroParcelle(value ?? '');
    const m = v.match(/^(\d+)\s*(.*)$/);
    if (!m) return { num: Number.POSITIVE_INFINITY, suffix: v.toLocaleLowerCase() };
    return { num: Number(m[1]), suffix: (m[2] ?? '').trim().toLocaleLowerCase() };
  };

  const parcellesDisponibles = useMemo(() => {
    const assigned = new Set(
      jardiniers
        .filter((j) => j.id !== editingId)
        .map((j) => j.numero_parcelle)
        .filter((n): n is string => n !== null && n !== undefined)
    );

    return parcelles
      .filter((p) => p.numero_parcelle !== null && p.numero_parcelle !== undefined)
      .filter((p) => !assigned.has(p.numero_parcelle as string))
      .sort((a, b) => {
        const pa = parseNumeroParcelleForSort(a.numero_parcelle);
        const pb = parseNumeroParcelleForSort(b.numero_parcelle);
        if (pa.num !== pb.num) return pa.num - pb.num;
        return pa.suffix.localeCompare(pb.suffix, 'fr');
      });
  }, [parcelles, jardiniers, editingId]);

  const parcellesDisponiblesFiltrees = useMemo(() => {
    const q = normalizeNumeroParcelle(numeroParcelle);
    if (!q) return parcellesDisponibles;
    const ql = q.toLocaleLowerCase();
    return parcellesDisponibles.filter((p) => String(p.numero_parcelle ?? '').toLocaleLowerCase().includes(ql));
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

      if (sortKey === 'annee_naissance' || sortKey === 'anciennete') {
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
  }, [jardiniers, sortKey, sortDir]);

  const jardiniersStats = useMemo(() => {
    const total = jardiniers.length;
    const actifs = jardiniers.filter((j) => j.statut === 'actif').length;
    const retraites = jardiniers.filter((j) => j.statut === 'retraite').length;

    const nowYear = new Date().getFullYear();
    const ages = jardiniers
      .map((j) => j.annee_naissance)
      .filter((y): y is number => typeof y === 'number' && Number.isFinite(y))
      .map((y) => nowYear - y)
      .filter((a) => a > 0 && a < 130);

    const avgAge = ages.length ? ages.reduce((sum, a) => sum + a, 0) / ages.length : null;

    return {
      total,
      actifs,
      retraites,
      pctActifs: total ? (actifs / total) * 100 : 0,
      pctRetraites: total ? (retraites / total) * 100 : 0,
      avgAge,
    };
  }, [jardiniers]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const numeroParcelleValue = normalizeNumeroParcelle(numeroParcelle);

    if (numeroParcelleValue) {
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

    const ancienneteValue = anciennete.trim() ? Number(anciennete) : null;
    if (anciennete.trim() && Number.isNaN(ancienneteValue)) {
      setError("L'ancienneté doit être un nombre.");
      return;
    }

    const payload = {
      nom: nom.trim() || null,
      numero_parcelle: numeroParcelleValue ? numeroParcelleValue : null,
      email: email.trim() || null,
      telephone: telephone.trim() || null,
      anciennete: ancienneteValue,
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
    return sortDir === 'asc' ? '▲' : '▼';
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
                placeholder="Ex: 12 bis"
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
            <label className="block text-sm font-medium text-gray-700">Ancienneté</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={anciennete}
              onChange={(e) => setAnciennete(e.target.value)}
              placeholder="Ex: 5"
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-800">Actifs</div>
                  <div className="text-xs text-neutral-600">
                    {jardiniersStats.actifs}/{jardiniersStats.total}
                  </div>
                </div>
                <ProgressRing percent={jardiniersStats.pctActifs} className="text-green-600" />
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-800">Retraités</div>
                  <div className="text-xs text-neutral-600">
                    {jardiniersStats.retraites}/{jardiniersStats.total}
                  </div>
                </div>
                <ProgressRing percent={jardiniersStats.pctRetraites} className="text-orange-600" />
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-800">Âge moyen</div>
                  <div className="text-xs text-neutral-600">(sur les dates renseignées)</div>
                </div>
                <div className="text-2xl font-bold text-neutral-800">
                  {jardiniersStats.avgAge === null ? '—' : Math.round(jardiniersStats.avgAge)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('nom')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('nom') || ' '}</span>
                      <span>Nom</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('numero_parcelle')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('numero_parcelle') || ' '}</span>
                      <span>Parcelle</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('email')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('email') || ' '}</span>
                      <span>Email</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('telephone')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('telephone') || ' '}</span>
                      <span>Téléphone</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('annee_naissance')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('annee_naissance') || ' '}</span>
                      <span>Naissance</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('anciennete')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('anciennete') || ' '}</span>
                      <span>Ancienneté</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold flex flex-col items-start leading-none"
                      onClick={() => toggleSort('statut')}
                    >
                      <span className="text-[10px] h-3">{sortIndicator('statut') || ' '}</span>
                      <span>Statut</span>
                    </button>
                  </th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedJardiniers.map((jardinier) => (
                  <tr key={jardinier.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 md:pr-4 font-medium text-gray-900">{jardinier.nom ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4">
                      <div className="flex items-center gap-1">
                        <span>{jardinier.numero_parcelle ?? ''}</span>
                        {jardinier.numero_parcelle !== null && jardinier.numero_parcelle !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              const ok = window.confirm(
                                `Retirer la parcelle ${jardinier.numero_parcelle} de ${jardinier.nom ?? 'ce jardinier'} ?`
                              );
                              if (ok) handleUnassignParcelle(jardinier);
                            }}
                            className="text-orange-600 hover:text-orange-800 p-1"
                            aria-label="Retirer la parcelle"
                            title="Retirer la parcelle"
                          >
                            <Link2Off size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-2 md:pr-4">
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
                    <td className="py-2 pr-2 md:pr-4">
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
                    <td className="py-2 pr-2 md:pr-4">{jardinier.annee_naissance ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4">{jardinier.anciennete ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4">
                      {jardinier.statut === 'actif' ? 'Actif' : jardinier.statut === 'retraite' ? 'Retraité' : ''}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(jardinier)}
                          className="p-1.5 text-blue-600 hover:text-blue-800"
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(jardinier.id)}
                          className="p-1.5 text-red-600 hover:text-red-800"
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
