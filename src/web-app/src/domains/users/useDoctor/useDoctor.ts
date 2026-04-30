import {useQuery} from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useDoctor = (id: string) => {

  const {data, isLoading, isPending, error} = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => userService.getDoctorById(id),
    enabled: !!id,
  });
  return {

    data, isLoading, isPending, error
  }
};
