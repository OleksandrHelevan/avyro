import {Navigate, Outlet} from "react-router-dom";

import Loader from "../../../components/Loader/Loader";

import {useCheckDoctorStatus} from "../../../domains/users/useCheckDoctorStatus/useCheckDoctorStatus";
import {useAuth} from "../../../context/auth/useAuth.tsx";

export default function MainApprovalInterceptor() {
  const {token} = useAuth();

  const savedEmail = !token
    ? localStorage.getItem("savedDoctorEmail")
    : null;

  const {data: statusResponse, isLoading} =
    useCheckDoctorStatus(savedEmail);

  if (savedEmail && isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader/>
      </div>
    );
  }

  if (!token && savedEmail) {
    if (statusResponse?.isPending === true) {
      return <Navigate to="/not-approved" replace/>;
    }

    if (
      statusResponse?.isPending === false ||
      statusResponse?.isAuthenticated === true
    ) {
      return <Outlet/>;
    }
  }

  return <Outlet/>;
}
