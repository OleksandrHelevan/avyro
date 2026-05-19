import {adminApiClient} from "../api/adminApiClient.ts";
import type {AdminRegistration, ApproveRegistrationResponse, RejectRegistrationResponse} from "../types.ts";


export const adminService = {


  getAdminRegistrations: async (): Promise<AdminRegistration[]> => {
    return adminApiClient.getAdminRegistrations();
  },

  approveRegistration: async (requestId: string): Promise<ApproveRegistrationResponse> => {
    return adminApiClient.approveRegistration(requestId);
  },

  rejectRegistration: async (requestId: string, comment: string): Promise<RejectRegistrationResponse> => {
    return adminApiClient.rejectRegistration(requestId, comment);
  },

  getAdminSchedules: async () => {
    return adminApiClient.getAdminSchedules();
  },

  approveSchedule: async (scheduleId: string) => {
    return adminApiClient.approveSchedule(scheduleId);
  },

  rejectSchedule: async (scheduleId: string, comment: string) => {
    return adminApiClient.rejectSchedule(scheduleId, comment);
  },

  getAdminSpecializations: async (): Promise<any[]> => {
    return adminApiClient.getAdminSpecializations();
  },

  createSpecializationDirect: async (data: { name: string }): Promise<any> => {
    return adminApiClient.createSpecializationDirect(data);
  },


};
