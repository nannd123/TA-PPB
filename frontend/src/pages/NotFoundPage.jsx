import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-container not-found">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang kamu buka tidak tersedia.</p>
      <Link className="primary-button" to="/">Kembali ke Home</Link>
    </div>
  )
}
