'use client'

import { useEffect } from "react"
import { allIndexingConnectorAtom, userConnectorsAtom } from "../../../../store"
import { useAtom } from "jotai"

export default function RootLayout({ children }) {
    
  return (
    <div>
        { children }
    </div>
  )
}