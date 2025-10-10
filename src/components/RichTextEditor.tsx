import React, { useMemo, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Écrivez votre contenu ici...',
  minHeight = '200px',
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Tooltips personnalisés en français avec explications
  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().getModule('toolbar');
      const toolbarElement = toolbar.container;

      // Définir les tooltips avec titre et explication
      const tooltips: { [key: string]: string } = {
        '.ql-bold': 'Gras - Met le texte en caractères gras (Ctrl+B)',
        '.ql-italic': 'Italique - Met le texte en italique (Ctrl+I)',
        '.ql-underline': 'Souligné - Souligne le texte sélectionné (Ctrl+U)',
        '.ql-strike': 'Barré - Barre le texte sélectionné',
        '.ql-link': 'Lien - Insère un lien hypertexte vers une page web',
        '.ql-list[value="ordered"]': 'Liste numérotée - Crée une liste avec des numéros (1, 2, 3...)',
        '.ql-list[value="bullet"]': 'Liste à puces - Crée une liste avec des points',
        '.ql-align[value=""]': 'Aligner à gauche - Aligne le texte sur le bord gauche',
        '.ql-align[value="center"]': 'Centrer - Centre le texte au milieu',
        '.ql-align[value="right"]': 'Aligner à droite - Aligne le texte sur le bord droit',
        '.ql-align[value="justify"]': 'Justifier - Aligne le texte sur les deux bords',
        '.ql-color': 'Couleur du texte - Change la couleur des caractères',
        '.ql-background': 'Couleur de fond - Surligne le texte avec une couleur',
        '.ql-font': 'Police - Change le style de la police de caractères',
        '.ql-size[value="small"]': 'Petit - Réduit la taille du texte',
        '.ql-size[value="large"]': 'Grand - Augmente la taille du texte',
        '.ql-size[value="huge"]': 'Très grand - Texte en très grande taille',
      };

      // Appliquer les tooltips
      Object.entries(tooltips).forEach(([selector, title]) => {
        const elements = toolbarElement.querySelectorAll(selector);
        elements.forEach((el: Element) => {
          (el as HTMLElement).setAttribute('title', title);
        });
      });
    }
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
      ],
    }),
    []
  );

  const formats = [
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
