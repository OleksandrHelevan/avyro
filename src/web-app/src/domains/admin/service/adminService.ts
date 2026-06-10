import { adminApiClient } from "../api/adminApiClient.ts";
import type {
  AdminRegistration,
  ApproveRegistrationResponse,
  RejectRegistrationResponse,
  SendNotificationRequest,
  SendNotificationResponse,
  AdminFeedback
} from "../types.ts";

export const adminService = {

  /* ===== REGISTRATIONS ===== */
  getAdminRegistrations: async (): Promise<AdminRegistration[]> => {
    return adminApiClient.getAdminRegistrations();
  },

  approveRegistration: async (
    requestId: string
  ): Promise<ApproveRegistrationResponse> => {
    return adminApiClient.approveRegistration(requestId);
  },

  rejectRegistration: async (
    requestId: string,
    comment: string
  ): Promise<RejectRegistrationResponse> => {
    return adminApiClient.rejectRegistration(requestId, comment);
  },

  /* ===== SCHEDULES ===== */
  getAdminSchedules: async () => {
    return adminApiClient.getAdminSchedules();
  },

  approveSchedule: async (scheduleId: string) => {
    return adminApiClient.approveSchedule(scheduleId);
  },

  rejectSchedule: async (scheduleId: string, comment: string) => {
    return adminApiClient.rejectSchedule(scheduleId, comment);
  },

  /* ===== SPECIALIZATIONS ===== */
  getAdminSpecializations: async () => {
    return adminApiClient.getAdminSpecializations();
  },

  createSpecializationDirect: async (data: { name: string }) => {
    return adminApiClient.createSpecializationDirect(data);
  },

  approveSpecialization: async (requestId: string) => {
    return adminApiClient.approveSpecialization(requestId);
  },

  /* ===== NOTIFICATIONS ===== */
  sendNotification: async (
    data: SendNotificationRequest
  ): Promise<SendNotificationResponse> => {
    return adminApiClient.sendNotification(data);
  },

  /* ===== FEEDBACK ===== */
  getAllFeedbacks: async (): Promise<AdminFeedback[]> => {
    return adminApiClient.getAllFeedbacks();
  },
};
