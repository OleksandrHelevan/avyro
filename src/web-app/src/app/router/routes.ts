export const HOME_PATH = '/';
export const NOT_APPROVED_PATH = '/not-approved';
export const NOT_FOUND_PATH = '*';

export const LOGIN_PATH = '/login';
export const SIGNUP_PATH = '/sign-up';

export const DOCTOR_PROFILE_PATH = '/doctor/:id';
export const APPOINTMENTS_PATH = '/appointments';
export const PROFILE_PATH = '/profile';
export const SCHEDULE_EDIT_PATH = '/schedule-edit';
export const PATIENTS_PATH = '/patients';

export const ADMIN_REQUESTS_PATH = '/admin/requests';
export const ADMIN_SPECIALIZATIONS_PATH = '/admin/specializations';
export const ADMIN_SCHEDULES_PATH = '/admin/schedules';

// Хелпер для лінки на профіль лікаря
export const getDoctorProfileUrl = (id: string | number) => `/doctor/${id}`;
