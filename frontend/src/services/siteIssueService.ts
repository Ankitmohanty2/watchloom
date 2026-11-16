import api from './api'

export type SiteIssueCategory = 'bug' | 'feature' | 'performance' | 'other'

export interface SiteIssueCreatePayload {
  message: string
  category: SiteIssueCategory
  contact_email?: string
  page_path?: string
  company_website?: string
}

export interface SiteIssueCreateResponse {
  id: string
  message: string
}

export const siteIssueService = {
  async submit(payload: SiteIssueCreatePayload): Promise<SiteIssueCreateResponse> {
    const response = await api.post('/api/v1/issues', payload)
    return response.data as SiteIssueCreateResponse
  },
}