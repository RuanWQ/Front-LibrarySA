'use client'

import { useState } from 'react'
import { Review } from '@/types/review'
import { usersService } from '@/services/users'
import { useAuth } from '@/hooks/useAuth'
import { Trash2, Edit2, ChevronDown, ChevronUp, Reply } from 'lucide-react'

interface ReviewCardProps {
  review: Review
  onUpdate: (review: Review) => void
  onDelete: (reviewId: number) => void
  onReplyAdded: (reply: Review) => void
}

export function ReviewCard({
  review,
  onUpdate,
  onDelete,
  onReplyAdded,
}: ReviewCardProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [editedComment, setEditedComment] = useState(review.comment)
  const [editedRating, setEditedRating] = useState(review.rating || 0)
  const [replyComment, setReplyComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSaveEdit = async () => {
    if (!editedComment.trim()) return
    
    setIsSaving(true)
    try {
      const updated = await usersService.updateReview(
        review.id,
        editedRating || undefined,
        editedComment
      )
      onUpdate(updated)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este comentário?')) return
    
    setIsDeleting(true)
    try {
      await usersService.deleteReview(review.id)
      onDelete(review.id)
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = async () => {
    if (!replyComment.trim()) return
    
    setIsSaving(true)
    try {
      const reply = await usersService.createReply(review.id, replyComment)
      onReplyAdded(reply)
      setReplyComment('')
      setIsReplying(false)
      setShowReplies(true)
    } catch (error) {
      console.error('Erro ao responder comentário:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      {/* Header do comentário */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-black">{review.author.username}</h3>
          {review.rating && (
            <div className="text-yellow-400">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        {review.can_edit && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-blue-500/20 p-2 hover:bg-blue-500/30 transition"
              title="Editar"
            >
              <Edit2 size={16} className="text-blue-400" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-500/20 p-2 hover:bg-red-500/30 transition disabled:opacity-50"
              title="Deletar"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo do comentário */}
      {isEditing ? (
        <div className="mt-4 space-y-3">
          {review.rating !== null && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setEditedRating(star)}
                  className={`text-2xl ${
                    editedRating >= star ? 'text-yellow-400' : 'text-white/30'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          )}
          <textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#120d09] p-3 text-white placeholder-white/50"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditedComment(review.comment)
                setEditedRating(review.rating || 0)
              }}
              className="flex-1 rounded-lg bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[#d2c3b4]">{review.comment}</p>

          {/* Botões de ação secundários */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20 transition"
            >
              <Reply size={14} />
              Responder
            </button>
            {review.replies && review.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20 transition"
              >
                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {review.replies.length} resposta{review.replies.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Formulário de resposta */}
          {isReplying && (
            <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <textarea
                value={replyComment}
                onChange={(e) => setReplyComment(e.target.value)}
                placeholder="Escreva uma resposta..."
                className="w-full rounded-lg border border-white/10 bg-[#120d09] p-3 text-white placeholder-white/50"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={isSaving || !replyComment.trim()}
                  className="flex-1 rounded-lg bg-[#f3c76a] px-4 py-2 font-bold text-[#1a110a] hover:bg-[#e5b857] disabled:opacity-50"
                >
                  {isSaving ? 'Respondendo...' : 'Responder'}
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false)
                    setReplyComment('')
                  }}
                  className="rounded-lg bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Respostas */}
          {showReplies && review.replies && review.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-white/10 pl-4">
              {review.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm">{reply.author.username}</h4>
                      <p className="mt-1 text-sm text-[#d2c3b4]">{reply.comment}</p>
                    </div>
                    {reply.can_delete && (
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="rounded bg-red-500/20 p-1 hover:bg-red-500/30"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
