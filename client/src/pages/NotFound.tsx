"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"
import { useLocation } from "wouter"

export default function NotFound() {
  const [, setLocation] = useLocation()

  const handleGoHome = () => {
    setLocation("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">404</h1>
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
            </div>
            <p className="text-muted-foreground">
              Sorry, the page you are looking for doesn't exist.
              <br />
              It may have been moved or deleted.
            </p>
            <Button onClick={handleGoHome} className="mt-4">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
