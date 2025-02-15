'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileHistory } from "@/components/file-history"
import { 
  Files, 
  Save, 
  Zap,
  BarChart as BarChartIcon
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalConversions: number
  savedTexts: number
  monthlyUsage: number
}

interface AnalysisStats {
  totalCharacters: number
  byLanguage: Record<string, number>
  lastWeekCount: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/stats/analysis').then(res => res.json())
    ]).then(([basicStats, analysis]) => {
      setStats(basicStats)
      setAnalysisStats(analysis)
    }).catch(console.error)
  }, [])

  const renderLanguageChart = () => {
    if (!analysisStats?.byLanguage) return null

    const data = Object.entries(analysisStats.byLanguage).map(([lang, count]) => ({
      language: lang,
      count
    }))

    if (data.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No data available
        </p>
      )
    }

    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="language" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversions
                </CardTitle>
                <Files className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalConversions || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Saved Texts
                </CardTitle>
                <Save className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.savedTexts || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Usage This Month
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.monthlyUsage || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FileHistory />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLanguageChart()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' 