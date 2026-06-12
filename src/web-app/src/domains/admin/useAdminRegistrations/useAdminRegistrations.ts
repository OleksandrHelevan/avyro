import { useQuery } from "@tanstack/react-query";
import {adminService} from "../service/adminService.ts";

export const useAdminRegistrations = () => {
  return useQuery({
    queryKey: ["adminRegistrations"],
    queryFn: () => adminService.getAdminRegistrations(),
  });
};
