import { BookOpenCheck, Code2, Database, Smartphone } from 'lucide-react'
import PageHeading from '../components/PageHeading.jsx'

const technologies = [
  { icon: Code2, title: 'React dan Vite', description: 'Antarmuka interaktif dengan proses pengembangan dan build yang cepat.' },
  { icon: Database, title: 'Express dan Supabase', description: 'REST API dan PostgreSQL untuk kuis, akun, serta riwayat belajar.' },
  { icon: Smartphone, title: 'Progressive Web App', description: 'Dapat dipasang seperti aplikasi dan memiliki dukungan offline untuk app shell.' },
]

export default function AboutPage() {
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="TENTANG QUIZORA"
        title="Belajar lewat kuis, setiap hari."
        description="Quizora membantu kamu mengasah pengetahuan dengan kuis singkat, kategori yang beragam, dan statistik perkembangan belajar."
      />
      <section className="about-intro panel-card">
        <span className="about-icon"><BookOpenCheck aria-hidden="true" size={24} /></span>
        <div>
          <h2>Belajar sedikit, bertumbuh setiap hari</h2>
          <p>
            Temukan kuis harian, pilih topik yang kamu sukai, lalu lihat hasil dan riwayat
            belajarmu di profil. Quizora dirancang agar sesi belajar terasa ringan dan mudah diakses.
          </p>
        </div>
      </section>
      <section className="section" aria-labelledby="technology-title">
        <div className="section-heading">
          <h2 id="technology-title">Teknologi yang digunakan</h2>
        </div>
        <div className="card-grid about-grid">
          {technologies.map(({ icon: Icon, title, description }) => (
            <article className="panel-card about-tech-card" key={title}>
              <span className="category-icon"><Icon aria-hidden="true" size={21} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
