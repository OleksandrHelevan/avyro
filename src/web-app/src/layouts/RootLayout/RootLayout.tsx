import {Outlet} from 'react-router-dom'
import './RootLayout.css'
import Header from "../../components/Header/Header.tsx";
import AnimatedBackground from "../../components/AnimatedBackground/AnimatedBackground.tsx";

export default function RootLayout() {
    return (
        <div className="wrapper">
          <Header />
            <main className="main-container">
                <Outlet/>
            </main>
          <AnimatedBackground/>
        </div>
    )
}
