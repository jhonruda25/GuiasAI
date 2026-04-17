'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { WorkGuide } from '@repo/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { markAsReviewed } from '@/services/work-guide.api';
import { FillBlanksActivity } from './activities/FillBlanksActivity';
import { MatchConceptsActivity } from './activities/MatchConceptsActivity';
import { WordSearchGrid } from './activities/WordSearchGrid';
import { CrosswordActivity } from './activities/CrosswordActivity';
import { SequentialImageActivity } from './activities/SequentialImageActivity';
import { BonusActivity } from './activities/BonusActivity';
import { MultipleChoiceActivity } from './activities/MultipleChoiceActivity';
import { TrueFalseActivity } from './activities/TrueFalseActivity';
import { WordScrambleActivity } from './activities/WordScrambleActivity';
import { DictationActivity } from './activities/DictationActivity';
import { SentenceOrderActivity } from './activities/SentenceOrderActivity';
import { ErrorIdentificationActivity } from './activities/ErrorIdentificationActivity';
import { TableCompletionActivity } from './activities/TableCompletionActivity';

interface WorkGuidePreviewProps {
  workGuide: WorkGuide & { id?: string; language?: string; reviewed?: boolean; reviewedBy?: string | null; reviewedAt?: string | null };
  onReset: () => void;
}

interface ExportInfo {
  school: string;
  slogan: string;
  examType: string;
  subject: string;
  grade: string;
  teacher: string;
  term: string;
  date: string;
  studentName: boolean;
  logoUrl?: string;
  twoColumns: boolean;
  instructionsText: string;
  competenceText: string;
  includeRubric: boolean;
  includeSignature: boolean;
  includePageNumbers: boolean;
  compactMode: boolean;
  includeInstructions: boolean;
  includeCompetencies: boolean;
  includeActivityScores: boolean;
}

const EXPORT_PREFS_KEY = 'guiasai_export_prefs';

