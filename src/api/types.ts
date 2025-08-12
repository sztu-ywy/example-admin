export interface ModelBase {
  id: string
  created_at: number
  updated_at: number
  deleted_at: number
}

export interface Pagination {
  total: number
  per_page: number
  current_page: number
  total_pages: number
}

export interface GetListResponse<T> {
  data: T[]
  pagination: Pagination
}
