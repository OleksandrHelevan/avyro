import {Outlet} from 'react-router-dom'
import './RootLayout.css'

export default function RootLayout() {
    return (
        <div className="wrapper">
        <header className="header">

        </header>
            <main className="main-container">
                <Outlet/>
            </main>
        </div>
    )
}