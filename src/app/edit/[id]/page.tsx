'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Cropper, { Area } from 'react-easy-crop'
import {
  BookOpen,
  Upload,
  Palette,
  Type,
  Save,
  Book as BookIcon,
  Layout,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'
import { getBookCoverUrl } from '@/utils/bookCover'

const FONT_OPTIONS = ['Lora', 'Playfair Display', 'Merriweather', 'Crimson Text', 'EB Garamond', 'Cinzel', 'Old Standard TT', 'Unna', 'Cardo', 'Libre Baskerville', 'Courier Prime', 'Special Elite', 'VT323', 'Dancing Script', 'Great Vibes', 'MedievalSharp', 'Pirata One', 'Almendra', 'Amiri', 'Cormorant Upright']
const GENRES = ['Aventura', 'Ficção Científica', 'Mistério', 'Romance', 'Fantasia', 'Terror', 'Suspense', 'Poesia', 'História', 'Filosofia', 'Tecnologia', 'Educação', 'Infantil', 'Juvenil', 'Drama', 'Humor', 'Clássicos', 'Autoajuda', 'Negócios', 'Saúde', 'Arte', 'Religião', 'Quadrinhos']

const THEMES = {
  vintage: { page: '#f4ece1', text: '#3b2f23', border: '#8c6d46', font: 'EB Garamond' },
  dark_academy: { page: '#1a1a1a', text: '#d4c4a8', border: '#5c4d32', font: 'Lora' },
  parchment: { page: '#fcf5e5', text: '#2a2a2a', border: '#d4a03d', font: 'Crimson Text' },
  royal: { page: '#fffcf5', text: '#1a1a1a', border: '#c5a059', font: 'Playfair Display' }
}

export default function EditBookPage() {
  const router = useRouter()
  const { id } = useParams()
  const { loading: authLoading } = useAuth()

  const [form, setForm] = useState({
    title: '',
    genre: 'Geral',
    subGenre: '',
    description: '',
    coverImage: null as string | null,
    fullContent: '',
    styles: {
      coverColor: '#2b1d1d',
      fontFamily: 'EB Garamond',
      fontSize: '18px',
      pageColor: '#f4ece1',
      textColor: '#3b2f23',
      borderColor: '#8c6d46',
      borderWidth: '6px',
      borderRadius: '4px',
      borderStyle: 'double'
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'page-style' | 'cover-style'>('content')
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [previewPage, setPreviewPage] = useState(0)

  const CHARS_PER_PAGE = 1200

  // 1. Carrega os dados existentes do Livro
  useEffect(() => {
    const loadBook = async () => {
      try {
        const response = await api.get(`/books/${id}/`)
        const book = response.data
        const content = book.pages?.sort((a: any, b: any) => a.page_number - b.page_number)
          .map((p: any) => p.content).join(' ') || ''

        setForm({
          title: book.title,
          genre: book.genre || 'Geral',
          subGenre: book.sub_genre || '',
          description: book.description || '',
          coverImage: getBookCoverUrl(book),
          fullContent: content,
          styles: book.styles || form.styles
        })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadBook()
  }, [id])

  // 2. Paginação em tempo real
  const dynamicPages = useMemo(() => {
    const text = form.fullContent.trim()
    if (!text) return ['Carregando conteúdo...']
    const words = text.split(' ')
    const pages: string[] = []
    let currentPage = ''
    for (const word of words) {
      if ((currentPage + word).length > CHARS_PER_PAGE) {
        pages.push(currentPage); currentPage = word + ' '
      } else { currentPage += word + ' ' }
    }
    if (currentPage) pages.push(currentPage)
    return pages
  }, [form.fullContent])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = () => setImageToCrop(reader.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleApplyTheme = (themeName: keyof typeof THEMES) => {
    const theme = THEMES[themeName]
    setForm(f => ({
      ...f,
      styles: { ...f.styles, pageColor: theme.page, textColor: theme.text, borderColor: theme.border, fontFamily: theme.font }
    }))
  }

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !imageToCrop) return
    setForm(f => ({ ...f, coverImage: imageToCrop }))
    setImageToCrop(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        title: form.title,
        genre: form.genre,
        sub_genre: form.subGenre,
        description: form.description,
        cover: form.coverImage?.startsWith('blob') || form.coverImage?.startsWith('data') ? form.coverImage : undefined,
        total_pages: dynamicPages.length,
        styles: form.styles,
        full_content: form.fullContent 
      }
      await api.patch(`/books/${id}/`, payload)
      router.push('/profile')
    } catch (err) {
      alert('Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || isLoading) return <div className="p-20 text-center font-black bg-[#f7efe4] min-h-screen">SINCRONIZANDO COM A BIBLIOTECA...</div>

  return (
    <main className="min-h-screen bg-[#f7efe4] text-[#17120d] overflow-x-hidden">

      {/* Cropper Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-xl h-[450px] bg-gray-900 rounded-xl overflow-hidden">
            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={7/10} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="mt-6 flex gap-4">
            <button onClick={() => setImageToCrop(null)} className="px-8 py-2 text-white bg-white/10 rounded-lg font-bold">Cancelar</button>
            <button onClick={handleCropSave} className="px-8 py-2 bg-[#d4a03d] text-black font-black rounded-lg">Confirmar Capa</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1450px] px-8 py-10">
        
        {/* Header igual ao de criação */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#6f2f38] mb-1">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Ateliê de Edição de Obras</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter">REVISAR OBRA</h1>
          </div>

          <button onClick={handleSubmit} disabled={saving} className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#1f332b] text-white px-10 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-xl disabled:opacity-50">
            <Save className="w-5 h-5" /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </header>

        <div className="grid lg:grid-cols-[1fr_470px] gap-12">
          <div className="space-y-8">
            {/* Navegação de Abas igual ao Criador */}
            <nav className="flex flex-wrap gap-2 border-b border-[#d7c8b8]">
              {[
                { id: 'content', label: '1. Conteúdo', icon: BookIcon },
                { id: 'page-style', label: '2. Estilo da Página', icon: Layout },
                { id: 'cover-style', label: '3. Identidade da Capa', icon: Palette }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase transition-all ${activeTab === tab.id ? 'text-[#6f2f38] bg-white border-x border-t border-[#d7c8b8] rounded-t-xl' : 'text-[#9b6b24] hover:text-[#6f2f38]'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </nav>

            <div className="bg-white p-8 rounded-b-2xl rounded-tr-2xl shadow-sm border border-[#d7c8b8] min-h-[650px]">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#9b6b24]">Título do Livro</label>
                      <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full text-2xl font-black border-b-2 border-[#f7efe4] outline-none focus:border-[#d4a03d] pb-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#9b6b24]">Gênero</label>
                        <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full p-3 bg-[#f7efe4] rounded-lg font-bold">
                          {GENRES.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#6f2f38]">Subgênero</label>
                        <select value={form.subGenre} onChange={e => setForm({...form, subGenre: e.target.value})} className="w-full p-3 bg-[#f7efe4] rounded-lg font-bold">
                          <option value="">Nenhum</option>
                          {GENRES.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#9b6b24]">Sinopse</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-[#fffaf1] rounded-xl border-2 border-dashed border-[#d7c8b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#9b6b24]">Conteúdo da Obra</label>
                    <textarea rows={15} value={form.fullContent} onChange={e => setForm({...form, fullContent: e.target.value})} className="w-full p-6 bg-[#fffaf1] rounded-xl border-2 border-dashed border-[#d7c8b8] outline-none focus:border-[#d4a03d] leading-relaxed" />
                  </div>
                </div>
              )}

              {activeTab === 'page-style' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" />Temas Prontos</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {Object.keys(THEMES).map(theme => (
                        <button key={theme} onClick={() => handleApplyTheme(theme as any)} className="bg-[#f7efe4] p-5 rounded-xl font-black uppercase hover:scale-105 transition-all">{theme.replace('_', ' ')}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase flex items-center gap-2 border-b pb-2"><Type className="w-4 h-4" />Tipografia</h3>
                      <select value={form.styles.fontFamily} onChange={e => setForm({...form, styles: {...form.styles, fontFamily: e.target.value}})} className="w-full p-4 bg-[#f7efe4] rounded-xl font-bold">
                        {FONT_OPTIONS.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                      </select>
                      <input type="range" min="14" max="36" value={parseInt(form.styles.fontSize)} onChange={e => setForm({...form, styles: {...form.styles, fontSize: `${e.target.value}px`}})} className="w-full accent-[#6f2f38]" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase flex items-center gap-2 border-b pb-2"><Palette className="w-4 h-4" />Paleta</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="color" value={form.styles.pageColor} onChange={e => setForm({...form, styles: {...form.styles, pageColor: e.target.value}})} className="w-full h-12 rounded-lg" />
                        <input type="color" value={form.styles.textColor} onChange={e => setForm({...form, styles: {...form.styles, textColor: e.target.value}})} className="w-full h-12 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cover-style' && (
                <div className="flex flex-col items-center justify-center py-20">
                   <div className="w-20 h-20 bg-[#d4a03d]/20 rounded-full flex items-center justify-center mb-4"><Upload className="w-8 h-8 text-[#d4a03d]" /></div>
                   <h3 className="text-lg font-black mb-4">Imagem de Capa</h3>
                   <label className="bg-[#6f2f38] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:scale-105 transition-all shadow-lg">
                      SUBSTITUIR CAPA
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                   </label>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="sticky top-10 space-y-6">
              <h3 className="text-[10px] font-black uppercase text-[#9b6b24] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> PRÉVIA DA REVISÃO
              </h3>
              
              <div 
                className="w-full aspect-[1/1.4] shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative p-10 overflow-hidden"
                style={{ 
                  backgroundColor: form.styles.pageColor, 
                  color: form.styles.textColor, 
                  fontFamily: form.styles.fontFamily, 
                  fontSize: form.styles.fontSize,
                  border: `${form.styles.borderWidth} ${form.styles.borderStyle} ${form.styles.borderColor}`,
                  borderRadius: form.styles.borderRadius,
                  backgroundImage: 'url(https://www.transparenttextures.com/patterns/paper-fibers.png)'
                }}
              >
                <div className="opacity-40 text-[9px] uppercase font-bold tracking-widest mb-8 border-b pb-2 flex justify-between">
                  <span className="truncate max-w-[150px]">{form.title}</span>
                  <span>{form.genre} {form.subGenre && `/ ${form.subGenre}`}</span>
                </div>
                <p className="leading-relaxed text-justify first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left">
                  {dynamicPages[previewPage]?.substring(0, 550)}...
                </p>
                <div className="absolute bottom-6 left-0 right-0 text-center opacity-30 text-[9px] font-bold">{previewPage + 1}</div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button disabled={previewPage === 0} onClick={() => setPreviewPage(p => p - 1)} className="bg-white border px-4 py-2 rounded-xl disabled:opacity-30"><ChevronLeft/></button>
                <span className="text-xs font-black">Página {previewPage + 1} de {dynamicPages.length}</span>
                <button disabled={previewPage >= dynamicPages.length - 1} onClick={() => setPreviewPage(p => p + 1)} className="bg-white border px-4 py-2 rounded-xl disabled:opacity-30"><ChevronRight/></button>
              </div>

              {/* Miniatura da Capa */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d7c8b8] flex items-center gap-6">
                <div className="w-24 aspect-[7/10] shadow-xl rounded-md overflow-hidden bg-slate-200">
                  <img src={form.coverImage || ''} className="w-full h-full object-cover" alt="Capa" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase">{form.title || 'Título Pendente'}</h4>
                  <p className="text-[10px] font-bold text-[#d4a03d] uppercase mt-1">{form.genre}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}