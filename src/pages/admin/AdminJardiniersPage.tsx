import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link2Off, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import type { Jardinier, Parcelle, SecteurParcelle } from '../../types';

type SortKey = 'nom' | 'numero_parcelle' | 'email' | 'telephone' | 'anciennete' | 'annee_naissance' | 'statut';

type SortDir = 'asc' | 'desc';

type MultiStatusRingProps = {
  pctActifs: number;
  pctRetraites: number;
  pctNonRenseigne: number;
  size?: number;
  stroke?: number;
};

const MultiStatusRing: React.FC<MultiStatusRingProps> = ({
  pctActifs,
  pctRetraites,
  pctNonRenseigne,
  size = 72,
  stroke = 8,
}) => {
  const safe = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
  const a = safe(pctActifs);
  const r = safe(pctRetraites);
  const n = safe(pctNonRenseigne);
  const total = a + r + n || 1;

  const fa = a / total;
  const fr = r / total;
  const fn = n / total;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const segLength = (f: number) => circumference * f;

  const startActifs = 0;
  const startRetraites = fa;
  const startNonRenseigne = fa + fr;

  return (
    <svg width={size} height={size} className="text-neutral-200">
      {/* fond cercle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={stroke}
        opacity={0.3}
      />

      {/* Actifs - vert */}
      {fa > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#16a34a"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${segLength(fa)} ${circumference - segLength(fa)}`}
          transform={`rotate(${(startActifs * 360 - 90).toFixed(3)} ${size / 2} ${size / 2})`}
        />
      )}

      {/* Retraités - orange */}
      {fr > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#ea580c"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${segLength(fr)} ${circumference - segLength(fr)}`}
          transform={`rotate(${(startRetraites * 360 - 90).toFixed(3)} ${size / 2} ${size / 2})`}
        />
      )}

      {/* Non renseigné - gris */}
      {fn > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#9ca3af"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${segLength(fn)} ${circumference - segLength(fn)}`}
          transform={`rotate(${(startNonRenseigne * 360 - 90).toFixed(3)} ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
};

const AdminJardiniersPage: React.FC = () => {
  const [jardiniers, setJardiniers] = useState<Jardinier[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [confirmContact, setConfirmContact] = useState<
    | { kind: 'tel' | 'email'; value: string; nom: string | null }
    | null
  >(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [numeroParcelle, setNumeroParcelle] = useState('');
  const [adresse, setAdresse] = useState('');
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
    setAdresse('');
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
    setAdresse(jardinier.adresse || '');
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

  const secteurBadge = (value: SecteurParcelle | null) => {
    if (!value) return null;
    if (value === 'siege') return { label: 'Siège', badgeClass: 'bg-blue-100 text-blue-700' };
    if (value === 'clos_jacquet') return { label: 'Clos Jacquet', badgeClass: 'bg-green-100 text-green-700' };
    if (value === 'digue_sud') return { label: 'Digue Sud', badgeClass: 'bg-orange-100 text-orange-700' };
    if (value === 'digue_nord') return { label: 'Digue Nord', badgeClass: 'bg-red-100 text-red-700' };
    return { label: 'Nord', badgeClass: 'bg-gray-100 text-gray-700' };
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

  const filteredJardiniers = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase();
    if (!q) return jardiniers;

    const tokens = q.split(/\s+/).filter(Boolean);
    const toText = (value: unknown) => String(value ?? '').toLocaleLowerCase();

    return jardiniers.filter((j) => {
      const numero = j.numero_parcelle;
      const p = numero !== null && numero !== undefined ? parcelles.find((x) => x.numero_parcelle === numero) : undefined;
      const secteurLong = p?.secteur ? secteurLabel(p.secteur as SecteurParcelle) : '';
      const secteurShort = secteurLong.replace(/^secteur\s+/i, '');

      const haystack = [
        toText(j.nom),
        toText(j.telephone),
        toText(j.anciennete),
        toText(j.numero_parcelle),
        toText(secteurShort),
        toText(p?.secteur),
      ].join(' ');

      return tokens.every((t) => haystack.includes(t));
    });
  }, [jardiniers, parcelles, searchQuery]);

  const sortedJardiniers = useMemo(() => {
    const list = [...filteredJardiniers];

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
  }, [filteredJardiniers, sortKey, sortDir]);

  const jardiniersStats = useMemo(() => {
    const total = jardiniers.length;
    const actifs = jardiniers.filter((j) => j.statut === 'actif').length;
    const retraites = jardiniers.filter((j) => j.statut === 'retraite').length;
    const nonRenseigne = total - actifs - retraites;

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
      nonRenseigne,
      pctActifs: total ? (actifs / total) * 100 : 0,
      pctRetraites: total ? (retraites / total) * 100 : 0,
      pctNonRenseigne: total ? (nonRenseigne / total) * 100 : 0,
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
      adresse: adresse.trim() || null,
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
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse"
            />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-800">Répartition des statuts</div>
                  <div className="mt-2 space-y-1 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
                      <span>
                        Actifs ({jardiniersStats.actifs}/{jardiniersStats.total})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
                      <span>
                        Retraités ({jardiniersStats.retraites}/{jardiniersStats.total})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />
                      <span>
                        Non renseigné ({jardiniersStats.nonRenseigne}/{jardiniersStats.total})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MultiStatusRing
                    pctActifs={jardiniersStats.pctActifs}
                    pctRetraites={jardiniersStats.pctRetraites}
                    pctNonRenseigne={jardiniersStats.pctNonRenseigne}
                  />
                  <div className="text-xs text-neutral-700 space-y-1 min-w-[70px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-green-700 font-medium">Actifs</span>
                      <span>{Math.round(jardiniersStats.pctActifs)}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-orange-700 font-medium">Retraités</span>
                      <span>{Math.round(jardiniersStats.pctRetraites)}%</span>
                    </div>
                  </div>
                </div>
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

            <div className="mb-4">
              <input
                className="w-full border border-neutral-300 rounded px-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (nom, prénom, secteur, téléphone, depuis, parcelle...)"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('nom')}
                    >
                      <span className="leading-none">Nom</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('nom') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('numero_parcelle')}
                    >
                      <span className="leading-none">Parcelle</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('numero_parcelle') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('anciennete')}
                    >
                      <span className="leading-none">Depuis</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('anciennete') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <span className="font-semibold inline-flex items-center gap-1 leading-none">
                      <span className="leading-none">Adresse</span>
                      <span className="w-3 text-[10px] leading-none" />
                    </span>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('email')}
                    >
                      <span className="leading-none">Email</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('email') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4 min-w-[140px]">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('telephone')}
                    >
                      <span className="leading-none">Téléphone</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('telephone') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4 min-w-[90px]">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('annee_naissance')}
                    >
                      <span className="leading-none">Né en</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('annee_naissance') || ''}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-2 md:pr-4">
                    <button
                      className="font-semibold inline-flex items-center gap-1 leading-none"
                      onClick={() => toggleSort('statut')}
                    >
                      <span className="leading-none">Statut</span>
                      <span className="w-3 text-[10px] leading-none">{sortIndicator('statut') || ''}</span>
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
                {sortedJardiniers.map((jardinier) => (
                  <tr key={jardinier.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 md:pr-4 align-top font-medium text-gray-900">{jardinier.nom ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4 align-top">
                      {(() => {
                        const numero = jardinier.numero_parcelle;
                        const p = numero !== null && numero !== undefined ? parcelles.find((x) => x.numero_parcelle === numero) : undefined;
                        const badge = secteurBadge((p?.secteur as SecteurParcelle | null) ?? null);

                        return (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-start gap-1">
                              <span>{numero ?? ''}</span>
                              {numero !== null && numero !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ok = window.confirm(
                                      `Retirer la parcelle ${numero} de ${jardinier.nom ?? 'ce jardinier'} ?`
                                    );
                                    if (ok) handleUnassignParcelle(jardinier);
                                  }}
                                  className="text-orange-600 hover:text-orange-800 p-0.5"
                                  aria-label="Retirer la parcelle"
                                  title="Retirer la parcelle"
                                >
                                  <Link2Off size={18} />
                                </button>
                              )}
                            </div>

                            {badge ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge.badgeClass}`}>
                                {badge.label}
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2 pr-2 md:pr-4 align-top">{jardinier.anciennete ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4 align-top">{jardinier.adresse ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4 align-top">
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
                    <td className="py-2 pr-2 md:pr-4 min-w-[140px] align-top">
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
                    <td className="py-2 pr-2 md:pr-4 min-w-[90px] align-top">{jardinier.annee_naissance ?? ''}</td>
                    <td className="py-2 pr-2 md:pr-4 align-top">{jardinier.statut ?? ''}</td>
                    <td className="py-2 align-top">
                      <div className="flex items-center gap-1 md:gap-4">
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
