import DoctorProfile from "../../../pages/DoctorProfile/DoctorProfile.tsx";
import PatientProfile from "../../../pages/PatientProfile/PatientProfile.tsx";
import {useAuth} from "../../../context/auth/useAuth.tsx";


export default function ProfileDispatcher() {
  const {isDoctor} = useAuth();

  return isDoctor
    ? <DoctorProfile/>
    : <PatientProfile/>;
}
