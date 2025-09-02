import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Ruleta de Preguntas',
  description: 'Aplicación para seleccionar preguntas aleatoriamente',
  keywords: 'ruleta, preguntas, aula, educacion, aleatorio',
  authors: [{ name: 'Windsurf AI' }],
  robots: 'index, follow'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-gradient-to-b from-gray-900 to-gray-800 text-white`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
