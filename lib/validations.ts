import { z } from 'zod'

// 공통 스키마
export const idSchema = z.string().uuid()
export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다.')
export const phoneSchema = z.string().regex(/^[0-9-+\s()]+$/, '올바른 전화번호 형식이 아닙니다.')

// 사용자 관련 스키마
export const userSignupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phone: phoneSchema.optional(),
  language: z.string().min(1, '언어를 선택해주세요.'),
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
  language: z.string().min(1).optional(),
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  avatar_url: z.string().url().optional(),
})

// 병원 관련 스키마
export const hospitalCreateSchema = z.object({
  name: z.string().min(2, '병원명은 최소 2자 이상이어야 합니다.'),
  specialty: z.string().optional(),
  address: z.string().min(5, '주소는 최소 5자 이상이어야 합니다.'),
  phone: phoneSchema.optional(),
  website: z.string().url().optional(),
  hours: z.string().optional(),
  image_url: z.string().url().optional(),
})

export const hospitalUpdateSchema = hospitalCreateSchema.partial()

// 예약 관련 스키마
export const reservationCreateSchema = z.object({
  hospital_id: idSchema,
  interpreter_id: idSchema.optional(),
  treatment: z.string().min(1, '치료 항목을 입력해주세요.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, '올바른 시간 형식이 아닙니다.'),
  notes: z.string().optional(),
  estimated_cost: z.string().optional(),
  special_requests: z.string().optional(),
})

export const reservationUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  estimated_cost: z.string().optional(),
  special_requests: z.string().optional(),
  cancellation_reason: z.string().optional(),
})

// 통역사 관련 스키마
export const interpreterCreateSchema = z.object({
  user_id: idSchema,
  languages: z.array(z.string()).min(1, '최소 1개 언어를 선택해주세요.'),
  specializations: z.array(z.string()).min(1, '최소 1개 전문분야를 선택해주세요.'),
  experience_years: z.number().min(0).max(50).optional(),
})

export const interpreterUpdateSchema = z.object({
  languages: z.array(z.string()).min(1).optional(),
  specializations: z.array(z.string()).min(1).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// 리뷰 관련 스키마
export const reviewCreateSchema = z.object({
  reservation_id: idSchema,
  rating: z.number().min(1).max(5, '평점은 1-5 사이여야 합니다.'),
  comment: z.string().max(500, '댓글은 500자 이하여야 합니다.').optional(),
  review_type: z.enum(['in_progress', 'completed']),
})

// 검색/필터 스키마
export const hospitalSearchSchema = z.object({
  search_term: z.string().optional(),
  specialty_filter: z.string().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  max_price_filter: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
})

export const reservationFilterSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  hospital_id: idSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
})

// 타입 추출
export type UserSignupInput = z.infer<typeof userSignupSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type HospitalCreateInput = z.infer<typeof hospitalCreateSchema>
export type HospitalUpdateInput = z.infer<typeof hospitalUpdateSchema>
export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>
export type InterpreterCreateInput = z.infer<typeof interpreterCreateSchema>
export type InterpreterUpdateInput = z.infer<typeof interpreterUpdateSchema>
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type HospitalSearchInput = z.infer<typeof hospitalSearchSchema>
export type ReservationFilterInput = z.infer<typeof reservationFilterSchema>
