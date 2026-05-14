'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import {
  BookOpen,
  Upload,
  Palette,
  Type,
  Frame,
  Save,
  Book as BookIcon,
  Layout,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { booksService } from '@/services/books'

const FONT_OPTIONS = [
  'Lora',
  'Playfair Display',
  'Merriweather',
  'Crimson Text',
  'EB Garamond',
  'Cinzel',
  'Old Standard TT',
  'Unna',
  'Cardo',
  'Libre Baskerville',
  'Courier Prime',
  'Special Elite',
  'VT323',
  'Dancing Script',
  'Great Vibes',
  'MedievalSharp',
  'Pirata One',
  'Almendra',
  'Amiri',
  'Cormorant Upright'
]

const GENRES = [
  'Aventura',
  'Ficção Científica',
  'Mistério',
  'Romance',
  'Fantasia',
  'Terror',
  'Suspense',
  'Poesia',
  'História',
  'Filosofia',
  'Biografia',
  'Tecnologia',
  'Educação',
  'Infantil',
  'Juvenil',
  'Drama',
  'Humor',
  'Clássicos',
  'Autoajuda',
  'Negócios',
  'Saúde',
  'Arte',
  'Religião',
  'Quadrinhos',
]

const THEMES = {
  vintage: {
    page: '#f4ece1',
    text: '#3b2f23',
    border: '#8c6d46',
    font: 'var(--font-eb)'
  },
  dark_academy: {
    page: '#1a1a1a',
    text: '#d4c4a8',
    border: '#5c4d32',
    font: 'Lora'
  },
  parchment: {
    page: '#fcf5e5',
    text: '#2a2a2a',
    border: '#d4a03d',
    font: 'Crimson Text'
  },
  royal: {
    page: '#fffcf5',
    text: '#1a1a1a',
    border: '#c5a059',
    font: 'Playfair Display'
  }
}

type BookStyles = {
  coverColor: string
  fontFamily: string
  fontSize: string
  pageColor: string
  textColor: string
  borderColor: string
  borderWidth: string
  borderRadius: string
  borderStyle: string
}

type BookForm = {
  title: string
  genre: string
  description: string
  coverImage: string | null
  fullContent: string
  styles: BookStyles
}

const createEmptyForm = (): BookForm => ({
  title: '',
  genre: 'Terror',
  description: '',
  coverImage: null,
  fullContent: '',
  styles: {
    coverColor: '#2b1d1d',
    fontFamily: 'var(--font-eb)',
    fontSize: '18px',
    pageColor: '#f4ece1',
    textColor: '#3b2f23',
    borderColor: '#8c6d46',
    borderWidth: '6px',
    borderRadius: '4px',
    borderStyle: 'double'
  }
})

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.src = url
  })

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<string | null> => {
  const image = await createImage(imageSrc)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return canvas.toDataURL('image/jpeg')
}

