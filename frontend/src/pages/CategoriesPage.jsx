import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { useCategories } from '../hooks/useCategories.js'

export default function CategoriesPage() {
  const { data: categories, error, loading, retry } = useCategories()

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="TEMUKAN TOPIK FAVORITMU"
        title="Kategori kuis"
        description="Pilih kategori dan temukan kuis yang sesuai dengan rasa ingin tahumu."
      />
      {loading && <LoadingState label="Memuat kategori..." />}
      {!loading && error && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && categories?.length === 0 && (
        <EmptyState title="Belum ada kategori" description="Coba kembali nanti untuk melihat kategori kuis." />
      )}
      {!loading && !error && categories?.length > 0 && (
        <div className="card-grid">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      )}
    </div>
  )
}
