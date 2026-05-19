import { useQuery } from "@tanstack/react-query";
import {adminService} from "../service/adminService.ts";

export const useAdminSchedules = () => {
  return useQuery({
    queryKey: ["adminSchedules"],
    queryFn: () => adminService.getAdminSchedules(),
  });
};