function getLocalizedDate(isEn: boolean) {
  return new Date().toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDefaultExportInfo(isEn: boolean): ExportInfo {
  return {
    school: '',
    slogan: 'Educating to grow',
    examType: 'MID TERM',
    subject: '',
    grade: '',
    teacher: '',
    term: '',
    date: '',
    studentName: true,
    twoColumns: true,
    instructionsText: isEn
      ? 'Read carefully each item, and answer according with the instruction, if you use a pencil, you are NOT allowed to make a claim. Use colors only in the requested item.'
      : 'Lea cuidadosamente cada item y responda de acuerdo con la instruccion. Si usa lapiz, NO se aceptaran reclamos posteriores. Use colores solo en los items donde se le solicite.',
    competenceText: isEn
      ? 'Learners develop the ability to use a range of language to write text for different purposes, using a variety of written genres. Learners also develop the skills to express their opinion.'
      : 'Los estudiantes desarrollan la habilidad de usar un rango de vocabulario para escribir textos para diferentes propositos, usando una variedad de generos escritos, y expresan su opinion.',
    includeRubric: true,
    includeSignature: true,
    includePageNumbers: true,
    compactMode: false,
    includeInstructions: true,
    includeCompetencies: true,
    includeActivityScores: true,
  };
}

function getStoredExportInfo(isEn: boolean): ExportInfo {
  const defaults = getDefaultExportInfo(isEn);

  try {
    const saved = localStorage.getItem(EXPORT_PREFS_KEY);
    if (!saved) {
      return { ...defaults, date: getLocalizedDate(isEn) };
    }

    const parsed = JSON.parse(saved) as Partial<ExportInfo>;
    return {
      ...defaults,
      ...parsed,
      date: parsed.date || getLocalizedDate(isEn),
    };
  } catch (error) {
    console.error('Failed to load local settings', error);
    return { ...defaults, date: getLocalizedDate(isEn) };
  }
}

const ACTIVITY_TYPE_LABELS: Record<string, Record<string, string>> = {
  WORD_SEARCH: { es: 'Sopa de Letras', en: 'Word Search' },
  CROSSWORD: { es: 'Crucigrama', en: 'Crossword' },
  FILL_BLANKS: { es: 'Completa los Espacios', en: 'Fill in the Blanks' },
  MATCH_CONCEPTS: { es: 'Une con una Línea', en: 'Match Concepts' },
  SEQUENTIAL_IMAGE_ANALYSIS: { es: 'Análisis de Imágenes', en: 'Image Analysis' },
  BONUS: { es: 'Reto Bonus', en: 'Bonus Challenge' },
  MULTIPLE_CHOICE: { es: 'Selección Múltiple', en: 'Multiple Choice' },
  TRUE_FALSE: { es: 'Verdadero o Falso', en: 'True or False' },
  WORD_SCRAMBLE: { es: 'Palabras Revueltas', en: 'Word Scramble' },
  DICTATION: { es: 'Dictado', en: 'Dictation' },
  SENTENCE_ORDER: { es: 'Ordenar Oraciones', en: 'Sentence Order' },
  ERROR_IDENTIFICATION: { es: 'Identificar Errores', en: 'Error Identification' },
  TABLE_COMPLETION: { es: 'Completar Tabla', en: 'Table Completion' },
};

function ActivityRenderer({ activity, language, theme }: { activity: WorkGuide['activities'][number], language?: string, theme?: { color: string; emoji: string; } }) {
  const props = { activity: activity as any, language, theme };
  
  switch (activity.type) {
    case 'FILL_BLANKS': return <FillBlanksActivity {...props} />;
    case 'MATCH_CONCEPTS': return <MatchConceptsActivity {...props} />;
    case 'WORD_SEARCH': return <WordSearchGrid {...props} />;
    case 'CROSSWORD': return <CrosswordActivity {...props} />;
    case 'SEQUENTIAL_IMAGE_ANALYSIS': return <SequentialImageActivity {...props} />;
    case 'BONUS': return <BonusActivity {...props} />;
    case 'MULTIPLE_CHOICE': return <MultipleChoiceActivity {...props} />;
    case 'TRUE_FALSE': return <TrueFalseActivity {...props} />;
    case 'WORD_SCRAMBLE': return <WordScrambleActivity {...props} />;
    case 'DICTATION': return <DictationActivity {...props} />;
    case 'SENTENCE_ORDER': return <SentenceOrderActivity {...props} />;
    case 'ERROR_IDENTIFICATION': return <ErrorIdentificationActivity {...props} />;
    case 'TABLE_COMPLETION': return <TableCompletionActivity {...props} />;
    default: return null;
  }
}

export function WorkGuidePreview({ workGuide, onReset }: WorkGuidePreviewProps) {
  const isEn = workGuide.language === 'en';

  const [showExportModal, setShowExportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [isReviewed, setIsReviewed] = useState(workGuide.reviewed || false);
  const printRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<ExportInfo>({
    school: '',
    slogan: 'Educating to grow',
    examType: 'MID TERM',
    subject: '',
    grade: '',
    teacher: '',
    term: '',
    date: '', // SSR fallback
    studentName: true,
    twoColumns: true,
    instructionsText: isEn
      ? 'Read carefully each item, and answer according with the instruction, if you use a pencil, you are NOT allowed to make a claim. Use colors only in the requested item.'
      : 'Lea cuidadosamente cada ítem y responda de acuerdo con la instrucción. Si usa lápiz, NO se aceptarán reclamos posteriores. Use colores solo en los ítems donde se le solicite.',
    competenceText: isEn
      ? 'Learners develop the ability to use a range of language to write text for different purposes, using a variety of written genres. Learners also develop the skills to express their opinion.'
      : 'Los estudiantes desarrollan la habilidad de usar un rango de vocabulario para escribir textos para diferentes propósitos, usando una variedad de géneros escritos, y expresan su opinión.',
    includeRubric: true,
    includeSignature: true,
    includePageNumbers: true,
    compactMode: false,
    includeInstructions: true,
    includeCompetencies: true,
    includeActivityScores: true,
  });

  useEffect(() => {
    startTransition(() => {
      setInfo(getStoredExportInfo(isEn));
    });
  }, [isEn]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo((current) => ({ ...current, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const savePrefs = () => {
    localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify({
      school: info.school,
      slogan: info.slogan,
      teacher: info.teacher,
      logoUrl: info.logoUrl,
      twoColumns: info.twoColumns,
      instructionsText: info.instructionsText,
      competenceText: info.competenceText,
      includeRubric: info.includeRubric,
      includeSignature: info.includeSignature,
      includeCompactMode: info.compactMode,
      includeInstructions: info.includeInstructions,
      includeCompetencies: info.includeCompetencies,
      includeActivityScores: info.includeActivityScores,
    }));
  };

  const handleExport = () => {
    savePrefs();
    setShowExportModal(false);
    // Small delay to allow the modal to close and state to settle
    setTimeout(() => {
      const printCSS = `
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          @page { 
            margin: 12mm; 
            size: A4 portrait; 
          }
          #print-root {
            font-size: 10pt;
            line-height: 1.3;
          }
          .print-break-inside { break-inside: avoid; }
          .print-break-after { break-after: always; }
          @page :first {
            margin-top: 10mm;
          }
          /* Fix for extra blank pages */
          html, body { height: auto !important; margin: 0 !important; overflow: visible !important; }
        }
        @media screen {
          #print-root { display: none; }
        }
      `;

      // Inject print styles
      const styleEl = document.createElement('style');
      styleEl.id = '__print-style__';
      styleEl.innerHTML = printCSS;
      document.head.appendChild(styleEl);

      // Create a printable div with the content
      const printRoot = document.createElement('div');
      printRoot.id = 'print-root';
      if (printRef.current) {
        printRoot.innerHTML = printRef.current.outerHTML;
      }
      document.body.appendChild(printRoot);

      window.print();

      // Cleanup after print dialog closes
      setTimeout(() => {
        document.head.removeChild(styleEl);
        document.body.removeChild(printRoot);
      }, 1000);
    }, 200);
  };

  const handleReview = async () => {
    if (!reviewerName.trim() || !workGuide.id) return;
    try {
      await markAsReviewed(workGuide.id, reviewerName);
      setIsReviewed(true);
      setShowReviewModal(false);
      setReviewerName('');
    } catch (err) {
      console.error('Error marking as reviewed:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold">{workGuide.topic}</h2>
          {isReviewed && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded mt-1">
              ✓ {isEn ? 'Reviewed by' : 'Revisado por'}: {workGuide.reviewedBy}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isReviewed && (
            <Button variant="outline" onClick={() => setShowReviewModal(true)}>
              ✓ {isEn ? 'Mark as Reviewed' : 'Marcar como Revisado'}
            </Button>
          )}
          <Button variant="outline" onClick={onReset}>{isEn ? 'Create New Guide' : 'Crear Nueva Guía'}</Button>
          <Button onClick={() => setShowExportModal(true)}>📥 {isEn ? 'Export PDF' : 'Exportar PDF'}</Button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">{isEn ? 'Configure PDF Export' : 'Configurar exportación PDF'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'school', label: isEn ? 'School Name' : 'Nombre del colegio', placeholder: 'Colegio Bilingüe...' },
                { key: 'slogan', label: isEn ? 'Slogan' : 'Lema del colegio', placeholder: 'Educating to grow' },
                { key: 'examType', label: isEn ? 'Document / Exam Type' : 'Tipo de Documento', placeholder: 'MID TERM' },
                { key: 'subject', label: isEn ? 'Subject' : 'Materia', placeholder: 'English' },
                { key: 'grade', label: isEn ? 'Grade' : 'Grado', placeholder: 'First' },
                { key: 'teacher', label: isEn ? 'Teacher' : 'Docente', placeholder: 'Nombre del docente' },
                { key: 'term', label: isEn ? 'Term' : 'Período', placeholder: 'First' },
                { key: 'date', label: isEn ? 'Date' : 'Fecha', placeholder: 'Friday March 06th 2026' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm bg-white"
                    placeholder={placeholder}
                    value={info[key as keyof ExportInfo] as string}
                    onChange={(e) => setInfo((current) => ({ ...current, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Logo Upload Section */}
            <div className="space-y-1 mt-2">
              <label className="text-xs font-medium text-gray-600 flex justify-between items-center">
                {isEn ? 'School Logo' : 'Logo del Colegio'}
                {info.logoUrl && (
                  <button onClick={() => setInfo((current) => ({ ...current, logoUrl: undefined }))} className="text-red-500 hover:text-red-700 text-xs">
                    {isEn ? 'Remove Logo' : 'Quitar Logo'}
                  </button>
                )}
              </label>
              <div className="flex items-center gap-3">
                {info.logoUrl && (
                  <Image
                    src={info.logoUrl}
                    alt="Logo"
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded border object-contain"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">
                  {isEn ? 'Instructions Text' : 'Texto de Instrucciones'}
                </label>
                <label className="flex items-center gap-1 text-[10px] cursor-pointer text-blue-600">
                  <input
                    type="checkbox"
                    checked={info.includeInstructions}
                    onChange={(e) => setInfo((current) => ({ ...current, includeInstructions: e.target.checked }))}
                  />
                  {isEn ? 'Include in PDF' : 'Incluir en PDF'}
                </label>
              </div>
              <textarea
                rows={3}
                disabled={!info.includeInstructions}
                className="w-full border rounded px-2 py-1 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                value={info.instructionsText}
                onChange={e => setInfo((current) => ({ ...current, instructionsText: e.target.value }))}
              />
              
              <div className="flex items-center justify-between mt-2">
                <label className="text-xs font-medium text-gray-600">
                  {isEn ? 'Competence Text' : 'Texto de Competencias'}
                </label>
                <label className="flex items-center gap-1 text-[10px] cursor-pointer text-blue-600">
                  <input
                    type="checkbox"
                    checked={info.includeCompetencies}
                    onChange={(e) => setInfo((current) => ({ ...current, includeCompetencies: e.target.checked }))}
                  />
                  {isEn ? 'Include in PDF' : 'Incluir en PDF'}
                </label>
              </div>
              <textarea
                rows={3}
                disabled={!info.includeCompetencies}
                className="w-full border rounded px-2 py-1 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                value={info.competenceText}
                onChange={e => setInfo((current) => ({ ...current, competenceText: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.studentName}
                  onChange={(e) => setInfo((current) => ({ ...current, studentName: e.target.checked }))}
                />
                {isEn ? 'Include "Student:" field' : 'Incluir campo "Estudiante:"'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.twoColumns}
                  onChange={(e) => setInfo((current) => ({ ...current, twoColumns: e.target.checked }))}
                />
                {isEn ? 'Use 2-Column Print Layout' : 'Usar diseño de impresión a 2 columnas'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.includeRubric}
                  onChange={(e) => setInfo((current) => ({ ...current, includeRubric: e.target.checked }))}
                />
                {isEn ? 'Include Evaluation Rubric' : 'Incluir rúbrica de evaluación'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.includeSignature}
                  onChange={(e) => setInfo((current) => ({ ...current, includeSignature: e.target.checked }))}
                />
                {isEn ? 'Include Final Grade / Evaluator section' : 'Incluir sección de Nota Final / Evaluador(a)'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.includePageNumbers}
                  onChange={(e) => setInfo((current) => ({ ...current, includePageNumbers: e.target.checked }))}
                />
                {isEn ? 'Include page numbers' : 'Incluir números de página'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.compactMode}
                  onChange={(e) => setInfo((current) => ({ ...current, compactMode: e.target.checked }))}
                />
                {isEn ? 'Compact mode (smaller spacing)' : 'Modo compacto (menor espaciado)'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={info.includeActivityScores}
                  onChange={(e) => setInfo((current) => ({ ...current, includeActivityScores: e.target.checked }))}
                />
                {isEn ? 'Include Activity Scores (e.g. 20p)' : 'Incluir puntajes de actividades (ej. 20p)'}
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>{isEn ? 'Cancel' : 'Cancelar'}</Button>
              <Button onClick={handleExport}>📥 {isEn ? 'Generate PDF' : 'Generar PDF'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">{isEn ? 'Mark as Reviewed' : 'Marcar como Revisado'}</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {isEn ? 'Teacher / Reviewer Name' : 'Nombre del Docente / Revisor'}
              </label>
              <Input
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder={isEn ? 'Enter your name' : 'Ingresa tu nombre'}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>{isEn ? 'Cancel' : 'Cancelar'}</Button>
              <Button onClick={handleReview} disabled={!workGuide.id}>{isEn ? 'Confirm Review' : 'Confirmar Revisión'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Printable document */}
      <div ref={printRef} className="bg-white text-black font-serif" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header - EXACT REPLICA OF THE REQUESTED GRID */}
        <div className="border border-black flex flex-col mt-4">

          {/* Top Block: Logo (Left 1/4) + Detail Grid (Right 3/4) */}
          <div className="flex border-b border-black">

            {/* Logo Cell */}
            <div className="w-1/4 min-h-24 border-r border-black flex items-center justify-center p-2 bg-white">
              {info.logoUrl ? (
                <Image
                  src={info.logoUrl}
                  alt="School Logo"
                  width={128}
                  height={128}
                  unoptimized
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <div className="text-4xl font-black text-gray-300">
                  {info.school ? info.school.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4) : 'LOGO'}
                </div>
              )}
            </div>

            {/* School Info Block */}
            <div className="w-3/4 flex flex-col bg-gray-100/30">

              {/* Row 1: Titles */}
              <div className="flex-1 flex flex-col items-center justify-center py-2 border-b border-black">
                <div className="text-lg uppercase font-bold text-center tracking-wide leading-tight">
                  {info.school || (isEn ? 'SCHOOL NAME' : 'COLEGIO BILINGÜE')}
                </div>
                {info.slogan && <div className="text-sm italic text-center mt-1 font-medium">{info.slogan}</div>}
                {info.examType && <div className="text-sm font-bold text-center uppercase tracking-widest mt-0.5">{info.examType}</div>}
              </div>

              {/* Row 2: Subject / Grade */}
              <div className="flex border-b border-black bg-gray-100/50">
                <div className="w-1/2 border-r border-black p-1 px-3 flex items-center">
                  <span className="font-bold text-xs mr-2">{isEn ? 'SUBJECT:' : 'MATERIA:'}</span>
                  <span className="text-xs font-medium italic">{info.subject}</span>
                </div>
                <div className="w-1/2 p-1 px-3 flex items-center">
                  <span className="font-bold text-xs mr-2">{isEn ? 'GRADE:' : 'GRADO:'}</span>
                  <span className="text-xs font-medium italic">{info.grade}</span>
                </div>
              </div>

              {/* Row 3: Term / Date */}
              <div className="flex bg-gray-100/50">
                <div className="w-1/2 border-r border-black p-1 px-3 flex items-center">
                  <span className="font-bold text-xs mr-2">{isEn ? 'TERM:' : 'PERÍODO:'}</span>
                  <span className="text-xs font-medium italic">{info.term}</span>
                </div>
                <div className="w-1/2 p-1 px-3 flex items-center">
                  <span className="font-bold text-xs mr-2">{isEn ? 'DATE:' : 'FECHA:'}</span>
                  <span className="text-xs font-medium italic">{info.date}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Full Width Row: Teacher */}
          <div className="border-b border-black p-1.5 px-3 flex items-center bg-gray-100/50">
            <span className="font-bold text-xs mr-2">{isEn ? 'TEACHER:' : 'DOCENTE:'}</span>
            <span className="text-xs italic grow">{info.teacher}</span>
          </div>

          {/* Full Width Row: Student */}
          {info.studentName && (
            <div className="p-1.5 px-3 flex items-center bg-gray-100/50">
              <span className="font-bold text-xs mr-2">{isEn ? 'STUDENT:' : 'ESTUDIANTE:'}</span>
              <span className="text-xs grow inline-block border-b border-black ml-1 mr-4"></span>
            </div>
          )}

        </div>

        {/* Topic & info */}
        {/* Topic removed here, as it may interfere with the layout. The document already has "WORK GUIDE" */}

        {/* Instructions & Competence Block */}
        {(info.includeInstructions || info.includeCompetencies) && (
          <div className="border border-t-0 border-black flex text-xs mb-4">
            {info.includeInstructions && (
              <div className={`${info.includeCompetencies ? 'w-1/2 border-r' : 'w-full'} border-black flex flex-col`}>
                <div className="bg-gray-300 font-bold p-1 text-center border-b border-black uppercase">
                  {isEn ? 'INSTRUCTIONS' : 'INSTRUCCIONES'}
                </div>
                <div className="p-2 text-justify grow">
                  {info.instructionsText}
                </div>
              </div>
            )}
            {info.includeCompetencies && (
              <div className={`${info.includeInstructions ? 'w-1/2' : 'w-full'} flex flex-col`}>
                <div className="bg-gray-300 font-bold p-1 text-center border-b border-black uppercase">
                  {isEn ? 'COMPETENCE' : 'COMPETENCIA'}
                </div>
                <div className="p-2 text-justify grow">
                  {info.competenceText}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={info.twoColumns ? "grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 px-2" : "space-y-5 px-2"}>
          {workGuide.activities.map((activity, index) => (
            <div key={index} className={`border border-gray-300 rounded p-3 break-inside-avoid ${info.compactMode ? 'print:py-1 print:px-2' : ''}`}>
              <div className={`flex justify-between items-start ${info.compactMode ? 'mb-1' : 'mb-2'}`}>
                <div>
                  <span className={`font-bold ${info.compactMode ? 'text-xs' : 'text-sm'}`}>
                    {index + 1}. {ACTIVITY_TYPE_LABELS[activity.type]?.[isEn ? 'en' : 'es'] || activity.type}
                    {info.includeActivityScores && ` (${activity.score}p)`}
                  </span>
                  <p className={`text-gray-600 ${info.compactMode ? 'text-xs mt-0' : 'text-xs mt-0.5'} italic`}>{activity.instructions}</p>
                </div>
              </div>
              <ActivityRenderer activity={activity} language={workGuide.language} theme={workGuide.theme ? { color: workGuide.theme.primary_color, emoji: workGuide.theme.icon_emoji } : undefined} />
            </div>
          ))}
        </div>

        {/* Rubric */}
        {info.includeRubric && workGuide.global_rubric && (
          <div className="mt-6 px-2">
            <div className="border border-gray-300 rounded p-3">
              <h3 className="font-bold text-sm mb-1">{isEn ? 'Evaluation Rubric' : 'Rúbrica de Evaluación'}</h3>
              <p className="text-xs text-gray-500 mb-3">{workGuide.global_rubric.global_description}</p>
              <div className="space-y-2">
                {workGuide.global_rubric.criteria.map((criteria, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold">{ACTIVITY_TYPE_LABELS[criteria.activity_type]?.[isEn ? 'en' : 'es'] || criteria.activity_type}: {criteria.criteria_description}</p>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
                      <div className="p-1.5 bg-green-50 border border-green-200 rounded">
                        <strong>{isEn ? 'Excellent' : 'Excelente'}:</strong> {criteria.levels.excellent}
                      </div>
                      <div className="p-1.5 bg-blue-50 border border-blue-200 rounded">
                        <strong>{isEn ? 'Good' : 'Bueno'}:</strong> {criteria.levels.good}
                      </div>
                      <div className="p-1.5 bg-yellow-50 border border-yellow-200 rounded">
                        <strong>{isEn ? 'Needs Imp.' : 'Mejora'}:</strong> {criteria.levels.needs_improvement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grade section (Separated from Rubric) */}
        {info.includeSignature && (
          <div className="px-2 pb-4">
            <div className="break-inside-avoid mt-4">
              <div className="grid grid-cols-2 border border-black text-xs">
                <div className="border-r border-black p-2 font-bold text-center">{isEn ? 'FINAL GRADE' : 'NOTA FINAL'}</div>
                <div className="p-2 font-bold text-center">{isEn ? 'EVALUATOR' : 'EVALUADOR(A)'}</div>
              </div>
              <div className="grid grid-cols-2 border-l border-r border-b border-black text-xs">
                <div className="border-r border-black p-4">&nbsp;</div>
                <div className="p-4 text-center italic text-gray-500 flex items-center justify-center">{info.teacher}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