export default function BooksPage() {
  const { loading: authLoading } = useAuth()

  const [form, setForm] = useState<BookForm>(createEmptyForm())

  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState<
    'content' | 'page-style' | 'cover-style'
  >('content')

  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const [crop, setCrop] = useState({ x: 0, y: 0 })

  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null)

  const [previewPage, setPreviewPage] = useState(0)

  const CHARS_PER_PAGE = 1200

  useEffect(() => {
    const savedDraft = localStorage.getItem('book-draft')

    if (savedDraft) {
      setForm(JSON.parse(savedDraft))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('book-draft', JSON.stringify(form))
  }, [form])

  const dynamicPages = useMemo(() => {
    const text = form.fullContent.trim()

    if (!text) return ['O conteúdo da sua obra aparecerá aqui...']

    const words = text.split(' ')

    const pages: string[] = []

    let currentPage = ''

    for (const word of words) {
      if ((currentPage + word).length > CHARS_PER_PAGE) {
        pages.push(currentPage)
        currentPage = word + ' '
      } else {
        currentPage += word + ' '
      }
    }

    if (currentPage) {
      pages.push(currentPage)
    }

    return pages
  }, [form.fullContent])

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()

      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string)
      })

      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleApplyTheme = (themeName: keyof typeof THEMES) => {
    const theme = THEMES[themeName]

    setForm(f => ({
      ...f,
      styles: {
        ...f.styles,
        pageColor: theme.page,
        textColor: theme.text,
        borderColor: theme.border,
        fontFamily: theme.font
      }
    }))
  }

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !imageToCrop) return

    const croppedImage = await getCroppedImg(
      imageToCrop,
      croppedAreaPixels
    )

    setForm(f => ({
      ...f,
      coverImage: croppedImage
    }))

    setImageToCrop(null)
  }

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()

  if (!form.title) {
    alert('Defina um título.')
    return
  }

  try {
    setSaving(true)

    // CRIANDO O PAYLOAD COM CONVERSÃO DE TIPOS
    const payload = {
      title: form.title,
      genre: form.genre,
      description: form.description,
      cover: form.coverImage,
      total_pages: dynamicPages.length,
      // Aqui convertemos as strings "4px" para números puros
      styles: {
        ...form.styles,
        fontSize: parseInt(form.styles.fontSize),
        borderWidth: parseInt(form.styles.borderWidth),
        borderRadius: parseInt(form.styles.borderRadius),
      }
    }

    // Agora o TypeScript vai aceitar, poisborderRadius virou number
    const savedBook = await booksService.createBook(payload as any) 

    await Promise.all(
      dynamicPages.map((content, index) =>
        booksService.createPage({
          book: savedBook.id,
          page_number: index + 1,
          content
        })
      )
    )

    localStorage.removeItem('book-draft')
    alert('Obra publicada com sucesso!')
    
  } catch (err) {
    console.error(err)
    alert('Erro ao publicar a obra.')
  } finally {
    setSaving(false)
  }
}

  if (authLoading) {
    return (
      <div className="p-20 text-center font-black">
        CARREGANDO...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7efe4] text-[#17120d] overflow-hidden">

      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6">

          <div className="relative w-full max-w-xl h-[450px] bg-gray-900 rounded-xl overflow-hidden border border-white/10">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={7 / 10}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
            />
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-[300px] mt-6"
          />

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setImageToCrop(null)}
              className="px-8 py-2 text-white bg-white/10 rounded-lg font-bold"
            >
              Cancelar
            </button>

            <button
              onClick={handleCropSave}
              className="px-8 py-2 bg-[#d4a03d] text-black font-black rounded-lg shadow-lg"
            >
              Cortar e Salvar
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1450px] px-8 py-10">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">

          <div>
            <div className="flex items-center gap-2 text-[#6f2f38] mb-1">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                Ateliê de Escrita Profissional
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tighter">
              CRIADOR DE OBRAS
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#1f332b] text-white px-10 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-xl disabled:opacity-50"
          >
            <Save className="w-5 h-5" />

            {saving ? 'PUBLICANDO...' : 'PUBLICAR OBRA'}
          </button>
        </header>

        <div className="grid lg:grid-cols-[1fr_470px] gap-12">

          <div className="space-y-8">

            <nav className="flex flex-wrap gap-2 border-b border-[#d7c8b8]">

              {[
                {
                  id: 'content',
                  label: '1. Conteúdo',
                  icon: BookIcon
                },
                {
                  id: 'page-style',
                  label: '2. Estilo da Página',
                  icon: Layout
                },
                {
                  id: 'cover-style',
                  label: '3. Identidade da Capa',
                  icon: Palette
                }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase transition-all ${
                    activeTab === tab.id
                      ? 'text-[#6f2f38] bg-white border-x border-t border-[#d7c8b8] rounded-t-xl'
                      : 'text-[#9b6b24] hover:text-[#6f2f38]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="bg-white p-8 rounded-b-2xl rounded-tr-2xl shadow-sm border border-[#d7c8b8] min-h-[650px]">

              {activeTab === 'content' && (
                <div className="space-y-6">

                  <div className="grid md:grid-cols-2 gap-4">

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#9b6b24]">
                        Título do Livro
                      </label>

                      <input
                        value={form.title}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            title: e.target.value
                          }))
                        }
                        placeholder="Ex: O Corvo de Sangue"
                        className="w-full text-2xl font-black border-b-2 border-[#f7efe4] outline-none focus:border-[#d4a03d] pb-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#9b6b24]">
                        Gênero
                      </label>

                      <select
                        value={form.genre}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            genre: e.target.value
                          }))
                        }
                        className="w-full p-3 bg-[#f7efe4] rounded-lg font-bold"
                      >
                        {GENRES.map(g => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">

                    <label className="text-[10px] font-black uppercase text-[#9b6b24]">
                      Sinopse
                    </label>

                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          description: e.target.value
                        }))
                      }
                      className="w-full p-4 bg-[#fffaf1] rounded-xl border-2 border-dashed border-[#d7c8b8]"
                    />
                  </div>

                  <div className="space-y-2">

                    <label className="text-[10px] font-black uppercase text-[#9b6b24]">
                      Conteúdo da Obra
                    </label>

                    <textarea
                      placeholder="Comece sua narrativa aqui..."
                      rows={18}
                      value={form.fullContent}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          fullContent: e.target.value
                        }))
                      }
                      className="w-full p-6 bg-[#fffaf1] rounded-xl border-2 border-dashed border-[#d7c8b8] outline-none focus:border-[#d4a03d] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'page-style' && (
                <div className="space-y-10">

                  <div>

                    <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Temas Prontos
                    </h3>

                    <div className="grid md:grid-cols-4 gap-4">

                      {Object.keys(THEMES).map(theme => (
                        <button
                          key={theme}
                          onClick={() =>
                            handleApplyTheme(theme as keyof typeof THEMES)
                          }
                          className="bg-[#f7efe4] p-5 rounded-xl font-black uppercase hover:scale-105 transition-all"
                        >
                          {theme.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">

                    <div className="space-y-4">

                      <h3 className="text-xs font-black uppercase flex items-center gap-2 border-b pb-2">
                        <Type className="w-4 h-4" />
                        Tipografia
                      </h3>

                      <select
                        value={form.styles.fontFamily}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            styles: {
                              ...f.styles,
                              fontFamily: e.target.value
                            }
                          }))
                        }
                        className="w-full p-4 bg-[#f7efe4] rounded-xl font-bold"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option
                            key={font}
                            value={font}
                            style={{
                              fontFamily: font
                            }}
                          >
                            {font}
                          </option>
                        ))}
                      </select>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-black">
                            TAMANHO
                          </span>

                          <span className="text-xs font-bold">
                            {form.styles.fontSize}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="14"
                          max="36"
                          value={parseInt(form.styles.fontSize)}
                          onChange={e =>
                            setForm(f => ({
                              ...f,
                              styles: {
                                ...f.styles,
                                fontSize: `${e.target.value}px`
                              }
                            }))
                          }
                          className="w-full accent-[#6f2f38]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">

                      <h3 className="text-xs font-black uppercase flex items-center gap-2 border-b pb-2">
                        <Palette className="w-4 h-4" />
                        Paleta
                      </h3>

                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <label className="text-xs font-black">
                            Página
                          </label>

                          <input
                            type="color"
                            value={form.styles.pageColor}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                styles: {
                                  ...f.styles,
                                  pageColor: e.target.value
                                }
                              }))
                            }
                            className="w-full h-12 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-black">
                            Texto
                          </label>

                          <input
                            type="color"
                            value={form.styles.textColor}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                styles: {
                                  ...f.styles,
                                  textColor: e.target.value
                                }
                              }))
                            }
                            className="w-full h-12 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">

                    <h3 className="text-xs font-black uppercase flex items-center gap-2">
                      <Frame className="w-4 h-4" />
                      Molduras
                    </h3>

                    <div className="grid sm:grid-cols-4 gap-4">

                      <input
                        type="number"
                        min={0}
                        max={50}
                        placeholder="Espessura"
                        value={parseInt(form.styles.borderWidth)}
                        onChange={e => {
                          const value = Math.min(
                            50,
                            Math.max(0, Number(e.target.value))
                          )

                          setForm(f => ({
                            ...f,
                            styles: {
                              ...f.styles,
                              borderWidth: `${value}px`
                            }
                          }))
                        }}
                        className="p-3 bg-[#f7efe4] rounded-lg"
                      />

                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Radius"
                        value={parseInt(form.styles.borderRadius)}
                        onChange={e => {
                          const value = Math.min(
                            100,
                            Math.max(0, Number(e.target.value))
                          )

                          setForm(f => ({
                            ...f,
                            styles: {
                              ...f.styles,
                              borderRadius: `${value}px`
                            }
                          }))
                        }}
                        className="p-3 bg-[#f7efe4] rounded-lg"
                      />

                      <select
                        value={form.styles.borderStyle}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            styles: {
                              ...f.styles,
                              borderStyle: e.target.value
                            }
                          }))
                        }
                        className="p-3 bg-[#f7efe4] rounded-lg"
                      >
                        <option value="solid">Solid</option>
                        <option value="double">Double</option>
                        <option value="ridge">Ridge</option>
                        <option value="groove">Groove</option>
                        <option value="dashed">Dashed</option>
                      </select>

                      <input
                        type="color"
                        value={form.styles.borderColor}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            styles: {
                              ...f.styles,
                              borderColor: e.target.value
                            }
                          }))
                        }
                        className="w-full h-12 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cover-style' && (
                <div className="space-y-10">

                  <div className="bg-[#fffaf1] p-8 rounded-2xl border-2 border-dashed border-[#d7c8b8] flex flex-col items-center justify-center text-center">

                    <div className="w-20 h-20 bg-[#d4a03d]/20 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-[#d4a03d]" />
                    </div>

                    <h3 className="text-lg font-black mb-2">
                      Imagem de Capa
                    </h3>

                    <label className="bg-[#6f2f38] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg">
                      SELECIONAR ARQUIVO

                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onFileChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-8">

            <div className="sticky top-10 space-y-6">

              <div>

                <h3 className="text-[10px] font-black uppercase mb-4 text-[#9b6b24] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  PRÉVIA EM TEMPO REAL
                </h3>

                <div
                  className="w-full aspect-[1/1.4] shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative p-10 overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundColor: form.styles.pageColor,
                    color: form.styles.textColor,
                    fontFamily: form.styles.fontFamily,
                    fontSize: form.styles.fontSize,
                    border: `${form.styles.borderWidth} ${form.styles.borderStyle} ${form.styles.borderColor}`,
                    borderRadius: form.styles.borderRadius,
                    backgroundImage:
                      'url(https://www.transparenttextures.com/patterns/paper-fibers.png)'
                  }}
                >
                  <div className="opacity-40 text-[9px] uppercase font-bold tracking-[0.2em] mb-8 border-b pb-2 flex justify-between">

                    <span className="truncate max-w-[150px]">
                      {form.title || 'Sua Obra'}
                    </span>

                    <span>{form.genre}</span>
                  </div>

                  <p className="leading-relaxed text-justify first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left">

                    {dynamicPages[previewPage]?.length > 550
                      ? dynamicPages[previewPage].substring(0, 550) + '...'
                      : dynamicPages[previewPage]}
                  </p>

                  <div className="absolute bottom-6 left-0 right-0 text-center opacity-30 text-[9px] font-bold">
                    {previewPage + 1}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">

                  <button
                    disabled={previewPage === 0}
                    onClick={() =>
                      setPreviewPage(prev => prev - 1)
                    }
                    className="bg-white border px-4 py-2 rounded-xl disabled:opacity-30"
                  >
                    <ChevronLeft />
                  </button>

                  <span className="text-xs font-black">
                    Página {previewPage + 1} de {dynamicPages.length}
                  </span>

                  <button
                    disabled={previewPage >= dynamicPages.length - 1}
                    onClick={() =>
                      setPreviewPage(prev => prev + 1)
                    }
                    className="bg-white border px-4 py-2 rounded-xl disabled:opacity-30"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d7c8b8] flex items-center gap-6">

                <div
                  className="w-24 aspect-[7/10] shadow-xl rounded-md overflow-hidden flex items-center justify-center text-center p-2"
                  style={{
                    backgroundColor: form.coverImage
                      ? 'transparent'
                      : form.styles.coverColor
                  }}
                >
                  {form.coverImage ? (
                    <img
                      src={form.coverImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[7px] text-white font-black leading-tight uppercase opacity-50">
                      {form.title || 'SEM TÍTULO'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-black text-sm uppercase">
                    {form.title || 'Título Pendente'}
                  </h4>

                  <p className="text-[10px] font-bold text-[#d4a03d] uppercase mt-1">
                    {form.genre}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] bg-[#f7efe4] px-2 py-1 rounded font-bold">
                      {dynamicPages.length} PÁG.
                    </span>

                    <span className="text-[10px] bg-[#f7efe4] px-2 py-1 rounded font-bold">
                      PT-BR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}