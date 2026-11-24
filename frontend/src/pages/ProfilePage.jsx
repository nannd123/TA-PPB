import { ChartNoAxesColumnIncreasing, LogOut, Save, Upload, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import api from '../config/api.js'
import { useAuth } from '../contexts/useAuth.js'
import { useQuizHistory } from '../hooks/useQuizHistory.js'
import { getUserAuthorization } from '../services/authService.js'
import { getApiError } from '../utils/apiError.js'

export default function ProfilePage() {
  const { data: history, error, loading, retry } = useQuizHistory()
  const { user, setSession, updateUser } = useAuth()
  const [name, setName] = useState(user.user_metadata?.display_name || user.user_metadata?.username || '')
  const [username, setUsername] = useState(user.user_metadata?.username || '')
  const [avatarSelection, setAvatarSelection] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const averageScore = history?.length
    ? Math.round(history.reduce((total, attempt) => total + (Number(attempt.score) || 0), 0) / history.length)
    : 0
  const avatarPreview = avatarSelection?.previewUrl || user.user_metadata?.avatar_url || ''

  useEffect(() => {
    if (!avatarSelection) return undefined
    return () => URL.revokeObjectURL(avatarSelection.previewUrl)
  }, [avatarSelection])

  const updateProfile = async (event) => {
    event.preventDefault()
    setFormError('')
    setNotice('')
    setSaving(true)

    try {
      let updatedUser = user
      if (avatarSelection) {
        const { file: avatarFile } = avatarSelection
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(avatarFile.type) || avatarFile.size > 5 * 1024 * 1024) {
          throw new Error('Pilih gambar JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.')
        }

        const headers = await getUserAuthorization()
        const { data: avatarResponse } = await api.post('/api/profile/avatar', avatarFile, {
          headers: { ...headers, 'Content-Type': avatarFile.type },
        })
        updatedUser = avatarResponse.data.user
        updateUser(updatedUser)
      }

      const headers = await getUserAuthorization()
      const { data: profileResponse } = await api.patch('/api/profile', {
        display_name: name.trim(),
        username: username.trim(),
      }, {
        headers,
      })
      updatedUser = profileResponse.data.user
      updateUser(updatedUser)
      setName(updatedUser.user_metadata?.display_name || '')
      setUsername(updatedUser.user_metadata?.username || '')
      setAvatarSelection(null)
      setNotice('Profil berhasil diperbarui.')
    } catch (updateError) {
      setFormError(getApiError(updateError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="RUANG PRIBADIMU"
        title="Profil"
        description="Kelola informasi akun dan pantau perkembangan belajarmu."
      />
      <form className="panel-card profile-edit-card" onSubmit={updateProfile}>
        <div className="profile-edit-header">
          {avatarPreview
            ? <img className="profile-avatar profile-avatar-image" src={avatarPreview} alt="Foto profil" />
            : <span className="profile-avatar"><UserRound aria-hidden="true" size={30} /></span>}
          <label className="secondary-button avatar-upload">
            <Upload aria-hidden="true" size={16} /> Ganti foto
            <input
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                setAvatarSelection(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
              }}
              type="file"
            />
          </label>
        </div>
        <label className="profile-name-field">
          Nama tampilan
          <input
            autoComplete="nickname"
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label className="profile-name-field">
          Username akun
          <input
            autoComplete="username"
            maxLength={30}
            minLength={3}
            onChange={(event) => setUsername(event.target.value)}
            pattern="[A-Za-z0-9_]{3,30}"
            required
            value={username}
          />
        </label>
        {formError && <div className="error-banner" role="alert">{formError}</div>}
        {notice && <div className="success-banner" role="status">{notice}</div>}
        <div className="profile-actions">
          <button className="primary-button" disabled={saving} type="submit">
            <Save aria-hidden="true" size={16} /> {saving ? 'Menyimpan...' : 'Simpan profil'}
          </button>
          <button className="secondary-button" onClick={() => setSession(null)} type="button">
            <LogOut aria-hidden="true" size={16} /> Keluar
          </button>
        </div>
      </form>
      <section className="section" aria-labelledby="stats-title">
        <div className="section-heading">
          <h2 id="stats-title">Statistik belajar</h2>
          <Link className="text-link" to="/history">Lihat riwayat</Link>
        </div>
        {loading && <LoadingState label="Menghitung statistik..." />}
        {!loading && error && <ErrorState error={error} onRetry={retry} />}
        {!loading && !error && (
          <div className="card-grid">
            <article className="panel-card">
              <ChartNoAxesColumnIncreasing aria-hidden="true" size={20} color="#5b5bd6" />
              <h2>{history.length}</h2>
              <p>Kuis diselesaikan</p>
            </article>
            <article className="panel-card">
              <ChartNoAxesColumnIncreasing aria-hidden="true" size={20} color="#5b5bd6" />
              <h2>{averageScore}%</h2>
              <p>Rata-rata skor</p>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
