import {useQuery} from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const usePatient = (id: string) => {

  const {data, isLoading, isPending, error} = useQuery({
    queryKey: ["patient", id],
    queryFn: () => userService.getPatientById(id),
    enabled: !!id,
  });
  return {

    data, isLoading, isPending, error
  }
};
