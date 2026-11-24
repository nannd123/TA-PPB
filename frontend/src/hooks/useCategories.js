import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getCategories } from '../services/categoryService.js'

export function useCategories() {
  const loader = useCallback(() => getCategories(), [])
  return useApiResource(loader, 'categories')
}
