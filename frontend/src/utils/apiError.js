import axios from 'axios'

export function getApiError(error) {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'Tidak dapat memuat data dari server.',
      status: error.response?.status,
      data: error.response?.data?.data,
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
    status: undefined,
    data: undefined,
  }
}
