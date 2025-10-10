# Éditeur WYSIWYG - React-Quill

## Changements effectués

### ✅ Installation
- **react-quill** : Bibliothèque d'éditeur de texte riche WYSIWYG pour React

### ✅ Composant créé
- **`src/components/RichTextEditor.tsx`** : Composant réutilisable avec barre d'outils complète

### ✅ Pages mises à jour

#### 1. AdminBlogPage
- ❌ Supprimé : Boutons individuels (Gras, Italique, Souligné, etc.)
- ❌ Supprimé : `contentRef` avec `contentEditable`
- ✅ Ajouté : `RichTextEditor` avec toutes les fonctionnalités

#### 2. AdminEventsPage
- ❌ Supprimé : Boutons individuels de formatage
- ❌ Supprimé : `contentRef` avec `contentEditable`
- ✅ Ajouté : `RichTextEditor` avec toutes les fonctionnalités

#### 3. AdminSettingsPage
- ❌ Supprimé : Boutons individuels de formatage
- ❌ Supprimé : `editorRef` avec `contentEditable`
- ✅ Ajouté : `RichTextEditor` avec toutes les fonctionnalités

## Fonctionnalités de l'éditeur

L'éditeur React-Quill offre une barre d'outils complète avec :

### Formatage de texte
- **Titres** : H1, H2, H3, H4, H5, H6
- **Police** : Sélection de différentes polices
- **Taille** : Petit, Normal, Grand, Très grand
- **Style** : Gras, Italique, Souligné, Barré
- **Couleur** : Couleur du texte et couleur de fond
- **Script** : Exposant et indice

### Mise en page
- **Listes** : Numérotées et à puces
- **Indentation** : Augmenter/Diminuer
- **Alignement** : Gauche, Centre, Droite, Justifié

### Médias et liens
- **Liens** : Insertion de liens hypertextes
- **Images** : Insertion d'images
- **Vidéos** : Insertion de vidéos

### Autres
- **Citation** : Bloc de citation
- **Code** : Bloc de code
- **Nettoyer** : Supprimer le formatage

## Utilisation

```tsx
import RichTextEditor from '../../components/RichTextEditor';

// Dans votre composant
const [content, setContent] = useState('');

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Écrivez votre contenu ici..."
  minHeight="300px"
/>
```

## Avantages

✅ **Interface intuitive** : Barre d'outils visuelle avec icônes
✅ **Toutes les options en un seul endroit** : Plus besoin de boutons séparés
✅ **Prévisualisation en temps réel** : WYSIWYG (What You See Is What You Get)
✅ **Plus professionnel** : Interface moderne et épurée
✅ **Facilité d'utilisation** : Expérience utilisateur améliorée
✅ **Maintenance simplifiée** : Code plus propre et réutilisable

## Styles personnalisés

Les styles de l'éditeur sont définis dans `src/index.css` :
- Bordures arrondies
- Fond gris clair pour la barre d'outils
- Hauteur minimale configurable
- Placeholder en italique gris

## Compatibilité

L'éditeur génère du HTML standard qui est compatible avec :
- Tous les navigateurs modernes
- Le système d'affichage existant (dangerouslySetInnerHTML)
- Les données déjà stockées dans Supabase
