'use client'

import Link from 'next/link'
import Cropper, { Area, Point } from 'react-easy-crop'
import { api } from '@/services/api'
import { 
  Camera, 
  Pencil, 
  Check, 
  LogOut, 
  Plus, 
  Trash2, 
  AlertTriangle,
} from 'lucide-react'

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { DashboardCard } from '@/components/DashboardCard'
import { ProfileCard } from '@/components/ProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { booksService } from '@/services/books'
import { usersService } from '@/services/users'
import { Favorite, ReadingProgress, Book } from '@/types/book'
import { Profile } from '@/types/user'
import { getBookCoverUrl } from '@/utils/bookCover'
import { storage } from '@/utils/storage'

type ProfileForm = {
  bio: string
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()

  // ESTADOS DE DADOS
  const [profile, setProfile] = useState<Profile | null>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [likes, setLikes] = useState<any[]>([])
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)

  // ESTADOS DE UI
  const [form, setForm] = useState<ProfileForm>({ bio: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // IMAGENS E CROPPER
  const [avatarPreview, setAvatarPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [cropImage, setCropImage] = useState('')
  const [cropType, setCropType] = useState<'avatar' | 'banner' | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // CARREGAR DADOS INICIAIS
  useEffect(() => {
    let isActive = true
    const loadProfile = async () => {
      if (loading || !user) return

      try {
        setIsLoadingProfile(true)
        setError('')
        const [profileData, favoritesData, progressData, myBooksData, likesData] = await Promise.all([
          usersService.getProfile(user.username),
          booksService.getFavorites(),
          booksService.getProgress(),
          booksService.getMyBooks(),
          booksService.getLikes(),
        ])

        if (!isActive) return

        setProfile({ ...profileData, email: user.email })
        setFavorites(favoritesData)
        setProgress(progressData)
        setLikes(likesData)
        setMyBooks(myBooksData)
        setForm({ bio: profileData.bio || '' })
        
        setAvatarPreview(profileData.avatar || '')
        setBannerPreview(profileData.banner || '')
      } catch (err) {
        setError('Ops! Não conseguimos carregar suas informações.')
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
    return () => { isActive = false }
  }, [loading, user])

  // LÓGICA DE EXCLUSÃO DE LIVRO
  const handleDeleteBook = async () => {
    if (!bookToDelete) return
    try {
      setDeleteLoading(true)
      setError('')
      await api.delete(`/books/${bookToDelete.id}/`)
      setMyBooks((current) => current.filter((b) => b.id !== bookToDelete.id))
      setSuccess('Livro removido com sucesso!')
      setBookToDelete(null)
    } catch (err) {
      setError('Erro ao excluir a obra. Tente novamente.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const readingItems = useMemo(() => progress.filter((item) => !item.finished), [progress])
  const finishedItems = useMemo(() => progress.filter((item) => item.finished), [progress])

  // Extrair livros para cada estante
  const favoriteBooks = useMemo(() => favorites.map((fav) => fav.book_detail).filter(Boolean) as Book[], [favorites])
  const readingBooks = useMemo(() => readingItems.map((item) => item.book_detail).filter(Boolean) as Book[], [readingItems])
  const finishedBooks = useMemo(() => finishedItems.map((item) => item.book_detail).filter(Boolean) as Book[], [finishedItems])
  const likedBooks = useMemo(() => likes.map((like: any) => like.book_detail).filter(Boolean) as Book[], [likes])

  // LÓGICA DE CROPPER
  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = event.target.files?.[0]
    if (!file) return
    setCropImage(URL.createObjectURL(file))
    setCropType(type)
  }

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return
    
    const image = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image(); img.src = cropImage; img.onload = () => resolve(img)
    })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = croppedAreaPixels.width; canvas.height = croppedAreaPixels.height
    ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
    
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const file = new File([blob], `${cropType}.jpg`, { type: 'image/jpeg' })
      if (cropType === 'avatar') { setAvatarPreview(url); setAvatarFile(file) }
      else { setBannerPreview(url); setBannerFile(file) }
      setCropImage(''); setCropType(null)
    }, 'image/jpeg', 0.95)
  }

  // SALVAR PERFIL
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile) return

    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('bio', form.bio.trim())
      if (avatarFile) formData.append('avatar', avatarFile)
      if (bannerFile) formData.append('banner', bannerFile)

      const updatedProfile = await usersService.updateProfile(profile.username, formData)
      
      const t = Date.now()
      const mergedProfile = { 
        ...updatedProfile, 
        email: profile.email,
        avatar: `${updatedProfile.avatar}?t=${t}`, 
        banner: `${updatedProfile.banner}?t=${t}` 
      }
      
      setProfile(mergedProfile)
      setAvatarPreview(mergedProfile.avatar)
      setBannerPreview(mergedProfile.banner)
      storage.setUser(mergedProfile)

      setSuccess('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (err) {
      setError('Não foi possível salvar as alterações do perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || isLoadingProfile) return <main className="min-h-screen bg-[#f7efe4] flex items-center justify-center font-black uppercase tracking-widest text-[#6f2f38]">Carregando Acervo...</main>
  if (!user) return <main className="min-h-screen bg-[#f7efe4] flex items-center justify-center font-bold">Acesso negado. Faça login.</main>

  const visibleProfile = profile || user

  return (
    <main className="min-h-screen bg-[#f7efe4] px-5 py-10 text-[#17120d]">
      <div className="mx-auto max-w-6xl">
        
        {/* MODAL EXCLUIR LIVRO */}
        {bookToDelete && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600" size={24}/>
                <h2 className="text-lg font-bold">Excluir livro?</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Deseja remover <strong>{bookToDelete.title}</strong> permanentemente?</p>
              <div className="flex gap-3">
                <button onClick={() => setBookToDelete(null)} className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleDeleteBook} disabled={deleteLoading} className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition-colors">
                  {deleteLoading ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CROPPER PERFIL */}
        {cropImage && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6">
              <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-black">
                <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={cropType === 'avatar' ? 1 : 16/5}
                  onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                   <button onClick={() => setCropImage('')} className="px-6 py-2 rounded-xl border font-bold">Cancelar</button>
                   <button onClick={handleCropSave} className="px-6 py-2 rounded-xl bg-[#6f2f38] text-white font-bold">Recortar</button>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACKS (IMPORTANTE PARA O DEPLOY PASSAR) */}
        {error && (
          <div className="mb-5 p-4 rounded-xl flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 font-bold animate-in slide-in-from-top-2">
            <AlertTriangle size={20}/> {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-xl flex items-center gap-3 bg-green-50 text-green-700 border border-green-200 font-bold animate-in slide-in-from-top-2">
            <Check size={20}/> {success}
          </div>
        )}

        {/* CARTÃO DE PERFIL */}
        <ProfileCard
          profile={{
            ...visibleProfile,
            avatar: avatarPreview || visibleProfile.avatar,
            banner: bannerPreview || visibleProfile.banner,
          }}
          favoriteCount={favorites.length}
          readingCount={readingItems.length}
          finishedCount={finishedItems.length}
          myBooksCount={myBooks.length}
          actions={
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(!isEditing)} className="rounded-xl bg-[#6f2f38] px-6 py-2.5 text-white font-bold shadow-lg shadow-[#6f2f38]/20 transition hover:bg-[#5a262d]">
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </button>
              <button onClick={logout} className="rounded-xl border-2 border-[#d4a03d] px-6 py-2.5 font-bold text-[#d4a03d] hover:bg-[#d4a03d]/5 transition-colors">
                <LogOut size={18} className="inline mr-2"/> Sair
              </button>
            </div>
          }
        />

        {/* FORMULÁRIO DE EDIÇÃO */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
              <div className="relative">
                <div className="group relative h-52 w-full bg-slate-200">
                  <img src={bannerPreview || visibleProfile.banner || ''} className="h-full w-full object-cover" alt="Banner" />
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={32} className="text-white" />
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
                  </label>
                </div>
                <div className="absolute -bottom-14 left-10">
                  <div className="group relative h-36 w-36 rounded-full border-[6px] border-white bg-slate-100 shadow-xl overflow-hidden">
                    <img src={avatarPreview || visibleProfile.avatar || ''} className="h-full w-full object-cover" alt="Avatar" />
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera size={28} className="text-white" />
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 pt-20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Sobre Mim / Biografia</label>
                    <span className={`text-xs font-bold ${form.bio.length > 240 ? 'text-red-500' : 'text-slate-400'}`}>
                      {form.bio.length} / 250
                    </span>
                  </div>
                  <textarea
                    value={form.bio}
                    maxLength={250}
                    onChange={(e) => setForm({ bio: e.target.value })}
                    rows={4}
                    className="w-full resize-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-slate-700 outline-none transition-all focus:border-[#6f2f38] focus:bg-white"
                    placeholder="Conte um pouco da sua história como autor ou leitor..."
                  />
                </div>
                <div className="mt-8 flex justify-end">
                  <button type="submit" disabled={isSaving} className="rounded-2xl bg-[#6f2f38] px-12 py-4 font-black text-white shadow-xl shadow-[#6f2f38]/30 transition hover:scale-[1.02] disabled:opacity-50">
                    {isSaving ? 'Gravando Alterações...' : 'Salvar Perfil'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* MINHA ESTANTE */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter">Minha Estante</h2>
            <Link href="/books/new" className="flex items-center gap-2 rounded-xl bg-[#6f2f38] px-5 py-2.5 text-white font-bold transition hover:bg-[#5a262d] active:scale-95">
              <Plus size={18}/> Novo Livro
            </Link>
          </div>

          {myBooks.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {myBooks.map((book) => (
                <div key={book.id} className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-[#eadfcd] shadow-sm transition-all hover:shadow-2xl">
                  <Link href={`/reader?book=${book.id}`} className="relative h-64 overflow-hidden">
                    <img src={getBookCoverUrl(book)} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="line-clamp-1 text-lg font-bold">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-400 mb-4">{book.genre || 'Obra Original'}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="font-bold text-[#d4a03d]">★ {book.average_rating.toFixed(1)}</span>
                      
                      <div className="flex gap-2">
                        <Link 
                          href={`/edit/${book.id}`} 
                          className="p-2 text-slate-300 hover:text-teal-600 transition-colors"
                          title="Editar Manuscrito"
                        >
                          <Pencil size={20}/>
                        </Link>
                        <button 
                          onClick={() => setBookToDelete(book)} 
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Remover Obra"
                        >
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#d7c8b8] bg-white/50 py-20 text-center">
              <p className="text-slate-400 font-medium tracking-tight">Nenhuma obra publicada. Comece sua história agora!</p>
            </div>
          )}
        </section>

        {/* ESTANTE: LENDO */}
        <section className="mt-16">
          <h2 className="mb-8 text-3xl font-black tracking-tighter">📖 Lendo</h2>
          {readingBooks.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {readingBooks.map((book) => (
                <Link key={book.id} href={`/reader?book=${book.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-[#eadfcd] shadow-sm transition-all hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <img src={getBookCoverUrl(book)} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="line-clamp-1 text-lg font-bold">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{book.author?.username || 'Autor'}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <span className="font-bold text-[#d4a03d]">★ {book.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#d7c8b8] bg-white/50 py-12 text-center">
              <p className="text-slate-400 font-medium">Comece a ler um livro</p>
            </div>
          )}
        </section>

        {/* ESTANTE: FAVORITOS */}
        <section className="mt-16">
          <h2 className="mb-8 text-3xl font-black tracking-tighter">❤️ Favoritos</h2>
          {favoriteBooks.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteBooks.map((book) => (
                <Link key={book.id} href={`/reader?book=${book.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-[#eadfcd] shadow-sm transition-all hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <img src={getBookCoverUrl(book)} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="line-clamp-1 text-lg font-bold">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{book.author?.username || 'Autor'}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <span className="font-bold text-[#d4a03d]">★ {book.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#d7c8b8] bg-white/50 py-12 text-center">
              <p className="text-slate-400 font-medium">Nenhum favorito ainda</p>
            </div>
          )}
        </section>

        {/* ESTANTE: CURTIDOS */}
        <section className="mt-16">
          <h2 className="mb-8 text-3xl font-black tracking-tighter">👍 Curtidos</h2>
          {likedBooks.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {likedBooks.map((book) => (
                <Link key={book.id} href={`/reader?book=${book.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-[#eadfcd] shadow-sm transition-all hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <img src={getBookCoverUrl(book)} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="line-clamp-1 text-lg font-bold">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{book.author?.username || 'Autor'}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <span className="font-bold text-[#d4a03d]">★ {book.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#d7c8b8] bg-white/50 py-12 text-center">
              <p className="text-slate-400 font-medium">Nenhum livro curtido ainda</p>
            </div>
          )}
        </section>

        {/* ESTANTE: CONCLUÍDOS */}
        <section className="mt-16">
          <h2 className="mb-8 text-3xl font-black tracking-tighter">✅ Concluídos</h2>
          {finishedBooks.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {finishedBooks.map((book) => (
                <Link key={book.id} href={`/reader?book=${book.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-[#eadfcd] shadow-sm transition-all hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <img src={getBookCoverUrl(book)} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="line-clamp-1 text-lg font-bold">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{book.author?.username || 'Autor'}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <span className="font-bold text-[#d4a03d]">★ {book.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#d7c8b8] bg-white/50 py-12 text-center">
              <p className="text-slate-400 font-medium">Nenhum livro concluído ainda</p>
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <DashboardCard title="Favoritos" count={favorites.length} />
          <DashboardCard title="Em Leitura" count={readingItems.length} />
          <DashboardCard title="Terminados" count={finishedItems.length} />
        </section>
      </div>
    </main>
  )
}