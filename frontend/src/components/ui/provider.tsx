"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system } from "@/theme"
import { ColorModeProvider } from "@/components/ui/color-mode"
import { Toaster } from "./toaster" // 👈 1. Import your pre-built Toaster


export function Provider({ children }: { children: React.ReactNode }) {
  // You no longer need to pass the `system` object here.
  // Chakra UI v3's provider will automatically pick up the theme.
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
      {children}
      <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
