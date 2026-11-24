import { Download, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) {
      return
    }

    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
    } catch (installError) {
      setError(installError instanceof Error ? installError.message : 'Instalasi tidak dapat dimulai.')
    }
  }

  return (
    <section className="panel-card install-card">
      <span className="install-icon"><Smartphone aria-hidden="true" size={20} /></span>
      <div className="install-copy">
        <h2>Instal Quizora</h2>
        <p>
          {installed
            ? 'Quizora sudah terpasang di perangkat ini.'
            : 'Gunakan Quizora seperti aplikasi di perangkatmu. Koneksi internet tetap diperlukan untuk kuis dan sinkronisasi.'}
        </p>
        {!installed && !installPrompt && (
          <small>Jika tombol instal tidak tersedia, gunakan menu browser Tambahkan ke layar utama.</small>
        )}
        {error && <small className="install-error" role="alert">{error}</small>}
      </div>
      {!installed && installPrompt && (
        <button className="primary-button" type="button" onClick={installApp}>
          <Download aria-hidden="true" size={16} /> Instal
        </button>
      )}
    </section>
  )
}
